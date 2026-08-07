import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  MainSchema,
  EnemySchema,
  MapBlockSchema,
  ItemSchema,
  FloorSchema,
} from '@modern-mota/data/schema/index.js'

export interface SchemaResult {
  passed: boolean
  errors: string[]
}

export function validateSchema(dir: string): SchemaResult {
  const errors: string[] = []

  try {
    const mainRaw = JSON.parse(readFileSync(join(dir, 'data.json'), 'utf-8'))
    MainSchema.parse(mainRaw)
  } catch (e) {
    errors.push(`data.json: ${(e as Error).message}`)
  }

  try {
    const enemysRaw = JSON.parse(readFileSync(join(dir, 'enemys.json'), 'utf-8'))
    for (const [id, enemy] of Object.entries(enemysRaw as Record<string, unknown>)) {
      try {
        EnemySchema.parse(enemy)
      } catch (e) {
        errors.push(`enemys.${id}: ${(e as Error).message}`)
      }
    }
  } catch {}

  try {
    const mapsRaw = JSON.parse(readFileSync(join(dir, 'maps.json'), 'utf-8'))
    for (const [id, map] of Object.entries(mapsRaw as Record<string, unknown>)) {
      try {
        MapBlockSchema.parse(map)
      } catch (e) {
        errors.push(`maps.${id}: ${(e as Error).message}`)
      }
    }
  } catch {}

  try {
    const itemsRaw = JSON.parse(readFileSync(join(dir, 'items.json'), 'utf-8'))
    for (const [id, item] of Object.entries(itemsRaw as Record<string, unknown>)) {
      try {
        ItemSchema.parse(item)
      } catch (e) {
        errors.push(`items.${id}: ${(e as Error).message}`)
      }
    }
  } catch {}

  const floorsDir = join(dir, 'floors')
  if (existsSync(floorsDir)) {
    const floorFiles = readdirSync(floorsDir).filter(f => f.endsWith('.json'))
    for (const file of floorFiles) {
      const floorId = file.replace('.json', '')
      try {
        const floorRaw = JSON.parse(readFileSync(join(floorsDir, file), 'utf-8'))
        FloorSchema.parse(floorRaw)
      } catch (e) {
        errors.push(`floors/${floorId}: ${(e as Error).message}`)
      }
    }
  }

  return { passed: errors.length === 0, errors }
}

function existsSync(path: string): boolean {
  try {
    require('node:fs').accessSync(path)
    return true
  } catch {
    return false
  }
}
