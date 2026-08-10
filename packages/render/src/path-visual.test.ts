import { describe, expect, it } from 'vitest'
import { buildRoutePoints } from './path-visual.js'

describe('path route visualization', () => {
  it('turns movement directions into ordered map cells', () => {
    expect(buildRoutePoints({ x: 3, y: 4 }, ['right', 'right', 'up', 'left'])).toEqual([
      { x: 4, y: 4, direction: 'right' },
      { x: 5, y: 4, direction: 'right' },
      { x: 5, y: 3, direction: 'up' },
      { x: 4, y: 3, direction: 'left' },
    ])
  })

  it('returns no markers when the target is the current cell', () => {
    expect(buildRoutePoints({ x: 3, y: 4 }, [])).toEqual([])
  })
})
