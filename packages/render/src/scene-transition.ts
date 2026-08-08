import Phaser from 'phaser'
import type { Floor } from '@modern-mota/data'
import { TileMapLayer } from './tilemap.js'
import { CameraSystem } from './camera.js'
import { HeroSprite } from './sprite.js'
import { gameStore } from '@modern-mota/core'

export class GameScene extends Phaser.Scene {
  private tileMap!: TileMapLayer
  private cameraSystem!: CameraSystem
  private heroSprite!: HeroSprite
  private unsubscribers: (() => void)[] = []

  constructor() {
    super('GameScene')
  }

  create() {
    this.cameraSystem = new CameraSystem(this, 13, 13)

    const loadFloorFromState = () => {
      const towerData = (globalThis as Record<string, unknown>)['__towerData'] as {
        floors: Record<string, Floor>
      } | null
      if (!towerData) return
      const state = gameStore.getState()
      if (!state.state.floorId) return
      const floor = towerData.floors[state.state.floorId]
      if (floor) {
        this.loadFloor(floor)
      }
    }

    this.unsubscribers.push(
      gameStore.subscribe((_prev, next) => {
        if (next.state.floorId) {
          loadFloorFromState()
        }
      })
    )

    loadFloorFromState()
  }

  shutdown() {
    this.unsubscribers.forEach((unsub) => unsub())
    this.unsubscribers = []
  }

  loadFloor(floor: Floor) {
    if (this.tileMap) {
      this.tileMap.destroy()
    }
    if (this.heroSprite) {
      this.heroSprite.destroy()
    }

    this.tileMap = new TileMapLayer(this)
    this.tileMap.render(floor.map, floor.bgmap, floor.fgmap)

    this.heroSprite = new HeroSprite(this, 6, 6)
    const spriteObj = (this.heroSprite as unknown as { sprite: Phaser.GameObjects.GameObject }).sprite
    this.cameraSystem.follow(spriteObj)
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
