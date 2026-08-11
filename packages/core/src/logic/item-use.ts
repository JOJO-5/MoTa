import type { Direction, GameState, HeroSnapshot, Position, RuntimeTileValue } from '../types.js'

interface ItemMapEntry {
  cls?: string
  id?: string
  canBreak?: boolean
}

interface ItemEnemyEntry {
  notBomb?: boolean
}

interface ItemDefinition {
  name?: string
}

export interface ItemUseContext {
  state: GameState
  map: RuntimeTileValue[][]
  maps: Record<string, ItemMapEntry>
  enemys?: Record<string, ItemEnemyEntry>
  items?: Record<string, ItemDefinition>
  floorIds?: string[]
  floors?: Record<string, { map: RuntimeTileValue[][] }>
  targetFloorId?: string
}

export type ItemUseEffect =
  | { type: 'show-enemy-guide' }
  | { type: 'clear-tiles'; tiles: Position[] }
  | { type: 'clear-flags'; flags: string[] }
  | { type: 'teleport'; position: Position }
  | {
      type: 'hero-patch'
      hero: Partial<Pick<HeroSnapshot, 'hp' | 'atk' | 'def' | 'mdef' | 'equipment'>>
      flags?: Record<string, unknown>
      removeItems?: string[]
    }
  | { type: 'change-floor'; direction?: 'up' | 'down'; floorId?: string }

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
  'superPotion',
  'freezeBadge',
  'bigKey',
  'icePickaxe',
  'earthquake',
  'jumpShoes',
  'upFly',
  'downFly',
  'weakWine',
  'poisonWine',
  'curseWine',
  'superWine',
  'centerFly',
  'fly',
  'lifeWand',
  'I359',
  'I360',
  'redPotion',
  'bluePotion',
  'yellowPotion',
  'greenPotion',
  'redGem',
  'blueGem',
  'greenGem',
  'yellowGem',
  'I451',
  'I452',
  'I453',
  'I454',
  'I455',
  'I456',
  'I457',
  'I458',
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

function itemName(context: ItemUseContext, itemId: string): string {
  return context.items?.[itemId]?.name ?? itemId
}

function positionsMatching(
  context: ItemUseContext,
  predicate: (entry: ItemMapEntry | undefined) => boolean
): Position[] {
  const positions: Position[] = []
  for (let y = 0; y < context.map.length; y++) {
    for (let x = 0; x < (context.map[y]?.length ?? 0); x++) {
      if (predicate(tileEntry(context, { x, y }))) positions.push({ x, y })
    }
  }
  return positions
}

function heroPatchForItem(
  itemId: string,
  state: GameState
): Partial<Pick<HeroSnapshot, 'hp' | 'atk' | 'def' | 'mdef'>> | null {
  const current = state.hero
  const numeric: Record<string, Partial<Pick<HeroSnapshot, 'hp' | 'atk' | 'def' | 'mdef'>>> = {
    redPotion: { hp: current.hp + 25 },
    bluePotion: { hp: current.hp + 50 },
    yellowPotion: { hp: current.hp + 100 },
    greenPotion: { hp: current.hp + 250 },
    superPotion: { hp: current.hp * 2 },
    lifeWand: { hp: Math.min(current.hpMax, current.hp + 100) },
    redGem: { atk: current.atk + 1 },
    blueGem: { def: current.def + 1 },
    greenGem: { mdef: current.mdef + 2 },
    yellowGem: { atk: current.atk + 1, def: current.def + 1 },
    I451: { hp: current.hp + 500 },
    I452: { hp: current.hp + 1000 },
    I453: { hp: current.hp + 2000 },
    I454: { hp: current.hp + 4000 },
    I455: { atk: current.atk + 10 },
    I456: { def: current.def + 10 },
    I457: { atk: current.atk + 5, def: current.def + 5 },
    I458: { mdef: current.mdef + 10 },
  }
  return numeric[itemId] ?? null
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
  const heroPatch = heroPatchForItem(itemId, context.state)
  if (heroPatch) {
    return {
      ok: true,
      consume: true,
      message: `${itemName(context, itemId)}使用成功`,
      effect: { type: 'hero-patch', hero: heroPatch },
    }
  }

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

  if (itemId === 'icePickaxe') {
    const vector = DIRECTION_VECTORS[context.state.direction]
    const target = {
      x: context.state.position.x + vector.x,
      y: context.state.position.y + vector.y,
    }
    if (tileEntry(context, target)?.id !== 'ice') {
      return { ok: false, consume: false, message: '前方没有可以破坏的冰墙' }
    }
    return {
      ok: true,
      consume: true,
      message: `${itemName(context, itemId)}使用成功`,
      effect: { type: 'clear-tiles', tiles: [target] },
    }
  }

  if (itemId === 'freezeBadge') {
    const { x, y } = context.state.position
    const adjacent = [
      { x, y: y - 1 },
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y + 1 },
    ]
    const targets = adjacent.filter((position) => {
      const id = tileEntry(context, position)?.id
      return id === 'lava' || id === 'blueLava'
    })
    if (targets.length === 0) {
      return { ok: false, consume: false, message: '周围没有可以冻结的熔岩' }
    }
    return {
      ok: true,
      consume: true,
      message: `${itemName(context, itemId)}使用成功`,
      effect: { type: 'clear-tiles', tiles: targets },
    }
  }

  if (itemId === 'bigKey') {
    const targets = positionsMatching(context, (entry) => entry?.id === 'yellowDoor')
    if (targets.length === 0) {
      return { ok: false, consume: false, message: '当前楼层没有黄色门' }
    }
    return {
      ok: true,
      consume: true,
      message: `${itemName(context, itemId)}使用成功`,
      effect: { type: 'clear-tiles', tiles: targets },
    }
  }

  if (itemId === 'earthquake') {
    const targets = positionsMatching(context, (entry) => entry?.canBreak === true)
    if (targets.length === 0) {
      return { ok: false, consume: false, message: '当前楼层没有可以震碎的墙' }
    }
    return {
      ok: true,
      consume: true,
      message: `${itemName(context, itemId)}使用成功`,
      effect: { type: 'clear-tiles', tiles: targets },
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

  if (itemId === 'fly') {
    const targetFloorId = context.targetFloorId
    const currentIndex = context.floorIds?.indexOf(context.state.floorId) ?? -1
    if (
      !targetFloorId ||
      targetFloorId === context.state.floorId ||
      currentIndex < 0 ||
      !context.floorIds?.includes(targetFloorId) ||
      !context.floors?.[targetFloorId]
    ) {
      return { ok: false, consume: false, message: '请选择已经探索过的其他楼层' }
    }
    return {
      ok: true,
      consume: true,
      message: `${itemName(context, itemId)}使用成功`,
      effect: { type: 'change-floor', floorId: targetFloorId },
    }
  }

  if (itemId === 'jumpShoes') {
    const vector = DIRECTION_VECTORS[context.state.direction]
    const target = {
      x: context.state.position.x + vector.x * 2,
      y: context.state.position.y + vector.y * 2,
    }
    if (!isEmptyTarget(context, target)) {
      return { ok: false, consume: false, message: '前方两格无法跳跃' }
    }
    return {
      ok: true,
      consume: true,
      message: `${itemName(context, itemId)}使用成功`,
      effect: { type: 'teleport', position: target },
    }
  }

  if (itemId === 'upFly' || itemId === 'downFly') {
    const direction = itemId === 'upFly' ? 'up' : 'down'
    const index = context.floorIds?.indexOf(context.state.floorId) ?? -1
    const targetIndex = direction === 'up' ? index + 1 : index - 1
    const targetFloorId = context.floorIds?.[targetIndex]
    const targetFloor = targetFloorId ? context.floors?.[targetFloorId] : undefined
    if (
      !targetFloor ||
      !isEmptyTarget({ ...context, map: targetFloor.map }, context.state.position)
    ) {
      return { ok: false, consume: false, message: '相同位置没有可到达的楼层' }
    }
    return {
      ok: true,
      consume: true,
      message: `${itemName(context, itemId)}使用成功`,
      effect: { type: 'change-floor', direction },
    }
  }

  if (itemId === 'I359' || itemId === 'I360') {
    const equipped = context.state.hero.equipment.accessory
    const equipment = { ...context.state.hero.equipment }
    const removeItems: string[] = []
    const hero =
      itemId === 'I359'
        ? { atk: Math.floor(context.state.hero.atk * 1.2) }
        : { def: Math.floor(context.state.hero.def * 1.5) }

    if (itemId === 'I359' && equipped === 'I357')
      hero.atk = Math.floor(context.state.hero.atk * 1.5)
    if (itemId === 'I359' && equipped === 'I358') {
      equipment.accessory = undefined
      removeItems.push('I358')
    }
    if (itemId === 'I360' && equipped === 'I358') {
      hero.atk = Math.floor(context.state.hero.atk * 1.2)
      hero.def = Math.floor(context.state.hero.def * 1.8)
    }
    if (itemId === 'I360' && equipped === 'I357') {
      equipment.accessory = undefined
      removeItems.push('I357')
    }

    return {
      ok: true,
      consume: true,
      message: `${itemName(context, itemId)}使用成功`,
      effect: {
        type: 'hero-patch',
        hero: { ...hero, equipment },
        flags:
          itemId === 'I359' ? { 寒冰杖路线: 0, 赤炎杖路线: 1 } : { 寒冰杖路线: 1, 赤炎杖路线: 0 },
        removeItems,
      },
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
  if (
    position.y < 0 ||
    position.y >= context.map.length ||
    position.x < 0 ||
    position.x >= (context.map[position.y]?.length ?? 0)
  ) {
    return false
  }
  const tile = context.map[position.y]?.[position.x]
  return tile === undefined || tile === null || tile === 0
}
