import type { HeroSnapshot } from '@modern-mota/core'
import { formatKeyCounts } from './ui/keys.js'
import { buildInventoryView, type ItemDefinition } from './item-catalog.js'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export class Hud {
  private container: HTMLElement
  private identityEl: HTMLElement
  private vitalityEl: HTMLElement
  private statsEl: HTMLElement
  private keysEl: HTMLElement
  private equipmentEl: HTMLElement
  private itemsEl: HTMLElement
  private inventoryToggle: HTMLButtonElement
  private lastInventorySignature = ''

  constructor(
    host: HTMLElement = document.body,
    private readonly onUseItem: (itemId: string) => void = () => undefined
  ) {
    this.container = document.createElement('aside')
    this.container.className = 'mota-hud'
    this.container.setAttribute('aria-label', '勇者档案')
    this.container.innerHTML = `
      <button class="mota-hud__toggle" type="button" aria-expanded="false" aria-label="打开勇者行囊">
        <span aria-hidden="true">✦</span><b>行囊</b>
      </button>
      <div class="mota-hud__body">
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
      </div>
    `
    host.appendChild(this.container)

    this.identityEl = this.container.querySelector('.mota-hud__identity') as HTMLElement
    this.vitalityEl = this.container.querySelector('.mota-hud__vitality') as HTMLElement
    this.statsEl = this.container.querySelector('.mota-hud__stats') as HTMLElement
    this.keysEl = this.container.querySelector('.mota-hud__keys') as HTMLElement
    this.equipmentEl = this.container.querySelector('.mota-hud__equipment') as HTMLElement
    this.itemsEl = this.container.querySelector('.mota-hud__items') as HTMLElement
    this.inventoryToggle = this.container.querySelector('.mota-hud__toggle') as HTMLButtonElement
    this.inventoryToggle.addEventListener('click', this.handleToggle)
    this.itemsEl.addEventListener('click', this.handleItemClick)
  }

  private readonly handleToggle = () => {
    const expanded = this.container.classList.toggle('mota-hud--open')
    this.inventoryToggle.setAttribute('aria-expanded', String(expanded))
    this.inventoryToggle.setAttribute('aria-label', expanded ? '关闭勇者行囊' : '打开勇者行囊')
    const label = this.inventoryToggle.querySelector('b')
    if (label) label.textContent = expanded ? '收起' : '行囊'
  }

  private readonly handleItemClick = (event: Event) => {
    const target = event.target as Element | null
    const button = target?.closest<HTMLButtonElement>('button[data-item-id]')
    if (!button || !this.itemsEl.contains(button)) return
    this.onUseItem(button.dataset.itemId ?? '')
  }

  update(
    hero: HeroSnapshot,
    itemDefinitions: Record<string, ItemDefinition> = {},
    values: Record<string, number> = {}
  ) {
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
    const inventory = buildInventoryView(hero, values, itemDefinitions)
    const signature = JSON.stringify(inventory)
    if (signature !== this.lastInventorySignature) {
      this.lastInventorySignature = signature
      this.equipmentEl.innerHTML = `
        <span class="mota-hud__section-label">当前装备 <i>LOADOUT</i></span>
        <div class="mota-hud__equipment-list">
          ${
            inventory.equipment.length
              ? inventory.equipment
                  .map(
                    (item) => `
                      <div class="mota-hud__equipment-card">
                        <span>${escapeHtml(item.slot)}</span>
                        <div><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.description)}</small></div>
                      </div>
                    `
                  )
                  .join('')
              : '<span class="mota-hud__empty">尚未装备</span>'
          }
        </div>
      `
      this.itemsEl.innerHTML = `
        <span class="mota-hud__section-label">勇者行囊 <i>INVENTORY</i></span>
        <div class="mota-hud__item-list">
          ${
            inventory.items.length
              ? inventory.items
                  .map(
                    (item) => `
                      <${item.usable ? 'button type="button"' : 'div'}
                        class="mota-hud__item mota-hud__item--${item.availability}"
                        ${item.usable ? `data-item-id="${escapeHtml(item.id)}"` : ''}
                      >
                        <span class="mota-hud__item-heading">
                          <b>${escapeHtml(item.name)}</b>
                          <em>${escapeHtml(item.category)}${item.count > 1 ? ` · ×${item.count}` : ''}</em>
                        </span>
                        <small>${escapeHtml(item.description)}</small>
                        <span class="mota-hud__item-action">${
                          item.availability === 'usable'
                            ? '使用'
                            : item.availability === 'passive'
                              ? '被动生效'
                              : '暂未接入'
                        }</span>
                      </${item.usable ? 'button' : 'div'}>
                    `
                  )
                  .join('')
              : '<span class="mota-hud__empty">行囊还是空的</span>'
          }
        </div>
      `
    }
  }

  destroy() {
    this.inventoryToggle.removeEventListener('click', this.handleToggle)
    this.itemsEl.removeEventListener('click', this.handleItemClick)
    this.container.remove()
  }
}
