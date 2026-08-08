import Phaser from 'phaser'
import { TILE_SIZE } from './constants.js'

const TILE_COLORS: Record<number, number> = {
  0: 0x333333,
  141: 0x3d5a80,
  142: 0x4a7fa8,
  143: 0xee6c4b,
  144: 0x293241,
  153: 0x5c4033,
  201: 0xffd700,
  22: 0xff4500,
  23: 0xff6b6b,
  21: 0xffd700,
  11359: 0x7a6b5a,
  10726: 0x4a7a4a,
  11116: 0x3a6a4a,
  11124: 0x2a5a3a,
  10104: 0x3a4a6a,
  10105: 0x3a4a6a,
  10106: 0x3a4a6a,
  10112: 0x2a3a5a,
  10113: 0x2a3a5a,
  10114: 0x2a3a5a,
  10118: 0x4a5a7a,
  10126: 0x5a6a8a,
  10134: 0x6a7a9a,
  10125: 0x7a8aaa,
  10133: 0x8a9aba,
  10030: 0x1a1a3e,
  10031: 0x16213e,
  10032: 0x0f3460,
  10033: 0x1b003b,
  10034: 0x00334d,
  10734: 0x5a8a5a,
  11792: 0x112233,
  20706: 0x8a6a4a,
}

function getTileColor(tileId: number): number {
  return TILE_COLORS[tileId] ?? 0x444444
}

export class TileMapLayer {
  private bgLayer!: Phaser.GameObjects.Graphics
  private wallLayer!: Phaser.GameObjects.Graphics
  private fgLayer!: Phaser.GameObjects.Graphics

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
          this.bgLayer.fillStyle(getTileColor(bgId), 1)
          this.bgLayer.fillRect(px, py, TILE_SIZE, TILE_SIZE)
        }

        if (wallId !== 0) {
          const color = getTileColor(wallId)
          this.wallLayer.fillStyle(color, 1)
          this.wallLayer.fillRect(px, py, TILE_SIZE, TILE_SIZE)
          this.wallLayer.lineStyle(1, 0x000000, 0.6)
          this.wallLayer.strokeRect(px, py, TILE_SIZE, TILE_SIZE)
        } else {
          this.wallLayer.fillStyle(getTileColor(0), 1)
          this.wallLayer.fillRect(px, py, TILE_SIZE, TILE_SIZE)
          this.wallLayer.lineStyle(1, 0x222222, 0.3)
          this.wallLayer.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2)
        }

        if (fgId !== 0) {
          const color = getTileColor(fgId)
          this.fgLayer.fillStyle(color, 1)
          this.fgLayer.fillRect(px, py, TILE_SIZE, TILE_SIZE)
          this.fgLayer.lineStyle(1, 0x000000, 0.4)
          this.fgLayer.strokeRect(px, py, TILE_SIZE, TILE_SIZE)
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
