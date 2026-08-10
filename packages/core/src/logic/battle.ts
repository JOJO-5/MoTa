import { dispatch, State } from '../state/store.js'
import type { Enemy } from '@modern-mota/data'
import type { HeroSnapshot } from '../types.js'
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
  /** Total HP the hero would lose; null means the battle cannot progress. */
  damage: number | null
}

/** Calculate a battle without mutating game state. */
export function previewBattle(enemy: Enemy, hero: HeroSnapshot = State.hero): BattleResult {
  const legacy = enemy as Enemy & {
    vampire?: number
    add?: boolean
    breakArmor?: number
    counterAttack?: number
    purify?: number
    damage?: number
  }

  if (hasSpecial(enemy, 20) && !hero.items.includes('cross')) {
    return {
      outcome: 'stalemate',
      enemyHp: enemy.hp,
      heroHp: hero.hp,
      turns: 0,
      damage: null,
    }
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
      return {
        outcome: 'stalemate' as const,
        enemyHp,
        heroHp: hero.hp,
        turns: 1,
        damage: null,
      }
    }
    const turns = Math.ceil(hero.hp / enemyDamage)
    return { outcome: 'defeat', enemyHp, heroHp: 0, turns, damage: turns * enemyDamage }
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

  return {
    outcome,
    enemyHp: currentEnemyHp,
    heroHp: currentHeroHp,
    turns,
    damage: Math.floor(totalDamage),
  }
}

/** Apply a battle result. Callers may preview first when defeat must be blocked. */
export function startBattle(enemy: Enemy): BattleResult {
  const heroBefore = State.hero
  const result = previewBattle(enemy)

  if (result.outcome !== 'stalemate') {
    dispatch({ type: 'SET_HERO', hero: { hp: result.heroHp } })
  }
  dispatch({
    type: 'SET_BATTLE',
    battle: {
      enemyId: enemy.id,
      enemyHp: result.enemyHp,
      enemyHpMax: enemy.hp,
      enemyName: enemy.name,
      enemyAtk: enemy.atk,
      enemyDef: enemy.def,
      heroHpBefore: heroBefore.hp,
      heroHpAfter: result.heroHp,
      heroAtk: heroBefore.atk,
      heroDef: heroBefore.def,
      damage: result.damage,
      outcome: result.outcome,
      turns: result.turns,
    },
  })
  return result
}

export function endBattle(): void {
  dispatch({ type: 'SET_BATTLE', battle: null })
}
