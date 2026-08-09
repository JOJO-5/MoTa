export const LEGACY_FALLBACK_TEXTURE_KEY = '__legacy-fallback'

const LEGACY_FALLBACK_ASSET = 'materials/legacy-fallback.svg'

export function getLegacyFallbackAssetPath(contentBase: string): string {
  return `${contentBase}/${LEGACY_FALLBACK_ASSET}`
}
