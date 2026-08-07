import { z } from 'zod'

export const MapBlockSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().optional(),
  animate: z.number().int().optional(),
  value: z.number().int().optional(),
  canOpen: z.boolean().optional(),
  noPass: z.boolean().optional(),
  door: z.boolean().optional(),
  doorId: z.string().optional(),
  key: z.string().optional(),
  changeFloor: z.boolean().optional(),
  canFight: z.boolean().optional(),
  enemyId: z.string().optional(),
  itemId: z.string().optional(),
  npc: z.boolean().optional(),
  noReopen: z.boolean().optional(),
}).strict()

export type MapBlock = z.infer<typeof MapBlockSchema>
