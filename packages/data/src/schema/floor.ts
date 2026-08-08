import { z } from 'zod'
import { EventSchema } from './event.js'

const EventListSchema = z.array(EventSchema)

const ChangeFloorSchema = z.object({
  floorId: z.string(),
  loc: z.tuple([z.number(), z.number()]).optional(),
  direction: z.enum(['up', 'down', 'left', 'right']).optional(),
  stair: z.string().optional(),
  time: z.number().int().default(800),
})

export const FloorSchema = z.object({
  floorId: z.string(),
  title: z.string(),
  name: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  map: z.array(z.array(z.number().int().min(0))),
  bgmap: z.array(z.array(z.number().int())).default([]),
  fgmap: z.array(z.array(z.number().int())).default([]),
  firstArrive: EventListSchema.default([]),
  eachArrive: EventListSchema.default([]),
  parallelDo: z.union([z.array(z.string()), z.string()]).default([]),
  events: z.record(z.string(), EventListSchema).default({}),
  cannotMove: z.record(z.string(), EventListSchema).default({}),
  afterBattle: z.record(z.string(), EventListSchema).default({}),
  afterGetItem: z.record(z.string(), EventListSchema).default({}),
  afterOpenDoor: z.record(z.string(), EventListSchema).default({}),
  changeFloor: z.record(z.string(), ChangeFloorSchema).default({}),
  images: z.array(z.object({
    code: z.union([z.string(), z.number()]),
    image: z.string(),
    loc: z.tuple([z.number(), z.number()]),
    dw: z.number(),
    dh: z.number(),
    opacity: z.number().default(1),
    time: z.number().default(0),
  })).default([]),
  canFlyTo: z.boolean().default(false),
  canFlyFrom: z.boolean().default(false),
  canUseQuickShop: z.boolean().default(false),
  cannotViewMap: z.boolean().default(false),
  cannotMoveDirectly: z.boolean().default(false),
  ratio: z.number().default(1),
  defaultGround: z.string().default(''),
  beforeBattle: z.record(z.string(), EventListSchema).default({}),
  autoEvent: z.record(z.string(), EventListSchema).default({}),
  cannotMoveIn: z.record(z.string(), EventListSchema).default({}),
  bgm: z.string().default(''),
  upFloor: z.string().nullable().default(null),
  downFloor: z.string().nullable().default(null),
  flyPoint: z.array(z.number()).default([]),
})

export type Floor = z.infer<typeof FloorSchema>
