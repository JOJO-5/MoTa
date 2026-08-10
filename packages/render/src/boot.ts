import Phaser from 'phaser'
import { SHEET_CONFIG, type SpriteSheetKey } from './icons.js'
import { getLegacyFallbackAssetPath, LEGACY_FALLBACK_TEXTURE_KEY } from './fallback.js'

const CONTENT_BASE = './content/mota-2014'

/** Phaser texture key for each sprite sheet */
const SHEET_PATHS: Record<SpriteSheetKey, string> = {
  terrains: `${CONTENT_BASE}/materials/terrains.png`,
  animates: `${CONTENT_BASE}/materials/animates.png`,
  npcs: `${CONTENT_BASE}/materials/npcs.png`,
  npc48: `${CONTENT_BASE}/materials/npc48.png`,
  enemys: `${CONTENT_BASE}/materials/enemys.png`,
  enemy48: `${CONTENT_BASE}/materials/enemy48.png`,
  items: `${CONTENT_BASE}/materials/items.png`,
  autotile: `${CONTENT_BASE}/autotiles/autotile.png`,
  tileset: `${CONTENT_BASE}/tilesets/magictower.png`,
  hero: `${CONTENT_BASE}/images/hero.png`,
}

/** Autotile variant images (autotile0 ~ autotile8) */
const AUTOTILE_FILES = [
  'autotile.png',
  'autotile1.png',
  'autotile2.png',
  'autotile3.png',
  'autotile4.png',
  'autotile5.png',
  'autotile6.png',
  'autotile7.png',
  'autotile8.png',
]

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload() {
    // Load each sprite sheet with correct frame dimensions
    for (const [key, path] of Object.entries(SHEET_PATHS)) {
      const cfg = SHEET_CONFIG[key as SpriteSheetKey]
      this.load.spritesheet(key, path, {
        frameWidth: cfg.frameWidth,
        frameHeight: cfg.frameHeight,
      })
    }

    // Load all autotile variants as individual images
    AUTOTILE_FILES.forEach((file, i) => {
      const key = `autotile_${i}`
      this.load.image(key, `${CONTENT_BASE}/autotiles/${file}`)
    })

    // Load ground texture for background
    this.load.image('ground', `${CONTENT_BASE}/materials/ground.png`)

    // Modern gameplay skin. The floor, wall and hero are generated pixel assets;
    // legacy data IDs continue to drive collisions, events and progression.
    this.load.image('modern-floor-texture', `${CONTENT_BASE}/materials/modern-floor-texture-v2.png`)
    this.load.image('modern-wall-texture', `${CONTENT_BASE}/materials/modern-wall-texture-v2.png`)
    this.load.image('modern-hero', `${CONTENT_BASE}/materials/modern-hero-v3.png`)
    this.load.spritesheet('modern-enemies', `${CONTENT_BASE}/materials/modern-enemies-v1.png`, {
      frameWidth: 256,
      frameHeight: 256,
    })

    // Generate a 1x1 white pixel texture for fallback
    const g = this.make.graphics({ x: 0, y: 0 })
    g.fillStyle(0x333344, 1)
    g.fillRect(0, 0, 32, 32)
    g.generateTexture('__placeholder', 32, 32)
    g.destroy()

    // Load a static pixel-art replacement instead of generating it at runtime.
    // Android WebGL can expose generated CanvasTextures as black even though
    // the source pixels are valid on desktop browsers.
    this.load.image(LEGACY_FALLBACK_TEXTURE_KEY, getLegacyFallbackAssetPath(CONTENT_BASE))
  }

  create() {
    this.scene.start('GameScene')
  }
}
