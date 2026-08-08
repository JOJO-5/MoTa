import { gameStore } from '@modern-mota/core'
import type { GameScene } from './scene-transition.js'
import { UiLayer } from './ui/layer.js'
import { Hud } from './hud.js'

export class GameLoop {
  private uiLayer: UiLayer
  private hud: Hud
  private running: boolean = false

  constructor(_scene: GameScene, container: HTMLElement) {
    this.uiLayer = new UiLayer(container)
    this.hud = new Hud()
    this.running = true
    this.tick()
  }

  private tick = () => {
    if (!this.running) return
    this.update()
    requestAnimationFrame(this.tick)
  }

  private update() {
    const { hero, ui } = gameStore.getState()

    this.uiLayer.updateHero(hero)
    this.uiLayer.updateStatus(hero)
    this.hud.update(hero)

    if (ui.floorMsg) {
      this.uiLayer.showMessage(ui.floorMsg)
    } else {
      this.uiLayer.hideMessage()
    }
  }

  stop() {
    this.running = false
    this.uiLayer.destroy()
    this.hud.destroy()
  }
}
