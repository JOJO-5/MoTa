import Phaser from 'phaser'
import { TILE_SIZE } from './constants.js'

export type ModernTileKind =
  | { kind: 'ground'; variant: 'stone' }
  | { kind: 'wall'; variant: 'basalt' }
  | { kind: 'stair'; variant: 'up' | 'down' }
  | { kind: 'door'; variant: 'yellow' | 'blue' | 'red' | 'green' | 'special' | 'steel' }
  | {
      kind: 'item'
      variant:
        | 'yellow-key'
        | 'blue-key'
        | 'red-key'
        | 'green-key'
        | 'key'
        | 'gem'
        | 'potion'
        | 'equipment'
        | 'item'
    }
  | { kind: 'enemy'; variant: string }
  | { kind: 'npc'; variant: 'sage' | 'trader' | 'fairy' | 'royal' | 'npc' }
  | { kind: 'unknown'; variant: 'rune' }

type MapsData = Record<string, { cls: string; id: string; canPass?: boolean }>

const KEY_VARIANTS: Record<string, ModernTileKind & { kind: 'item' }> = {
  yellowKey: { kind: 'item', variant: 'yellow-key' },
  blueKey: { kind: 'item', variant: 'blue-key' },
  redKey: { kind: 'item', variant: 'red-key' },
  greenKey: { kind: 'item', variant: 'green-key' },
}

const DOOR_VARIANTS: Record<string, ModernTileKind & { kind: 'door' }> = {
  yellowDoor: { kind: 'door', variant: 'yellow' },
  blueDoor: { kind: 'door', variant: 'blue' },
  redDoor: { kind: 'door', variant: 'red' },
  greenDoor: { kind: 'door', variant: 'green' },
  specialDoor: { kind: 'door', variant: 'special' },
  steelDoor: { kind: 'door', variant: 'steel' },
}

export function resolveModernTileKind(tileId: number, maps: MapsData): ModernTileKind {
  const entry = maps[String(tileId)]
  if (tileId >= 10000 && entry?.canPass) return { kind: 'ground', variant: 'stone' }
  if (tileId >= 10000) return { kind: 'wall', variant: 'basalt' }
  if (!entry) return { kind: 'unknown', variant: 'rune' }

  if (entry.cls === 'autotile') return { kind: 'ground', variant: 'stone' }
  if (entry.cls === 'terrains') {
    if (entry.id === 'upFloor') return { kind: 'stair', variant: 'up' }
    if (entry.id === 'downFloor') return { kind: 'stair', variant: 'down' }
    return { kind: 'ground', variant: 'stone' }
  }
  if (entry.cls === 'animates' && DOOR_VARIANTS[entry.id]) return DOOR_VARIANTS[entry.id]
  if (entry.cls === 'items') {
    if (KEY_VARIANTS[entry.id]) return KEY_VARIANTS[entry.id]
    if (entry.id.includes('Gem')) return { kind: 'item', variant: 'gem' }
    if (entry.id.includes('Potion') || entry.id.includes('Wine')) {
      return { kind: 'item', variant: 'potion' }
    }
    if (entry.id.startsWith('sword') || entry.id.startsWith('shield')) {
      return { kind: 'item', variant: 'equipment' }
    }
    if (entry.id === 'steelKey' || entry.id === 'MagicKey' || entry.id === 'bigKey') {
      return { kind: 'item', variant: 'key' }
    }
    return { kind: 'item', variant: 'item' }
  }
  if (entry.cls === 'enemys' || entry.cls === 'enemy48') {
    return { kind: 'enemy', variant: entry.id }
  }
  if (entry.cls === 'npcs' || entry.cls === 'npc48') {
    if (entry.id === 'wizard') return { kind: 'npc', variant: 'sage' }
    if (entry.id === 'trader' || entry.id === 'moneyShop' || entry.id === 'expShop') {
      return { kind: 'npc', variant: 'trader' }
    }
    if (entry.id === 'fairy' || entry.id === 'evilFairy') return { kind: 'npc', variant: 'fairy' }
    if (entry.id === 'king' || entry.id === 'princess') return { kind: 'npc', variant: 'royal' }
    return { kind: 'npc', variant: 'npc' }
  }

  return { kind: 'unknown', variant: 'rune' }
}

const ENEMY_COLORS: Record<string, number> = {
  bat: 0x8b5cf6,
  bigBat: 0x6d28d9,
  dragon: 0xef4444,
  greenSlime: 0x34d399,
  redSlime: 0xf87171,
  skeleton: 0xe2e8f0,
  vampire: 0xf472b6,
}

const DOOR_COLORS: Record<string, number> = {
  yellow: 0xf5c84b,
  blue: 0x4da3ff,
  red: 0xff6b6b,
  green: 0x47d7a0,
  special: 0xc084fc,
  steel: 0x94a3b8,
}

function drawPixelRect(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
  alpha = 1
) {
  graphics.fillStyle(color, alpha)
  graphics.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
}

function drawRune(graphics: Phaser.GameObjects.Graphics, px: number, py: number, color: number) {
  graphics.lineStyle(2, color, 0.85)
  graphics.strokeRect(px + 8, py + 8, 16, 16)
  graphics.lineBetween(px + 12, py + 12, px + 20, py + 20)
  graphics.lineBetween(px + 20, py + 12, px + 12, py + 20)
}

/** Draws the modern semantic tile language without consulting legacy sheets. */
export function drawModernTile(
  scene: Phaser.Scene,
  kind: ModernTileKind,
  px: number,
  py: number,
  opacity = 1
): Phaser.GameObjects.Graphics {
  const graphics = scene.add.graphics()
  graphics.setAlpha(opacity)

  if (kind.kind === 'ground') {
    // Passable authored terrain remains visibly inset into the cool slate
    // floor, while the warm masonry walls stay visually separate.
    graphics.fillStyle(0x5f8998, 0.34)
    graphics.fillRoundedRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8, 3)
    graphics.lineStyle(1, 0xa8d2d0, 0.62)
    graphics.strokeRoundedRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8, 3)
    drawPixelRect(graphics, px + 7, py + 7, TILE_SIZE - 14, 2, 0xc3e4dd, 0.22)
    drawPixelRect(graphics, px + 7, py + TILE_SIZE - 9, TILE_SIZE - 14, 2, 0x193647, 0.34)
    return graphics
  }

  if (kind.kind === 'wall') {
    // Warm raised masonry sits over the generated texture. Thick walnut
    // shadows and an amber top bevel make blocked cells unmistakable.
    drawPixelRect(graphics, px, py, TILE_SIZE, TILE_SIZE, 0x1d1009, 0.26)
    drawPixelRect(graphics, px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 5, 0xb66b26, 0.1)
    drawPixelRect(graphics, px + 3, py + 3, TILE_SIZE - 6, 3, 0xf0b34f, 0.72)
    drawPixelRect(graphics, px + 3, py + 6, 3, TILE_SIZE - 11, 0xc37a31, 0.48)
    drawPixelRect(graphics, px + 5, py + TILE_SIZE - 7, TILE_SIZE - 9, 4, 0x2a160c, 0.82)
    graphics.lineStyle(1, 0x6d3718, 0.94)
    graphics.strokeRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 5)
    const seam = (((px / TILE_SIZE + py / TILE_SIZE) % 2) + 2) % 2
    drawPixelRect(graphics, px + (seam ? 7 : 18), py + 14, 10, 2, 0x3b2112, 0.72)
    if (((px / TILE_SIZE) * 3 + py / TILE_SIZE) % 7 === 0) {
      drawPixelRect(graphics, px + 22, py + 9, 4, 2, 0x8c9848, 0.82)
    }
    return graphics
  }

  if (kind.kind === 'stair') {
    graphics.fillStyle(0x3a2d12, 0.9)
    graphics.fillRoundedRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4, 6)
    graphics.lineStyle(2, 0xffd166, 1)
    graphics.strokeRoundedRect(px + 3, py + 3, TILE_SIZE - 6, TILE_SIZE - 6, 5)
    graphics.fillStyle(0xf5c84b, 0.9)
    if (kind.variant === 'up') {
      graphics.fillTriangle(px + 16, py + 7, px + 8, py + 17, px + 24, py + 17)
      graphics.fillRect(px + 13, py + 17, 6, 8)
    } else {
      graphics.fillTriangle(px + 8, py + 15, px + 24, py + 15, px + 16, py + 25)
      graphics.fillRect(px + 13, py + 7, 6, 8)
    }
    return graphics
  }

  if (kind.kind === 'door') {
    if (kind.variant === 'steel') {
      // Steel doors read as ancient dungeon machinery: cool metal values
      // belong to the slate floor, while tiny rust-orange rivets echo the
      // warm masonry without turning the door into another brown tile.
      drawPixelRect(graphics, px + 2, py + 1, TILE_SIZE - 4, TILE_SIZE - 2, 0x07131f, 0.98)
      drawPixelRect(graphics, px + 4, py + 3, TILE_SIZE - 8, TILE_SIZE - 6, 0x1b3444, 0.96)
      drawPixelRect(graphics, px + 5, py + 5, TILE_SIZE - 10, TILE_SIZE - 10, 0x0b1d2a, 0.96)

      // A stepped silver-blue frame gives the door a readable silhouette at
      // 32px while the lower edge remains visibly recessed.
      drawPixelRect(graphics, px + 4, py + 3, TILE_SIZE - 8, 2, 0xb8d3d7, 0.82)
      drawPixelRect(graphics, px + 4, py + 5, 2, TILE_SIZE - 10, 0x6f9aaa, 0.74)
      drawPixelRect(graphics, px + 6, py + TILE_SIZE - 6, TILE_SIZE - 12, 2, 0x030b12, 0.94)
      drawPixelRect(graphics, px + TILE_SIZE - 6, py + 5, 2, TILE_SIZE - 10, 0x2f5262, 0.84)

      // Portcullis bars: each has a dark offset and a narrow highlight so the
      // metal remains legible without looking like a flat grey sticker.
      for (const barX of [10, 16, 22]) {
        drawPixelRect(graphics, px + barX + 1, py + 8, 3, 17, 0x02080d, 0.92)
        drawPixelRect(graphics, px + barX, py + 7, 2, 17, 0x91b7c1, 0.92)
        drawPixelRect(graphics, px + barX, py + 8, 1, 15, 0xd1e1e0, 0.46)
      }
      drawPixelRect(graphics, px + 7, py + 12, TILE_SIZE - 14, 2, 0x5b8190, 0.88)
      drawPixelRect(graphics, px + 7, py + 20, TILE_SIZE - 14, 2, 0x496d7c, 0.82)

      // Small rust-orange rivets are the only warm accent on the mechanism.
      graphics.fillStyle(0xe28a43, 0.92)
      graphics.fillRect(px + 6, py + 6, 2, 2)
      graphics.fillRect(px + 24, py + 6, 2, 2)
      graphics.fillStyle(0x6a3420, 0.88)
      graphics.fillRect(px + 6, py + 24, 2, 2)
      graphics.fillRect(px + 24, py + 24, 2, 2)
      return graphics
    }

    const color = DOOR_COLORS[kind.variant]
    graphics.fillStyle(0x24130b, 0.96)
    graphics.fillRoundedRect(px + 3, py + 1, TILE_SIZE - 6, TILE_SIZE - 2, 5)
    graphics.lineStyle(2, color, 0.95)
    graphics.strokeRoundedRect(px + 4, py + 2, TILE_SIZE - 8, TILE_SIZE - 4, 4)
    drawPixelRect(graphics, px + 8, py + 6, TILE_SIZE - 16, TILE_SIZE - 11, 0x4a2a17)
    drawPixelRect(graphics, px + 14, py + 10, 4, 13, color, 0.92)
    drawPixelRect(graphics, px + 18, py + 10, 2, 13, color, 0.55)
    graphics.fillStyle(color, 0.95)
    graphics.fillCircle(px + 23, py + 17, 2)
    return graphics
  }

  if (kind.kind === 'item') {
    const color =
      kind.variant === 'yellow-key'
        ? 0xf5c84b
        : kind.variant === 'blue-key'
          ? 0x4da3ff
          : kind.variant === 'red-key'
            ? 0xff6b6b
            : kind.variant === 'green-key'
              ? 0x47d7a0
              : kind.variant === 'gem'
                ? 0x4de1ff
                : kind.variant === 'potion'
                  ? 0xf472b6
                  : kind.variant === 'equipment'
                    ? 0xc084fc
                    : 0xf5c84b
    graphics.fillStyle(color, 0.95)
    if (kind.variant.includes('key') || kind.variant === 'key') {
      graphics.fillCircle(px + 12, py + 13, 5)
      graphics.fillRect(px + 16, py + 11, 10, 4)
      graphics.fillRect(px + 22, py + 15, 3, 4)
    } else if (kind.variant === 'gem') {
      graphics.fillTriangle(px + 16, py + 5, px + 25, py + 14, px + 16, py + 27)
      graphics.fillTriangle(px + 16, py + 5, px + 7, py + 14, px + 16, py + 27)
    } else if (kind.variant === 'potion') {
      drawPixelRect(graphics, px + 12, py + 8, 8, 4, 0xffffff, 0.9)
      drawPixelRect(graphics, px + 9, py + 12, 14, 13, color)
    } else {
      drawPixelRect(graphics, px + 8, py + 8, 16, 16, color)
      drawRune(graphics, px, py, 0x111a2c)
    }
    return graphics
  }

  if (kind.kind === 'enemy') {
    const color = ENEMY_COLORS[kind.variant] ?? 0xf97316
    graphics.fillStyle(color, 0.95)
    if (kind.variant.toLowerCase().includes('bat')) {
      graphics.fillTriangle(px + 16, py + 7, px + 4, py + 16, px + 12, py + 23)
      graphics.fillTriangle(px + 16, py + 7, px + 28, py + 16, px + 20, py + 23)
      graphics.fillCircle(px + 16, py + 17, 7)
    } else {
      graphics.fillRoundedRect(px + 6, py + 7, 20, 19, 5)
      graphics.fillRect(px + 9, py + 23, 5, 4)
      graphics.fillRect(px + 18, py + 23, 5, 4)
    }
    drawPixelRect(graphics, px + 11, py + 15, 3, 3, 0xffffff)
    drawPixelRect(graphics, px + 18, py + 15, 3, 3, 0xffffff)
    return graphics
  }

  if (kind.kind === 'npc') {
    const robe = kind.variant === 'sage' ? 0x38bdf8 : kind.variant === 'fairy' ? 0xf472b6 : 0xa78bfa
    graphics.fillStyle(robe, 0.95)
    graphics.fillCircle(px + 16, py + 10, 6)
    graphics.fillTriangle(px + 6, py + 27, px + 16, py + 13, px + 26, py + 27)
    drawPixelRect(graphics, px + 12, py + 8, 3, 3, 0xf8fafc)
    drawPixelRect(graphics, px + 18, py + 8, 3, 3, 0xf8fafc)
    drawRune(graphics, px, py, kind.variant === 'sage' ? 0xf5c84b : 0x67e8f9)
    return graphics
  }

  // Unknown legacy-only decoration should fall back to the generated floor.
  // Drawing a bright rune here made old background tiles look like cyan
  // crosses and obscured the actual player on mobile screens.
  return graphics
}
