import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialState, dispatch, gameStore } from '../state/store.js'
import { getRuntimeLayer, getRuntimeMap, getHiddenTiles, type TileLayer } from './floor-state.js'

describe('runtime floor state', () => {
  beforeEach(() => {
    dispatch({ type: 'RESET' })
  })

  it('applies tile overrides without mutating source map data', () => {
    const sourceMap = [
      [10001, 0],
      [0, 10002],
    ]

    dispatch({ type: 'SET_TILE_OVERRIDE', floorId: 'MT0', x: 0, y: 0, override: { map: 0 } })
    dispatch({ type: 'SET_TILE_OVERRIDE', floorId: 'MT0', x: 1, y: 1, override: { map: 10003 } })

    expect(getRuntimeMap('MT0', sourceMap, gameStore.getState().state)).toEqual([
      [0, 0],
      [0, 10003],
    ])
    expect(sourceMap).toEqual([
      [10001, 0],
      [0, 10002],
    ])
  })

  it('supports hidden tiles and background/foreground layers', () => {
    const state = createInitialState('MT0', 0, 0)
    state.tileOverrides = {
      MT0: {
        '1,1': { hidden: true },
        '0,1': { bgmap: 12 },
        '1,0': { fgmap: 13 },
      },
    }

    const layer: TileLayer = 'bgmap'
    expect(
      getRuntimeLayer(
        'MT0',
        layer,
        [
          [0, 0],
          [0, 0],
        ],
        state
      )
    ).toEqual([
      [0, 0],
      [12, 0],
    ])
    expect(getHiddenTiles('MT0', state)).toEqual(new Set(['1,1']))
    expect(
      getRuntimeLayer(
        'MT0',
        'fgmap',
        [
          [0, 0],
          [0, 0],
        ],
        state
      )
    ).toEqual([
      [0, 13],
      [0, 0],
    ])
  })
})
