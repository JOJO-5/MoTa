import Phaser from 'phaser'
import type { Direction } from '@modern-mota/core'

const DIR_MAP: Record<number, Direction> = {
  12: 'up', 13: 'down', 14: 'left', 15: 'right',
}

export class GamepadInput {
  private scene: Phaser.Scene
  private onMove: (dir: Direction) => void
  private onAction: (() => void) | null
  private lastMove = 0

  constructor(scene: Phaser.Scene, onMove: (dir: Direction) => void, onAction?: () => void) {
    this.scene = scene
    this.onMove = onMove
    this.onAction = onAction ?? null
    this.setup()
  }

  private setup() {
    this.scene.input.gamepad?.on('down', (_pad: Phaser.Input.Gamepad.Gamepad, button: Phaser.Input.Gamepad.Button) => {
      if (button.index === 0) this.onAction?.()
      const dir = DIR_MAP[button.index]
      if (dir) this.onMove(dir)
    })

    this.scene.input.gamepad?.on('axis', (_pad: Phaser.Input.Gamepad.Gamepad, axis: Phaser.Input.Gamepad.Axis, value: number) => {
      const now = Date.now()
      if (now - this.lastMove < 150) return
      if (Math.abs(value) < 0.5) return
      const dir: Direction = axis.index === 0 ? (value < 0 ? 'left' : 'right') : (value < 0 ? 'up' : 'down')
      this.onMove(dir)
      this.lastMove = now
    })
  }

  destroy() {
    this.scene.input.gamepad?.off('down')
    this.scene.input.gamepad?.off('axis')
  }
}
