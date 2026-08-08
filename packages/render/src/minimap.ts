import Phaser from 'phaser'
import { GAME_WIDTH } from './constants.js'

export class MiniMap {
  private graphics: Phaser.GameObjects.Graphics
  private scale = 4

  constructor(scene: Phaser.Scene, x: number = GAME_WIDTH - 52, y: number = 8) {
    this.graphics = scene.add.graphics()
    this.graphics.setScrollFactor(0)
    this.graphics.setDepth(50)
    this.graphics.setPosition(x, y)
  }

  render(map: number[][], heroX: number, heroY: number) {
    this.graphics.clear()
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const tileId = map[y][x]
        const color = tileId === 0 ? 0x333333 : 0x666666
        this.graphics.fillStyle(color, 1)
        this.graphics.fillRect(x * this.scale, y * this.scale, this.scale, this.scale)
      }
    }
    this.graphics.fillStyle(0xff0000, 1)
    this.graphics.fillRect(heroX * this.scale, heroY * this.scale, this.scale, this.scale)
  }

  destroy() {
    this.graphics.destroy()
  }
}
