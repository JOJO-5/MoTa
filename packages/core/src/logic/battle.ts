import { dispatch, State } from '../state/store.js'
import type { Enemy } from '@modern-mota/data'

export function calculateDamage(attackerAtk: number, defenderDef: number): number {
  return Math.max(0, attackerAtk - defenderDef)
}

export function startBattle(enemy: Enemy): void {
  const { hero } = State
  const heroDamagePerTurn = calculateDamage(hero.atk, enemy.def)
  const enemyDamagePerTurn = calculateDamage(enemy.atk, hero.def)

  let currentHeroHp = hero.hp
  let currentEnemyHp = enemy.hp
  let turns = 0

  while (currentHeroHp > 0 && currentEnemyHp > 0) {
    turns++
    currentEnemyHp -= heroDamagePerTurn
    currentHeroHp -= enemyDamagePerTurn
  }

  dispatch({ type: 'SET_HERO', hero: { hp: currentHeroHp } })
  dispatch({ type: 'SET_BATTLE', battle: { enemyId: enemy.id, enemyHp: currentEnemyHp, turns } })
}

export function endBattle(): void {
  dispatch({ type: 'SET_BATTLE', battle: null })
}
