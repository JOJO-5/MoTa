
import type { HeroSnapshot } from '../types.js'
import type { Enemy } from '@modern-mota/data'

export function hasSpecial(enemy: Enemy, specialName: string): boolean {
  return enemy.special?.includes(specialName) ?? false
}

export function calcHeroDamage(hero: HeroSnapshot, enemy: Enemy): number {
  let damage = Math.max(0, hero.atk - enemy.def)

  if (hasSpecial(enemy, 'magical')) {
    damage += Math.max(0, hero.atk - enemy.def) // Magical enemies take full damage from ATK too
  }
  // Add more special calculations here later

  return damage
}

export function calcEnemyDamage(hero: HeroSnapshot, enemy: Enemy): number {
  let damage = Math.max(0, enemy.atk - hero.def)

  if (hasSpecial(enemy, 'magical')) {
    // Magical enemies ignore hero DEF, deal full ATK damage
    damage = enemy.atk
  }
  if (hasSpecial(enemy, 'shield')) {
    damage = Math.max(0, damage - Math.floor(hero.atk / 2)) // Shielded enemies deal less damage if hero has ATK
  }
  // Add more special calculations here later

  return damage
}
