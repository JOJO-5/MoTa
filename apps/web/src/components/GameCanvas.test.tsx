import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { gameStore } from '@modern-mota/core'
import { GameCanvas } from './GameCanvas'

const { saveGame } = vi.hoisted(() => ({ saveGame: vi.fn(() => true) }))

vi.mock('@modern-mota/render', () => ({
  createGame: vi.fn(() => ({ destroy: vi.fn() })),
  saveGame,
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
