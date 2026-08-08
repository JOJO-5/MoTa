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
    console.log('[GameScene] create() called')
    this.cameraSystem = new CameraSystem(this, 13, 13)

    const loadFloorFromState = () => {
      const towerData = (globalThis as Record<string, unknown>)['__towerData'] as {
        floors: Record<string, Floor>
      } | null
      console.log('[GameScene] towerData:', !!towerData)
      if (!towerData) return
      const { state } = gameStore.getState()
      console.log('[GameScene] floorId:', state.floorId)
      if (!state.floorId) return
      const floor = towerData.floors[state.floorId]
      console.log('[GameScene] floor found:', floor?.floorId, 'map rows:', floor?.map?.length)
      if (floor) {
        this.loadFloor(floor)
      }
    }

    this.unsubscribers.push(
      gameStore.subscribe((_prev, next) => {
        console.log('[GameScene] Zustand:', next.state.floorId)
        if (next.state.floorId) {
          loadFloorFromState()
        }
      })
    )

    loadFloorFromState()
  }

  shutdown() {
    console.log('[GameScene] shutdown')
    this.unsubscribers.forEach((unsub) => unsub())
    this.unsubscribers = []
  }

  loadFloor(floor: Floor) {
    console.log('[GameScene] loadFloor', floor.floorId)
    if (this.tileMap) { this.tileMap.destroy() }
    if (this.heroSprite) { this.heroSprite.destroy() }

    this.tileMap = new TileMapLayer(this)
    this.tileMap.render(floor.map, floor.bgmap, floor.fgmap)
    console.log('[GameScene] TileMapLayer done, rows:', floor.map.length)

    this.heroSprite = new HeroSprite(this, 6, 6)
    this.cameraSystem.follow(this.heroSprite.container as Phaser.GameObjects.GameObject)
    console.log('[GameScene] HeroSprite done')
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
