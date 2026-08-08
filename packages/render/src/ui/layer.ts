import type { HeroSnapshot } from '@modern-mota/core'

export class UiLayer {
  private container: HTMLElement
  private hpBar: HTMLElement
  private floorNameEl: HTMLElement
  private msgBox: HTMLElement
  private statusEl: HTMLElement
  private modalEl: HTMLElement

  constructor(container: HTMLElement) {
    this.container = document.createElement('div')
    this.container.className = 'mota-ui-layer'
    container.appendChild(this.container)

    this.hpBar = this.createHpBar()
    this.floorNameEl = this.createFloorName()
    this.msgBox = this.createMsgBox()
    this.statusEl = this.createStatus()
    this.modalEl = this.createModal()
  }

  private createHpBar(): HTMLElement {
    const hpBar = document.createElement('div')
    hpBar.className = 'mota-hp-bar'
    hpBar.innerHTML = `
      <div class="mota-hp-fill"></div>
      <div class="mota-hp-text">1000/1000</div>
    `
    this.container.appendChild(hpBar)
    return hpBar
  }

  private createFloorName(): HTMLElement {
    const el = document.createElement('div')
    el.className = 'mota-floor-name'
    el.textContent = '第 1 层'
    this.container.appendChild(el)
    return el
  }

  private createMsgBox(): HTMLElement {
    const box = document.createElement('div')
    box.className = 'mota-msg-box'
    box.style.display = 'none'
    this.container.appendChild(box)
    return box
  }

  private createStatus(): HTMLElement {
    const el = document.createElement('div')
    el.className = 'mota-status'
    this.container.appendChild(el)
    return el
  }

  private createModal(): HTMLElement {
    const el = document.createElement('div')
    el.className = 'mota-modal'
    el.style.display = 'none'
    this.container.appendChild(el)
    return el
  }

  showModal(text: string) {
    this.modalEl.textContent = text
    this.modalEl.style.display = 'block'
  }

  hideModal() {
    this.modalEl.style.display = 'none'
    this.modalEl.textContent = ''
  }

  updateHero(hero: HeroSnapshot) {
    const pct = Math.max(0, Math.min(100, (hero.hp / hero.hpMax) * 100))
    const fill = this.hpBar.querySelector('.mota-hp-fill') as HTMLElement
    const text = this.hpBar.querySelector('.mota-hp-text') as HTMLElement
    if (fill) fill.style.width = `${pct}%`
    if (text) text.textContent = `${hero.hp}/${hero.hpMax}`
  }

  updateFloorName(name: string) {
    this.floorNameEl.textContent = name
  }

  showMessage(text: string) {
    this.msgBox.textContent = text
    this.msgBox.style.display = 'block'
  }

  hideMessage() {
    this.msgBox.style.display = 'none'
  }

  updateStatus(hero: HeroSnapshot) {
    this.statusEl.innerHTML = `
      <span>ATK: ${hero.atk}</span>
      <span>DEF: ${hero.def}</span>
      <span>💰 ${hero.money}</span>
      <span>🔑 ${hero.keys.yellowKey ?? 0}</span>
    `
  }

  destroy() {
    this.container.remove()
  }
}
