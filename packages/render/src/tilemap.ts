import Phaser from 'phaser'
import { TILE_SIZE } from './constants.js'
import { drawModernTile, resolveModernTileKind } from './modern-theme.js'

/** Maps data from maps.json: tileId → { cls, id } */
type MapsData = Record<string, { cls: string; id: string }>

function getMapsData(): MapsData {
  const td = (globalThis as Record<string, unknown>)['__towerData'] as {
    maps: MapsData
  } | null
  return td?.maps ?? {}
}

/** Autotile id → texture key index */
const AUTOTILE_KEYS: Record<string, string> = {
  autotile: 'autotile_0',
  autotile1: 'autotile_1',
  autotile2: 'autotile_2',
  autotile3: 'autotile_3',
  autotile4: 'autotile_4',
  autotile5: 'autotile_5',
  autotile6: 'autotile_6',
  autotile7: 'autotile_7',
  autotile8: 'autotile_8',
}

const DEFAULT_AUTOTILE = 'autotile_0'

export class TileMapLayer {
  private scene: Phaser.Scene
  private sprites: Phaser.GameObjects.GameObject[] = []
  private mapsData: MapsData

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.mapsData = getMapsData()
  }

  render(
    map: number[][],
    bgmap: number[][] | null,
    fgmap: number[][] | null,
    defaultGround: string | null = null,
    collectedTiles: string[] = [],
    opacities: Record<string, number> = {},
    stairPoints: Array<[number, number]> = []
  ) {
    this.destroy()

    const rows = map.length
    const cols = map[0]?.length ?? 0
    const collected = new Set(collectedTiles)

    // Pass 1: use a generated modern texture as the floor foundation. The
    // legacy map IDs remain untouched; this layer is purely visual.
    if (this.scene.textures.exists('modern-floor-texture')) {
      const floor = this.scene.add
        .tileSprite(0, 0, cols * TILE_SIZE, rows * TILE_SIZE, 'modern-floor-texture')
        .setOrigin(0, 0)
        .setDepth(-5)
      this.sprites.push(floor)
    } else {
      const groundKey = defaultGround
        ? (AUTOTILE_KEYS[defaultGround] ?? DEFAULT_AUTOTILE)
        : DEFAULT_AUTOTILE
      const groundTexture = this.scene.textures.exists(groundKey) ? groundKey : DEFAULT_AUTOTILE
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const img = this.scene.add
            .image(x * TILE_SIZE, y * TILE_SIZE, groundTexture)
            .setOrigin(0, 0)
          this.sprites.push(img)
        }
      }
    }

    // Paint all blocking map cells from one continuous generated wall texture.
    // This keeps adjacent walls visually connected instead of rendering every
    // collision cell as an isolated UI-like card.
    if (this.scene.textures.exists('modern-wall-texture')) {
      const maskShape = this.scene.make.graphics({}, false)
      maskShape.fillStyle(0xffffff, 1)
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if ((map[y]?.[x] ?? 0) !== 0) {
            maskShape.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
          }
        }
      }
      const wallTexture = this.scene.add
        .tileSprite(0, 0, cols * TILE_SIZE, rows * TILE_SIZE, 'modern-wall-texture')
        .setOrigin(0, 0)
        .setAlpha(0.98)
        .setDepth(0)
      wallTexture.setMask(new Phaser.Display.Masks.GeometryMask(this.scene, maskShape))
      this.sprites.push(maskShape, wallTexture)
    }

    // Pass 2: background layer overrides (only non-zero entries)
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (collected.has(`${x},${y}`)) continue
        const bgId = bgmap?.[y]?.[x] ?? 0
        if (bgId !== 0)
          this.drawTile(bgId, x * TILE_SIZE, y * TILE_SIZE, opacities[`${x},${y}`] ?? 1)
      }
    }

    // Pass 3: wall/object layer
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (collected.has(`${x},${y}`)) continue
        const wallId = map[y]?.[x] ?? 0
        if (wallId !== 0)
          this.drawTile(wallId, x * TILE_SIZE, y * TILE_SIZE, opacities[`${x},${y}`] ?? 1)
      }
    }

    // Pass 4: foreground layer
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (collected.has(`${x},${y}`)) continue
        const fgId = fgmap?.[y]?.[x] ?? 0
        if (fgId !== 0)
          this.drawTile(fgId, x * TILE_SIZE, y * TILE_SIZE, opacities[`${x},${y}`] ?? 1)
      }
    }

    // Legacy maps often use a subtle stair sprite. Keep the original art but
    // add a crisp gold frame so the next-floor entrance is discoverable on a
    // phone-sized canvas.
    for (const [x, y] of stairPoints) {
      const marker = this.scene.add.graphics()
      const px = x * TILE_SIZE
      const py = y * TILE_SIZE
      marker.lineStyle(2, 0xffd166, 0.95)
      marker.strokeRoundedRect(px + 3, py + 3, TILE_SIZE - 6, TILE_SIZE - 6, 5)
      marker.fillStyle(0xffd166, 0.9)
      marker.fillTriangle(px + 16, py + 7, px + 8, py + 17, px + 24, py + 17)
      marker.setDepth(2)
      this.sprites.push(marker)
    }
  }

  private drawTile(tileId: number, px: number, py: number, opacity = 1) {
    const kind = resolveModernTileKind(tileId, this.mapsData)
    // The generated wall texture above owns wall presentation. Keep this
    // fallback for scenes/tests that do not load the asset bundle.
    if (kind.kind === 'wall' && this.scene.textures.exists('modern-wall-texture')) return
    const modern = drawModernTile(this.scene, kind, px, py, opacity)
    modern.setDepth(1)
    this.sprites.push(modern)
  }

  destroy() {
    for (const s of this.sprites) {
      s.destroy()
    }
    this.sprites = []
  }
}
