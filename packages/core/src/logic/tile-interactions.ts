import { dispatch, State } from '../state/store.js'
import { startBattle } from './battle.js'
import { hasSpecial } from './battle-utils.js'
import { eventMachine } from './event-machine.js'
import type { Event } from '@modern-mota/data'

/**
 * Raw item entry as exported from the original mota-js project (items.json).
 * The project schema (ItemSchema) does not match the source data format, so we
 * work with the raw shape here.
 */
export interface RawItem {
  cls?: string
  name?: string
  text?: string
  hideInToolbox?: boolean
  itemEffect?: string
  equip?: {
    type?: number
    animate?: string
    value?: Record<string, number>
    percentage?: Record<string, number>
  }
}

/** Raw enemy entry as exported from the original mota-js project (enemys.json). */
export interface RawEnemy {
  name?: string
  hp: number
  atk: number
  def: number
  money: number
  exp: number
  point?: number
  special?: number | Array<number | string>
  beforeBattle?: Event[]
  afterBattle?: Event[]
}

export interface RawMapEntry {
  cls?: string
  id?: string
  name?: string
  event?: Event[]
  script?: string
}

/** Gem values copied from the original project's data.js `values` table. */
const GEM_VALUES: Record<string, { atk?: number; def?: number; mdef?: number }> = {
  redGem: { atk: 1 },
  blueGem: { def: 1 },
  greenGem: { mdef: 2 },
  yellowGem: { atk: 1, def: 1 },
}

/** Potion values copied from the original project's data.js `values` table. */
const POTION_VALUES: Record<string, number> = {
  redPotion: 25,
  bluePotion: 50,
  yellowPotion: 100,
  greenPotion: 250,
}

const KEY_IDS = new Set(['yellowKey', 'blueKey', 'redKey', 'greenKey', 'steelKey', 'bigKey'])

export interface TileInteractionResult {
  /** Short message shown to the player (floor message box). */
  message: string
  /** Whether the tile should be cleared from the map. */
  consumed: boolean
  kind?: 'item' | 'enemy' | 'map-event'
  afterBattle?: Event[]
}

/** Resolve and apply one map tile interaction, including its collection state. */
export function interactWithTile(
  floorId: string,
  x: number,
  y: number,
  tileId: number,
  maps: Record<string, RawMapEntry> | undefined,
  itemsData: Record<string, RawItem> | undefined,
  enemysData: Record<string, RawEnemy> | undefined
): TileInteractionResult | null {
  if (State.collectedTiles[floorId]?.includes(`${x},${y}`)) return null

  const entry = maps?.[String(tileId)]
  if (!entry?.id) return null

  let result: TileInteractionResult | null
  if (entry.cls === 'items') {
    const pickedUp = pickUpItem(entry.id, itemsData)
    result = pickedUp ? { ...pickedUp, kind: 'item' } : null
  } else if (entry.cls === 'enemys' || entry.cls === 'enemy48') {
    const battle = battleEnemy(entry.id, enemysData)
    result = battle ? { ...battle, kind: 'enemy' } : null
  } else {
    result = interactWithEmbeddedMapEvent(floorId, x, y, entry)
  }

  if (result?.consumed) {
    dispatch({ type: 'COLLECT_TILE', floorId, x, y })
  }

  return result
}

function hasItem(itemId: string): boolean {
  return State.hero.items.includes(itemId) || Number(State.values[`item:${itemId}`]) > 0
}

function interactWithEmbeddedMapEvent(
  floorId: string,
  x: number,
  y: number,
  entry: RawMapEntry
): TileInteractionResult | null {
  if (Array.isArray(entry.event) && entry.event.length > 0) {
    eventMachine.start(entry.event, {
      floorId,
      x,
      y,
      eventIndex: 0,
      eventCount: entry.event.length,
    })
    const consumed = entry.event.some(
      (event) =>
        typeof event === 'object' &&
        event !== null &&
        (event as { type?: string; remove?: boolean }).type === 'hide' &&
        (event as { remove?: boolean }).remove !== false
    )
    return { message: entry.name ?? entry.id ?? '', consumed, kind: 'map-event' }
  }

  if (!entry.script || !entry.id) return null
  if (entry.id === 'lavaNet') {
    dispatch({ type: 'SET_HERO', hero: { hp: Math.max(0, State.hero.hp - 50) } })
    return { message: '经过熔岩，受到伤害50点', consumed: false, kind: 'map-event' }
  }
  if (entry.id === 'IceNet') {
    if (!hasItem('amulet')) {
      dispatch({ type: 'SET_HERO', hero: { hp: Math.max(0, State.hero.hp - 50) } })
      return { message: '经过过冷水，受到伤害50点', consumed: false, kind: 'map-event' }
    }
    return { message: '护身符抵消了过冷水', consumed: false, kind: 'map-event' }
  }
  if (entry.id === 'poisonNet' || entry.id === 'weakNet' || entry.id === 'curseNet') {
    if (!hasItem('amulet')) {
      const debuff = entry.id.replace('Net', '')
      dispatch({ type: 'SET_FLAG', name: debuff, value: true })
      return { message: `陷入${entry.name ?? debuff}状态`, consumed: false, kind: 'map-event' }
    }
    return { message: '护身符抵消了异常状态', consumed: false, kind: 'map-event' }
  }
  return null
}

/**
 * Pick up an item tile. Handles the common item classes from the original
 * game (keys, gems, potions, equipment); anything else is stored in the
 * hero's item bag without an effect yet.
 */
export function pickUpItem(
  itemId: string,
  itemsData: Record<string, RawItem> | undefined
): TileInteractionResult | null {
  const item = itemsData?.[itemId]
  if (!item) return null

  const { hero } = State
  const name = item.name ?? itemId

  if (KEY_IDS.has(itemId)) {
    dispatch({
      type: 'SET_HERO',
      hero: { keys: { ...hero.keys, [itemId]: (hero.keys[itemId] ?? 0) + 1 } },
    })
    return { message: `获得钥匙 ×1`, consumed: true }
  }

  const gem = GEM_VALUES[itemId]
  if (gem) {
    const heroPatch: Record<string, number> = {}
    if (gem.atk) heroPatch.atk = hero.atk + gem.atk
    if (gem.def) heroPatch.def = hero.def + gem.def
    if (gem.mdef) heroPatch.mdef = hero.mdef + gem.mdef
    dispatch({ type: 'SET_HERO', hero: heroPatch })
    return { message: `获得${name}（攻击+${gem.atk ?? 0} 防御+${gem.def ?? 0}）`, consumed: true }
  }

  const potionHp = POTION_VALUES[itemId]
  if (potionHp !== undefined) {
    dispatch({ type: 'SET_HERO', hero: { hp: hero.hp + potionHp } })
    return { message: `获得${name}（回复 ${potionHp} HP）`, consumed: true }
  }

  if (item.cls === 'equips' && item.equip?.value) {
    const value = item.equip.value
    const heroPatch: Record<string, number> = {}
    if (value.atk) heroPatch.atk = hero.atk + value.atk
    if (value.def) heroPatch.def = hero.def + value.def
    if (value.mdef) heroPatch.mdef = hero.mdef + value.mdef
    dispatch({ type: 'SET_HERO', hero: heroPatch })
    const equipment = { ...hero.equipment }
    if (item.equip.type === 0) equipment.weapon = itemId
    else if (item.equip.type === 1) equipment.shield = itemId
    else equipment.accessory = itemId
    dispatch({ type: 'SET_HERO', hero: { equipment } })
    return { message: `装备${name}`, consumed: true }
  }

  dispatch({ type: 'ADD_ITEM', itemId })
  return { message: `获得${name}`, consumed: true }
}

/**
 * Fight an enemy tile. Runs the battle simulation; on victory the enemy is
 * cleared and money/exp are awarded. On defeat the hero's HP is clamped to 0.
 */
export function battleEnemy(
  enemyId: string,
  enemysData: Record<string, RawEnemy> | undefined
): TileInteractionResult | null {
  const enemy = enemysData?.[enemyId]
  if (!enemy) return null

  const name = enemy.name ?? enemyId
  const battle = startBattle({ ...enemy, id: enemyId } as never)

  const { hero } = State
  dispatch({ type: 'SET_BATTLE', battle: null })
  if (battle.outcome === 'stalemate') {
    return { message: `${name} 当前无法被有效攻击`, consumed: false }
  }
  if (hero.hp <= 0) {
    dispatch({ type: 'SET_HERO', hero: { hp: 0 } })
    return { message: `你被 ${name} 击败了…`, consumed: false }
  }

  if (hasSpecial(enemy as never, 12)) {
    dispatch({ type: 'SET_FLAG', name: 'poison', value: true })
  }
  if (hasSpecial(enemy as never, 13) && !State.flags.weak) {
    const atkLoss = Math.max(1, Math.floor(State.hero.atk * 0.1))
    const defLoss = Math.max(1, Math.floor(State.hero.def * 0.1))
    dispatch({ type: 'SET_FLAG', name: 'weak', value: true })
    dispatch({ type: 'SET_VALUE', name: '__weakAtkLoss', value: atkLoss })
    dispatch({ type: 'SET_VALUE', name: '__weakDefLoss', value: defLoss })
    dispatch({
      type: 'SET_HERO',
      hero: {
        atk: Math.max(0, State.hero.atk - atkLoss),
        def: Math.max(0, State.hero.def - defLoss),
      },
    })
  }
  if (hasSpecial(enemy as never, 14)) {
    dispatch({ type: 'SET_FLAG', name: 'curse', value: true })
  }
  if (hasSpecial(enemy as never, 19) || hasSpecial(enemy as never, 29)) {
    dispatch({ type: 'SET_HERO', hero: { hp: 0 } })
  }

  if (!State.flags.curse) {
    dispatch({
      type: 'SET_HERO',
      hero: { money: State.hero.money + enemy.money, exp: State.hero.exp + enemy.exp },
    })
  }
  return {
    message: `击败${name}（💰+${State.flags.curse ? 0 : enemy.money} ⭐+${State.flags.curse ? 0 : enemy.exp}）`,
    consumed: true,
    afterBattle: enemy.afterBattle,
  }
}
