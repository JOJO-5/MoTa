import type { HeroSnapshot } from '../types.js'
import type { Enemy } from '@modern-mota/data'

type LegacyEnemy = Enemy & {
  n?: number
  value?: number
}

const SPECIAL_ALIASES: Record<string, number> = {
  firstStrike: 1,
  magical: 2,
  solid: 3,
  doubleHit: 4,
  tripleHit: 5,
  multiHit: 6,
  shield: 3,
}

export function hasSpecial(enemy: Enemy, specialName: number | string): boolean {
  const raw = enemy.special as unknown
  const specials = Array.isArray(raw) ? raw : raw == null || raw === 0 ? [] : [raw]
  const expected =
    typeof specialName === 'string' ? (SPECIAL_ALIASES[specialName] ?? specialName) : specialName
  return specials.includes(specialName) || specials.includes(expected)
}

export function resolveEnemyStats(hero: HeroSnapshot, enemy: Enemy): LegacyEnemy {
  const resolved = { ...(enemy as LegacyEnemy) }
  if (hasSpecial(enemy, 10)) {
    resolved.atk = Math.floor(hero.atk * 1.3)
    resolved.def = Math.floor(hero.def * 0.6)
  }
  if (hasSpecial(enemy, 3)) resolved.def = Math.max(resolved.def, hero.atk - 1)
  if (hasSpecial(enemy, 28)) resolved.atk = Math.max(resolved.atk, hero.atk)
  return resolved
}

export function calcHeroDamage(hero: HeroSnapshot, enemy: Enemy): number {
  const resolved = resolveEnemyStats(hero, enemy)
  const damage = Math.max(0, hero.atk - resolved.def)
  const raw = Array.isArray(enemy.special) ? enemy.special : [enemy.special]
  return raw.includes('magical' as never) ? damage * 2 : damage
}

export function calcEnemyDamage(hero: HeroSnapshot, enemy: Enemy): number {
  const resolved = resolveEnemyStats(hero, enemy)
  const raw = Array.isArray(enemy.special) ? enemy.special : [enemy.special]
  let damage =
    hasSpecial(enemy, 2) || raw.includes('magical' as never)
      ? resolved.atk
      : Math.max(0, resolved.atk - hero.def)

  if (hasSpecial(enemy, 30)) damage += Number(resolved.value) || 0
  if (hasSpecial(enemy, 4)) damage *= 2
  if (hasSpecial(enemy, 5)) damage *= 3
  if (hasSpecial(enemy, 6)) damage *= Number(resolved.n) || 4
  if (raw.includes('shield' as never)) {
    damage = Math.max(0, damage - Math.floor(hero.atk / 2))
  }

  return damage
}
