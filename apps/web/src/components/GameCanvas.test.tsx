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
})

describe('GameCanvas', () => {
  it('saves the current run from an in-game button', () => {
    render(<GameCanvas onBackToMenu={vi.fn()} onRestart={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /保存游戏/i }))

    expect(saveGame).toHaveBeenCalledWith(0, gameStore.getState().state)
    expect(screen.getByText('已保存')).toBeVisible()
  })
})
