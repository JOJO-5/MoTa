import Phaser from 'phaser'
import { TILE_SIZE } from './constants.js'

export class ParticleSystem {
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  burst(x: number, y: number, color: number = 0xffffff, count: number = 10) {
    for (let i = 0; i < count; i++) {
      const particle = this.scene.add.circle(
        x * TILE_SIZE + TILE_SIZE / 2,
        y * TILE_SIZE + TILE_SIZE / 2,
        3,
        color
      )
      this.scene.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-50, 50),
        y: particle.y + Phaser.Math.Between(-50, 50),
        alpha: 0,
        scale: 0,
        duration: 500,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      })
    }
  }

  battleEffect(x: number, y: number) {
    this.burst(x, y, 0xff4444, 20)
  }

  itemEffect(x: number, y: number) {
    this.burst(x, y, 0xffff00, 15)
  }

  doorEffect(x: number, y: number) {
    this.burst(x, y, 0x00aaff, 12)
  }

  healEffect(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const particle = this.scene.add.circle(
        x * TILE_SIZE + TILE_SIZE / 2,
        y * TILE_SIZE + TILE_SIZE / 2 + 16,
        2,
        0x00ff00
      )
      this.scene.tweens.add({
        targets: particle,
        y: particle.y - 30,
        alpha: 0,
        duration: 600,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      })
    }
  }
}
