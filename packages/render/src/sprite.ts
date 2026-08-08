import Phaser from 'phaser'
import { TILE_SIZE } from './constants.js'
import { HERO_FRAMES, HERO_COLS, ICONS } from './icons.js'
import type { Direction } from '@modern-mota/core'

export class HeroSprite {
  public container: Phaser.GameObjects.Container
  private sprite: Phaser.GameObjects.Image
  private direction: Direction

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.container = scene.add.container(x * TILE_SIZE, y * TILE_SIZE)
    this.direction = 'down'

    // hero.png: 128x192, 4 cols x 4 rows, each frame 32x48
    // Frame = row * HERO_COLS + col
    // Use 'down stop' frame as initial (row 0, col 0 = frame 0)
    const initialFrame = HERO_FRAMES[this.direction].row * HERO_COLS + HERO_FRAMES[this.direction].stop
    this.sprite = scene.add.image(0, -8, 'hero', initialFrame).setOrigin(0, 0)
    this.container.add(this.sprite)
  }

  setDirection(direction: Direction) {
    this.direction = direction
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
