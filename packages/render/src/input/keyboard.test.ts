import { describe, expect, it } from 'vitest'
import { acceptKeydown } from './keyboard.js'

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
})
