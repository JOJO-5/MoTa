import { dispatch, State } from '../state/store.js'
import type { Enemy } from '@modern-mota/data'
import { calcHeroDamage, calcEnemyDamage } from './battle-utils.js'

export function calculateDamage(attackerAtk: number, defenderDef: number): number {
  return Math.max(0, attackerAtk - defenderDef)
}

export function startBattle(enemy: Enemy): void {
  const { hero } = State

  let currentHeroHp = hero.hp
  let currentEnemyHp = enemy.hp
  let turns = 0

  while (currentHeroHp > 0 && currentEnemyHp > 0) {
    turns++
    const heroDamage = calcHeroDamage(hero, enemy)
    currentEnemyHp -= heroDamage
    if (currentEnemyHp <= 0) break

    const enemyDamage = calcEnemyDamage(hero, enemy)
    currentHeroHp -= enemyDamage
  }

  dispatch({ type: 'SET_HERO', hero: { hp: currentHeroHp } })
  dispatch({ type: 'SET_BATTLE', battle: { enemyId: enemy.id, enemyHp: currentEnemyHp, turns } })
}

export function endBattle(): void {
  dispatch({ type: 'SET_BATTLE', battle: null })
}
