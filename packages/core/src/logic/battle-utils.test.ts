import { describe, it, expect } from 'vitest'
import { hasSpecial, calcHeroDamage, calcEnemyDamage } from './battle-utils.js'
import type { HeroSnapshot } from '../types.js'
import type { Enemy } from '@modern-mota/data'

describe('hasSpecial', () => {
  it('returns true if enemy has special', () => {
    const enemy: Enemy = {
      id: 'e1',
      name: 'n1',
      hp: 10,
      atk: 1,
      def: 1,
      money: 1,
      exp: 1,
      special: ['magical'],
      priority: 0,
    }
    expect(hasSpecial(enemy, 'magical')).toBe(true)
    expect(hasSpecial(enemy, 'shield')).toBe(false)
  })
})

describe('calcHeroDamage', () => {
  const hero: HeroSnapshot = {
    hp: 100,
    hpMax: 100,
    mana: 10,
    manaMax: 10,
    atk: 50,
    def: 20,
    money: 0,
    exp: 0,
    level: 1,
    keys: {},
    items: [],
    equipment: {},
  }

  it('calculates basic damage', () => {
    const enemy: Enemy = {
      id: 'e1',
      name: 'n1',
      hp: 10,
      atk: 1,
      def: 10,
      money: 1,
      exp: 1,
      special: [],
      priority: 0,
    }
    expect(calcHeroDamage(hero, enemy)).toBe(40)
  })

  it('calculates damage against magical enemy', () => {
    const enemy: Enemy = {
      id: 'e1',
      name: 'n1',
      hp: 10,
      atk: 1,
      def: 10,
      money: 1,
      exp: 1,
      special: ['magical'],
      priority: 0,
    }
    // Hero (50 ATK) vs Magical Enemy (10 DEF)
    // Base damage: 50 - 10 = 40
    // Magical: +40
    expect(calcHeroDamage(hero, enemy)).toBe(80)
  })

  it('doubles the final strike damage while double slash is active', () => {
    const enemy: Enemy = {
      id: 'e1',
      name: 'n1',
      hp: 10,
      atk: 1,
      def: 10,
      money: 1,
      exp: 1,
      special: [],
      priority: 0,
    }
    expect(calcHeroDamage(hero, enemy, true)).toBe(80)
  })
})

describe('calcEnemyDamage', () => {
  const hero: HeroSnapshot = {
    hp: 100,
    hpMax: 100,
    mana: 10,
    manaMax: 10,
    atk: 50,
    def: 20,
    money: 0,
    exp: 0,
    level: 1,
    keys: {},
    items: [],
    equipment: {},
  }

  it('calculates basic damage', () => {
    const enemy: Enemy = {
      id: 'e1',
      name: 'n1',
      hp: 10,
      atk: 30,
      def: 10,
      money: 1,
      exp: 1,
      special: [],
      priority: 0,
    }
    expect(calcEnemyDamage(hero, enemy)).toBe(10) // Enemy (30 ATK) vs Hero (20 DEF)
  })

  it('calculates damage from magical enemy', () => {
    const enemy: Enemy = {
      id: 'e1',
      name: 'n1',
      hp: 10,
      atk: 30,
      def: 10,
      money: 1,
      exp: 1,
      special: ['magical'],
      priority: 0,
    }
    expect(calcEnemyDamage(hero, enemy)).toBe(30) // Magical enemy ignores hero DEF
  })

  it('calculates damage from shielded enemy', () => {
    const enemy: Enemy = {
      id: 'e1',
      name: 'n1',
      hp: 10,
      atk: 30,
      def: 10,
      money: 1,
      exp: 1,
      special: ['shield'],
      priority: 0,
    }
    // Enemy (30 ATK) vs Hero (20 DEF) = 10 base damage
    // Shielded: 10 - floor(hero.atk/2) = 10 - floor(50/2) = 10 - 25 = -15. Clamped to 0.
    expect(calcEnemyDamage(hero, enemy)).toBe(0)
  })
})
