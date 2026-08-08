import Phaser from 'phaser'
import type { Floor } from '@modern-mota/data'
import { TileMapLayer } from './tilemap.js'
import { CameraSystem } from './camera.js'
import { HeroSprite } from './sprite.js'

export class GameScene extends Phaser.Scene {
  private tileMap!: TileMapLayer
  private cameraSystem!: CameraSystem
  private heroSprite!: HeroSprite

  constructor() {
    super('GameScene')
  }

  create() {
    this.cameraSystem = new CameraSystem(this, 13, 13)
  }

  loadFloor(floor: Floor) {
    if (this.tileMap) {
      this.tileMap.destroy()
    }
    if (this.heroSprite) {
      this.heroSprite.destroy()
    }

    this.tileMap = new TileMapLayer(this)
    this.tileMap.render(floor.map, 'tileset')

    this.heroSprite = new HeroSprite(this, 6, 6)
    this.cameraSystem.follow(this.heroSprite['sprite'])
  }

  changeFloor(
    nextFloor: Floor,
    position: { x: number; y: number },
    direction: 'up' | 'down' | 'left' | 'right'
  ) {
    this.cameraSystem.fadeOut(300).once('camerafadeoutcomplete', () => {
      this.loadFloor(nextFloor)
      this.heroSprite.setPosition(position.x, position.y)
      this.heroSprite.setDirection(direction)
      this.cameraSystem.fadeIn(300)
    })
  }
}
