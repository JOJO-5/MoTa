import { describe, it, expect } from 'vitest'
import { UI_VERSION } from './index'

describe('@modern-mota/ui', () => {
  it('exports a version string', () => {
    expect(UI_VERSION).toBe('0.1.0')
  })
})
