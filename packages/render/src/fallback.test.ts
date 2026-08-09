import { describe, expect, it } from 'vitest'
import { getLegacyFallbackAssetPath, LEGACY_FALLBACK_TEXTURE_KEY } from './fallback.js'

describe('legacy fallback asset', () => {
  it('uses a static asset that can be uploaded reliably by mobile WebGL', () => {
    expect(LEGACY_FALLBACK_TEXTURE_KEY).toBe('__legacy-fallback')
    expect(getLegacyFallbackAssetPath('./content/mota-2014')).toBe(
      './content/mota-2014/materials/legacy-fallback.svg'
    )
  })
})
