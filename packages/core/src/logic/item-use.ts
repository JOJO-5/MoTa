import type { Direction, GameState, Position, RuntimeTileValue } from '../types.js'

interface ItemMapEntry {
  cls?: string
  id?: string
  canBreak?: boolean
}

interface ItemEnemyEntry {
  notBomb?: boolean
}

export interface ItemUseContext {
  state: GameState
  map: RuntimeTileValue[][]
  maps: Record<string, ItemMapEntry>
  enemys?: Record<string, ItemEnemyEntry>
}

export type ItemUseEffect =
  { type: 'show-enemy-guide' } | { type: 'clear-tiles'; tiles: Position[] }

export interface ItemUseResult {
  ok: boolean
  consume: boolean
  message: string
  effect?: ItemUseEffect
}

export const SUPPORTED_USABLE_ITEMS = new Set(['book', 'pickaxe', 'bomb'])

export function isSupportedUsableItem(itemId: string): boolean {
  return SUPPORTED_USABLE_ITEMS.has(itemId)
}

const DIRECTION_VECTORS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

function tileEntry(context: ItemUseContext, position: Position): ItemMapEntry | undefined {
  const tile = context.map[position.y]?.[position.x]
  return tile === undefined || tile === null ? undefined : context.maps[String(tile)]
}

export function resolveItemUse(itemId: string, context: ItemUseContext): ItemUseResult {
  if (itemId === 'book') {
    return {
      ok: true,
      consume: false,
      message: '打开心镜',
      effect: { type: 'show-enemy-guide' },
    }
  }

  if (itemId === 'pickaxe') {
    const vector = DIRECTION_VECTORS[context.state.direction]
    const target = {
      x: context.state.position.x + vector.x,
      y: context.state.position.y + vector.y,
    }
    if (tileEntry(context, target)?.canBreak !== true) {
      return { ok: false, consume: false, message: '前方没有可以破坏的墙' }
    }
    return {
      ok: true,
      consume: true,
      message: '破墙镐使用成功',
      effect: { type: 'clear-tiles', tiles: [target] },
    }
  }

  if (itemId === 'bomb') {
    const { x, y } = context.state.position
    const adjacent = [
      { x, y: y - 1 },
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y + 1 },
    ]
    const targets = adjacent.filter((position) => {
      const entry = tileEntry(context, position)
      if (!entry?.id || (entry.cls !== 'enemys' && entry.cls !== 'enemy48')) return false
      return context.enemys?.[entry.id]?.notBomb !== true
    })
    if (targets.length === 0) {
      return { ok: false, consume: false, message: '周围没有可以消灭的怪物' }
    }
    return {
      ok: true,
      consume: true,
      message: `爆裂卷轴消灭了 ${targets.length} 个怪物`,
      effect: { type: 'clear-tiles', tiles: targets },
    }
  }

  return { ok: false, consume: false, message: '这个道具暂时不能主动使用' }
}
