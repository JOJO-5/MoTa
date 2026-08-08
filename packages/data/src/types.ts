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
