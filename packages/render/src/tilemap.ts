import Phaser from 'phaser'
import { TILE_SIZE } from './constants.js'
import { getTileSprite, SHEET_CONFIG } from './icons.js'

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
const BLANK_FRAME_CACHE = new Map<number, boolean>()

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

    // Pass 1: default ground layer (fills the entire floor)
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
    const spriteInfo = getTileSprite(tileId, this.mapsData)
    if (!spriteInfo) {
      this.drawFallback(px, py, opacity)
      return
    }

    const { sheet, frame } = spriteInfo

    // Autotiles: use individual image textures
    if (sheet === 'autotile') {
      const entry = this.mapsData[String(tileId)]
      const atKey = entry ? (AUTOTILE_KEYS[entry.id] ?? DEFAULT_AUTOTILE) : DEFAULT_AUTOTILE
      const textureKey = this.scene.textures.exists(atKey) ? atKey : DEFAULT_AUTOTILE
      const img = this.scene.add.image(px, py, textureKey).setOrigin(0, 0).setAlpha(opacity)
      this.sprites.push(img)
      return
    }

    // Standard sprite sheets: use frame index
    const textureKey = sheet as string
    if (!this.scene.textures.exists(textureKey)) {
      this.drawFallback(px, py, opacity)
      return
    }

    if (sheet === 'tileset' && this.isBlankTilesetFrame(frame)) {
      this.drawFallback(px, py, opacity)
      return
    }

    // Tall sprites (npc48/enemy48) are 48px high; bottom-align to the 32px cell.
    const frameHeight = SHEET_CONFIG[sheet]?.frameHeight ?? 32
    const dy = frameHeight > 32 ? py - (frameHeight - 32) : py

    const img = this.scene.add.image(px, dy, textureKey, frame).setOrigin(0, 0).setAlpha(opacity)
    this.sprites.push(img)
  }

  private drawFallback(px: number, py: number, opacity = 1) {
    if (!this.scene.textures.exists('__legacy-fallback')) return
    const img = this.scene.add.image(px, py, '__legacy-fallback').setOrigin(0, 0).setAlpha(opacity)
    this.sprites.push(img)
  }

  /** Detect transparent/solid-black legacy frames and replace them visually. */
  private isBlankTilesetFrame(frameIndex: number) {
    const cached = BLANK_FRAME_CACHE.get(frameIndex)
    if (cached !== undefined) return cached

    let blank = false
    try {
      const frame = this.scene.textures.getFrame('tileset', frameIndex)
      const source = frame.source.image
      if (
        typeof document !== 'undefined' &&
        (source instanceof HTMLImageElement || source instanceof HTMLCanvasElement)
      ) {
        const canvas = document.createElement('canvas')
        canvas.width = frame.cutWidth
        canvas.height = frame.cutHeight
        const context = canvas.getContext('2d')
        if (context) {
          context.drawImage(
            source,
            frame.cutX,
            frame.cutY,
            frame.cutWidth,
            frame.cutHeight,
            0,
            0,
            frame.cutWidth,
            frame.cutHeight
          )
          const pixels = context.getImageData(0, 0, frame.cutWidth, frame.cutHeight).data
          let opaque = 0
          let visible = 0
          let luminance = 0
          for (let i = 0; i < pixels.length; i += 4) {
            const alpha = pixels[i + 3]
            if (alpha > 20) {
              opaque++
              const light = pixels[i] + pixels[i + 1] + pixels[i + 2]
              luminance += light
              if (light > 24) visible++
            }
          }
          const total = frame.cutWidth * frame.cutHeight
          blank =
            opaque < total * 0.08 ||
            (opaque > total * 0.75 && luminance / opaque < 24 && visible < total * 0.08)
        }
      }
    } catch {
      // A protected/cross-origin image should keep the original frame.
      blank = false
    }

    BLANK_FRAME_CACHE.set(frameIndex, blank)
    return blank
  }

  destroy() {
    for (const s of this.sprites) {
      s.destroy()
    }
    this.sprites = []
  }
}
