import { parse } from 'acorn'
import type { Program, Expression, ObjectExpression, Property } from 'acorn'

function evaluate(code: string): unknown {
  try {
    return new Function(`return (${code})`)()
  } catch {
    return undefined
  }
}

function evaluateLiteralNode(node: any): unknown {
  if (!node) return undefined
  if (node.type === 'Literal') return node.value
  if (node.type === 'UnaryExpression') {
    const argument = evaluateLiteralNode(node.argument)
    if (argument === undefined) return undefined
    if (node.operator === '-') return -Number(argument)
    if (node.operator === '+') return Number(argument)
    if (node.operator === '!') return !argument
    if (node.operator === '~') return ~Number(argument)
    return undefined
  }
  if (node.type === 'ArrayExpression') {
    const values: unknown[] = []
    for (const element of node.elements ?? []) {
      const value = evaluateLiteralNode(element)
      if (value === undefined && element?.type !== 'Literal') return undefined
      values.push(value)
    }
    return values
  }
  if (node.type === 'ObjectExpression') {
    const result: Record<string, unknown> = {}
    for (const property of node.properties ?? []) {
      if (property.type !== 'Property' || property.kind !== 'init') return undefined
      const key = property.computed
        ? evaluateLiteralNode(property.key)
        : (property.key?.name ?? property.key?.value)
      if (typeof key !== 'string' && typeof key !== 'number') return undefined
      const value = evaluateLiteralNode(property.value)
      if (value === undefined && property.value?.type !== 'Literal') return undefined
      result[String(key)] = value
    }
    return result
  }
  return undefined
}

function matchesAnyName(name: string, names: string[]): string | null {
  if (names.includes(name)) return name
  for (const n of names) {
    if (name === n || name.startsWith(`${n}_`)) return n
  }
  return null
}

function getMemberPath(node: any): string[] | null {
  if (!node || node.type !== 'MemberExpression' || node.computed) return null

  const property = node.property?.type === 'Identifier' ? node.property.name : null
  if (!property) return null

  if (node.object?.type === 'Identifier') {
    return [node.object.name, property]
  }

  const parentPath = getMemberPath(node.object)
  return parentPath ? [...parentPath, property] : null
}

function extractVarDeclarations(node: any, result: Map<string, unknown>, names: string[]): void {
  if (node?.type === 'VariableDeclaration') {
    for (const decl of node.declarations) {
      if (decl.id?.type === 'Identifier') {
        const matched = matchesAnyName(decl.id.name, names)
        if (matched && decl.init) {
          const literalValue = evaluateLiteralNode(decl.init)
          const value = literalValue ?? evaluate(generateCode(decl.init))
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
            const literalValue = evaluateLiteralNode(expr.right)
            const value = literalValue ?? evaluate(generateCode(expr.right))
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
          : prop.key.type === 'Identifier'
            ? prop.key.name
            : JSON.stringify((prop.key as any).value)
        const val = generateCode(prop.value as Expression)
        return `${key}: ${val}`
      })
    return `{ ${pairs.join(', ')} }`
  }
  if (node.type === 'ArrayExpression') {
    const arr = node as any
    return `[${(arr.elements || []).map((el: Expression | null) => (el ? generateCode(el) : '')).join(', ')}]`
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

  try {
    const ast = parse(code, { ecmaVersion: 'latest', sourceType: 'module' }) as Program
    for (const node of ast.body) {
      if (node.type !== 'ExpressionStatement') continue
      const expr = (node as any).expression
      if (expr?.type !== 'AssignmentExpression') continue

      const path = getMemberPath(expr.left)
      if (!path || path[0] !== 'main' || path[1] !== 'floors' || !path[2]) continue

      const value = evaluateLiteralNode(expr.right)
      if (value !== undefined) {
        result.set(path[2], value)
      }
    }
  } catch {
    // parse error
  }

  return result
}

export function readMotaJsFile(filePath: string): string {
  const { readFileSync } = require('node:fs')
  return readFileSync(filePath, 'utf-8')
}
