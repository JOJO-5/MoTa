import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload() {
    // Initial loading assets, e.g. loading screen images
    this.load.image('loading', 'assets/loading.png')
  }

  create() {
    this.scene.start('GameScene')
  }
}
