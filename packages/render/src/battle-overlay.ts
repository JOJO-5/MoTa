import { endBattle, type BattleSnapshot, type HeroSnapshot } from '@modern-mota/core'
import type { Enemy } from '@modern-mota/data'
import { getEnemyPortraitStyle } from './modern-assets.js'

export const BATTLE_PRESENTATION_MS = 1350

export class BattleOverlay {
  private container: HTMLElement
  private activeBattle: BattleSnapshot | null = null
  private timer: ReturnType<typeof setTimeout> | null = null

  constructor(host: HTMLElement) {
    this.container = document.createElement('div')
    this.container.className = 'mota-battle'
    this.container.setAttribute('role', 'status')
    this.container.setAttribute('aria-live', 'assertive')
    this.container.style.display = 'none'
    host.appendChild(this.container)
  }

  update(battle: BattleSnapshot | null, hero: HeroSnapshot, enemy?: Enemy) {
    if (!battle) {
      this.hide()
      return
    }
    if (battle === this.activeBattle) return
    this.activeBattle = battle
    if (this.timer) clearTimeout(this.timer)

    const enemyName = battle.enemyName ?? enemy?.name ?? battle.enemyId
    const enemyHpMax = battle.enemyHpMax ?? enemy?.hp ?? Math.max(1, battle.enemyHp)
    const heroHpBefore = battle.heroHpBefore ?? hero.hp
    const heroHpAfter = battle.heroHpAfter ?? hero.hp
    const heroPct = Math.max(0, Math.min(100, (heroHpAfter / Math.max(1, hero.hpMax)) * 100))
    const enemyPct = Math.max(0, Math.min(100, (battle.enemyHp / Math.max(1, enemyHpMax)) * 100))
    const outcome = battle.outcome ?? (battle.enemyHp <= 0 ? 'victory' : 'defeat')
    const resultText =
      outcome === 'victory' ? '战斗胜利' : outcome === 'stalemate' ? '无法破防' : '挑战失败'
    const damage = battle.damage ?? Math.max(0, heroHpBefore - heroHpAfter)

    this.container.dataset.outcome = outcome
    this.container.innerHTML = `
      <div class="mota-battle__veil"></div>
      <div class="mota-battle__card">
        <div class="mota-battle__kicker">COMBAT RECORD · ${battle.turns} TURN${battle.turns === 1 ? '' : 'S'}</div>
        <div class="mota-battle__duel">
          <section class="mota-battle__fighter mota-battle__fighter--enemy">
            <div class="mota-battle__portrait-frame">
              <div class="mota-battle__enemy-portrait" style='${getEnemyPortraitStyle(battle.enemyId)}'></div>
            </div>
            <span class="mota-battle__role">怪物</span>
            <strong>${enemyName}</strong>
            <div class="mota-battle__statline"><span>攻 ${battle.enemyAtk ?? enemy?.atk ?? 0}</span><span>防 ${battle.enemyDef ?? enemy?.def ?? 0}</span></div>
            <div class="mota-battle__life"><i style="width:${enemyPct}%"></i></div>
            <small>${Math.max(0, battle.enemyHp)} / ${enemyHpMax}</small>
          </section>
          <div class="mota-battle__impact" aria-hidden="true"><span>VS</span><b>−${damage}</b></div>
          <section class="mota-battle__fighter mota-battle__fighter--hero">
            <div class="mota-battle__portrait-frame">
              <div class="mota-battle__hero-portrait"></div>
            </div>
            <span class="mota-battle__role">勇者</span>
            <strong>菲利安</strong>
            <div class="mota-battle__statline"><span>攻 ${battle.heroAtk ?? hero.atk}</span><span>防 ${battle.heroDef ?? hero.def}</span></div>
            <div class="mota-battle__life"><i style="width:${heroPct}%"></i></div>
            <small>${heroHpAfter} / ${hero.hpMax}</small>
          </section>
        </div>
        <div class="mota-battle__result">${resultText}</div>
      </div>
    `
    this.container.style.display = 'flex'
    this.container.classList.remove('is-active')
    void this.container.offsetWidth
    this.container.classList.add('is-active')

    this.timer = setTimeout(() => {
      this.timer = null
      endBattle()
    }, BATTLE_PRESENTATION_MS)
  }

  private hide() {
    this.activeBattle = null
    this.container.classList.remove('is-active')
    this.container.style.display = 'none'
  }

  destroy() {
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
    this.container.remove()
  }
}
