import { describe, it, expect, beforeEach } from 'vitest'
import { gameStore, dispatch, pickUpItem, battleEnemy, interactWithTile } from '../index.js'
import type { RawItem, RawEnemy } from './tile-interactions.js'

const ITEMS: Record<string, RawItem> = {
  yellowKey: { cls: 'tools', name: '黄铜钥匙' },
  redGem: { cls: 'items', name: '红宝石', itemEffect: 'atk += 1' },
  blueGem: { cls: 'items', name: '蓝宝石', itemEffect: 'def += 1' },
  redPotion: { cls: 'items', name: '红药水', itemEffect: 'hp += 25' },
  sword1: { cls: 'equips', name: '铁剑', equip: { type: 0, value: { atk: 8 } } },
  shield1: { cls: 'equips', name: '小盾牌', equip: { type: 1, value: { def: 19 } } },
}

const ENEMIES: Record<string, RawEnemy> = {
  greenSlime: { name: '绿色史莱姆', hp: 15, atk: 2, def: 0, money: 0, exp: 1 },
  wolf: { name: '恶狼', hp: 50, atk: 25, def: 0, money: 3, exp: 2 },
  dragon: { name: '巨龙', hp: 99999, atk: 999, def: 999, money: 0, exp: 0 },
}

const MAPS = {
  '21': { cls: 'items', id: 'yellowKey' },
  '201': { cls: 'enemys', id: 'greenSlime' },
}

describe('tile-interactions', () => {
  beforeEach(() => {
    dispatch({ type: 'RESET' })
  })

  it('picks up a key and increments the counter', () => {
    const result = pickUpItem('yellowKey', ITEMS)
    expect(result?.consumed).toBe(true)
    expect(gameStore.getState().state.hero.keys.yellowKey).toBe(1)
  })

  it('applies gem stat bonuses', () => {
    const hpBefore = gameStore.getState().state.hero.hp
    pickUpItem('redGem', ITEMS)
    pickUpItem('blueGem', ITEMS)
    const hero = gameStore.getState().state.hero
    expect(hero.atk).toBe(11)
    expect(hero.def).toBe(11)
    expect(hero.hp).toBe(hpBefore)
  })

  it('heals with potions without exceeding max HP', () => {
    dispatch({ type: 'SET_HERO', hero: { hp: 10 } })
    pickUpItem('redPotion', ITEMS)
    expect(gameStore.getState().state.hero.hp).toBe(35)
  })

  it('equips weapons and shields', () => {
    pickUpItem('sword1', ITEMS)
    pickUpItem('shield1', ITEMS)
    const hero = gameStore.getState().state.hero
    expect(hero.atk).toBe(18)
    expect(hero.def).toBe(29)
    expect(hero.equipment.weapon).toBe('sword1')
    expect(hero.equipment.shield).toBe('shield1')
  })

  it('wins an easy battle and grants rewards, clearing the tile', () => {
    const result = battleEnemy('wolf', ENEMIES)
    expect(result?.consumed).toBe(true)
    const hero = gameStore.getState().state.hero
    expect(hero.hp).toBeLessThan(1000)
    expect(hero.exp).toBe(2)
    expect(hero.money).toBe(3)
    expect(gameStore.getState().state.battle).toBeNull()
  })

  it('loses a hopeless battle and does not clear the tile', () => {
    const result = battleEnemy('dragon', ENEMIES)
    expect(result?.consumed).toBe(false)
    expect(gameStore.getState().state.hero.hp).toBe(0)
  })

  it('records a victorious enemy coordinate after clearing the tile', () => {
    const result = interactWithTile('MT0', 7, 4, 201, MAPS, ITEMS, ENEMIES)
    expect(result?.consumed).toBe(true)
    expect(gameStore.getState().state.collectedTiles.MT0).toContain('7,4')
  })

  it('increments a key and records its coordinate after pickup', () => {
    const result = interactWithTile('MT0', 3, 8, 21, MAPS, ITEMS, ENEMIES)
    expect(result?.consumed).toBe(true)
    expect(gameStore.getState().state.hero.keys.yellowKey).toBe(1)
    expect(gameStore.getState().state.collectedTiles.MT0).toContain('3,8')

    expect(interactWithTile('MT0', 3, 8, 21, MAPS, ITEMS, ENEMIES)).toBeNull()
    expect(gameStore.getState().state.hero.keys.yellowKey).toBe(1)
  })

  it('returns null for unknown items', () => {
    expect(pickUpItem('doesNotExist', ITEMS)).toBeNull()
    expect(battleEnemy('doesNotExist', ENEMIES)).toBeNull()
  })
})
