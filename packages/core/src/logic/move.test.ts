import { describe, it, expect, beforeEach } from 'vitest'
import { findPath, moveHero } from './move.js'
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

  it('deducts poison damage after each successful step', () => {
    dispatch({ type: 'SET_FLAG', name: 'poison', value: true })

    expect(moveHero('up', floor, maps)).toBe(true)
    expect(State.hero.hp).toBe(990)
  })

  it('does not let a defeated hero continue walking', () => {
    dispatch({ type: 'SET_HERO', hero: { hp: 0 } })

    expect(moveHero('up', floor, maps)).toBe(false)
    expect(State.position).toEqual({ x: 1, y: 1 })
  })

  it('finds a shortest walkable route around walls', () => {
    const route = findPath(
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      {
        map: [
          [0, 10030, 0],
          [0, 0, 0],
        ],
        cannotMove: {},
      },
      maps
    )

    expect(route).toEqual(['down', 'right', 'right', 'up'])
  })

  it('can route up to a blocked interaction target without crossing it', () => {
    const route = findPath(
      { x: 0, y: 1 },
      { x: 2, y: 1 },
      {
        map: [
          [0, 0, 0],
          [0, 0, 10030],
        ],
        cannotMove: {},
      },
      maps,
      { allowBlockedTarget: true }
    )

    expect(route).toEqual(['right', 'right'])
  })

  it('returns null when no legal route exists', () => {
    const route = findPath(
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      {
        map: [
          [0, 10030, 0],
          [0, 10030, 0],
        ],
        cannotMove: {},
      },
      maps
    )

    expect(route).toBeNull()
  })
})
