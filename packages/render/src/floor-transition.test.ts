import { describe, expect, it } from 'vitest'
import { getStairPoints, resolveStairLanding } from './floor-transition.js'

describe('resolveStairLanding', () => {
  it('uses the target down stair requested by the source transition', () => {
    expect(
      resolveStairLanding({ upFloor: [13, 13], downFloor: [7, 1] }, 'downFloor', [
        [0, 0, 0],
        [0, 87, 0],
      ])
    ).toEqual([7, 1])
  })

  it('uses the target up stair requested by the source transition', () => {
    expect(
      resolveStairLanding({ upFloor: [2, 2], downFloor: [9, 9] }, 'upFloor', [[0, 0, 0]])
    ).toEqual([2, 2])
  })

  it('falls back to the first complementary stair when metadata is absent', () => {
    expect(
      resolveStairLanding({}, 'downFloor', [
        [0, 0, 0],
        [0, 88, 0],
        [0, 87, 0],
      ])
    ).toEqual([1, 1])
  })
})

describe('getStairPoints', () => {
  it('extracts visible entry points from legacy changeFloor keys', () => {
    expect(getStairPoints({ '7,2': { floorId: 'MT1' }, '13,13': { floorId: 'MT2' } })).toEqual([
      [7, 2],
      [13, 13],
    ])
  })
})
