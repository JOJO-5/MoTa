import type { HeroSnapshot } from '@modern-mota/core'

export class Hud {
  private container: HTMLElement
  private statsEl: HTMLElement
  private keysEl: HTMLElement
  private itemsEl: HTMLElement

  constructor() {
    this.container = document.createElement('div')
    this.container.className = 'mota-hud'
    document.body.appendChild(this.container)

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
      ❤️ ${hero.hp}/${hero.hpMax}
      ⚔️ ATK:${hero.atk}
      🛡️ DEF:${hero.def}
      💰 ${hero.money}
      ⭐ LV${hero.level}
    `
    this.keysEl.innerHTML = `
      🔑 ${Object.entries(hero.keys).map(([k, v]) => `${k}:${v}`).join(' ')}
    `
    this.itemsEl.innerHTML = `道具: ${hero.items.slice(0, 6).join(', ')}`
  }

  destroy() {
    this.container.remove()
  }
}
