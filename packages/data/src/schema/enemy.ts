import { z } from 'zod'

export const EnemySchema = z.object({
  id: z.string(),
  name: z.string(),
  hp: z.number().int().positive(),
  atk: z.number().int().nonnegative(),
  def: z.number().int().nonnegative(),
  money: z.number().int().nonnegative(),
  exp: z.number().int().nonnegative(),
  special: z.array(z.string()).default([]),
  fail: z.string().optional(),
  range: z.tuple([z.number().int(), z.number().int()]).optional(),
  priority: z.number().int().default(0),
}).strict()

export type Enemy = z.infer<typeof EnemySchema>
