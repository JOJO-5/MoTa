import { describe, it, expect, beforeEach } from 'vitest'
import {
  gameStore,
  dispatch,
  eventMachine,
  pickUpItem,
  battleEnemy,
  interactWithTile,
} from '../index.js'
import type { RawItem, RawEnemy } from './tile-interactions.js'

const ITEMS: Record<string, RawItem> = {
  yellowKey: { cls: 'tools', name: '黄铜钥匙' },
  redGem: { cls: 'items', name: '红宝石', itemEffect: 'atk += 1' },
  blueGem: { cls: 'items', name: '蓝宝石', itemEffect: 'def += 1' },
  redPotion: { cls: 'items', name: '红药水', itemEffect: 'hp += 25' },
  I451: { cls: 'items', name: '粉色元气瓶', itemEffect: 'hp += 500' },
  I457: { cls: 'items', name: '黄色水晶', itemEffect: 'atk += 5; def += 5;' },
  sword1: { cls: 'equips', name: '铁剑', equip: { type: 0, value: { atk: 8 } } },
  sword2: {
    cls: 'equips',
    name: '银光剑',
    itemEffect: 'atk += 18',
    equip: { type: 0, value: { atk: 26 } },
  },
  shield1: { cls: 'equips', name: '小盾牌', equip: { type: 1, value: { def: 19 } } },
}

const ENEMIES: Record<string, RawEnemy> = {
  greenSlime: { name: '绿色史莱姆', hp: 15, atk: 2, def: 0, money: 0, exp: 1 },
  wolf: { name: '恶狼', hp: 50, atk: 25, def: 0, money: 3, exp: 2 },
  dragon: { name: '巨龙', hp: 99999, atk: 999, def: 999, money: 0, exp: 0 },
  poisonSlime: {
    name: '毒史莱姆',
    hp: 1,
    atk: 0,
    def: 0,
    money: 7,
    exp: 4,
    special: [12],
  },
  curseSlime: {
    name: '诅咒史莱姆',
    hp: 1,
    atk: 0,
    def: 0,
    money: 7,
    exp: 4,
    special: [14],
  },
  regenerator: {
    name: '再生怪',
    hp: 1,
    atk: 0,
    def: 0,
    money: 0,
    exp: 0,
    special: [32],
    afterBattle: [{ type: 'setBlock', number: 'secondForm' }],
  },
}

const MAPS = {
  '21': { cls: 'items', id: 'yellowKey' },
  '201': { cls: 'enemys', id: 'greenSlime' },
  '301': { cls: 'enemy48', id: 'greenSlime' },
  '478': {
    cls: 'animates',
    id: 'IceNet',
    script: 'core.status.hero.hp -= 50',
  },
  '495': {
    cls: 'terrains',
    id: 'T495',
    event: [
      { type: 'setValue', name: 'status:hp', operator: '+=', value: '4000' },
      { type: 'hide', remove: true },
    ],
  },
}

describe('tile-interactions', () => {
  beforeEach(() => {
    eventMachine.stop()
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

  it('adds potion health beyond the display baseline like the source game', () => {
    pickUpItem('redPotion', ITEMS)
    expect(gameStore.getState().state.hero.hp).toBe(1025)
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

  it('replaces an equipped weapon bonus instead of stacking cumulative values', () => {
    pickUpItem('sword1', ITEMS)
    pickUpItem('sword2', ITEMS)
    const hero = gameStore.getState().state.hero
    expect(hero.atk).toBe(36)
    expect(hero.equipment.weapon).toBe('sword2')
  })

  it('applies late-game item effects immediately instead of storing an unusable item', () => {
    pickUpItem('I451', ITEMS)
    pickUpItem('I457', ITEMS)
    const hero = gameStore.getState().state.hero
    expect(hero.hp).toBe(1500)
    expect(hero.atk).toBe(15)
    expect(hero.def).toBe(15)
    expect(hero.items).not.toContain('I451')
    expect(hero.items).not.toContain('I457')
  })

  it('wins an easy battle and grants rewards, clearing the tile', () => {
    const result = battleEnemy('wolf', ENEMIES)
    expect(result?.consumed).toBe(true)
    const hero = gameStore.getState().state.hero
    expect(hero.hp).toBeLessThan(1000)
    expect(hero.exp).toBe(2)
    expect(hero.money).toBe(3)
    expect(gameStore.getState().state.battle).toMatchObject({
      enemyId: 'wolf',
      heroHpBefore: 1000,
      heroHpAfter: hero.hp,
      outcome: 'victory',
    })
  })

  it('warns about a hopeless battle without taking HP or clearing the tile', () => {
    const result = battleEnemy('dragon', ENEMIES)

    expect(result?.consumed).toBe(false)
    expect(result?.message).toContain('你打不过')
    expect(result?.message).toContain('当前 HP 1000')
    expect(gameStore.getState().state.hero.hp).toBe(1000)
  })

  it('applies poison after a victorious poison battle', () => {
    const result = battleEnemy('poisonSlime', ENEMIES)

    expect(result?.consumed).toBe(true)
    expect(gameStore.getState().state.flags.poison).toBe(true)
  })

  it('grants no money or experience after a victorious curse battle', () => {
    const result = battleEnemy('curseSlime', ENEMIES)

    expect(result?.consumed).toBe(true)
    expect(gameStore.getState().state.flags.curse).toBe(true)
    expect(gameStore.getState().state.hero.money).toBe(0)
    expect(gameStore.getState().state.hero.exp).toBe(0)
  })

  it('returns enemy after-battle actions for the scene to execute', () => {
    const result = battleEnemy('regenerator', ENEMIES)

    expect(result?.afterBattle).toEqual([{ type: 'setBlock', number: 'secondForm' }])
  })

  it('does not consume an enemy when neither side can damage the other', () => {
    const result = battleEnemy('purpleBowman', {
      ...ENEMIES,
      purpleBowman: { name: '绮鹃攼寮撶鍏?', hp: 1030, atk: 0, def: 200, money: 26, exp: 3 },
    })

    expect(result?.consumed).toBe(false)
    expect(gameStore.getState().state.hero.money).toBe(0)
    expect(gameStore.getState().state.hero.exp).toBe(0)
  })

  it('records a victorious enemy coordinate after clearing the tile', () => {
    const result = interactWithTile('MT0', 7, 4, 201, MAPS, ITEMS, ENEMIES)
    expect(result?.consumed).toBe(true)
    expect(gameStore.getState().state.collectedTiles.MT0).toContain('7,4')
  })

  it('fights and clears 48px enemies with the same rules as normal enemies', () => {
    const result = interactWithTile('JX1', 10, 3, 301, MAPS, ITEMS, ENEMIES)

    expect(result?.consumed).toBe(true)
    expect((result as { kind?: string })?.kind).toBe('enemy')
    expect(gameStore.getState().state.hero.exp).toBe(1)
    expect(gameStore.getState().state.collectedTiles.JX1).toContain('10,3')
  })

  it('runs embedded map events and lets them hide their own tile', () => {
    const result = interactWithTile('JX2', 1, 4, 495, MAPS, ITEMS, ENEMIES)

    expect(result?.consumed).toBe(true)
    expect(gameStore.getState().state.hero.hp).toBe(5000)
    expect(gameStore.getState().state.tileOverrides.JX2['1,4']).toMatchObject({ hidden: true })
  })

  it('applies scripted cold-water damage when the hero has no amulet', () => {
    const result = interactWithTile('JX10', 7, 3, 478, MAPS, ITEMS, ENEMIES)

    expect(result?.consumed).toBe(false)
    expect(gameStore.getState().state.hero.hp).toBe(950)
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
