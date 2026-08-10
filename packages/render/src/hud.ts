import type { HeroSnapshot } from '@modern-mota/core'
import { formatKeyCounts } from './ui/keys.js'

function equipmentLabel(hero: HeroSnapshot): string {
  const equipment = [hero.equipment.weapon, hero.equipment.shield, hero.equipment.accessory].filter(
    Boolean
  )
  return equipment.length ? equipment.join(' · ') : '尚未装备'
}

export class Hud {
  private container: HTMLElement
  private identityEl: HTMLElement
  private vitalityEl: HTMLElement
  private statsEl: HTMLElement
  private keysEl: HTMLElement
  private equipmentEl: HTMLElement
  private itemsEl: HTMLElement

  constructor(host: HTMLElement = document.body) {
    this.container = document.createElement('aside')
    this.container.className = 'mota-hud'
    this.container.setAttribute('aria-label', '勇者档案')
    this.container.innerHTML = `
      <div class="mota-hud__ornament" aria-hidden="true"></div>
      <header class="mota-hud__header">
        <div class="mota-hud__portrait" role="img" aria-label="勇者菲利安"></div>
        <div class="mota-hud__identity"></div>
      </header>
      <div class="mota-hud__vitality"></div>
      <div class="mota-hud__stats"></div>
      <section class="mota-hud__section mota-hud__keys"></section>
      <section class="mota-hud__section mota-hud__equipment"></section>
      <section class="mota-hud__section mota-hud__items"></section>
    `
    host.appendChild(this.container)

    this.identityEl = this.container.querySelector('.mota-hud__identity') as HTMLElement
    this.vitalityEl = this.container.querySelector('.mota-hud__vitality') as HTMLElement
    this.statsEl = this.container.querySelector('.mota-hud__stats') as HTMLElement
    this.keysEl = this.container.querySelector('.mota-hud__keys') as HTMLElement
    this.equipmentEl = this.container.querySelector('.mota-hud__equipment') as HTMLElement
    this.itemsEl = this.container.querySelector('.mota-hud__items') as HTMLElement
  }

  update(hero: HeroSnapshot) {
    const hpPct = Math.max(0, Math.min(100, (hero.hp / Math.max(1, hero.hpMax)) * 100))
    this.identityEl.innerHTML = `
      <span class="mota-hud__eyebrow">HERO DOSSIER</span>
      <strong>勇者档案</strong>
      <small>菲利安 · LEVEL ${hero.level}</small>
    `
    this.vitalityEl.innerHTML = `
      <div class="mota-hud__vitality-label"><span>生命值</span><b>${hero.hp} / ${hero.hpMax}</b></div>
      <div class="mota-hud__hp-track"><i class="mota-hud__hp-fill" style="width:${hpPct}%"></i></div>
    `
    this.statsEl.innerHTML = `
      <div class="mota-hud__stat"><span>攻击</span><strong>${hero.atk}</strong><em>ATK</em></div>
      <div class="mota-hud__stat"><span>防御</span><strong>${hero.def}</strong><em>DEF</em></div>
      <div class="mota-hud__stat"><span>魔防</span><strong>${hero.mdef}</strong><em>MDEF</em></div>
      <div class="mota-hud__stat"><span>金币</span><strong>${hero.money}</strong><em>GOLD</em></div>
      <div class="mota-hud__stat"><span>经验</span><strong>${hero.exp}</strong><em>EXP</em></div>
      <div class="mota-hud__stat"><span>等级</span><strong>${hero.level}</strong><em>LEVEL</em></div>
    `
    this.keysEl.innerHTML = `
      <span class="mota-hud__section-label">钥匙环 <i>KEYRING</i></span>
      <span class="mota-hud__key">${formatKeyCounts(hero.keys)}</span>
    `
    this.equipmentEl.innerHTML = `
      <span class="mota-hud__section-label">当前装备 <i>LOADOUT</i></span>
      <span>${equipmentLabel(hero)}</span>
    `
    this.itemsEl.innerHTML = `
      <span class="mota-hud__section-label">遗物袋 <i>RELICS</i></span>
      <span>${hero.items.length ? hero.items.slice(0, 6).join(' · ') : '暂无遗物'}</span>
    `
  }

  destroy() {
    this.container.remove()
  }
}
