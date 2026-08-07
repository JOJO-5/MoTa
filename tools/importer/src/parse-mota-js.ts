import { parse } from 'acorn'
import type { Program, Expression, ObjectExpression, Property } from 'acorn'

function evaluate(code: string): unknown {
  try {
    return new Function(`return (${code})`)()
  } catch {
    return undefined
  }
}

function matchesAnyName(name: string, names: string[]): string | null {
  if (names.includes(name)) return name
  for (const n of names) {
    if (name === n || name.startsWith(`${n}_`)) return n
  }
  return null
}

function extractVarDeclarations(node: any, result: Map<string, unknown>, names: string[]): void {
  if (node?.type === 'VariableDeclaration') {
    for (const decl of node.declarations) {
      if (decl.id?.type === 'Identifier') {
        const matched = matchesAnyName(decl.id.name, names)
        if (matched && decl.init) {
          const value = evaluate(generateCode(decl.init))
          if (value !== undefined) {
            result.set(matched, value)
          }
        }
      }
    }
  }
}

function findTopLevelAssignments(code: string, names: string[]): Map<string, unknown> {
  const result = new Map<string, unknown>()
  try {
    const ast = parse(code, { ecmaVersion: 'latest', sourceType: 'module' }) as Program
    for (const node of ast.body) {
      if (node.type === 'VariableDeclaration') {
        extractVarDeclarations(node, result, names)
      }
      if (node.type === 'ExpressionStatement') {
        const expr = (node as any).expression
        if (expr?.type === 'AssignmentExpression' && expr.left?.type === 'MemberExpression') {
          const left = expr.left
          const objName = left.object?.name
          const propName = left.property?.name
          if (objName && propName && names.includes(objName)) {
            const value = evaluate(generateCode(expr.right))
            if (value !== undefined) {
              result.set(propName, value)
            }
          }
        }
        if (expr?.type === 'VariableDeclaration') {
          extractVarDeclarations(expr, result, names)
        }
      }
    }
  } catch {
    // parse error
  }
  return result
}

function generateCode(node: Expression): string {
  if (node.type === 'ObjectExpression') {
    const obj = node as ObjectExpression
    const pairs = obj.properties
      .filter((p): p is Property => p.type === 'Property')
      .map((prop) => {
        const key = prop.computed
          ? `[${generateCode(prop.key as Expression)}]`
          : (prop.key as any).name ?? (prop.key as any).value ?? JSON.stringify(prop.key)
        const val = generateCode(prop.value as Expression)
        return `${key}: ${val}`
      })
    return `{ ${pairs.join(', ')} }`
  }
  if (node.type === 'ArrayExpression') {
    const arr = (node as any)
    return `[${(arr.elements || []).map((el: Expression | null) => el ? generateCode(el) : '').join(', ')}]`
  }
  if (node.type === 'Literal') return JSON.stringify((node as any).value)
  if (node.type === 'Identifier') return (node as any).name
  if (node.type === 'MemberExpression') {
    const me = node as any
    return `${generateCode(me.object)}.${me.property.name ?? generateCode(me.property)}`
  }
  if (node.type === 'ConditionalExpression') {
    const ce = node as any
    return `${generateCode(ce.test)} ? ${generateCode(ce.consequent)} : ${generateCode(ce.alternate)}`
  }
  return 'null'
}

export function extractDataObjects(code: string): Map<string, unknown> {
  return findTopLevelAssignments(code, ['data', 'enemys', 'maps', 'items', 'events'])
}

export function extractFloorObjects(code: string): Map<string, unknown> {
  const mainObj = findTopLevelAssignments(code, ['main'])
  const main = mainObj.get('main') as Record<string, unknown> | undefined
  const floors = main?.floors as Record<string, unknown> | undefined
  const result = new Map<string, unknown>()
  if (floors) {
    for (const [key, value] of Object.entries(floors)) {
      result.set(key, value)
    }
  }
  return result
}

export function readMotaJsFile(filePath: string): string {
  const { readFileSync } = require('node:fs')
  return readFileSync(filePath, 'utf-8')
}
