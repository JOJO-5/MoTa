// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'
import { createInitialState } from '@modern-mota/core'
import { loadGame, saveGame } from './save.js'

describe('save persistence boundaries', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('does not persist transient modal or battle state', () => {
    const state = createInitialState('MT0', 6, 6)
    state.ui.modal = '未完成的对话'
    state.ui.floorMsg = '临时提示'
    state.battle = {
      enemyId: 'slime',
      enemyHp: 1,
      turns: 1,
      outcome: 'victory',
    }

    expect(saveGame(0, state)).toBe(true)
    expect(loadGame(0)?.data.ui).toMatchObject({ modal: null, floorMsg: null })
    expect(loadGame(0)?.data.battle).toBeNull()
  })

  it('migrates an old save with an open modal into a recoverable state', () => {
    const state = createInitialState('MT1', 7, 13)
    state.ui.modal = '旧版存档中的对话'
    localStorage.setItem(
      'modern-mota-save-0',
      JSON.stringify({ id: 0, timestamp: 1, floorId: 'MT1', heroLevel: 1, data: state })
    )

    expect(loadGame(0)?.data.ui.modal).toBeNull()
    expect(loadGame(0)?.data.battle).toBeNull()
  })

  it('backfills mana fields when loading a pre-skill save', () => {
    const state = createInitialState('MT1', 7, 13)
    const { mana: _mana, manaMax: _manaMax, ...legacyHero } = state.hero
    localStorage.setItem(
      'modern-mota-save-0',
      JSON.stringify({
        id: 0,
        timestamp: 1,
        floorId: 'MT1',
        heroLevel: 1,
        data: { ...state, hero: legacyHero },
      })
    )

    expect(loadGame(0)?.data.hero.mana).toBe(10)
    expect(loadGame(0)?.data.hero.manaMax).toBe(10)
  })
})
