import { describe, it, expect, beforeEach } from 'vitest'
import { moveHero } from './move.js'
import { dispatch, State, createInitialState } from '../state/store.js'

describe('moveHero', () => {
  const floor = {
    map: [
      [0, 0, 10030],
      [0, 0, 0],
      [0, 0, 0],
    ],
    cannotMove: {},
  }

  const maps = {
    '10030': { cls: 'tileset', id: 'X10030' },
  }

  beforeEach(() => {
    dispatch({ type: 'LOAD_STATE', state: createInitialState('MT0', 1, 1) })
  })

  it('moves hero when path is clear', () => {
    const success = moveHero('up', floor, maps)
    expect(success).toBe(true)
    expect(State.position).toEqual({ x: 1, y: 0 })
    expect(State.direction).toBe('up')
  })

  it('does not move hero into wall', () => {
    dispatch({ type: 'SET_POSITION', position: { x: 1, y: 0 } })
    const success = moveHero('right', floor, maps) // 1,0 to 2,0 (tileset wall)
    expect(success).toBe(false)
    expect(State.position).toEqual({ x: 1, y: 0 })
  })

  it('does not move hero out of bounds', () => {
    dispatch({ type: 'SET_POSITION', position: { x: 0, y: 0 } })
    const success = moveHero('left', floor, maps)
    expect(success).toBe(false)
    expect(State.position).toEqual({ x: 0, y: 0 })
  })

  it('moves hero onto an item tile', () => {
    const floorWithItem = {
      map: [
        [0, 21, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      cannotMove: {},
    }
    const mapsWithItem = {
      '21': { cls: 'items', id: 'yellowKey' },
    }
    dispatch({ type: 'SET_POSITION', position: { x: 0, y: 0 } })
    const success = moveHero('right', floorWithItem, mapsWithItem)
    expect(success).toBe(true)
    expect(State.position).toEqual({ x: 1, y: 0 })
  })
})
