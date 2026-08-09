import { describe, expect, it } from 'vitest'
import { getTileSprite } from './icons.js'

describe('legacy tileset ids', () => {
  it('decodes both legacy tileset bases', () => {
    expect(getTileSprite(10007, {})).toEqual({ sheet: 'tileset', frame: 7 })
    expect(getTileSprite(20706, {})).toEqual({ sheet: 'tileset', frame: 706 })
  })

  it('keeps legacy frames inside the source sheet range', () => {
    expect(getTileSprite(20706, {})).toEqual({ sheet: 'tileset', frame: 706 })
  })

  it('routes known blank legacy tiles to the generated fallback', () => {
    expect(getTileSprite(20302, {})).toBeNull()
    expect(getTileSprite(20852, {})).toBeNull()
  })
})
