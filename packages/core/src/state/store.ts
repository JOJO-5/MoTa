import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { GameState, GameAction, HeroSnapshot, Direction } from '../types.js'

const INITIAL_HERO: HeroSnapshot = {
  hp: 1000,
  hpMax: 1000,
  atk: 10,
  def: 10,
  mdef: 0,
  money: 0,
  exp: 0,
  level: 1,
  keys: { yellowKey: 0, blueKey: 0, redKey: 0 },
  items: [],
  equipment: {},
}

const INITIAL_UI = {
  modal: null as string | null,
  floorMsg: null as string | null,
  bgm: null as string | null,
}

export const createInitialState = (floorId: string, x: number, y: number): GameState => ({
  hero: { ...INITIAL_HERO, keys: { ...INITIAL_HERO.keys }, items: [...INITIAL_HERO.items], equipment: { ...INITIAL_HERO.equipment } },
  floorId,
  position: { x, y },
  direction: 'up' as Direction,
  actors: [],
  flags: {},
  values: {},
  enemys: {},
  battle: null,
  ui: { ...INITIAL_UI },
})

interface StoreState {
  state: GameState
  dispatch: (action: GameAction) => void
}

function createStore() {
  return create<StoreState>()(
    immer((set) => ({
      state: createInitialState('MT0', 6, 6),
      dispatch: (action: GameAction) => {
        set((s) => {
          switch (action.type) {
            case 'SET_HERO':
              Object.assign(s.state.hero, action.hero)
              break
            case 'SET_FLOOR':
              s.state.floorId = action.floorId
              break
            case 'SET_POSITION':
              s.state.position = action.position
              break
            case 'SET_DIRECTION':
              s.state.direction = action.direction
              break
            case 'SET_FLAG':
              s.state.flags[action.name] = action.value
              break
            case 'SET_VALUE':
              s.state.values[action.name] = action.value
              break
            case 'ADD_ITEM':
              if (!s.state.hero.items.includes(action.itemId)) {
                s.state.hero.items.push(action.itemId)
              }
              break
            case 'REMOVE_ITEM':
              s.state.hero.items = s.state.hero.items.filter((i) => i !== action.itemId)
              break
            case 'USE_KEY':
              if (s.state.hero.keys[action.keyType] !== undefined) {
                s.state.hero.keys[action.keyType]--
              }
              break
            case 'SET_BATTLE':
              s.state.battle = action.battle
              break
            case 'SET_UI':
              Object.assign(s.state.ui, action.ui)
              break
            case 'LOAD_STATE':
              Object.assign(s.state, action.state)
              break
            case 'RESET':
              Object.assign(s.state, createInitialState('MT0', 6, 6))
              break
          }
        })
      },
    }))
  )
}

export const gameStore = createStore()
export const getState = gameStore.getState
export const setState = gameStore.setState
export const dispatch = (action: GameAction) => gameStore.getState().dispatch(action)
export const State = new Proxy({} as GameState, {
  get: (_target, prop) => (gameStore.getState().state as unknown as Record<string | symbol, unknown>)[prop as string],
  has: (_target, prop) => prop in gameStore.getState().state,
  ownKeys: () => Reflect.ownKeys(gameStore.getState().state),
  getOwnPropertyDescriptor: (_target, prop) => {
    const value = (gameStore.getState().state as unknown as Record<string | symbol, unknown>)[prop as string]
    return {
      configurable: true,
      enumerable: true,
      writable: false,
      value,
    }
  },
})
