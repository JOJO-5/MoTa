import Phaser from 'phaser'
import type { Floor, Event } from '@modern-mota/data'
import { TileMapLayer } from './tilemap.js'
import { CameraSystem } from './camera.js'
import { HeroSprite } from './sprite.js'
import { KeyboardInput } from './input/keyboard.js'
import {
  gameStore,
  moveHero,
  eventMachine,
  dispatch,
  interactWithTile,
  getRuntimeLayer,
  getRuntimeMap,
  resolveRuntimeTileValue,
  getTileOpacities,
  evaluate,
} from '@modern-mota/core'
import { GameLoop } from './game-loop.js'
import { getStairPoints, resolveStairLanding } from './floor-transition.js'

export class GameScene extends Phaser.Scene {
  private tileMap!: TileMapLayer
  private cameraSystem!: CameraSystem
  private heroSprite!: HeroSprite
  private keyboardInput: KeyboardInput | null = null
  private gameLoop: GameLoop | null = null
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
        maps: Record<string, { cls: string; id: string; trigger?: string; doorInfo?: unknown }>
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

    // Zustand v4 subscribe listener signature is (state, previousState):
    // first arg is the NEW state, second is the OLD one.
    this.unsubscribers.push(
      gameStore.subscribe((next, _prev) => {
        console.log('[GameScene] Zustand:', next.state.floorId)
        if (next.state.floorId && next.state.floorId !== this.currentFloor?.floorId) {
          loadFloorFromState()
        }
      })
    )

    // Sync hero sprite with store position/direction
    this.unsubscribers.push(
      gameStore.subscribe((next, prev) => {
        if (!this.heroSprite) return
        if (
          prev.state.position.x !== next.state.position.x ||
          prev.state.position.y !== next.state.position.y
        ) {
          this.heroSprite.setPosition(next.state.position.x, next.state.position.y)
        }
        if (prev.state.direction !== next.state.direction) {
          this.heroSprite.setDirection(next.state.direction)
        }
      })
    )

    this.unsubscribers.push(
      gameStore.subscribe((next, prev) => {
        if (next.state.tileOverrides !== prev.state.tileOverrides && this.tileMap) {
          this.rerenderTiles()
        }
      })
    )

    // Set up keyboard input: move with arrows/WASD, confirm dialogs with Enter/Space
    this.keyboardInput = new KeyboardInput(
      this,
      (direction) => {
        this.tryMove(direction)
      },
      () => {
        // Advance dialogs or interact with the tile directly in front of hero.
        this.tryAction()
      }
    )

    // Mount DOM UI layer (HP bar, floor name, messages) inside the game container
    const container = (this.game.canvas?.parentElement as HTMLElement | null) ?? document.body
    this.gameLoop = new GameLoop(this, container)

    // Cleanup on scene shutdown
    this.events.once('shutdown', () => {
      this.shutdown()
    })
    this.events.once('destroy', () => {
      this.shutdown()
    })

    // Expose for automated end-to-end testing
    if (typeof window !== 'undefined') {
      ;(window as unknown as Record<string, unknown>).__gameScene = this
      ;(window as unknown as Record<string, unknown>).__gameStore = gameStore
      ;(window as unknown as Record<string, unknown>).__eventMachine = eventMachine
    }

    loadFloorFromState()
  }

  tryMove(direction: 'up' | 'down' | 'left' | 'right') {
    if (eventMachine.getState() === 'waiting') {
      eventMachine.moveChoice(direction)
      return
    }
    if (!this.currentFloor) return
    // Block movement while a modal dialog is open
    if (gameStore.getState().state.ui.modal) return
    const towerData = (globalThis as Record<string, unknown>)['__towerData'] as {
      maps: Record<string, { cls: string; id: string; trigger?: string; doorInfo?: unknown }>
    } | null
    const maps = towerData?.maps ?? {}

    const runtimeFloor = {
      ...this.currentFloor,
      map: getRuntimeMap(
        this.currentFloor.floorId,
        this.currentFloor.map,
        gameStore.getState().state,
        maps
      ),
    }
    const moved = moveHero(direction, runtimeFloor, maps)
    if (moved) {
      this.triggerEventsAtHero()
    } else {
      this.tryOpenDoor(direction, maps)
    }
  }

  tryAction() {
    if (eventMachine.getState() === 'waiting') {
      eventMachine.resume()
      return
    }
    if (gameStore.getState().state.ui.modal) return
    this.triggerEventsAtFacing()
  }

  /** Trigger the legacy event attached to the tile directly in front of hero. */
  private triggerEventsAtFacing() {
    const { state } = gameStore.getState()
    const target = { ...state.position }
    if (state.direction === 'up') target.y--
    if (state.direction === 'down') target.y++
    if (state.direction === 'left') target.x--
    if (state.direction === 'right') target.x++
    this.triggerEventsAtPosition(target.x, target.y)
  }

  /** Open legacy mota-js doors when the player taps into them. */
  private tryOpenDoor(
    direction: 'up' | 'down' | 'left' | 'right',
    maps: Record<string, { cls: string; id: string; trigger?: string; doorInfo?: unknown }>
  ) {
    if (!this.currentFloor) return
    const { state } = gameStore.getState()
    const next = { ...state.position }
    if (direction === 'up') next.y--
    if (direction === 'down') next.y++
    if (direction === 'left') next.x--
    if (direction === 'right') next.x++
    const tileId =
      getRuntimeMap(this.currentFloor.floorId, this.currentFloor.map, state, maps)[next.y]?.[
        next.x
      ] ?? 0
    const entry = maps[String(tileId)]
    const doorInfo = entry?.doorInfo as { keys?: Record<string, number> } | undefined
    if (!entry || entry.trigger !== 'openDoor' || !doorInfo) return

    const required = Object.entries(doorInfo.keys ?? {}).find(([, count]) => count > 0)
    if (required && (state.hero.keys[required[0]] ?? 0) < required[1]) {
      dispatch({ type: 'SET_UI', ui: { floorMsg: `需要${required[0]}×${required[1]}` } })
      return
    }
    if (required) {
      dispatch({
        type: 'SET_HERO',
        hero: {
          keys: {
            ...state.hero.keys,
            [required[0]]: (state.hero.keys[required[0]] ?? 0) - required[1],
          },
        },
      })
    }

    dispatch({
      type: 'SET_TILE_OVERRIDE',
      floorId: this.currentFloor.floorId,
      x: next.x,
      y: next.y,
      override: { map: 0, hidden: false },
    })
    dispatch({ type: 'SET_UI', ui: { floorMsg: `${entry.id} 已开启` } })
    this.rerenderTiles()
    const afterOpen = this.currentFloor.afterOpenDoor?.[`${next.x},${next.y}`]
    if (afterOpen?.length) {
      eventMachine.start(afterOpen, {
        floorId: this.currentFloor.floorId,
        x: next.x,
        y: next.y,
        eventIndex: 0,
        eventCount: afterOpen.length,
      })
    }
  }

  private triggerEventsAtHero() {
    if (!this.currentFloor) return
    const { state } = gameStore.getState()
    const pos = state.position
    const key = `${pos.x},${pos.y}`
    const towerData = (globalThis as Record<string, unknown>)['__towerData'] as {
      main: { floorIds: string[] }
      floors: Record<string, Floor>
      maps: Record<string, { cls: string; id: string; doorInfo?: unknown }>
      items: Record<string, unknown>
      enemys: Record<string, unknown>
    } | null

    // Trigger changeFloor (stairs) — resolve :next/:before and missing loc
    const changeFloor = (
      this.currentFloor.changeFloor as Record<string, Record<string, unknown>> | undefined
    )?.[key]
    if (changeFloor) {
      const resolved = this.resolveChangeFloor(changeFloor)
      if (resolved) {
        eventMachine.start([{ type: 'changeFloor', ...resolved }], {
          floorId: this.currentFloor.floorId,
          x: pos.x,
          y: pos.y,
          eventIndex: 0,
          eventCount: 1,
        })
      }
      return
    }

    // Trigger tile events (items, enemies, npcs)
    const handledByFloorEvent = this.triggerEventsAtPosition(pos.x, pos.y)
    if (handledByFloorEvent) return

    // Step-on interactions: pick up items, fight enemies
    if (!towerData) return
    const tileId =
      getRuntimeMap(this.currentFloor.floorId, this.currentFloor.map, state, towerData.maps)[
        pos.y
      ]?.[pos.x] ?? 0
    const entry = towerData.maps[String(tileId)]
    if (!entry) return

    const result = interactWithTile(
      this.currentFloor.floorId,
      pos.x,
      pos.y,
      tileId,
      towerData.maps,
      towerData.items as never,
      towerData.enemys as never
    )

    if (result) {
      dispatch({ type: 'SET_UI', ui: { floorMsg: result.message } })
      if (result.consumed && result.kind === 'enemy') {
        const afterBattle = [
          ...(result.afterBattle ?? []),
          ...(this.currentFloor.afterBattle?.[`${pos.x},${pos.y}`] ?? []),
        ]
        if (afterBattle?.length) {
          eventMachine.start(afterBattle as Event[], {
            floorId: this.currentFloor.floorId,
            x: pos.x,
            y: pos.y,
            eventIndex: 0,
            eventCount: afterBattle.length,
          })
        }
      }
      this.rerenderTiles()
      this.runAutoEvents()
    }
  }

  /**
   * Resolve a changeFloor entry: expand :next/:before floorId aliases and
   * fill in the landing position when `loc` is missing (matching the
   * original mota-js behaviour of landing on the complementary stair).
   */
  private resolveChangeFloor(
    changeFloor: Record<string, unknown>
  ): { floorId: string; loc?: [number, number] } | null {
    const towerData = (globalThis as Record<string, unknown>)['__towerData'] as {
      main: { floorIds: string[] }
      floors: Record<string, Floor>
    } | null
    if (!towerData || !this.currentFloor) return null

    const floorIds = towerData.main.floorIds
    const currentIdx = floorIds.indexOf(this.currentFloor.floorId)
    let nextFloorId = changeFloor.floorId as string
    if (nextFloorId === ':next') nextFloorId = floorIds[currentIdx + 1]
    else if (nextFloorId === ':before') nextFloorId = floorIds[currentIdx - 1]

    if (!nextFloorId || !towerData.floors[nextFloorId]) {
      console.warn(
        '[GameScene] cannot resolve changeFloor target:',
        changeFloor.floorId,
        'from',
        this.currentFloor.floorId
      )
      return null
    }

    const loc = changeFloor.loc as [number, number] | undefined
    if (loc && Array.isArray(loc) && loc.length === 2) {
      return { floorId: nextFloorId, loc: [loc[0] as number, loc[1] as number] }
    }

    const target = towerData.floors[nextFloorId]
    const landing = resolveStairLanding(target, changeFloor.stair as string | undefined, target.map)
    if (landing) {
      return { floorId: nextFloorId, loc: landing }
    }
    // Fallback: keep current position
    return { floorId: nextFloorId }
  }

  /** Re-render the tile layer, skipping tiles that were picked up / cleared. */
  private rerenderTiles() {
    if (!this.currentFloor) return
    const { state } = gameStore.getState()
    const maps =
      (
        (globalThis as Record<string, unknown>)['__towerData'] as {
          maps?: Record<string, { id: string }>
        } | null
      )?.maps ?? {}
    const runtimeMap = getRuntimeMap(this.currentFloor.floorId, this.currentFloor.map, state, maps)
    const runtimeBgMap = getRuntimeLayer(
      this.currentFloor.floorId,
      'bgmap',
      this.currentFloor.bgmap,
      state
    ).map((row) => row.map((value) => resolveRuntimeTileValue(value, maps)))
    const runtimeFgMap = getRuntimeLayer(
      this.currentFloor.floorId,
      'fgmap',
      this.currentFloor.fgmap,
      state
    ).map((row) => row.map((value) => resolveRuntimeTileValue(value, maps)))
    const collected = state.collectedTiles[this.currentFloor.floorId] ?? []
    this.tileMap.render(
      runtimeMap,
      runtimeBgMap,
      runtimeFgMap,
      this.currentFloor.defaultGround || null,
      collected,
      getTileOpacities(this.currentFloor.floorId, state),
      getStairPoints(this.currentFloor.changeFloor as Record<string, unknown> | undefined)
    )
    // Keep hero above freshly added tiles
    this.heroSprite?.container.setDepth(10)
  }

  /** Evaluate legacy autoEvent entries after a stable gameplay state change. */
  private runAutoEvents() {
    if (!this.currentFloor) return
    const autoEvent = this.currentFloor.autoEvent as unknown as
      Record<string, Record<string, unknown>> | undefined
    if (!autoEvent) return
    const { state } = gameStore.getState()
    const candidates: Array<{
      key: string
      index: string
      data: Event[]
      condition: string
      multiExecute: boolean
      priority: number
    }> = []

    for (const [key, entries] of Object.entries(autoEvent)) {
      for (const [index, rawValue] of Object.entries(entries ?? {})) {
        if (!rawValue || typeof rawValue !== 'object') continue
        const raw = rawValue as Record<string, unknown>
        if (!Array.isArray(raw.data)) continue
        candidates.push({
          key,
          index,
          data: raw.data as Event[],
          condition: String(raw.condition ?? 'false'),
          multiExecute: raw.multiExecute === true,
          priority: Number(raw.priority) || 0,
        })
      }
    }

    candidates.sort((a, b) => b.priority - a.priority)
    for (const candidate of candidates) {
      const firedKey = `__autoEvent:${this.currentFloor.floorId}:${candidate.key}:${candidate.index}`
      if (!candidate.multiExecute && state.flags[firedKey]) continue
      if (!Boolean(evaluate(candidate.condition))) continue

      if (!candidate.multiExecute) dispatch({ type: 'SET_FLAG', name: firedKey, value: true })
      eventMachine.start(candidate.data, {
        floorId: this.currentFloor.floorId,
        x: state.position.x,
        y: state.position.y,
        eventIndex: 0,
        eventCount: candidate.data.length,
      })
    }
  }

  shutdown() {
    console.log('[GameScene] shutdown')
    this.unsubscribers.forEach((unsub) => unsub())
    this.unsubscribers = []
    this.keyboardInput?.destroy()
    this.keyboardInput = null
    this.gameLoop?.stop()
    this.gameLoop = null
    if (typeof window !== 'undefined') {
      const globals = window as unknown as Record<string, unknown>
      if (globals.__gameScene === this) globals.__gameScene = undefined
    }
  }

  private triggerEventsAtPosition(x: number, y: number): boolean {
    if (!this.currentFloor) return false
    const tileEvents = (
      this.currentFloor.events as
        Record<string, Event[] | { data?: Event[]; enable?: boolean; trigger?: string }> | undefined
    )?.[`${x},${y}`]
    const events = Array.isArray(tileEvents) ? tileEvents : tileEvents?.data
    const enabled = Array.isArray(tileEvents) || tileEvents?.enable !== false
    if (!tileEvents || !enabled || !events || events.length === 0) return false
    eventMachine.start(tileEvents, {
      floorId: this.currentFloor.floorId,
      x,
      y,
      eventIndex: 0,
      eventCount: events.length,
    })
    return true
  }

  loadFloor(floor: Floor) {
    console.log('[GameScene] loadFloor', floor.floorId)
    this.currentFloor = floor
    const previousState = gameStore.getState().state
    const firstVisit = !(previousState.visitedFloors ?? []).includes(floor.floorId)
    if (firstVisit) {
      gameStore.getState().dispatch({ type: 'MARK_FLOOR_VISITED', floorId: floor.floorId })
    }
    if (this.tileMap) {
      this.tileMap.destroy()
    }
    if (this.heroSprite) {
      this.heroSprite.destroy()
    }

    // Set up camera with actual floor dimensions
    const w = floor.width || floor.map[0]?.length || 13
    const h = floor.height || floor.map.length || 13
    this.cameraSystem = new CameraSystem(this, w, h)

    this.tileMap = new TileMapLayer(this)
    const state = gameStore.getState().state
    const maps =
      (
        (globalThis as Record<string, unknown>)['__towerData'] as {
          maps?: Record<string, { id: string }>
        } | null
      )?.maps ?? {}
    const runtimeMap = getRuntimeMap(floor.floorId, floor.map, state, maps)
    const runtimeBgMap = getRuntimeLayer(floor.floorId, 'bgmap', floor.bgmap, state).map((row) =>
      row.map((value) => resolveRuntimeTileValue(value, maps))
    )
    const runtimeFgMap = getRuntimeLayer(floor.floorId, 'fgmap', floor.fgmap, state).map((row) =>
      row.map((value) => resolveRuntimeTileValue(value, maps))
    )
    const collected = state.collectedTiles[floor.floorId] ?? []
    this.tileMap.render(
      runtimeMap,
      runtimeBgMap,
      runtimeFgMap,
      floor.defaultGround || null,
      collected,
      getTileOpacities(floor.floorId, state),
      getStairPoints(floor.changeFloor as Record<string, unknown> | undefined)
    )
    console.log('[GameScene] TileMapLayer done, rows:', floor.map.length)

    const { state: latestState } = gameStore.getState()
    this.heroSprite = new HeroSprite(this, latestState.position.x, latestState.position.y)
    this.heroSprite.setDirection(latestState.direction)
    this.cameraSystem.follow(this.heroSprite.container as Phaser.GameObjects.GameObject)
    console.log('[GameScene] HeroSprite done')

    // Trigger firstArrive only once; revisiting uses eachArrive.
    const arrivalEvents = firstVisit ? floor.firstArrive : floor.eachArrive
    if (arrivalEvents && arrivalEvents.length > 0) {
      eventMachine.start(arrivalEvents as Event[], {
        floorId: floor.floorId,
        x: latestState.position.x,
        y: latestState.position.y,
        eventIndex: 0,
        eventCount: arrivalEvents.length,
      })
    }
    this.runAutoEvents()
  }

  changeFloor(
    nextFloor: Floor,
    position: { x: number; y: number },
    direction: 'up' | 'down' | 'left' | 'right'
  ) {
    this.cameraSystem.fadeOut(300).once('camerafadeoutcomplete', () => {
      dispatch({ type: 'ENTER_FLOOR', floorId: nextFloor.floorId, position, direction })
      this.cameraSystem.fadeIn(300)
    })
  }
}
