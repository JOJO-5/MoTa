import { z } from 'zod'

export const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  text: z.string().optional(),
  icon: z.number().int().optional(),
  equip: z.boolean().default(false),
  key: z.boolean().default(false),
  value: z.number().int().default(0),
  hp: z.number().int().default(0),
  atk: z.number().int().default(0),
  def: z.number().int().default(0),
  money: z.number().int().default(0),
  exp: z.number().int().default(0),
  special: z.array(z.string()).default([]),
}).strict()

export type Item = z.infer<typeof ItemSchema>
