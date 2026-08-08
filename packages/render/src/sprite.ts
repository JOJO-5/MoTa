import Phaser from 'phaser'
import { TILE_SIZE } from './constants.js'
import type { Direction } from '@modern-mota/core'

export class HeroSprite {
  private sprite: Phaser.GameObjects.Sprite
  private anims: Map<string, Phaser.Animations.Animation>

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.add.sprite(x * TILE_SIZE, y * TILE_SIZE, 'hero')
    this.sprite.setOrigin(0, 0)
    this.anims = new Map()
  }

  setDirection(direction: Direction) {
    const frameMap: Record<Direction, number> = {
      up: 0, down: 1, left: 2, right: 3
    }
    this.sprite.setFrame(frameMap[direction])
  }

  playWalk(direction: Direction) {
    const frameMap: Record<Direction, number> = {
      up: 4, down: 5, left: 6, right: 7
    }
    this.sprite.setFrame(frameMap[direction])
  }

  setPosition(x: number, y: number) {
    this.sprite.setPosition(x * TILE_SIZE, y * TILE_SIZE)
  }

  destroy() {
    this.sprite.destroy()
  }
}

export class EnemySprite {
  private sprite: Phaser.GameObjects.Sprite

  constructor(scene: Phaser.Scene, x: number, y: number, enemyId: string) {
    this.sprite = scene.add.sprite(x * TILE_SIZE, y * TILE_SIZE, `enemy_${enemyId}`)
    this.sprite.setOrigin(0, 0)
  }

  setPosition(x: number, y: number) {
    this.sprite.setPosition(x * TILE_SIZE, y * TILE_SIZE)
  }

  destroy() {
    this.sprite.destroy()
  }
}
