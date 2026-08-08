import Phaser from 'phaser'
import { BootScene } from './boot.js'
import { GameScene } from './scene-transition.js'

export function createGame(container: HTMLElement) {
  return new Phaser.Game({
    type: Phaser.CANVAS,
    width: 416,
    height: 416,
    parent: container,
    scene: [BootScene, GameScene],
    pixelArt: true,
  })
}
