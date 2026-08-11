import { describe, expect, it } from 'vitest'
import { createInitialState } from '../state/store.js'
import { resolveItemUse } from './item-use.js'

const maps = {
  '0': { cls: 'terrains', id: 'ground' },
  '1': { cls: 'animates', id: 'yellowWall', canBreak: true },
  '4': { cls: 'animates', id: 'star' },
  '10010': { cls: 'tileset', id: 'X10010' },
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

function specialContext(floorId: string, map: number[][]) {
  const result = context(map)
  result.state.floorId = floorId
  result.state.flags.pzf = 1
  return result
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

  it('allows special mode to break star tiles on MT11 through MT20', () => {
    expect(
      resolveItemUse(
        'pickaxe',
        specialContext('MT11', [
          [0, 0, 0],
          [0, 0, 4],
          [0, 0, 0],
        ])
      )
    ).toMatchObject({ ok: true, consume: true })
  })

  it('allows special mode to break tileset walls on MT10 and MT26', () => {
    expect(
      resolveItemUse(
        'pickaxe',
        specialContext('MT10', [
          [0, 0, 0],
          [0, 0, 10010],
          [0, 0, 0],
        ])
      )
    ).toMatchObject({ ok: true, consume: true })
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

  it('clears poison with an antidote and consumes one bottle', () => {
    const state = context([[0]]).state
    state.flags.poison = true
    expect(resolveItemUse('poisonWine', { ...context([[0]]), state })).toEqual({
      ok: true,
      consume: true,
      message: '抗毒剂使用成功',
      effect: { type: 'clear-flags', flags: ['poison'] },
    })
  })

  it('flies to the center-symmetric empty tile only', () => {
    const state = context([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]).state
    state.position = { x: 0, y: 0 }
    expect(
      resolveItemUse('centerFly', {
        ...context([
          [0, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ]),
        state,
      })
    ).toEqual({
      ok: true,
      consume: true,
      message: '圆转飞行器使用成功',
      effect: { type: 'teleport', position: { x: 2, y: 2 } },
    })
  })

  it('supports stat-based consumables instead of leaving them inert', () => {
    const state = context([[0]]).state
    state.hero.hp = 200
    expect(resolveItemUse('superPotion', { ...context([[0]]), state })).toMatchObject({
      ok: true,
      consume: true,
      effect: { type: 'hero-patch', hero: { hp: 400 } },
    })
  })

  it('clears every breakable wall with an earthquake scroll', () => {
    expect(
      resolveItemUse(
        'earthquake',
        context([
          [0, 1, 0],
          [1, 0, 1],
          [0, 1, 0],
        ])
      )
    ).toMatchObject({
      ok: true,
      consume: true,
      effect: {
        type: 'clear-tiles',
        tiles: [
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: 2, y: 1 },
          { x: 1, y: 2 },
        ],
      },
    })
  })

  it('jumps two empty cells in the facing direction', () => {
    expect(
      resolveItemUse(
        'jumpShoes',
        context([
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ])
      )
    ).toMatchObject({
      ok: true,
      consume: true,
      effect: { type: 'teleport', position: { x: 3, y: 1 } },
    })
  })

  it('keeps jump shoes when the landing cell is outside the map', () => {
    const state = context([[0, 0, 0]]).state
    state.position = { x: 2, y: 0 }
    expect(resolveItemUse('jumpShoes', { ...context([[0, 0, 0]]), state })).toMatchObject({
      ok: false,
      consume: false,
    })
  })

  it('uses the next floor when an up-floor item has a safe matching cell', () => {
    const state = context([[0, 0, 0]]).state
    state.position = { x: 1, y: 0 }
    const result = resolveItemUse('upFly', {
      ...context([[0, 0, 0]]),
      state,
      floorIds: ['MT0', 'MT1'],
      floors: { MT1: { map: [[0, 0, 0]] } },
    })
    expect(result).toMatchObject({
      ok: true,
      consume: true,
      effect: { type: 'change-floor', direction: 'up' },
    })
  })
})
