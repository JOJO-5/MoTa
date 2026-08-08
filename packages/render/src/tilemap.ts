import Phaser from 'phaser'
import { TILE_SIZE } from './constants.js'

export class TileMapLayer {
  private scene: Phaser.Scene
  private graphics: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.graphics = scene.add.graphics()
  }

  render(map: number[][], tilesetImage: string) {
    this.graphics.clear()
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const tileId = map[y][x]
        if (tileId === 0) continue
        const col = tileId % 10
        const row = Math.floor(tileId / 10)
        this.graphics.fillStyle(0x888888, 1)
        this.graphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
        this.graphics.lineStyle(1, 0x666666, 1)
        this.graphics.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
      }
    }
  }

  setTile(x: number, y: number, tileId: number) {
    this.graphics.clear()
  }

  destroy() {
    this.graphics.destroy()
  }
}
