import { describe, it, expect, beforeEach } from 'vitest'
import { moveHero } from './move.js'
import { dispatch, State, createInitialState } from '../state/store.js'

describe('moveHero', () => {
  const mockMap = [
    [0, 0, 1],
    [0, 0, 0],
    [0, 0, 0]
  ]

  beforeEach(() => {
    dispatch({ type: 'LOAD_STATE', state: createInitialState('MT0', 1, 1) })
  })

  it('moves hero when path is clear', () => {
    const success = moveHero('up', mockMap)
    expect(success).toBe(true)
    expect(State.position).toEqual({ x: 1, y: 0 })
    expect(State.direction).toBe('up')
  })

  it('does not move hero into wall', () => {
    dispatch({ type: 'SET_POSITION', position: { x: 1, y: 0 } })
    const success = moveHero('right', mockMap) // 1,0 to 2,0 (is 1/wall)
    expect(success).toBe(false)
    expect(State.position).toEqual({ x: 1, y: 0 })
  })

  it('does not move hero out of bounds', () => {
    dispatch({ type: 'SET_POSITION', position: { x: 0, y: 0 } })
    const success = moveHero('left', mockMap)
    expect(success).toBe(false)
    expect(State.position).toEqual({ x: 0, y: 0 })
  })
})