import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { z } from 'zod'
import {
  MainSchema,
  EnemySchema,
  MapBlockSchema,
  ItemSchema,
  FloorSchema,
} from './schema/index.js'

export interface TowerContent {
  main: z.infer<typeof MainSchema>
  enemys: Record<string, z.infer<typeof EnemySchema>>
  maps: Record<string, z.infer<typeof MapBlockSchema>>
  items: Record<string, z.infer<typeof ItemSchema>>
  floors: Record<string, z.infer<typeof FloorSchema>>
  events: Record<string, unknown[]>
}

export interface LoadOptions {
  validate?: boolean
  freeze?: boolean
}

async function readJson(path: string): Promise<unknown> {
  const content = await readFile(path, 'utf-8')
  return JSON.parse(content)
}

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) {
    obj.forEach(item => deepFreeze(item))
  } else {
    Object.values(obj as Record<string, unknown>).forEach(value => deepFreeze(value as unknown))
    Object.freeze(obj)
  }
  return obj
}

export async function loadTowerContent(
  root: string,
  options: LoadOptions = {}
): Promise<TowerContent> {
  const { validate = true, freeze = true } = options

  const [mainRaw, enemysRaw, mapsRaw, itemsRaw, eventsRaw] = await Promise.all([
    readJson(join(root, 'data.json')),
    readJson(join(root, 'enemys.json')),
    readJson(join(root, 'maps.json')),
    readJson(join(root, 'items.json')),
    readJson(join(root, 'events.json')).catch(() => ({})),
  ])

  const main = validate
    ? MainSchema.parse(mainRaw)
    : mainRaw as unknown as z.infer<typeof MainSchema>

  const floorIds = main.floorIds
  const floorResults = await Promise.all(
    floorIds.map(async (floorId) => {
      const floorRaw = await readJson(join(root, 'floors', `${floorId}.json`))
      const floor = validate
        ? FloorSchema.parse(floorRaw)
        : floorRaw as z.infer<typeof FloorSchema>
      return [floorId, floor] as const
    })
  )

  const floors: Record<string, z.infer<typeof FloorSchema>> = {}
  for (const [floorId, floor] of floorResults) {
    floors[floorId] = freeze ? deepFreeze(floor) : floor
  }

  let result: TowerContent = {
    main: freeze ? deepFreeze(validate ? main : mainRaw as z.infer<typeof MainSchema>) : main,
    enemys: freeze ? deepFreeze(enemysRaw as Record<string, z.infer<typeof EnemySchema>>) : enemysRaw as Record<string, z.infer<typeof EnemySchema>>,
    maps: freeze ? deepFreeze(mapsRaw as Record<string, z.infer<typeof MapBlockSchema>>) : mapsRaw as Record<string, z.infer<typeof MapBlockSchema>>,
    items: freeze ? deepFreeze(itemsRaw as Record<string, z.infer<typeof ItemSchema>>) : itemsRaw as Record<string, z.infer<typeof ItemSchema>>,
    events: freeze ? deepFreeze(eventsRaw as Record<string, unknown[]>) : eventsRaw as Record<string, unknown[]>,
    floors,
  }

  if (freeze) deepFreeze(result)

  return result
}
