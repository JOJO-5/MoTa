import { afterEach, describe, expect, it, vi } from 'vitest'
import { acceptKeydown, KeyboardInput } from './keyboard.js'

afterEach(() => {
  vi.useRealTimers()
})

describe('keyboard movement repeat guard', () => {
  it('accepts the initial keydown but ignores browser repeat until keyup', () => {
    const pressed = new Set<string>()
    const acceptedAt = new Map<string, number>()
    const initial = { key: 'ArrowDown', repeat: false } as KeyboardEvent
    const repeated = { key: 'ArrowDown', repeat: true } as KeyboardEvent

    expect(acceptKeydown(initial, pressed, acceptedAt, 0)).toBe(true)
    expect(acceptKeydown(repeated, pressed, acceptedAt, 20)).toBe(false)
    expect(acceptKeydown(initial, pressed, acceptedAt, 100)).toBe(false)

    pressed.delete('ArrowDown')
    expect(acceptKeydown(initial, pressed, acceptedAt, 200)).toBe(true)
  })

  it('keeps moving at a controlled rate while a direction is held', () => {
    vi.useFakeTimers()
    const handlers = new Map<string, (event: KeyboardEvent) => void>()
    const keyboard = {
      on: vi.fn((name: string, handler: (event: KeyboardEvent) => void) => {
        handlers.set(name, handler)
      }),
      off: vi.fn(),
    }
    const onMove = vi.fn()
    const input = new KeyboardInput({ input: { keyboard } } as never, onMove)
    const keydown = {
      key: 'ArrowRight',
      repeat: false,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent
    const keyup = { key: 'ArrowRight' } as KeyboardEvent

    handlers.get('keydown')?.(keydown)
    expect(onMove).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(179)
    expect(onMove).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1)
    expect(onMove).toHaveBeenCalledTimes(2)
    vi.advanceTimersByTime(180)
    expect(onMove).toHaveBeenCalledTimes(4)

    handlers.get('keyup')?.(keyup)
    vi.advanceTimersByTime(500)
    expect(onMove).toHaveBeenCalledTimes(4)
    input.destroy()
  })
})
