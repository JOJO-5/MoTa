import jsep from 'jsep'
import { State } from '../state/store.js'

export type ExpressionContext = {
  hero: {
    hp: number
    atk: number
    def: number
    mdef: number
    money: number
    exp: number
    level: number
  }
  flags: Record<string, unknown>
  values: Record<string, number>
  items: Record<string, number>
  status: Record<string, unknown>
  core: {
    status: Record<string, unknown>
  }
}

export function getContext(): ExpressionContext {
  const { hero, flags, values } = State
  const items: Record<string, number> = {}
  for (const itemId of hero.items) items[itemId] = 1
  // The original mota-js keeps the selected difficulty in core.status.hard,
  // while the exported 2014 events use numeric flag:hard for map branches.
  // The web entry currently starts directly in the tower without a difficulty
  // picker, so keep the legacy high-tier NPC entry available by default.
  const hardFlag = flags.hard ?? values.hard
  const hard =
    hardFlag === 1 || hardFlag === 'Starter'
      ? 'Starter'
      : hardFlag === 2 || hardFlag === 'Basic'
        ? 'Basic'
        : hardFlag === 3 || hardFlag === 'Premium' || hardFlag === undefined
          ? 'Premium'
          : hardFlag
  return {
    hero: {
      hp: hero.hp,
      atk: hero.atk,
      def: hero.def,
      mdef: hero.mdef,
      money: hero.money,
      exp: hero.exp,
      level: hero.level,
    },
    flags,
    values,
    items,
    status: { ...hero },
    core: { status: { hard } },
  }
}

type JsepNode = {
  type: string
  [key: string]: unknown
}

function preprocessExpression(expression: string): string {
  // Convert mota-js flag/status prefixes to member expressions.
  // flag:name -> flags.name
  // status:name -> status.name (resolved in context if available)
  return expression
    .replace(/!==/g, '!=')
    .replace(/===/g, '==')
    .replace(/flag:([A-Za-z0-9_\u4e00-\u9fff]+)/g, 'flags.$1')
    .replace(/switch:([A-Za-z0-9_\u4e00-\u9fff]+)/g, 'flags.$1')
    .replace(/status:([A-Za-z0-9_\u4e00-\u9fff]+)/g, 'status.$1')
    .replace(/item:([A-Za-z0-9_\u4e00-\u9fff]+)/g, 'items.$1')
}

export function evaluate(expression: string): number | boolean | string | null {
  const ctx = getContext()
  const processed = preprocessExpression(expression)
  let ast: JsepNode
  try {
    ast = jsep(processed) as JsepNode
  } catch {
    // Unsupported expression syntax; default to false/0 to keep game running.
    return false
  }

  function evalNode(node: JsepNode): unknown {
    switch (node.type) {
      case 'Literal':
        return node.value
      case 'Identifier': {
        const name = node.name as string
        if (name === 'hero') return ctx.hero
        if (name in ctx.hero) return (ctx.hero as Record<string, unknown>)[name]
        if (name === 'flags') return ctx.flags
        if (name === 'items') return ctx.items
        if (name === 'status') return ctx.status
        if (name === 'core') return ctx.core
        if (name in ctx.flags) return ctx.flags[name]
        if (name in ctx.values) return ctx.values[name]
        return null
      }
      case 'BinaryExpression': {
        const left = evalNode(node.left as JsepNode)
        const right = evalNode(node.right as JsepNode)
        const op = node.operator as string
        if (op === '&&') return Boolean(left) && Boolean(right)
        if (op === '||') return Boolean(left) || Boolean(right)
        if (op === '==') return left === right
        if (op === '!=') return left !== right
        if (typeof left === 'string' || typeof right === 'string') {
          if (op === '+') return String(left) + String(right)
          return null
        }
        if (op === '<') return (left as number) < (right as number)
        if (op === '<=') return (left as number) <= (right as number)
        if (op === '>') return (left as number) > (right as number)
        if (op === '>=') return (left as number) >= (right as number)
        if (op === '+') return (left as number) + (right as number)
        if (op === '-') return (left as number) - (right as number)
        if (op === '*') return (left as number) * (right as number)
        if (op === '/') return right !== 0 ? Math.floor((left as number) / (right as number)) : 0
        if (op === '%') return (left as number) % (right as number)
        return null
      }
      case 'UnaryExpression': {
        const op = node.operator as string
        const arg = evalNode(node.argument as JsepNode)
        if (op === '!') return !arg
        if (op === '-') return -(arg as number)
        return null
      }
      case 'MemberExpression': {
        const object = evalNode(node.object as JsepNode) as Record<string, unknown> | null
        const propertyNode = node.property as JsepNode
        const property = propertyNode.name as string
        if (object && typeof object === 'object' && property in object) {
          return object[property]
        }
        return null
      }
      default:
        return null
    }
  }

  return evalNode(ast) as number | boolean | string | null
}
