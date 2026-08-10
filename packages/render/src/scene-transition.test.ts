// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createInitialState, dispatch, eventMachine, State } from '@modern-mota/core'
import { GameScene } from './scene-transition.js'

vi.mock('phaser', () => ({
  default: { Scene: class {} },
}))

describe('GameScene floor events', () => {
  beforeEach(() => {
    eventMachine.stop()
    dispatch({ type: 'LOAD_STATE', state: createInitialState('MT1', 7, 6) })
  })

  it('does not retrigger a departed NPC event after its tile is hidden', () => {
    dispatch({
      type: 'SET_TILE_OVERRIDE',
      floorId: 'MT1',
      x: 7,
      y: 7,
      override: { hidden: true },
    })
    const scene = new GameScene() as unknown as {
      currentFloor: { floorId: string; events: Record<string, unknown[]> }
      triggerEventsAtPosition: (x: number, y: number) => boolean
    }
    scene.currentFloor = {
      floorId: 'MT1',
      events: { '7,7': ['已经离开的 NPC 不应再次说话'] },
    }

    expect(scene.triggerEventsAtPosition(7, 7)).toBe(false)
    expect(State.ui.modal).toBeNull()
    expect(eventMachine.getState()).toBe('idle')
  })
})
