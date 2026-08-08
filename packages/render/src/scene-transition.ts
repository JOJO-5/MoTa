import Phaser from 'phaser'
import type { Floor, Event } from '@modern-mota/data'
import { TileMapLayer } from './tilemap.js'
import { CameraSystem } from './camera.js'
import { HeroSprite } from './sprite.js'
import { KeyboardInput } from './input/keyboard.js'
import { gameStore, moveHero, eventMachine } from '@modern-mota/core'

export class GameScene extends Phaser.Scene {
  private tileMap!: TileMapLayer
  private cameraSystem!: CameraSystem
  private heroSprite!: HeroSprite
  private keyboardInput!: KeyboardInput
  private unsubscribers: (() => void)[] = []
  private currentFloor: Floor | null = null

  constructor() {
    super('GameScene')
  }

  create() {
    console.log('[GameScene] create() called')

    const loadFloorFromState = () => {
      const towerData = (globalThis as Record<string, unknown>)['__towerData'] as {
        floors: Record<string, Floor>
        maps: Record<string, { cls: string; id: string; doorInfo?: unknown }>
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
        if (next.state.floorId && next.state.floorId !== this.currentFloor?.floorId) {
          loadFloorFromState()
        }
      })
    )

    // Sync hero sprite with store position/direction
    this.unsubscribers.push(
      gameStore.subscribe((prev, next) => {
        if (!this.heroSprite) return
        if (prev.state.position.x !== next.state.position.x || prev.state.position.y !== next.state.position.y) {
          this.heroSprite.setPosition(next.state.position.x, next.state.position.y)
        }
        if (prev.state.direction !== next.state.direction) {
          this.heroSprite.setDirection(next.state.direction)
        }
      })
    )

    // Set up keyboard input
    this.keyboardInput = new KeyboardInput(this, (direction) => {
      this.tryMove(direction)
    })

    // Expose for automated end-to-end testing
    if (typeof window !== 'undefined') {
      ;(window as unknown as Record<string, unknown>).__gameScene = this
    }

    loadFloorFromState()
  }

  tryMove(direction: 'up' | 'down' | 'left' | 'right') {
    if (!this.currentFloor) return
    const towerData = (globalThis as Record<string, unknown>)['__towerData'] as {
      maps: Record<string, { cls: string; id: string; doorInfo?: unknown }>
    } | null
    const maps = towerData?.maps ?? {}

    const moved = moveHero(direction, this.currentFloor, maps)
    if (moved) {
      this.triggerEventsAtHero()
    }
  }

  private triggerEventsAtHero() {
    if (!this.currentFloor) return
    const { state } = gameStore.getState()
    const pos = state.position
    const key = `${pos.x},${pos.y}`

    // Trigger changeFloor (stairs)
    const changeFloor = (this.currentFloor.changeFloor as Record<string, Record<string, unknown>> | undefined)?.[key]
    if (changeFloor) {
      const events = [{ type: 'changeFloor', ...changeFloor }] as Event[]
      eventMachine.start(events, {
        floorId: this.currentFloor.floorId,
        x: pos.x,
        y: pos.y,
        eventIndex: 0,
        eventCount: events.length,
      })
      return
    }

    // Trigger tile events (items, enemies, npcs)
    const tileEvents = (this.currentFloor.events as Record<string, Event[]> | undefined)?.[key]
    if (tileEvents && tileEvents.length > 0) {
      eventMachine.start(tileEvents, {
        floorId: this.currentFloor.floorId,
        x: pos.x,
        y: pos.y,
        eventIndex: 0,
        eventCount: tileEvents.length,
      })
    }
  }

  shutdown() {
    console.log('[GameScene] shutdown')
    this.unsubscribers.forEach((unsub) => unsub())
    this.unsubscribers = []
    this.keyboardInput?.destroy()
  }

  loadFloor(floor: Floor) {
    console.log('[GameScene] loadFloor', floor.floorId)
    this.currentFloor = floor
    if (this.tileMap) { this.tileMap.destroy() }
    if (this.heroSprite) { this.heroSprite.destroy() }

    // Set up camera with actual floor dimensions
    const w = floor.width || floor.map[0]?.length || 13
    const h = floor.height || floor.map.length || 13
    this.cameraSystem = new CameraSystem(this, w, h)

    this.tileMap = new TileMapLayer(this)
    this.tileMap.render(floor.map, floor.bgmap, floor.fgmap, floor.defaultGround || null)
    console.log('[GameScene] TileMapLayer done, rows:', floor.map.length)

    const { state } = gameStore.getState()
    this.heroSprite = new HeroSprite(this, state.position.x, state.position.y)
    this.heroSprite.setDirection(state.direction)
    this.cameraSystem.follow(this.heroSprite.container as Phaser.GameObjects.GameObject)
    console.log('[GameScene] HeroSprite done')

    // Trigger firstArrive events when entering a floor
    if (floor.firstArrive && floor.firstArrive.length > 0) {
      eventMachine.start(floor.firstArrive as Event[], {
        floorId: floor.floorId,
        x: state.position.x,
        y: state.position.y,
        eventIndex: 0,
        eventCount: floor.firstArrive.length,
      })
    }
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
