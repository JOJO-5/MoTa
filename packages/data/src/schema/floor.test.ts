import { describe, it, expect } from 'vitest'
import { FloorSchema } from './floor.js'

describe('FloorSchema', () => {
  it('parses a minimal floor', () => {
    const floor = {
      floorId: 'MT0',
      title: '一层',
      name: '第1层',
      width: 13,
      height: 13,
      map: Array(13).fill(null).map(() => Array(13).fill(0)),
    }
    const parsed = FloorSchema.parse(floor)
    expect(parsed.floorId).toBe('MT0')
    expect(parsed.firstArrive).toEqual([])
    expect(parsed.events).toEqual({})
  })

  it('parses a floor with events', () => {
    const floor = {
      floorId: 'MT1',
      title: '二层',
      name: '第2层',
      width: 13,
      height: 13,
      map: Array(13).fill(null).map(() => Array(13).fill(0)),
      firstArrive: [{ type: 'tip', text: '欢迎来到第2层' }],
      events: {
        '5,5': [{ type: 'battle', id: 'greenSlime' }],
      },
    }
    const parsed = FloorSchema.parse(floor)
    expect(parsed.events['5,5']).toHaveLength(1)
    expect(parsed.events['5,5'][0].type).toBe('battle')
  })

  it('rejects unknown event types', () => {
    const floor = {
      floorId: 'MT1',
      title: '二层',
      name: '第2层',
      width: 13,
      height: 13,
      map: Array(13).fill(null).map(() => Array(13).fill(0)),
      events: {
        '5,5': [{ type: 'unknownType', data: 'test' }],
      },
    }
    expect(() => FloorSchema.parse(floor)).toThrow()
  })

  it('parses changeFloor data', () => {
    const floor = {
      floorId: 'MT1',
      title: '二层',
      name: '第2层',
      width: 13,
      height: 13,
      map: Array(13).fill(null).map(() => Array(13).fill(0)),
      changeFloor: {
        '12,6': { floorId: 'MT2', loc: [1, 6], direction: 'up', time: 800 },
      },
    }
    const parsed = FloorSchema.parse(floor)
    expect(parsed.changeFloor['12,6'].floorId).toBe('MT2')
    expect(parsed.changeFloor['12,6'].direction).toBe('up')
  })
})
