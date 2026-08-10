import type { RuntimeTileValue, Position } from '../types.js'

export interface HazardMapEntry {
  cls?: string
  id?: string
  canPass?: boolean
}

export interface HazardEnemy {
  id?: string
  special?: number | string | Array<number | string>
  zone?: number
  zoneSquare?: boolean
  range?: number | [number, number]
  repulse?: number
}

export interface StepRepulse {
  enemyId: string
  from: Position
  to: Position
  map: RuntimeTileValue
}

export interface StepHazardResult {
  damage: number
  types: string[]
  repulses: StepRepulse[]
}

function hasSpecial(enemy: HazardEnemy, expected: number): boolean {
  const raw = enemy.special
  const specials = Array.isArray(raw) ? raw : raw == null || raw === 0 ? [] : [raw]
  return specials.includes(expected) || specials.includes(String(expected))
}

function inRange(from: Position, target: Position, range: number, square: boolean): boolean {
  const dx = Math.abs(from.x - target.x)
  const dy = Math.abs(from.y - target.y)
  if (dx === 0 && dy === 0) return false
  return square ? Math.max(dx, dy) <= range : dx + dy <= range
}

function isEnemyEntry(entry: HazardMapEntry | undefined): boolean {
  return entry?.cls === 'enemys' || entry?.cls === 'enemy48'
}

function isEmptyTile(value: number | undefined, maps: Record<string, HazardMapEntry>): boolean {
  if (value === undefined || value === 0) return true
  const entry = maps[String(value)]
  return entry?.canPass === true
}

export function resolveStepHazards(
  position: Position,
  map: number[][],
  maps: Record<string, HazardMapEntry> | undefined,
  enemies: Record<string, HazardEnemy> | undefined,
  heroHp: number,
  flags: Record<string, unknown> | undefined
): StepHazardResult {
  const mapEntries = maps ?? {}
  const enemyData = enemies ?? {}
  const result: StepHazardResult = { damage: 0, types: [], repulses: [] }
  const activeEnemies: Array<{ x: number; y: number; id: string; enemy: HazardEnemy }> = []

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < (map[y]?.length ?? 0); x++) {
      const entry = mapEntries[String(map[y][x])]
      if (!isEnemyEntry(entry) || !entry?.id || !enemyData[entry.id]) continue
      activeEnemies.push({ x, y, id: entry.id, enemy: enemyData[entry.id] })
    }
  }

  if (flags?.no_zone !== true) {
    for (const active of activeEnemies) {
      if (!hasSpecial(active.enemy, 15)) continue
      const range = Math.max(1, Number(active.enemy.range) || 1)
      if (inRange(active, position, range, active.enemy.zoneSquare === true)) {
        result.damage += Math.max(0, Number(active.enemy.zone) || 0)
        if (Number(active.enemy.zone) > 0 && !result.types.includes('领域伤害'))
          result.types.push('领域伤害')
      }
    }
  }

  if (flags?.no_repulse !== true) {
    for (const active of activeEnemies) {
      if (!hasSpecial(active.enemy, 18)) continue
      const range = Math.max(1, Number(active.enemy.range) || 1)
      if (!inRange(active, position, range, active.enemy.zoneSquare === true)) continue
      result.damage += Math.max(0, Number(active.enemy.repulse) || 0)
      if (Number(active.enemy.repulse) > 0 && !result.types.includes('阻击伤害'))
        result.types.push('阻击伤害')

      const dx = Math.sign(position.x - active.x)
      const dy = Math.sign(position.y - active.y)
      const target = { x: active.x - dx, y: active.y - dy }
      const targetValue = map[target.y]?.[target.x]
      if (
        target.x >= 0 &&
        target.y >= 0 &&
        target.y < map.length &&
        target.x < (map[target.y]?.length ?? 0) &&
        isEmptyTile(targetValue, mapEntries)
      ) {
        result.repulses.push({
          enemyId: active.id,
          from: { x: active.x, y: active.y },
          to: target,
          map: active.id,
        })
      }
    }
  }

  if (flags?.no_betweenAttack !== true) {
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < (map[y]?.length ?? 0); x++) {
        if (x !== position.x || y !== position.y) continue
        const left = mapEntries[String(map[y]?.[x - 1])]
        const right = mapEntries[String(map[y]?.[x + 1])]
        const top = mapEntries[String(map[y - 1]?.[x])]
        const bottom = mapEntries[String(map[y + 1]?.[x])]
        const leftId = left?.id
        const rightId = right?.id
        const topId = top?.id
        const bottomId = bottom?.id
        if (
          leftId &&
          leftId === rightId &&
          isEnemyEntry(left) &&
          hasSpecial(enemyData[leftId] ?? {}, 16)
        ) {
          const value = Math.floor(Math.max(0, heroHp - result.damage) / 2)
          if (value > 0) result.damage += value
          if (value > 0 && !result.types.includes('夹击伤害')) result.types.push('夹击伤害')
        }
        if (
          topId &&
          topId === bottomId &&
          isEnemyEntry(top) &&
          hasSpecial(enemyData[topId] ?? {}, 16)
        ) {
          const value = Math.floor(Math.max(0, heroHp - result.damage) / 2)
          if (value > 0) result.damage += value
          if (value > 0 && !result.types.includes('夹击伤害')) result.types.push('夹击伤害')
        }
      }
    }
  }

  return result
}
