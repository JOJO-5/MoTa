import Phaser from 'phaser'
import { TILE_SIZE } from './constants.js'
import { HERO_FRAMES, HERO_COLS, ICONS } from './icons.js'
import type { Direction } from '@modern-mota/core'

// Tight alpha bounds of modern-hero-v2.png. The source is a single portrait,
// not a sprite sheet; keeping the crop tight prevents the character becoming
// a tiny cyan shape inside a large transparent canvas on mobile.
const MODERN_HERO_CROP = { x: 237, y: 196, width: 602, height: 1103 }
const MODERN_HERO_SIZE = { width: 28, height: 52 }
const MODERN_HERO_SCALE = {
  x: MODERN_HERO_SIZE.width / MODERN_HERO_CROP.width,
  y: MODERN_HERO_SIZE.height / MODERN_HERO_CROP.height,
}

export class HeroSprite {
  public container: Phaser.GameObjects.Container
  private sprite: Phaser.GameObjects.Image
  private direction: Direction

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.container = scene.add.container(x * TILE_SIZE, y * TILE_SIZE)
    this.direction = 'down'

    const shadow = scene.add
      .ellipse(TILE_SIZE / 2, TILE_SIZE - 4, 23, 8, 0x02050a, 0.78)
      .setStrokeStyle(1, 0x35e4ff, 0.75)
    this.container.add(shadow)

    if (scene.textures.exists('modern-hero')) {
      this.sprite = scene.add
        .image(TILE_SIZE / 2, TILE_SIZE, 'modern-hero')
        .setOrigin(0.5, 1)
        .setCrop(
          MODERN_HERO_CROP.x,
          MODERN_HERO_CROP.y,
          MODERN_HERO_CROP.width,
          MODERN_HERO_CROP.height
        )
        .setScale(MODERN_HERO_SCALE.x, MODERN_HERO_SCALE.y)
    } else {
      // Keep a safe fallback for standalone scene tests that do not preload
      // the modern asset bundle.
      const initialFrame =
        HERO_FRAMES[this.direction].row * HERO_COLS + HERO_FRAMES[this.direction].stop
      this.sprite = scene.add.image(0, -8, 'hero', initialFrame).setOrigin(0, 0)
    }
    this.container.add(this.sprite)

    scene.tweens.add({
      targets: shadow,
      scaleX: 0.88,
      alpha: 0.55,
      duration: 820,
      ease: 'Sine.InOut',
      yoyo: true,
      repeat: -1,
    })
  }

  setDirection(direction: Direction) {
    this.direction = direction
    if (this.sprite.texture.key === 'modern-hero') {
      this.sprite.setScale(
        direction === 'left' ? -MODERN_HERO_SCALE.x : MODERN_HERO_SCALE.x,
        MODERN_HERO_SCALE.y
      )
      return
    }
    const dirData = HERO_FRAMES[direction]
    if (!dirData) return
    const frame = dirData.row * HERO_COLS + dirData.stop
    this.sprite.setFrame(frame)
  }

  setPosition(x: number, y: number) {
    this.container.setPosition(x * TILE_SIZE, y * TILE_SIZE)
  }

  destroy() {
    this.container.destroy()
  }
}

export class EnemySprite {
  private container: Phaser.GameObjects.Container

  constructor(scene: Phaser.Scene, x: number, y: number, enemyId: string) {
    this.container = scene.add.container(x * TILE_SIZE, y * TILE_SIZE)

    // Try to use enemys sprite sheet
    const frame = ICONS.enemys?.[enemyId] ?? 0
    const sprite = scene.add.image(0, 0, 'enemys', frame).setOrigin(0, 0)
    this.container.add(sprite)
  }

  setPosition(x: number, y: number) {
    this.container.setPosition(x * TILE_SIZE, y * TILE_SIZE)
  }

  destroy() {
    this.container.destroy()
  }
}
