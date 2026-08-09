import type { HeroSnapshot } from '@modern-mota/core'
import { formatKeyCounts } from './ui/keys.js'

export class Hud {
  private container: HTMLElement
  private statsEl: HTMLElement
  private keysEl: HTMLElement
  private itemsEl: HTMLElement

  constructor(host: HTMLElement = document.body) {
    this.container = document.createElement('div')
    this.container.className = 'mota-hud'
    host.appendChild(this.container)

    this.statsEl = document.createElement('div')
    this.statsEl.className = 'mota-hud__stats'
    this.container.appendChild(this.statsEl)

    this.keysEl = document.createElement('div')
    this.keysEl.className = 'mota-hud__keys'
    this.container.appendChild(this.keysEl)

    this.itemsEl = document.createElement('div')
    this.itemsEl.className = 'mota-hud__items'
    this.container.appendChild(this.itemsEl)
  }

  update(hero: HeroSnapshot) {
    this.statsEl.innerHTML = `
      <div class="mota-hud__stat"><span>HP</span><strong>${hero.hp}/${hero.hpMax}</strong></div>
      <div class="mota-hud__stat"><span>ATK</span><strong>${hero.atk}</strong></div>
      <div class="mota-hud__stat"><span>DEF</span><strong>${hero.def}</strong></div>
      <div class="mota-hud__stat"><span>GOLD</span><strong>${hero.money}</strong></div>
      <div class="mota-hud__stat"><span>LV</span><strong>${hero.level}</strong></div>
    `
    this.keysEl.innerHTML = `
      <span class="mota-hud__section-label">KEYS</span>
      <span class="mota-hud__key"><i>KEYS</i>${formatKeyCounts(hero.keys)}</span>
    `
    this.itemsEl.innerHTML = `<span class="mota-hud__section-label">RELICS</span><span>${hero.items.length ? hero.items.slice(0, 6).join(' · ') : '暂无装备'}</span>`
  }

  destroy() {
    this.container.remove()
  }
}
