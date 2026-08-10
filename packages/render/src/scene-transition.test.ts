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

  it('uses a Chinese door name in the successful opening message', () => {
    dispatch({ type: 'SET_POSITION', position: { x: 0, y: 0 } })
    dispatch({ type: 'SET_HERO', hero: { keys: { yellowKey: 1 } } })
    const scene = new GameScene() as unknown as {
      currentFloor: Record<string, unknown>
      tryOpenDoor: (direction: string, maps: Record<string, unknown>) => void
      rerenderTiles: () => void
    }
    scene.currentFloor = {
      floorId: 'JX1',
      map: [[0, 20]],
      bgmap: [],
      fgmap: [],
      afterOpenDoor: {},
      changeFloor: {},
      defaultGround: '',
    }
    scene.rerenderTiles = vi.fn()
    scene.tryOpenDoor('right', {
      '20': {
        cls: 'animates',
        id: 'yellowDoor',
        name: '黄门',
        trigger: 'openDoor',
        doorInfo: { keys: { yellowKey: 1 } },
      },
    })

    expect(State.ui.floorMsg).toBe('黄门已开启')
  })
})
