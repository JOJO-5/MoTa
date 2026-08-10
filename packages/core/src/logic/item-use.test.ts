import { describe, expect, it } from 'vitest'
import { createInitialState } from '../state/store.js'
import { resolveItemUse } from './item-use.js'

const maps = {
  '0': { cls: 'terrains', id: 'ground' },
  '1': { cls: 'animates', id: 'yellowWall', canBreak: true },
  '5': { cls: 'animates', id: 'lava' },
  '6': { cls: 'animates', id: 'ice' },
  '81': { cls: 'animates', id: 'yellowDoor' },
  '201': { cls: 'enemys', id: 'greenSlime' },
  '202': { cls: 'enemys', id: 'boss' },
}

function context(map: number[][]) {
  const state = createInitialState('MT0', 1, 1)
  state.direction = 'right'
  return { state, map, maps, enemys: { greenSlime: {}, boss: { notBomb: true } } }
}

describe('usable legacy items', () => {
  it('uses a pickaxe on the breakable tile in front of the hero', () => {
    expect(
      resolveItemUse(
        'pickaxe',
        context([
          [0, 0, 0],
          [0, 0, 1],
          [0, 0, 0],
        ])
      )
    ).toEqual({
      ok: true,
      consume: true,
      message: '破墙镐使用成功',
      effect: { type: 'clear-tiles', tiles: [{ x: 2, y: 1 }] },
    })
  })

  it('keeps a pickaxe when there is no breakable tile ahead', () => {
    expect(
      resolveItemUse(
        'pickaxe',
        context([
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ])
      )
    ).toMatchObject({
      ok: false,
      consume: false,
      message: '前方没有可以破坏的墙',
    })
  })

  it('bombs adjacent ordinary enemies but preserves protected enemies', () => {
    expect(
      resolveItemUse(
        'bomb',
        context([
          [0, 201, 0],
          [0, 0, 202],
          [0, 201, 0],
        ])
      )
    ).toMatchObject({
      ok: true,
      consume: true,
      effect: {
        type: 'clear-tiles',
        tiles: [
          { x: 1, y: 0 },
          { x: 1, y: 2 },
        ],
      },
    })
  })

  it('opens the monster mirror without consuming it', () => {
    expect(resolveItemUse('book', context([[0]]))).toEqual({
      ok: true,
      consume: false,
      message: '打开心镜',
      effect: { type: 'show-enemy-guide' },
    })
  })
})
