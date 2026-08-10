import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Settings } from './Settings'

describe('Settings', () => {
  it('does not expose controls that are not connected to runtime systems', () => {
    render(<Settings onClose={vi.fn()} />)

    expect(screen.getByRole('heading', { name: '游戏设置' })).toBeVisible()
    expect(screen.queryByRole('slider')).toBeNull()
    expect(screen.queryByRole('checkbox')).toBeNull()
    expect(screen.getByText(/音频功能开发中/)).toBeVisible()
    expect(screen.getByText(/小地图功能开发中/)).toBeVisible()
  })
})
