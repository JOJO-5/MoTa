import { z } from 'zod'

export const ValuesSchema = z.object({
  hero: z.object({
    name: z.string().default('勇者'),
    hp: z.number().int().default(1000),
    atk: z.number().int().default(10),
    def: z.number().int().default(10),
    money: z.number().int().default(0),
    exp: z.number().int().default(0),
  }).default({}),
  canvas: z.object({
    width: z.number().int().default(800),
    height: z.number().int().default(608),
  }).default({}),
  tile: z.object({
    width: z.number().int().default(32),
    height: z.number().int().default(32),
  }).default({}),
}).strict()

export type Values = z.infer<typeof ValuesSchema>
