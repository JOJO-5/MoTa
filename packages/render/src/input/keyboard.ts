import Phaser from 'phaser'
import type { Direction } from '@modern-mota/core'

export type MoveCallback = (direction: Direction) => void
export type ActionCallback = () => void

const KEY_REPEAT_GUARD_MS = 180

export function acceptKeydown(
  event: Pick<KeyboardEvent, 'key' | 'repeat'>,
  pressedKeys: Set<string>,
  acceptedAt: Map<string, number>,
  now: number
) {
  if (event.repeat || pressedKeys.has(event.key)) return false
  const previous = acceptedAt.get(event.key)
  if (previous !== undefined && now - previous < KEY_REPEAT_GUARD_MS) return false
  pressedKeys.add(event.key)
  acceptedAt.set(event.key, now)
  return true
}

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
  private pressedKeys = new Set<string>()
  private acceptedAt = new Map<string, number>()

  constructor(scene: Phaser.Scene, onMove: MoveCallback, onAction?: ActionCallback) {
    this.scene = scene
    this.onMove = onMove
    if (onAction) this.onAction = onAction
    this.setup()
  }

  private setup() {
    this.scene.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (!acceptKeydown(event, this.pressedKeys, this.acceptedAt, performance.now())) return
      const direction = KEY_MAP[event.key]
      if (direction) {
        event.preventDefault()
        this.onMove(direction)
      } else if (this.onAction && this.actionKeys.includes(event.key)) {
        event.preventDefault()
        this.onAction()
      }
    })
    this.scene.input.keyboard?.on('keyup', (event: KeyboardEvent) => {
      this.pressedKeys.delete(event.key)
    })
  }

  enable() { }
  disable() { }
  destroy() {
    this.scene.input.keyboard?.off('keydown')
    this.scene.input.keyboard?.off('keyup')
    this.pressedKeys.clear()
    this.acceptedAt.clear()
  }
}
