import Phaser from 'phaser'
import type { Direction } from '@modern-mota/core'

export type MoveCallback = (direction: Direction) => void
export type ActionCallback = () => void

const KEY_MAP: Record<string, Direction> = {
  'up': 'up', 'w': 'up', 'W': 'up',
  'ArrowUp': 'up',
  'down': 'down', 's': 'down', 'S': 'down',
  'ArrowDown': 'down',
  'left': 'left', 'a': 'left', 'A': 'left',
  'ArrowLeft': 'left',
  'right': 'right', 'd': 'right', 'D': 'right',
  'ArrowRight': 'right',
}

export class KeyboardInput {
  private scene: Phaser.Scene
  private onMove: MoveCallback
  private onAction: ActionCallback | null = null
  private actionKeys = ['Space', 'Enter', 'z', 'Z']

  constructor(scene: Phaser.Scene, onMove: MoveCallback, onAction?: ActionCallback) {
    this.scene = scene
    this.onMove = onMove
    if (onAction) this.onAction = onAction
    this.setup()
  }

  private setup() {
    this.scene.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const direction = KEY_MAP[event.key]
      if (direction) {
        event.preventDefault()
        this.onMove(direction)
      } else if (this.onAction && this.actionKeys.includes(event.key)) {
        event.preventDefault()
        this.onAction()
      }
    })
  }

  enable() { }
  disable() { }
  destroy() { this.scene.input.keyboard?.off('keydown') }
}
