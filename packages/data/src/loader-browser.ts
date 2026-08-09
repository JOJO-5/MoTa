import { z } from 'zod'
import { MainSchema, EnemySchema, MapBlockSchema, ItemSchema } from './schema/index.js'
import type { TowerContent, LoadOptions } from './types.js'
export type { TowerContent, LoadOptions }

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) {
    obj.forEach((item) => deepFreeze(item))
  } else {
    Object.values(obj as Record<string, unknown>).forEach((value) =>
      deepFreeze(value as unknown as T)
    )
    Object.freeze(obj)
  }
  return obj
}

async function fetchJson(url: string): Promise<unknown> {
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`Failed to fetch ${url}: ${resp.status}`)
  return resp.json()
}

function permissiveFloorSchema() {
  return z.object({
    floorId: z.string(),
    title: z.string(),
    name: z.string(),
    width: z.number(),
    height: z.number(),
    map: z.array(z.array(z.number())),
    bgmap: z.array(z.array(z.number())).default([]),
    fgmap: z.array(z.array(z.number())).default([]),
    events: z.record(z.string(), z.array(z.any())).default({}),
    cannotMove: z.record(z.string(), z.array(z.enum(['up', 'down', 'left', 'right']))).default({}),
    afterBattle: z.record(z.string(), z.array(z.any())).default({}),
    afterGetItem: z.record(z.string(), z.array(z.any())).default({}),
    afterOpenDoor: z.record(z.string(), z.array(z.any())).default({}),
    changeFloor: z.record(z.string(), z.any()).default({}),
    firstArrive: z.array(z.any()).default([]),
    eachArrive: z.array(z.any()).default([]),
    parallelDo: z.union([z.array(z.any()), z.string()]).default([]),
    images: z.array(z.any()).default([]),
    canFlyTo: z.boolean().default(false),
    canFlyFrom: z.boolean().default(false),
    canUseQuickShop: z.boolean().default(false),
    cannotViewMap: z.boolean().default(false),
    cannotMoveDirectly: z.boolean().default(false),
    ratio: z.number().default(1),
    defaultGround: z.string().default(''),
    beforeBattle: z.record(z.string(), z.array(z.any())).default({}),
    autoEvent: z.record(z.string(), z.array(z.any())).default({}),
    cannotMoveIn: z.record(z.string(), z.array(z.any())).default({}),
    bgm: z.union([z.string(), z.array(z.string())]).default(''),
    upFloor: z.union([z.string(), z.array(z.number()), z.null()]).default(null),
    downFloor: z.union([z.string(), z.array(z.number()), z.null()]).default(null),
    flyPoint: z.array(z.number()).default([]),
  })
}

export async function loadTowerContent(
  baseUrl: string,
  options: LoadOptions = {}
): Promise<TowerContent> {
  const { validate = true, freeze = true } = options

  const [mainRaw, enemysRaw, mapsRaw, itemsRaw, eventsRaw, shopsRaw] = await Promise.all([
    fetchJson(`${baseUrl}/data.json`),
    fetchJson(`${baseUrl}/enemys.json`),
    fetchJson(`${baseUrl}/maps.json`),
    fetchJson(`${baseUrl}/items.json`),
    fetchJson(`${baseUrl}/events.json`).catch(() => ({})),
    fetchJson(`${baseUrl}/shops.json`).catch(() => []),
  ])

  const main = validate
    ? MainSchema.parse(mainRaw)
    : (mainRaw as unknown as z.infer<typeof MainSchema>)

  const floorIds = main.floorIds
  const floorResults = await Promise.all(
    floorIds.map(async (floorId) => {
      const floorRaw = await fetchJson(`${baseUrl}/floors/${floorId}.json`)
      let floor: z.infer<ReturnType<typeof permissiveFloorSchema>>
      if (validate) {
        const result = permissiveFloorSchema().safeParse(floorRaw)
        floor = result.success
          ? result.data
          : (floorRaw as z.infer<ReturnType<typeof permissiveFloorSchema>>)
      } else {
        floor = floorRaw as z.infer<ReturnType<typeof permissiveFloorSchema>>
      }
      return [floorId, floor] as const
    })
  )

  const floors: Record<string, z.infer<ReturnType<typeof permissiveFloorSchema>>> = {}
  for (const [floorId, floor] of floorResults) {
    floors[floorId] = freeze ? deepFreeze(floor) : floor
  }

  const result: TowerContent = {
    main: freeze ? deepFreeze(validate ? main : (mainRaw as z.infer<typeof MainSchema>)) : main,
    enemys: freeze
      ? deepFreeze(enemysRaw as Record<string, z.infer<typeof EnemySchema>>)
      : (enemysRaw as Record<string, z.infer<typeof EnemySchema>>),
    maps: freeze
      ? deepFreeze(mapsRaw as Record<string, z.infer<typeof MapBlockSchema>>)
      : (mapsRaw as Record<string, z.infer<typeof MapBlockSchema>>),
    items: freeze
      ? deepFreeze(itemsRaw as Record<string, z.infer<typeof ItemSchema>>)
      : (itemsRaw as Record<string, z.infer<typeof ItemSchema>>),
    events: freeze
      ? deepFreeze(eventsRaw as Record<string, unknown[]>)
      : (eventsRaw as Record<string, unknown[]>),
    shops: freeze
      ? deepFreeze(shopsRaw as TowerContent['shops'])
      : (shopsRaw as TowerContent['shops']),
    floors: floors as TowerContent['floors'],
  }

  if (freeze) deepFreeze(result)
  return result
}
