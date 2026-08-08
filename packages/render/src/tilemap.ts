import Phaser from 'phaser'
import { TILE_SIZE } from './constants.js'

export class TileMapLayer {
  private graphics: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics()
  }

  render(map: number[][], _tilesetImage: string) {
    this.graphics.clear()
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const tileId = map[y][x]
        if (tileId === 0) continue
        this.graphics.fillStyle(0x888888, 1)
        this.graphics.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
        this.graphics.lineStyle(1, 0x666666, 1)
        this.graphics.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
      }
    }
  }

  setTile(_x: number, _y: number, _tileId: number) {
    this.graphics.clear()
  }

  destroy() {
    this.graphics.destroy()
  }
}
