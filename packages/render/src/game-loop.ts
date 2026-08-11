import { gameStore, dispatch } from '@modern-mota/core'
import type { GameScene } from './scene-transition.js'
import { UiLayer } from './ui/layer.js'
import { Hud } from './hud.js'
import { BattleOverlay } from './battle-overlay.js'

const FLOOR_MSG_TIMEOUT = 3500

export class GameLoop {
  private uiLayer: UiLayer
  private hud: Hud
  private battleOverlay: BattleOverlay
  private running: boolean = false
  private lastMsg = ''
  private lastMsgAt = 0

  constructor(scene: GameScene, container: HTMLElement) {
    this.uiLayer = new UiLayer(container)
    this.hud = new Hud(container, (itemId) => scene.useItem(itemId))
    this.battleOverlay = new BattleOverlay(container)
    this.running = true
    this.tick()
  }

  private tick = () => {
    if (!this.running) return
    this.update()
    requestAnimationFrame(this.tick)
  }

  private update() {
    const { state } = gameStore.getState()
    const { hero, ui, floorId, battle } = state

    this.uiLayer.updateHero(hero)
    this.uiLayer.updateStatus(hero, state.flags)
    this.battleOverlay.update(battle, hero, battle ? state.enemys[battle.enemyId] : undefined)

    // Show current floor name (e.g. 魔塔 0 层 / 第 1 层)
    const towerData = (globalThis as Record<string, unknown>)['__towerData'] as {
      floors: Record<string, { name?: string; title?: string }>
      items?: Record<string, { cls?: string; name?: string; text?: string }>
    } | null
    this.hud.update(hero, towerData?.items, state.values, state.flags)
    const floor = towerData?.floors?.[floorId]
    this.uiLayer.updateFloorName(floor?.name || floorId)

    // Modal dialog (NPC conversations) — stays until player confirms
    if (ui.modal) {
      this.uiLayer.showModal(ui.modal)
      this.lastMsg = ''
    } else {
      this.uiLayer.hideModal()
    }

    // Floor message box with auto-hide after a few seconds
    if (ui.floorMsg) {
      if (ui.floorMsg !== this.lastMsg) {
        this.lastMsg = ui.floorMsg
        this.lastMsgAt = Date.now()
      }
      this.uiLayer.showMessage(ui.floorMsg)
      if (Date.now() - this.lastMsgAt > FLOOR_MSG_TIMEOUT) {
        dispatch({ type: 'SET_UI', ui: { floorMsg: null } })
      }
    } else {
      this.lastMsg = ''
      this.uiLayer.hideMessage()
    }
  }

  stop() {
    this.running = false
    this.uiLayer.destroy()
    this.hud.destroy()
    this.battleOverlay.destroy()
  }
}
