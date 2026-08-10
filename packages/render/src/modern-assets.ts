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

export function getModernEnemyPortraitStyle(enemyId: string): string | undefined {
  const frame = getModernEnemyFrame(enemyId)
  if (frame === undefined) return undefined

  const cell = 104
  const column = frame % 4
  const row = Math.floor(frame / 4)
  return [
    'background-image:url("./content/mota-2014/materials/modern-enemies-v1.png")',
    `background-size:${cell * 4}px ${cell * 4}px`,
    `background-position:${-column * cell}px ${4 - row * cell}px`,
  ].join(';')
}
