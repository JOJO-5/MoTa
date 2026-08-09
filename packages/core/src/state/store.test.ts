import { describe, it, expect, beforeEach } from 'vitest'
import { createInitialState, gameStore } from './store.js'
import type { GameAction, GameState } from '../types.js'

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
        initial.hero.items = initial.hero.items.filter((i) => i !== action.itemId)
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
    expect(store.hero.items.filter((i) => i === 'redKey').length).toBe(1)
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

  it('commits floor, landing position, and direction in one store update', () => {
    gameStore.getState().dispatch({ type: 'LOAD_STATE', state: createInitialState('MT0', 6, 6) })
    const updates: Array<{
      floorId: string
      position: { x: number; y: number }
      direction: string
    }> = []
    const unsubscribe = gameStore.subscribe((next) => {
      updates.push({
        floorId: next.state.floorId,
        position: { ...next.state.position },
        direction: next.state.direction,
      })
    })

    const dispatchUnknown = gameStore.getState().dispatch as unknown as (action: unknown) => void
    dispatchUnknown({
      type: 'ENTER_FLOOR',
      floorId: 'MT1',
      position: { x: 7, y: 13 },
      direction: 'down',
    })
    unsubscribe()

    expect(gameStore.getState().state.floorId).toBe('MT1')
    expect(gameStore.getState().state.position).toEqual({ x: 7, y: 13 })
    expect(gameStore.getState().state.direction).toBe('down')
    expect(updates).toEqual([{ floorId: 'MT1', position: { x: 7, y: 13 }, direction: 'down' }])
  })

  it('records each visited floor only once', () => {
    gameStore.getState().dispatch({ type: 'LOAD_STATE', state: createInitialState('MT0', 6, 6) })
    const dispatchUnknown = gameStore.getState().dispatch as unknown as (action: unknown) => void

    dispatchUnknown({ type: 'MARK_FLOOR_VISITED', floorId: 'MT1' })
    dispatchUnknown({ type: 'MARK_FLOOR_VISITED', floorId: 'MT1' })

    expect(gameStore.getState().state.visitedFloors).toEqual(['MT1'])
  })

  it('migrates old loaded states with new runtime fields', () => {
    const legacyState = createInitialState('MT0', 6, 6) as Partial<GameState>
    delete legacyState.visitedFloors
    delete legacyState.tileOverrides

    gameStore.getState().dispatch({ type: 'LOAD_STATE', state: legacyState as GameState })

    expect(gameStore.getState().state.visitedFloors).toEqual([])
    expect(gameStore.getState().state.tileOverrides).toEqual({})
  })
})
