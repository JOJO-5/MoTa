export interface ShopItem {
  id: string
  name: string
  price: number
  description?: string
}

export interface ShopSystem {
  open(shopId: string, items: ShopItem[]): void
  purchase(itemId: string): boolean
  close(): void
}

export const shopSystem: ShopSystem = {
  open(_shopId, _items) { /* TODO */ },
  purchase(_itemId) { return false },
  close() { /* TODO */ },
}
