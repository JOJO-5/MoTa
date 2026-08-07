import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface BalanceResult {
  passed: boolean
  errors: string[]
  warnings: string[]
}

export function validateBalance(dir: string): BalanceResult {
  const errors: string[] = []
  const warnings: string[] = []

  const enemys = JSON.parse(readFileSync(join(dir, 'enemys.json'), 'utf-8'))

  for (const [id, enemy] of Object.entries(enemys as Record<string, any>)) {
    if (enemy.atk > 9999) warnings.push(`enemy ${id}: atk ${enemy.atk} > 9999`)
    if (enemy.def > 9999) warnings.push(`enemy ${id}: def ${enemy.def} > 9999`)
    if (enemy.hp > 999999) warnings.push(`enemy ${id}: hp ${enemy.hp} > 999999`)
    if (enemy.money < 0) errors.push(`enemy ${id}: money ${enemy.money} is negative`)
    if (enemy.exp < 0) errors.push(`enemy ${id}: exp ${enemy.exp} is negative`)
    if (enemy.atk < 0) errors.push(`enemy ${id}: atk ${enemy.atk} is negative`)
    if (enemy.def < 0) errors.push(`enemy ${id}: def ${enemy.def} is negative`)
  }

  return { passed: errors.length === 0, errors, warnings }
}
