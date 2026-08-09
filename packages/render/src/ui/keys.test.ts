import { describe, expect, it } from 'vitest'
import { formatKeyCounts } from './keys.js'

describe('mobile key status', () => {
  it('shows every legacy key type in a stable order', () => {
    expect(formatKeyCounts({ yellowKey: 1, blueKey: 2, redKey: 0, greenKey: 3 })).toBe('黄1 蓝2 红0 绿3 铁0 大0')
  })
})
