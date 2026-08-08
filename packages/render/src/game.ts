import Phaser from 'phaser'
import { BootScene } from './boot.js'
import { GameScene } from './scene-transition.js'

export function createGame(container: HTMLElement) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: 480,
    height: 480,
    parent: container,
    scene: [BootScene, GameScene],
    pixelArt: true,
    backgroundColor: '#0a0a14',
  })
}
