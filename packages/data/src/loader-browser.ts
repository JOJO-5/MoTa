import { z } from 'zod'
import {
  MainSchema,
  EnemySchema,
  MapBlockSchema,
  ItemSchema,
  FloorSchema,
} from './schema/index.js'
import type { TowerContent, LoadOptions } from './types.js'
export type { TowerContent, LoadOptions }

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

async function fetchJson(url: string): Promise<unknown> {
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`Failed to fetch ${url}: ${resp.status}`)
  return resp.json()
}

export async function loadTowerContent(
  baseUrl: string,
  options: LoadOptions = {}
): Promise<TowerContent> {
  const { validate = true, freeze = true } = options

  const [mainRaw, enemysRaw, mapsRaw, itemsRaw, eventsRaw] = await Promise.all([
    fetchJson(`${baseUrl}/data.json`),
    fetchJson(`${baseUrl}/enemys.json`),
    fetchJson(`${baseUrl}/maps.json`),
    fetchJson(`${baseUrl}/items.json`),
    fetchJson(`${baseUrl}/events.json`).catch(() => ({})),
  ])

  const main = validate
    ? MainSchema.parse(mainRaw)
    : mainRaw as unknown as z.infer<typeof MainSchema>

  const floorIds = main.floorIds
  const floorResults = await Promise.all(
    floorIds.map(async (floorId) => {
      const floorRaw = await fetchJson(`${baseUrl}/floors/${floorId}.json`)
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

  const result: TowerContent = {
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
