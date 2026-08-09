import { dispatch, State } from '../state/store.js'
import { startBattle } from './battle.js'

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
  special?: number | string[]
}

export interface RawMapEntry {
  cls?: string
  id?: string
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
}

/** Resolve and apply one map tile interaction, including its collection state. */
export function interactWithTile(
  floorId: string,
  x: number,
  y: number,
  tileId: number,
  maps: Record<string, RawMapEntry> | undefined,
  itemsData: Record<string, RawItem> | undefined,
  enemysData: Record<string, RawEnemy> | undefined,
): TileInteractionResult | null {
  if (State.collectedTiles[floorId]?.includes(`${x},${y}`)) return null

  const entry = maps?.[String(tileId)]
  if (!entry?.id) return null

  const result = entry.cls === 'items'
    ? pickUpItem(entry.id, itemsData)
    : entry.cls === 'enemys'
      ? battleEnemy(entry.id, enemysData)
      : null

  if (result?.consumed) {
    dispatch({ type: 'COLLECT_TILE', floorId, x, y })
  }

  return result
}

/**
 * Pick up an item tile. Handles the common item classes from the original
 * game (keys, gems, potions, equipment); anything else is stored in the
 * hero's item bag without an effect yet.
 */
export function pickUpItem(itemId: string, itemsData: Record<string, RawItem> | undefined): TileInteractionResult | null {
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
    dispatch({ type: 'SET_HERO', hero: { hp: Math.min(hero.hpMax, hero.hp + potionHp) } })
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
export function battleEnemy(enemyId: string, enemysData: Record<string, RawEnemy> | undefined): TileInteractionResult | null {
  const enemy = enemysData?.[enemyId]
  if (!enemy) return null

  const name = enemy.name ?? enemyId
  startBattle({ ...enemy, id: enemyId } as never)

  const { hero } = State
  dispatch({ type: 'SET_BATTLE', battle: null })
  if (hero.hp <= 0) {
    dispatch({ type: 'SET_HERO', hero: { hp: 0 } })
    return { message: `你被 ${name} 击败了…`, consumed: false }
  }

  dispatch({ type: 'SET_HERO', hero: { money: hero.money + enemy.money, exp: hero.exp + enemy.exp } })
  return { message: `击败${name}（💰+${enemy.money} ⭐+${enemy.exp}）`, consumed: true }
}
