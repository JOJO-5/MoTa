import type { Enemy } from '@modern-mota/data'
import { getEnemyPortraitStyle } from './modern-assets.js'

export interface EnemyGuideEntry {
  id: string
  name: string
  hp: number
  atk: number
  def: number
  money: number
  exp: number
  damage: number | null
  outcome: 'victory' | 'defeat' | 'stalemate'
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function battleForecast(entry: EnemyGuideEntry): string {
  if (entry.outcome === 'victory') return `预计损伤 ${entry.damage ?? 0}`
  if (entry.outcome === 'stalemate') return '当前无法破防'
  return '当前不可战胜'
}

export class EnemyGuide {
  private container: HTMLElement | null = null

  constructor(private readonly host: HTMLElement = document.body) {}

  show(enemy: Enemy) {
    this.showFloor([
      {
        id: enemy.id,
        name: enemy.name,
        hp: enemy.hp,
        atk: enemy.atk,
        def: enemy.def,
        money: enemy.money,
        exp: enemy.exp,
        damage: null,
        outcome: 'stalemate',
      },
    ])
  }

  showFloor(enemies: EnemyGuideEntry[]) {
    this.hide()
    this.container = document.createElement('div')
    this.container.className = 'mota-enemy-guide'
    this.container.setAttribute('role', 'dialog')
    this.container.setAttribute('aria-modal', 'true')
    this.container.setAttribute('aria-label', '心镜怪物档案')
    this.container.innerHTML = `
      <div class="mota-enemy-guide__card">
        <header class="mota-enemy-guide__header">
          <div><span>MIRROR ARCHIVE</span><h2>本层怪物</h2></div>
          <button class="mota-enemy-guide__close" type="button" aria-label="关闭怪物档案">×</button>
        </header>
        <p class="mota-enemy-guide__hint">心镜已记录当前楼层可见魔物与交战预估</p>
        <div class="mota-enemy-guide__list">
          ${
            enemies.length
              ? enemies
                  .map(
                    (enemy) => `
                      <article class="mota-enemy-guide__enemy ${enemy.outcome === 'victory' ? '' : 'is-danger'}">
                        <div class="mota-enemy-guide__portrait-frame">
                          <div
                            class="mota-enemy-guide__portrait"
                            role="img"
                            aria-label="${escapeHtml(enemy.name)}"
                            style='${getEnemyPortraitStyle(enemy.id, 88)}'
                          ></div>
                        </div>
                        <div class="mota-enemy-guide__enemy-title">
                          <strong>${escapeHtml(enemy.name)}</strong>
                          <span>${battleForecast(enemy)}</span>
                        </div>
                        <dl>
                          <div><dt>生命</dt><dd>${enemy.hp}</dd></div>
                          <div><dt>攻击</dt><dd>${enemy.atk}</dd></div>
                          <div><dt>防御</dt><dd>${enemy.def}</dd></div>
                          <div><dt>奖励</dt><dd>💰${enemy.money} · EXP ${enemy.exp}</dd></div>
                        </dl>
                      </article>
                    `
                  )
                  .join('')
              : '<p class="mota-enemy-guide__empty">本层暂未发现怪物</p>'
          }
        </div>
      </div>
    `
    this.container
      .querySelector('.mota-enemy-guide__close')
      ?.addEventListener('click', () => this.hide())
    this.container.addEventListener('click', (event) => {
      if (event.target === this.container) this.hide()
    })
    this.host.appendChild(this.container)
  }

  isVisible(): boolean {
    return this.container !== null
  }

  hide() {
    this.container?.remove()
    this.container = null
  }
}
