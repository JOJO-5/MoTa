import Phaser from 'phaser'
import { BootScene } from './boot.js'

export function createGame(container: HTMLElement) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: 416, // 13 * 32
    height: 416,
    parent: container,
    scene: [BootScene],
    pixelArt: true,
  })
}
