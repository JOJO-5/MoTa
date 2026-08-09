import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createInitialState, dispatch, State } from '@modern-mota/core'
import type { SaveSlot } from '@modern-mota/render'
import { App } from './App'

const renderMocks = vi.hoisted(() => ({
  initTower: vi.fn(async () => ({})),
  listSaves: vi.fn<[], Array<SaveSlot | null>>(() => [null, null, null]),
  loadGame: vi.fn<[number], SaveSlot | null>(() => null),
}))

vi.mock('@modern-mota/render', () => ({
  createGame: vi.fn(() => ({
    destroy: vi.fn(),
  })),
  saveGame: vi.fn(() => true),
  ...renderMocks,
}))

describe('App', () => {
  beforeEach(() => {
    renderMocks.initTower.mockClear()
    renderMocks.listSaves.mockReturnValue([null, null, null])
    renderMocks.loadGame.mockReturnValue(null)
    dispatch({ type: 'RESET' })
  })

  afterEach(cleanup)

  it('renders the title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/魔塔/)
  })

  it('resets stale run state before starting a new game', async () => {
    dispatch({ type: 'SET_HERO', hero: { atk: 99 } })
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /开始攀登/i }))

    await waitFor(() => expect(renderMocks.initTower).toHaveBeenCalledOnce())
    expect(State.hero.atk).toBe(10)
  })

  it('loads the newest save through continue game', async () => {
    const savedState = createInitialState('MT5', 2, 1)
    savedState.hero.atk = 77
    const save = { id: 0, timestamp: 123, floorId: 'MT5', heroLevel: 1, data: savedState }
    renderMocks.listSaves.mockReturnValue([save, null, null])
    renderMocks.loadGame.mockReturnValue(save)
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /继续游戏/i }))

    await waitFor(() => expect(State.floorId).toBe('MT5'))
    expect(State.hero.atk).toBe(77)
  })
})
