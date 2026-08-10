import { isSupportedUsableItem, type HeroSnapshot } from '@modern-mota/core'

export interface ItemDefinition {
  cls?: string
  name?: string
  text?: string
  useItemEffect?: string
}

export interface EquipmentView {
  id: string
  slot: string
  name: string
  description: string
}

export interface InventoryItemView {
  id: string
  name: string
  description: string
  count: number
  category: string
  usable: boolean
  availability: 'usable' | 'passive' | 'unavailable'
}

const SLOT_LABELS = {
  weapon: '武器',
  shield: '盾牌',
  accessory: '饰品',
} as const

function safeItemText(item: ItemDefinition | undefined, fallback: string) {
  return {
    name: item?.name?.trim() || fallback,
    description: item?.text?.trim() || '暂无说明',
  }
}

function itemCategory(cls: string | undefined): string {
  if (cls === 'tools') return '消耗道具'
  if (cls === 'constants') return '永久道具'
  return '重要道具'
}

export function buildInventoryView(
  hero: HeroSnapshot,
  values: Record<string, number>,
  items: Record<string, ItemDefinition>
): { equipment: EquipmentView[]; items: InventoryItemView[] } {
  const equipment = (Object.keys(SLOT_LABELS) as Array<keyof typeof SLOT_LABELS>).flatMap(
    (slot) => {
      const id = hero.equipment[slot]
      if (!id) return []
      const text = safeItemText(items[id], '未知装备')
      return [{ id, slot: SLOT_LABELS[slot], ...text }]
    }
  )

  const inventoryIds = [...hero.items]
  for (const [key, count] of Object.entries(values)) {
    if (!key.startsWith('item:') || count <= 0) continue
    const id = key.slice('item:'.length)
    if (!inventoryIds.includes(id)) inventoryIds.push(id)
  }

  const inventory = inventoryIds.map((id) => {
    const definition = items[id]
    const text = safeItemText(definition, '未知道具')
    const usable = isSupportedUsableItem(id)
    const availability: InventoryItemView['availability'] = usable
      ? 'usable'
      : definition?.useItemEffect?.trim()
        ? 'unavailable'
        : 'passive'
    return {
      id,
      ...text,
      count: Math.max(1, Number(values[`item:${id}`]) || 0),
      category: itemCategory(definition?.cls),
      usable,
      availability,
    }
  })

  return { equipment, items: inventory }
}
