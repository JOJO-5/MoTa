import { describe, it, expect, beforeEach } from 'vitest'
import { calculateDamage, startBattle, endBattle } from './battle.js'
import { dispatch, State, createInitialState } from '../state/store.js'
import type { Enemy } from '@modern-mota/data'

describe('calculateDamage', () => {
  it('calculates correct damage', () => {
    expect(calculateDamage(100, 50)).toBe(50)
    expect(calculateDamage(50, 100)).toBe(0)
    expect(calculateDamage(100, 100)).toBe(0)
  })
})

describe('startBattle', () => {
  const mockEnemy: Enemy = {
    id: 'greenSlime',
    name: '绿色史莱姆',
    hp: 100,
    atk: 10,
    def: 10,
    money: 5,
    exp: 2,
    special: [],
    priority: 0,
  }

  beforeEach(() => {
    dispatch({ type: 'LOAD_STATE', state: createInitialState('MT0', 6, 6) })
    // Reset hero stats for predictable tests
    dispatch({ type: 'SET_HERO', hero: { hp: 100, atk: 20, def: 5 } })
  })

  it('updates hero HP and sets battle state correctly', () => {
    startBattle(mockEnemy)
    // Hero: 100 HP, 20 ATK, 5 DEF
    // Enemy: 100 HP, 10 ATK, 10 DEF
    // Hero vs Enemy: Hero deals 20-10=10 damage/turn
    // Enemy vs Hero: Enemy deals 10-5=5 damage/turn

    // Turn 1: Hero deals 10. Enemy HP = 90. Enemy deals 5. Hero HP = 95.
    // Turn 2: Hero deals 10. Enemy HP = 80. Enemy deals 5. Hero HP = 90.
    // ...
    // Turn 10: Hero deals 10. Enemy HP = 0. Hero wins.
    // Hero does NOT take damage on the last turn if enemy is defeated first.
    // Total damage taken: 9 turns * 5 damage = 45.

    expect(State.hero.hp).toBe(55) // 100 - 45 = 55
    expect(State.battle).not.toBeNull()
    expect(State.battle?.enemyId).toBe('greenSlime')
    expect(State.battle?.enemyHp).toBeLessThanOrEqual(0)
    expect(State.battle?.turns).toBe(10)
  })

  it('handles hero losing battle', () => {
    dispatch({ type: 'SET_HERO', hero: { hp: 10, atk: 5, def: 5 } })
    startBattle(mockEnemy)
    // Hero: 10 HP, 5 ATK, 5 DEF
    // Enemy: 100 HP, 10 ATK, 10 DEF
    // Hero deals 5-10 = 0 damage/turn
    // Enemy deals 10-5 = 5 damage/turn

    // Hero HP will drop to 0 after 2 turns, enemy HP won't change.
    expect(State.hero.hp).toBeLessThanOrEqual(0)
    expect(State.battle).not.toBeNull()
  })

  it('stops a zero-damage battle without hanging or declaring victory', () => {
    const immovableEnemy: Enemy = {
      ...mockEnemy,
      id: 'purpleBowman',
      hp: 1030,
      atk: 0,
      def: 200,
    }

    const result = startBattle(immovableEnemy)

    expect(result.outcome).toBe('stalemate')
    expect(result.turns).toBe(1)
    expect(result.enemyHp).toBe(1030)
    expect(State.hero.hp).toBe(100)
    expect(State.battle?.enemyHp).toBe(1030)
  })

  it('honors numeric magic attack, multi-hit, first-strike and dark specials', () => {
    const fight = (special: number[]) => {
      dispatch({ type: 'SET_HERO', hero: { hp: 100, atk: 20, def: 5, mdef: 0 } })
      return startBattle({
        ...mockEnemy,
        id: `special-${special.join('-')}`,
        hp: 20,
        atk: 10,
        def: 10,
        special,
      } as Enemy)
    }

    expect(fight([2]).heroHp).toBe(90)
    expect(fight([4]).heroHp).toBe(90)
    expect(fight([1]).heroHp).toBe(90)
    expect(fight([31]).heroHp).toBe(85)
  })

  it('treats numeric solid defense as hero attack minus one', () => {
    dispatch({ type: 'SET_HERO', hero: { hp: 100, atk: 20, def: 20 } })
    const result = startBattle({
      ...mockEnemy,
      id: 'solid-enemy',
      hp: 2,
      atk: 10,
      def: 0,
      special: [3],
    } as Enemy)

    expect(result.outcome).toBe('victory')
    expect(result.turns).toBe(2)
  })

  it('blocks mysterious enemies until the hero owns the cross', () => {
    const mysterious = { ...mockEnemy, id: 'mysterious', hp: 1, def: 0, special: [20] } as Enemy

    expect(startBattle(mysterious).outcome).toBe('stalemate')
    dispatch({ type: 'ADD_ITEM', itemId: 'cross' })
    expect(startBattle(mysterious).outcome).toBe('victory')
  })
})

describe('endBattle', () => {
  beforeEach(() => {
    dispatch({ type: 'LOAD_STATE', state: createInitialState('MT0', 6, 6) })
    dispatch({ type: 'SET_BATTLE', battle: { enemyId: 'test', enemyHp: 1, turns: 1 } })
  })

  it('resets battle state to null', () => {
    endBattle()
    expect(State.battle).toBeNull()
  })
})
