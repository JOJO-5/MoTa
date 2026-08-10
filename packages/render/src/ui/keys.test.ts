import { describe, expect, it } from 'vitest'
import { formatKeyCounts, formatKeyRequirement } from './keys.js'

describe('mobile key status', () => {
  it('shows every legacy key type in a stable order', () => {
    expect(formatKeyCounts({ yellowKey: 1, blueKey: 2, redKey: 0, greenKey: 3 })).toBe(
      '黄1 蓝2 红0 绿3 铁0 大0'
    )
  })

  it('never exposes internal key ids in a door requirement', () => {
    expect(formatKeyRequirement('yellowKey', 1)).toBe('需要黄钥匙×1')
    expect(formatKeyRequirement('blueKey', 2)).toBe('需要蓝钥匙×2')
    expect(formatKeyRequirement('redKey', 1)).toBe('需要红钥匙×1')
    expect(formatKeyRequirement('greenKey', 1)).toBe('需要绿钥匙×1')
    expect(formatKeyRequirement('steelKey', 1)).toBe('需要铁钥匙×1')
    expect(formatKeyRequirement('bigKey', 1)).toBe('需要大钥匙×1')
    expect(formatKeyRequirement('MagicKey', 1)).toBe('需要魔法钥匙×1')
  })
})
