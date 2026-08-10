// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createInitialState, dispatch } from '@modern-mota/core'
import { GameLoop } from './game-loop.js'

describe('GameLoop battle presentation', () => {
  let loop: GameLoop | null = null

  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', vi.fn())
    dispatch({ type: 'LOAD_STATE', state: createInitialState('MT1', 7, 7) })
    dispatch({
      type: 'SET_ENEMYS',
      enemys: {
        skeleton: {
          id: 'skeleton',
          name: '骷髅',
          hp: 50,
          atk: 70,
          def: 0,
          money: 6,
          exp: 1,
          special: [],
          priority: 0,
        },
      },
    })
    dispatch({ type: 'SET_BATTLE', battle: { enemyId: 'skeleton', enemyHp: 0, turns: 2 } })
  })

  afterEach(() => {
    loop?.stop()
    loop = null
    vi.unstubAllGlobals()
  })

  it('mounts a visible versus result instead of ending invisibly in one frame', () => {
    const host = document.createElement('div')
    loop = new GameLoop({} as never, host)

    const battle = host.querySelector('.mota-battle')
    expect(battle).not.toBeNull()
    expect(battle?.textContent).toContain('战斗胜利')
    expect(battle?.querySelector('.mota-battle__enemy-portrait')).not.toBeNull()
    expect(battle?.querySelector('.mota-battle__hero-portrait')).not.toBeNull()
  })
})
