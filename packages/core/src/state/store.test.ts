import { describe, it, expect, beforeEach } from 'vitest'
import { createInitialState } from './store.js'
import type { GameAction } from '../types.js'

let store: ReturnType<typeof createInitialState>

function makeDispatch(initial: ReturnType<typeof createInitialState>) {
  return (action: GameAction) => {
    switch (action.type) {
      case 'SET_HERO':
        Object.assign(initial.hero, action.hero)
        break
      case 'SET_FLOOR':
        initial.floorId = action.floorId
        break
      case 'SET_POSITION':
        initial.position = action.position
        break
      case 'SET_FLAG':
        initial.flags[action.name] = action.value
        break
      case 'SET_VALUE':
        initial.values[action.name] = action.value
        break
      case 'ADD_ITEM':
        if (!initial.hero.items.includes(action.itemId)) {
          initial.hero.items.push(action.itemId)
        }
        break
      case 'REMOVE_ITEM':
        initial.hero.items = initial.hero.items.filter(i => i !== action.itemId)
        break
      case 'USE_KEY':
        if (initial.hero.keys[action.keyType] !== undefined) {
          initial.hero.keys[action.keyType]--
        }
        break
      case 'SET_DIRECTION':
        initial.direction = action.direction
        break
      case 'RESET':
        Object.assign(initial, createInitialState('MT0', 6, 6))
        break
    }
  }
}

describe('GameState', () => {
  beforeEach(() => {
    store = createInitialState('MT0', 6, 6)
  })

  it('creates initial state with defaults', () => {
    expect(store.hero.hp).toBe(1000)
    expect(store.hero.atk).toBe(10)
    expect(store.hero.def).toBe(10)
    expect(store.floorId).toBe('MT0')
    expect(store.position).toEqual({ x: 6, y: 6 })
    expect(store.battle).toBeNull()
  })

  it('SET_HERO updates hero fields', () => {
    const dispatch = makeDispatch(store)
    dispatch({ type: 'SET_HERO', hero: { hp: 500, atk: 50 } })
    expect(store.hero.hp).toBe(500)
    expect(store.hero.atk).toBe(50)
    expect(store.hero.def).toBe(10)
  })

  it('SET_FLAG sets flag values', () => {
    const dispatch = makeDispatch(store)
    dispatch({ type: 'SET_FLAG', name: 'tutorial', value: true })
    expect(store.flags.tutorial).toBe(true)
    dispatch({ type: 'SET_FLAG', name: 'tutorial', value: 2 })
    expect(store.flags.tutorial).toBe(2)
  })

  it('ADD_ITEM adds items to inventory', () => {
    const dispatch = makeDispatch(store)
    dispatch({ type: 'ADD_ITEM', itemId: 'redKey' })
    expect(store.hero.items).toContain('redKey')
    dispatch({ type: 'ADD_ITEM', itemId: 'redKey' })
    expect(store.hero.items.filter(i => i === 'redKey').length).toBe(1)
  })

  it('USE_KEY decrements key count', () => {
    store.hero.keys.redKey = 3
    const dispatch = makeDispatch(store)
    dispatch({ type: 'USE_KEY', keyType: 'redKey' })
    expect(store.hero.keys.redKey).toBe(2)
  })

  it('RESET restores initial state', () => {
    const dispatch = makeDispatch(store)
    store.hero.hp = 100
    store.hero.keys.redKey = 99
    dispatch({ type: 'RESET' })
    expect(store.hero.hp).toBe(1000)
    expect(store.hero.keys.redKey).toBe(0)
  })
})
