import Phaser from 'phaser'
import { TILE_SIZE } from './constants.js'

const TILE_COLORS: Record<number, number> = {
  0: 0x000000,
  10030: 0x1a1a2e,
  10031: 0x16213e,
  10032: 0x0f3460,
  10033: 0x1b003b,
  10034: 0x00334d,
  141: 0x3d5a80,
  142: 0x98c1d9,
  143: 0xee6c4b,
  144: 0x293241,
  153: 0x5c4033,
  201: 0xffd700,
  22: 0xff4500,
  23: 0xff6b6b,
  21: 0xffd700,
}

function getTileColor(tileId: number): number {
  return TILE_COLORS[tileId] ?? 0x333333
}

export class TileMapLayer {
  private bgLayer!: Phaser.GameObjects.Graphics
  private fgLayer!: Phaser.GameObjects.Graphics
  private wallLayer!: Phaser.GameObjects.Graphics

  constructor(scene: Phaser.Scene) {
    this.bgLayer = scene.add.graphics()
    this.wallLayer = scene.add.graphics()
    this.fgLayer = scene.add.graphics()
  }

  render(
    map: number[][],
    bgmap: number[][] | null,
    fgmap: number[][] | null
  ) {
    this.bgLayer.clear()
    this.wallLayer.clear()
    this.fgLayer.clear()

    const rows = map.length
    const cols = map[0]?.length ?? 0

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const wallId = map[y]?.[x] ?? 0
        const bgId = bgmap?.[y]?.[x] ?? 0
        const fgId = fgmap?.[y]?.[x] ?? 0

        const px = x * TILE_SIZE
        const py = y * TILE_SIZE

        if (bgId !== 0) {
          this.bgLayer.fillStyle(getTileColor(bgId), 0.3)
          this.bgLayer.fillRect(px, py, TILE_SIZE, TILE_SIZE)
        }

        if (wallId !== 0) {
          const color = getTileColor(wallId)
          this.wallLayer.fillStyle(color, 1)
          this.wallLayer.fillRect(px, py, TILE_SIZE, TILE_SIZE)
          this.wallLayer.lineStyle(1, 0x000000, 0.5)
          this.wallLayer.strokeRect(px, py, TILE_SIZE, TILE_SIZE)
        }

        if (fgId !== 0) {
          this.fgLayer.fillStyle(getTileColor(fgId), 1)
          this.fgLayer.fillRect(px, py, TILE_SIZE, TILE_SIZE)
        }
      }
    }
  }

  destroy() {
    this.bgLayer.destroy()
    this.wallLayer.destroy()
    this.fgLayer.destroy()
  }
}
