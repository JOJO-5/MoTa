import Phaser from 'phaser'
import { SHEET_CONFIG, type SpriteSheetKey } from './icons.js'

const CONTENT_BASE = './content/mota-2014'

/** Phaser texture key for each sprite sheet */
const SHEET_PATHS: Record<SpriteSheetKey, string> = {
  terrains: `${CONTENT_BASE}/materials/terrains.png`,
  animates: `${CONTENT_BASE}/materials/animates.png`,
  npcs:     `${CONTENT_BASE}/materials/npcs.png`,
  npc48:    `${CONTENT_BASE}/materials/npc48.png`,
  enemys:   `${CONTENT_BASE}/materials/enemys.png`,
  enemy48:  `${CONTENT_BASE}/materials/enemy48.png`,
  items:    `${CONTENT_BASE}/materials/items.png`,
  autotile: `${CONTENT_BASE}/autotiles/autotile.png`,
  tileset:  `${CONTENT_BASE}/tilesets/magictower.png`,
  hero:     `${CONTENT_BASE}/images/hero.png`,
}

/** Autotile variant images (autotile0 ~ autotile8) */
const AUTOTILE_FILES = [
  'autotile.png', 'autotile1.png', 'autotile2.png', 'autotile3.png',
  'autotile4.png', 'autotile5.png', 'autotile6.png', 'autotile7.png', 'autotile8.png',
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

    // Generate a 1x1 white pixel texture for fallback
    const g = this.make.graphics({ x: 0, y: 0 })
    g.fillStyle(0x333344, 1)
    g.fillRect(0, 0, 32, 32)
    g.generateTexture('__placeholder', 32, 32)
    g.destroy()

    // Generated pixel-art replacement for legacy tiles that point to an
    // empty/missing frame. This keeps old floors readable instead of showing
    // a solid black square.
    const fallback = this.make.graphics({ x: 0, y: 0 })
    fallback.fillStyle(0x182334, 1)
    fallback.fillRect(0, 0, 32, 32)
    fallback.fillStyle(0x26374b, 1)
    fallback.fillRect(3, 3, 26, 2)
    fallback.fillRect(3, 27, 26, 2)
    fallback.fillStyle(0x0c1420, 1)
    fallback.fillRect(3, 5, 2, 22)
    fallback.fillRect(27, 5, 2, 22)
    fallback.lineStyle(1, 0x65e3d3, 0.75)
    fallback.strokeRect(8, 8, 16, 16)
    fallback.fillStyle(0xf3c85b, 0.9)
    fallback.fillRect(15, 9, 2, 5)
    fallback.fillRect(15, 18, 2, 5)
    fallback.fillRect(9, 15, 5, 2)
    fallback.fillRect(18, 15, 5, 2)
    fallback.generateTexture('__legacy-fallback', 32, 32)
    fallback.destroy()
  }

  create() {
    this.scene.start('GameScene')
  }
}
