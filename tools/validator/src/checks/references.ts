import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface ReferencesResult {
  passed: boolean
  errors: string[]
  warnings: string[]
}

export function validateReferences(dir: string): ReferencesResult {
  const errors: string[] = []
  const warnings: string[] = []

  const main = JSON.parse(readFileSync(join(dir, 'data.json'), 'utf-8'))
  const floorIds = main.floorIds as string[]
  const allFloorIds = new Set(floorIds)

  const floorsDir = join(dir, 'floors')
  const floorFiles: string[] = []
  try {
    const { readdirSync } = require('node:fs')
    for (const f of readdirSync(floorsDir).filter((f: string) => f.endsWith('.json'))) {
      floorFiles.push(f.replace('.json', ''))
      allFloorIds.add(f.replace('.json', ''))
    }
  } catch {}

  const usedEnemyIds = new Set<string>()
  const usedItemIds = new Set<string>()
  const usedMapBlockIds = new Set<number>()

  for (const floorId of floorFiles) {
    const floor = JSON.parse(readFileSync(join(floorsDir, `${floorId}.json`), 'utf-8'))
    for (const row of floor.map ?? []) {
      for (const cell of row) {
        if (typeof cell === 'number') usedMapBlockIds.add(cell)
      }
    }

    for (const eventList of Object.values(floor.events ?? {}) as unknown[][]) {
      for (const event of eventList) {
        if ((event as any).type === 'battle') usedEnemyIds.add((event as any).id)
        if ((event as any).type === 'getItem') usedItemIds.add((event as any).id)
      }
    }
  }

  const definedEnemyIds = new Set(Object.keys(JSON.parse(readFileSync(join(dir, 'enemys.json'), 'utf-8'))))
  for (const id of usedEnemyIds) {
    if (!definedEnemyIds.has(id)) {
      errors.push(`enemy "${id}" referenced but not defined`)
    }
  }

  const definedItemIds = new Set(Object.keys(JSON.parse(readFileSync(join(dir, 'items.json'), 'utf-8'))))
  for (const id of usedItemIds) {
    if (!definedItemIds.has(id)) {
      errors.push(`item "${id}" referenced but not defined`)
    }
  }

  const definedMapIds = new Set(Object.keys(JSON.parse(readFileSync(join(dir, 'maps.json'), 'utf-8'))).map(Number))
  for (const id of usedMapBlockIds) {
    if (!definedMapIds.has(id)) {
      warnings.push(`map block ${id} used but not defined in maps.json`)
    }
  }

  return { passed: errors.length === 0, errors, warnings }
}
