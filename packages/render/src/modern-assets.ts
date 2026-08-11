import { ICONS, SHEET_COLS, SHEET_CONFIG, type SpriteSheetKey } from './icons.js'

const MODERN_ENEMY_IDS = [
  'greenSlime',
  'redSlime',
  'blackSlime',
  'bat',
  'bigBat',
  'skeleton',
  'skeletonCaptain',
  'zombie',
  'zombieKnight',
  'rock',
  'bluePriest',
  'redPriest',
  'yellowKnight',
  'blueKnight',
  'vampire',
  'dragon',
] as const

const MODERN_ENEMY_FRAMES = new Map<string, number>(
  MODERN_ENEMY_IDS.map((enemyId, frame) => [enemyId, frame])
)

export function getModernEnemyFrame(enemyId: string): number | undefined {
  return MODERN_ENEMY_FRAMES.get(enemyId)
}

export function getModernEnemyPortraitStyle(enemyId: string, cell = 104): string | undefined {
  const frame = getModernEnemyFrame(enemyId)
  if (frame === undefined) return undefined

  const column = frame % 4
  const row = Math.floor(frame / 4)
  return [
    'background-image:url("./content/mota-2014/materials/modern-enemies-v1.png")',
    `background-size:${cell * 4}px ${cell * 4}px`,
    `background-position:${-column * cell}px ${4 - row * cell}px`,
  ].join(';')
}

/**
 * Resolve a portrait style for both the generated enemy atlas and legacy
 * enemy sheets. The guide and battle overlay can therefore show the same
 * creature art even when a floor uses a less common enemy id.
 */
export function getEnemyPortraitStyle(enemyId: string, size = 104): string {
  const modernStyle = getModernEnemyPortraitStyle(enemyId, size)
  if (modernStyle) return modernStyle

  const sheet: Extract<SpriteSheetKey, 'enemys' | 'enemy48'> | null =
    ICONS.enemys?.[enemyId] !== undefined
      ? 'enemys'
      : ICONS.enemy48?.[enemyId] !== undefined
        ? 'enemy48'
        : null
  if (!sheet) return ''

  const row = ICONS[sheet][enemyId]
  const { frameWidth, frameHeight } = SHEET_CONFIG[sheet]
  const cols = SHEET_COLS[sheet]
  // Preserve the battle overlay's established legacy sizing at its default
  // 104px canvas, while allowing the compact guide cards to scale to 88px.
  const scale = size === 104 ? (sheet === 'enemy48' ? 2 : 3) : size / frameHeight
  const frameWidthScaled = frameWidth * scale
  const x = size === 104 && sheet === 'enemy48' ? 16 : (size - frameWidthScaled) / 2
  const y = -(row * frameHeight * scale)
  return [
    `background-image:url("./content/mota-2014/materials/${sheet}.png")`,
    `background-size:${cols * frameWidth * scale}px auto`,
    `background-position:${x}px ${y}px`,
  ].join(';')
}
