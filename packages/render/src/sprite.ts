import Phaser from 'phaser'
import { TILE_SIZE } from './constants.js'
import type { Direction } from '@modern-mota/core'

export class HeroSprite {
  private container: Phaser.GameObjects.Container
  private body: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.container = scene.add.container(x * TILE_SIZE, y * TILE_SIZE)
    this.body = scene.add.graphics()
    this.body.fillStyle(0xffcc00, 1)
    this.body.fillRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4)
    this.body.fillStyle(0x000000, 1)
    this.body.fillRect(6, 4, 4, 4)
    this.body.fillRect(14, 4, 4, 4)
    this.body.fillStyle(0xffd700, 1)
    this.body.fillRect(6, 10, 12, 4)
    this.container.add(this.body)
  }

  setDirection(_direction: Direction) {
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

  constructor(scene: Phaser.Scene, x: number, y: number, _enemyId: string) {
    this.container = scene.add.container(x * TILE_SIZE, y * TILE_SIZE)
    const g = scene.add.graphics()
    g.fillStyle(0xff0000, 1)
    g.fillCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2 - 2)
    g.fillStyle(0x000000, 1)
    g.fillCircle(TILE_SIZE / 2 - 4, TILE_SIZE / 2 - 2, 2)
    g.fillCircle(TILE_SIZE / 2 + 4, TILE_SIZE / 2 - 2, 2)
    this.container.add(g)
  }

  setPosition(x: number, y: number) {
    this.container.setPosition(x * TILE_SIZE, y * TILE_SIZE)
  }

  destroy() {
    this.container.destroy()
  }
}
