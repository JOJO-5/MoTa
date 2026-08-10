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
  | { type: 'show-enemy-guide' }
  | { type: 'clear-tiles'; tiles: Position[] }
  | { type: 'clear-flags'; flags: string[] }
  | { type: 'teleport'; position: Position }

export interface ItemUseResult {
  ok: boolean
  consume: boolean
  message: string
  effect?: ItemUseEffect
}

export const SUPPORTED_USABLE_ITEMS = new Set([
  'book',
  'pickaxe',
  'bomb',
  'weakWine',
  'poisonWine',
  'curseWine',
  'superWine',
  'centerFly',
])

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

function canBreakWithSpecialPickaxe(context: ItemUseContext, position: Position): boolean {
  const entry = tileEntry(context, position)
  if (!entry) return false
  if (entry.canBreak === true) return true
  if (context.state.flags.pzf !== 1) return false
  const floorId = context.state.floorId
  const specialFloor = floorId === 'MT10' || floorId === 'MT26' || /^MT(?:1[1-9]|20)$/.test(floorId)
  if (!specialFloor) return false
  return entry.id === 'star' || entry.cls === 'tileset'
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
    if (!canBreakWithSpecialPickaxe(context, target)) {
      return { ok: false, consume: false, message: '前方没有可以破坏的墙' }
    }
    return {
      ok: true,
      consume: true,
      message: '破墙镐使用成功',
      effect: { type: 'clear-tiles', tiles: [target] },
    }
  }

  const debuffs: Record<string, string[]> = {
    weakWine: ['weak'],
    poisonWine: ['poison'],
    curseWine: ['curse'],
    superWine: ['poison', 'weak', 'curse'],
  }
  if (debuffs[itemId]) {
    const flags = debuffs[itemId].filter((flag) => context.state.flags[flag] === true)
    if (flags.length === 0) {
      return { ok: false, consume: false, message: '当前没有需要解除的异常状态' }
    }
    const names: Record<string, string> = {
      weakWine: '火酒',
      poisonWine: '抗毒剂',
      curseWine: '解咒药水',
      superWine: '万能药水',
    }
    return {
      ok: true,
      consume: true,
      message: `${names[itemId]}使用成功`,
      effect: { type: 'clear-flags', flags },
    }
  }

  if (itemId === 'centerFly') {
    const target = {
      x: context.map[0]?.length - 1 - context.state.position.x,
      y: context.map.length - 1 - context.state.position.y,
    }
    if (target.x < 0 || target.y < 0 || !isEmptyTarget(context, target)) {
      return { ok: false, consume: false, message: '对称位置无法到达' }
    }
    return {
      ok: true,
      consume: true,
      message: '圆转飞行器使用成功',
      effect: { type: 'teleport', position: target },
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

function isEmptyTarget(context: ItemUseContext, position: Position): boolean {
  const tile = context.map[position.y]?.[position.x]
  return tile === undefined || tile === null || tile === 0
}
