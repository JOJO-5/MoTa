import { dispatch, State } from '../state/store.js'

export interface ItemEffectData {
  cls?: string
  name?: string
  itemEffect?: string
  equip?: {
    type?: number
    value?: Record<string, number>
  }
}

export interface ItemGrantResult {
  applied: boolean
  message: string
  stored?: boolean
}

const KEY_IDS = new Set(['yellowKey', 'blueKey', 'redKey', 'greenKey', 'steelKey', 'bigKey'])
const BASIC_VALUES: Record<string, Record<string, number>> = {
  redGem: { atk: 1 },
  blueGem: { def: 1 },
  greenGem: { mdef: 2 },
  yellowGem: { atk: 1, def: 1 },
  redPotion: { hp: 25 },
  bluePotion: { hp: 50 },
  yellowPotion: { hp: 100 },
  greenPotion: { hp: 250 },
}

function itemCount(itemId: string): number {
  return Math.max(
    Number(State.values[`item:${itemId}`]) || 0,
    State.hero.items.includes(itemId) ? 1 : 0
  )
}

function addOwnedItem(itemId: string, count: number) {
  dispatch({ type: 'SET_VALUE', name: `item:${itemId}`, value: count })
}

function equipmentSlot(type: number | undefined): 'weapon' | 'shield' | 'accessory' {
  if (type === 0) return 'weapon'
  if (type === 1) return 'shield'
  return 'accessory'
}

function applyEquipment(
  itemId: string,
  item: ItemEffectData,
  itemsData: Record<string, ItemEffectData> | undefined
): ItemGrantResult {
  const value = item.equip?.value ?? {}
  const slot = equipmentSlot(item.equip?.type)
  const previousId = State.hero.equipment[slot]
  const towerData = (globalThis as Record<string, unknown>).__towerData as
    { items?: Record<string, ItemEffectData> } | undefined
  const previousValue = previousId
    ? (itemsData?.[previousId]?.equip?.value ?? towerData?.items?.[previousId]?.equip?.value ?? {})
    : {}
  const heroPatch: Record<string, number> = {}
  for (const stat of ['atk', 'def', 'mdef'] as const) {
    const oldBonus = Number(previousValue?.[stat]) || 0
    const newBonus = Number(value[stat]) || 0
    if (oldBonus || newBonus) heroPatch[stat] = State.hero[stat] - oldBonus + newBonus
  }
  dispatch({
    type: 'SET_HERO',
    hero: {
      ...heroPatch,
      equipment: { ...State.hero.equipment, [slot]: itemId },
    },
  })
  addOwnedItem(itemId, Math.max(1, itemCount(itemId) + 1))
  return { applied: true, message: `装备${item.name ?? itemId}` }
}

function resolveRightHandValue(itemId: string, raw: string): number | null {
  const direct = Number(raw.trim())
  if (Number.isFinite(direct)) return direct
  return BASIC_VALUES[itemId] ? undefinedValue(BASIC_VALUES[itemId]) : null
}

function undefinedValue(values: Record<string, number>): number | null {
  const keys = Object.keys(values)
  return keys.length === 1 ? values[keys[0]] : null
}

function applyScriptedEffects(itemId: string, item: ItemEffectData): ItemGrantResult {
  if (itemId === 'bigKey') {
    const keys = { ...State.hero.keys }
    for (const key of ['yellowKey', 'blueKey', 'redKey']) keys[key] = (keys[key] ?? 0) + 1
    dispatch({ type: 'SET_HERO', hero: { keys } })
    return { applied: true, message: '获得大黄门钥匙（黄、蓝、红钥匙各1）' }
  }

  const effect = item.itemEffect?.replace(/\s+/g, ' ').trim()
  if (!effect) return { applied: false, message: '' }
  const clauses = effect
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
  const patch: Record<string, number> = {}
  let applied = false
  for (const clause of clauses) {
    const match = clause.match(
      /^(?:core\.status\.hero\.)?(hp|atk|def|mdef|money|exp)\s*(\+=|-=|\*=|\/=)\s*(.+)$/
    )
    if (!match) continue
    const stat = match[1] as 'hp' | 'atk' | 'def' | 'mdef' | 'money' | 'exp'
    const operator = match[2]
    const right = resolveRightHandValue(itemId, match[3])
    if (right === null) continue
    const current = State.hero[stat]
    patch[stat] =
      operator === '+='
        ? current + right
        : operator === '-='
          ? current - right
          : operator === '*='
            ? current * right
            : right === 0
              ? current
              : Math.floor(current / right)
    applied = true
  }
  if (!applied) return { applied: false, message: '' }
  dispatch({ type: 'SET_HERO', hero: patch })
  return { applied: true, message: `获得${item.name ?? itemId}` }
}

export function grantItem(
  itemId: string,
  itemsData: Record<string, ItemEffectData> | undefined
): ItemGrantResult {
  const item = itemsData?.[itemId]
  if (!item) return { applied: false, message: '' }

  if (KEY_IDS.has(itemId) && itemId !== 'bigKey') {
    dispatch({
      type: 'SET_HERO',
      hero: { keys: { ...State.hero.keys, [itemId]: (State.hero.keys[itemId] ?? 0) + 1 } },
    })
    return { applied: true, message: '获得钥匙 ×1', stored: false }
  }

  if (item.cls === 'equips' && item.equip?.value) return applyEquipment(itemId, item, itemsData)

  const effect = applyScriptedEffects(itemId, item)
  if (effect.applied) return effect

  dispatch({ type: 'ADD_ITEM', itemId })
  return { applied: true, message: `获得${item.name ?? itemId}`, stored: true }
}

export function setLegacyItemCount(
  itemId: string,
  nextCount: number,
  itemsData: Record<string, ItemEffectData> | undefined
) {
  const target = Math.max(0, Math.floor(nextCount))
  const current = itemCount(itemId)
  let stored = false
  for (let i = current; i < target; i++) {
    stored = grantItem(itemId, itemsData).stored === true || stored
  }
  if (target <= current || stored) {
    dispatch({ type: 'SET_VALUE', name: `item:${itemId}`, value: target })
  }
}
