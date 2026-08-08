import Phaser from 'phaser'
import type { Direction } from '@modern-mota/core'
import { GAME_WIDTH } from '../constants.js'

export class VirtualPad {
  private scene: Phaser.Scene
  private container: Phaser.GameObjects.Container
  private onMove: (dir: Direction) => void
  private onAction: (() => void) | null
  private buttons: Map<Direction, Phaser.GameObjects.Graphics> = new Map()
  private dpadCenter: { x: number; y: number } = { x: 0, y: 0 }

  constructor(scene: Phaser.Scene, onMove: (dir: Direction) => void, onAction?: () => void) {
    this.scene = scene
    this.onMove = onMove
    this.onAction = onAction ?? null
    this.dpadCenter = { x: 60, y: GAME_WIDTH - 60 }
    this.container = scene.add.container(0, 0)
    this.container.setScrollFactor(0)
    this.container.setDepth(400)
    this.createDPad()
  }

  private createDPad() {
    const cx = this.dpadCenter.x
    const cy = this.dpadCenter.y
    const btnSize = 36
    const gap = 4

    const dirs: { dir: Direction; dx: number; dy: number }[] = [
      { dir: 'up', dx: 0, dy: -1 },
      { dir: 'down', dx: 0, dy: 1 },
      { dir: 'left', dx: -1, dy: 0 },
      { dir: 'right', dx: 1, dy: 0 },
    ]

    dirs.forEach(({ dir, dx, dy }) => {
      const g = this.scene.add.graphics()
      const bx = cx + dx * (btnSize + gap)
      const by = cy + dy * (btnSize + gap)
      g.fillStyle(0xffffff, 0.3)
      g.fillRoundedRect(bx - btnSize / 2, by - btnSize / 2, btnSize, btnSize, 6)
      g.lineStyle(2, 0xffffff, 0.6)
      g.strokeRoundedRect(bx - btnSize / 2, by - btnSize / 2, btnSize, btnSize, 6)
      this.container.add(g)

      const zone = this.scene.add.zone(bx, by, btnSize, btnSize)
      zone.setInteractive({ useHandCursor: true })
      zone.on('pointerdown', () => this.onMove(dir))
      zone.on('pointerover', () => this.onMove(dir))
      this.container.add(zone)
      this.buttons.set(dir, g)
    })

    if (this.onAction) {
      const ag = this.scene.add.graphics()
      ag.fillStyle(0xffff00, 0.3)
      ag.fillCircle(cx + 80, cy, 28)
      ag.lineStyle(2, 0xffff00, 0.8)
      ag.strokeCircle(cx + 80, cy, 28)
      this.container.add(ag)

      const azone = this.scene.add.zone(cx + 80, cy, 56, 56)
      azone.setInteractive({ useHandCursor: true })
      azone.on('pointerdown', () => this.onAction?.())
      this.container.add(azone)
    }
  }

  destroy() {
    this.container.destroy()
  }
}
