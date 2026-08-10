import { describe, expect, it } from 'vitest'
import { createInitialState } from '@modern-mota/core'
import { buildInventoryView } from './item-catalog.js'

describe('inventory presentation', () => {
  it('uses Chinese content metadata instead of exposing internal ids', () => {
    const hero = createInitialState('MT0', 6, 6).hero
    hero.equipment.weapon = 'sword1'
    hero.items.push('book', 'pickaxe')

    const view = buildInventoryView(
      hero,
      { 'item:book': 1, 'item:pickaxe': 3 },
      {
        sword1: { cls: 'equips', name: '铁剑', text: '普通的攻击武器' },
        book: { cls: 'constants', name: '心镜', text: '洞察敌人信息' },
        pickaxe: { cls: 'tools', name: '破墙镐', text: '可以破坏勇士面前的墙' },
      }
    )

    expect(view.equipment).toEqual([
      { id: 'sword1', slot: '武器', name: '铁剑', description: '普通的攻击武器' },
    ])
    expect(view.items).toEqual([
      {
        id: 'book',
        name: '心镜',
        description: '洞察敌人信息',
        count: 1,
        category: '永久道具',
        usable: true,
        availability: 'usable',
      },
      {
        id: 'pickaxe',
        name: '破墙镐',
        description: '可以破坏勇士面前的墙',
        count: 3,
        category: '消耗道具',
        usable: true,
        availability: 'usable',
      },
    ])
  })

  it('distinguishes usable, passive and not-yet-supported active items', () => {
    const hero = createInitialState('MT0', 6, 6).hero
    hero.items.push('book', 'amulet', 'fly')

    const view = buildInventoryView(
      hero,
      { 'item:book': 1, 'item:amulet': 1, 'item:fly': 1 },
      {
        book: { cls: 'constants', name: '心镜', useItemEffect: 'openBook()' },
        amulet: { cls: 'constants', name: '护身符' },
        fly: { cls: 'constants', name: '楼层传送器', useItemEffect: 'openFly()' },
      }
    )

    expect(view.items.map(({ id, availability }) => ({ id, availability }))).toEqual([
      { id: 'book', availability: 'usable' },
      { id: 'amulet', availability: 'passive' },
      { id: 'fly', availability: 'unavailable' },
    ])
  })
})
