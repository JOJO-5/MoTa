import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'

vi.mock('@modern-mota/render', () => ({
  createGame: vi.fn(() => ({
    destroy: vi.fn(),
  })),
}))

describe('App', () => {
  it('renders the title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/魔塔/)
  })
})
