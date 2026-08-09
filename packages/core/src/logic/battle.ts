import { dispatch, State } from '../state/store.js'
import type { Enemy } from '@modern-mota/data'
import { calcHeroDamage, calcEnemyDamage } from './battle-utils.js'

export function calculateDamage(attackerAtk: number, defenderDef: number): number {
  return Math.max(0, attackerAtk - defenderDef)
}

export type BattleOutcome = 'victory' | 'defeat' | 'stalemate'

export interface BattleResult {
  outcome: BattleOutcome
  enemyHp: number
  heroHp: number
  turns: number
}

export function startBattle(enemy: Enemy): BattleResult {
  const { hero } = State

  let currentHeroHp = hero.hp
  let currentEnemyHp = enemy.hp
  let turns = 0
  let outcome: BattleOutcome = 'stalemate'

  while (currentHeroHp > 0 && currentEnemyHp > 0) {
    turns++
    const heroDamage = calcHeroDamage(hero, enemy)
    currentEnemyHp -= heroDamage
    if (currentEnemyHp <= 0) {
      outcome = 'victory'
      break
    }

    const enemyDamage = calcEnemyDamage(hero, enemy)
    currentHeroHp -= enemyDamage
    if (currentHeroHp <= 0) {
      outcome = 'defeat'
      break
    }

    // Legacy content contains enemies whose effective damage is zero on both
    // sides. Resolve this as a stalemate instead of spinning forever.
    if (heroDamage === 0 && enemyDamage === 0) break
  }

  dispatch({ type: 'SET_HERO', hero: { hp: currentHeroHp } })
  dispatch({ type: 'SET_BATTLE', battle: { enemyId: enemy.id, enemyHp: currentEnemyHp, turns } })

  return { outcome, enemyHp: currentEnemyHp, heroHp: currentHeroHp, turns }
}

export function endBattle(): void {
  dispatch({ type: 'SET_BATTLE', battle: null })
}
