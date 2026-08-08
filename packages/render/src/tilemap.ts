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

export class TileMapLayer {
  private scene: Phaser.Scene
  private sprites: Phaser.GameObjects.Image[] = []
  private mapsData: MapsData

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.mapsData = getMapsData()
  }

  render(
    map: number[][],
    bgmap: number[][] | null,
    fgmap: number[][] | null,
    defaultGround: string | null = null
  ) {
    this.destroy()

    const rows = map.length
    const cols = map[0]?.length ?? 0

    // Pass 1: default ground layer (fills the entire floor)
    const groundKey = defaultGround ? (AUTOTILE_KEYS[defaultGround] ?? DEFAULT_AUTOTILE) : DEFAULT_AUTOTILE
    const groundTexture = this.scene.textures.exists(groundKey) ? groundKey : DEFAULT_AUTOTILE
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const img = this.scene.add.image(x * TILE_SIZE, y * TILE_SIZE, groundTexture).setOrigin(0, 0)
        this.sprites.push(img)
      }
    }

    // Pass 2: background layer overrides (only non-zero entries)
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const bgId = bgmap?.[y]?.[x] ?? 0
        if (bgId !== 0) this.drawTile(bgId, x * TILE_SIZE, y * TILE_SIZE)
      }
    }

    // Pass 3: wall/object layer
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const wallId = map[y]?.[x] ?? 0
        if (wallId !== 0) this.drawTile(wallId, x * TILE_SIZE, y * TILE_SIZE)
      }
    }

    // Pass 4: foreground layer
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const fgId = fgmap?.[y]?.[x] ?? 0
        if (fgId !== 0) this.drawTile(fgId, x * TILE_SIZE, y * TILE_SIZE)
      }
    }
  }

  private drawTile(tileId: number, px: number, py: number) {
    const spriteInfo = getTileSprite(tileId, this.mapsData)
    if (!spriteInfo) return

    const { sheet, frame } = spriteInfo

    // Autotiles: use individual image textures
    if (sheet === 'autotile') {
      const entry = this.mapsData[String(tileId)]
      const atKey = entry ? (AUTOTILE_KEYS[entry.id] ?? DEFAULT_AUTOTILE) : DEFAULT_AUTOTILE
      const textureKey = this.scene.textures.exists(atKey) ? atKey : DEFAULT_AUTOTILE
      const img = this.scene.add.image(px, py, textureKey).setOrigin(0, 0)
      this.sprites.push(img)
      return
    }

    // Standard sprite sheets: use frame index
    const textureKey = sheet as string
    if (!this.scene.textures.exists(textureKey)) return

    // Tall sprites (npc48/enemy48) are 48px high; bottom-align to the 32px cell.
    const frameHeight = SHEET_CONFIG[sheet]?.frameHeight ?? 32
    const dy = frameHeight > 32 ? py - (frameHeight - 32) : py

    const img = this.scene.add.image(px, dy, textureKey, frame).setOrigin(0, 0)
    this.sprites.push(img)
  }

  destroy() {
    for (const s of this.sprites) {
      s.destroy()
    }
    this.sprites = []
  }
}
