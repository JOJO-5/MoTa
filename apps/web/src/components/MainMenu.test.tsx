import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MainMenu } from './MainMenu'

afterEach(cleanup)

describe('MainMenu', () => {
  it('continues from a real save when one exists', () => {
    const onContinue = vi.fn()
    render(<MainMenu onStart={vi.fn()} onContinue={onContinue} onSettings={vi.fn()} hasSave />)

    fireEvent.click(screen.getByRole('button', { name: /继续游戏/i }))
    expect(onContinue).toHaveBeenCalledOnce()
  })

  it('disables continue when there is no save', () => {
    render(<MainMenu onStart={vi.fn()} onContinue={vi.fn()} onSettings={vi.fn()} hasSave={false} />)

    expect(screen.getByRole('button', { name: /继续游戏/i })).toBeDisabled()
  })
})
