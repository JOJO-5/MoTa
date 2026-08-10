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

  it('applies a zone special when stepping into the enemy range', () => {
    const floorWithZone = {
      map: [
        [0, 201, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      cannotMove: {},
    }
    const enemyMaps = { '201': { cls: 'enemys', id: 'watcherSlime' } }
    dispatch({
      type: 'SET_ENEMYS',
      enemys: {
        watcherSlime: {
          id: 'watcherSlime',
          name: '邪眼史莱姆',
          hp: 1,
          atk: 0,
          def: 0,
          money: 0,
          exp: 0,
          special: [15],
          zone: 100,
          zoneSquare: true,
        } as never,
      },
    })
    dispatch({ type: 'SET_POSITION', position: { x: 0, y: 1 } })

    expect(moveHero('right', floorWithZone, enemyMaps)).toBe(true)
    expect(State.hero.hp).toBe(900)
  })

  it('halves HP when stepping between two matching guard monsters', () => {
    const floorWithBetween = {
      map: [
        [0, 0, 0],
        [201, 0, 201],
        [0, 0, 0],
      ],
      cannotMove: {},
    }
    const enemyMaps = { '201': { cls: 'enemys', id: 'guard' } }
    dispatch({
      type: 'SET_ENEMYS',
      enemys: {
        guard: {
          id: 'guard',
          name: '守卫',
          hp: 1,
          atk: 0,
          def: 0,
          money: 0,
          exp: 0,
          special: [16],
        } as never,
      },
    })
    dispatch({ type: 'SET_POSITION', position: { x: 1, y: 0 } })

    expect(moveHero('down', floorWithBetween, enemyMaps)).toBe(true)
    expect(State.hero.hp).toBe(500)
  })

  it('damages the hero and pushes a repulse monster back one tile', () => {
    const floorWithRepulse = {
      map: [
        [0, 0, 0],
        [0, 201, 0],
        [0, 0, 0],
      ],
      cannotMove: {},
    }
    const enemyMaps = { '201': { cls: 'enemys', id: 'redPriest' } }
    dispatch({
      type: 'SET_ENEMYS',
      enemys: {
        redPriest: {
          id: 'redPriest',
          name: '炎术师',
          hp: 1,
          atk: 0,
          def: 0,
          money: 0,
          exp: 0,
          special: [18],
          repulse: 50,
        } as never,
      },
    })
    dispatch({ type: 'SET_POSITION', position: { x: 0, y: 2 } })

    expect(moveHero('right', floorWithRepulse, enemyMaps)).toBe(true)
    expect(State.hero.hp).toBe(950)
    expect(State.tileOverrides.MT0['1,1']).toMatchObject({ hidden: true })
    expect(State.tileOverrides.MT0['1,0']).toMatchObject({ map: 'redPriest', hidden: false })
  })

  it('does not push a repulse monster into a wall', () => {
    const floorWithWall = {
      map: [
        [0, 10030, 0],
        [0, 201, 0],
        [0, 0, 0],
      ],
      cannotMove: {},
    }
    const enemyMaps = {
      '10030': { cls: 'terrains', id: 'sWallT' },
      '201': { cls: 'enemys', id: 'redPriest' },
    }
    dispatch({ type: 'SET_ENEMYS', enemys: { redPriest: { special: [18], repulse: 50 } } })
    dispatch({ type: 'SET_POSITION', position: { x: 0, y: 2 } })

    expect(moveHero('right', floorWithWall, enemyMaps)).toBe(true)
    expect(State.hero.hp).toBe(950)
    expect(State.tileOverrides.MT0?.['1,0']).toBeUndefined()
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
