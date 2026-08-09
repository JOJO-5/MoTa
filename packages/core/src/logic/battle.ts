import { dispatch, State } from '../state/store.js'
import type { Enemy } from '@modern-mota/data'
import { calcHeroDamage, calcEnemyDamage, hasSpecial, resolveEnemyStats } from './battle-utils.js'

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
  const legacy = enemy as Enemy & {
    vampire?: number
    add?: boolean
    breakArmor?: number
    counterAttack?: number
    purify?: number
    damage?: number
  }

  if (hasSpecial(enemy, 20) && !hero.items.includes('cross')) {
    const result = { outcome: 'stalemate' as const, enemyHp: enemy.hp, heroHp: hero.hp, turns: 0 }
    dispatch({ type: 'SET_BATTLE', battle: { enemyId: enemy.id, enemyHp: enemy.hp, turns: 0 } })
    return result
  }

  const resolved = resolveEnemyStats(hero, enemy)
  let enemyHp = resolved.hp
  let initialDamage = 0
  if (hasSpecial(enemy, 11)) {
    const vampireDamage = Math.floor(hero.hp * (Number(legacy.vampire) || 0))
    initialDamage += vampireDamage
    if (legacy.add) enemyHp += vampireDamage
  }

  const heroDamage = calcHeroDamage(hero, { ...enemy, hp: enemyHp } as Enemy)
  const enemyDamage = calcEnemyDamage(hero, enemy)
  if (heroDamage <= 0) {
    if (enemyDamage <= 0) {
      const result = {
        outcome: 'stalemate' as const,
        enemyHp,
        heroHp: hero.hp,
        turns: 1,
      }
      dispatch({ type: 'SET_BATTLE', battle: { enemyId: enemy.id, enemyHp, turns: 1 } })
      return result
    }
    const turns = Math.ceil(hero.hp / enemyDamage)
    dispatch({ type: 'SET_HERO', hero: { hp: 0 } })
    dispatch({ type: 'SET_BATTLE', battle: { enemyId: enemy.id, enemyHp, turns } })
    return { outcome: 'defeat', enemyHp, heroHp: 0, turns }
  }

  const turns = Math.ceil(enemyHp / heroDamage)
  if (hasSpecial(enemy, 1)) initialDamage += enemyDamage
  if (hasSpecial(enemy, 7)) {
    initialDamage += Math.floor((Number(legacy.breakArmor) || 0.9) * hero.def)
  }
  if (hasSpecial(enemy, 9)) {
    initialDamage += Math.floor((Number(legacy.purify) || 5) * hero.mdef)
  }
  const counterDamage = hasSpecial(enemy, 8)
    ? Math.floor((Number(legacy.counterAttack) || 0.1) * hero.atk)
    : 0

  let totalDamage = initialDamage + (turns - 1) * enemyDamage + turns * counterDamage
  totalDamage = Math.max(0, totalDamage - hero.mdef)
  if (hasSpecial(enemy, 22)) totalDamage += Number(legacy.damage) || 0
  if (hasSpecial(enemy, 31) && hero.def < resolved.atk) totalDamage *= 3

  const currentHeroHp = Math.max(0, hero.hp - Math.floor(totalDamage))
  const outcome: BattleOutcome = currentHeroHp > 0 ? 'victory' : 'defeat'
  const currentEnemyHp = outcome === 'victory' ? 0 : enemyHp

  dispatch({ type: 'SET_HERO', hero: { hp: currentHeroHp } })
  dispatch({
    type: 'SET_BATTLE',
    battle: { enemyId: enemy.id, enemyHp: currentEnemyHp, turns },
  })

  return { outcome, enemyHp: currentEnemyHp, heroHp: currentHeroHp, turns }
}

export function endBattle(): void {
  dispatch({ type: 'SET_BATTLE', battle: null })
}
