import { z } from 'zod'
import { FlagsSchema } from './flags.js'
import { ValuesSchema } from './values.js'

export const MainSchema = z.object({
  floorIds: z.array(z.string()).min(1),
  startFloorId: z.string(),
  tilesets: z.array(z.string()).default([]),
  animates: z.array(z.string()).default([]),
  bgms: z.array(z.string()).default([]),
  sounds: z.array(z.string()).default([]),
  portraits: z.array(z.string()).default([]),
  theme: z.object({
    borderColor: z.string().default('#CCCCCC'),
    statusBarBg: z.string().default('url(/art/tiles/ground.png)'),
    font: z.string().default('Verdana'),
    startButtonBg: z.string().default('#32369F'),
  }).default({}),
  levelChoose: z.array(z.tuple([z.string(), z.string()])).default([
    ['简单', 'Easy'], ['普通', 'Normal'], ['困难', 'Hard'], ['噩梦', 'Hell']
  ]),
  flags: FlagsSchema.default({}),
  values: ValuesSchema.default({}),
}).strict()

export type Main = z.infer<typeof MainSchema>
