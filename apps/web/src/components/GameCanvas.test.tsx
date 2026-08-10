import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { dispatch, gameStore } from '@modern-mota/core'
import { GameCanvas } from './GameCanvas'

const { saveGame, canSaveGame } = vi.hoisted(() => ({
  saveGame: vi.fn(() => true),
  canSaveGame: vi.fn(
    (state: { battle: unknown; ui: { modal: string | null } }) => !state.battle && !state.ui.modal
  ),
}))

vi.mock('@modern-mota/render', () => ({
  createGame: vi.fn(() => ({ destroy: vi.fn() })),
  saveGame,
  canSaveGame,
}))

afterEach(() => {
  cleanup()
  saveGame.mockClear()
  vi.useRealTimers()
  delete (window as unknown as { __gameScene?: unknown }).__gameScene
})

describe('GameCanvas', () => {
  it('saves the current run from an in-game button', () => {
    render(<GameCanvas onBackToMenu={vi.fn()} onRestart={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /保存游戏/i }))

    expect(saveGame).toHaveBeenCalledWith(0, gameStore.getState().state)
    expect(screen.getByText('已保存')).toBeVisible()
  })

  it('blocks saving while a dialog is open and explains why', () => {
    dispatch({ type: 'SET_UI', ui: { modal: '当前对话' } })
    render(<GameCanvas onBackToMenu={vi.fn()} onRestart={vi.fn()} />)

    const saveButton = screen.getByRole('button', { name: /保存游戏/i })
    expect(saveButton).toBeDisabled()
    expect(screen.getByText('请结束当前对话后再保存')).toBeVisible()
    fireEvent.click(saveButton)
    expect(saveGame).not.toHaveBeenCalled()
    dispatch({ type: 'SET_UI', ui: { modal: null } })
  })

  it('repeats mobile movement while a direction button is held', () => {
    vi.useFakeTimers()
    const tryMove = vi.fn()
    ;(window as unknown as { __gameScene?: { tryMove: typeof tryMove } }).__gameScene = {
      tryMove,
    }
    Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
      configurable: true,
      value: vi.fn(),
    })
    render(<GameCanvas onBackToMenu={vi.fn()} onRestart={vi.fn()} />)
    const right = screen.getByRole('button', { name: '向右移动' })

    fireEvent.pointerDown(right, { pointerId: 1 })
    expect(tryMove).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(180)
    expect(tryMove).toHaveBeenCalledTimes(2)
    vi.advanceTimersByTime(180)
    expect(tryMove).toHaveBeenCalledTimes(4)

    fireEvent.pointerUp(right, { pointerId: 1 })
    vi.advanceTimersByTime(500)
    expect(tryMove).toHaveBeenCalledTimes(4)
  })
})
