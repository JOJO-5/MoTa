import { z } from 'zod'
import { EventSchema } from './event.js'

const EventListSchema = z.array(EventSchema)

const ChangeFloorSchema = z.object({
  floorId: z.string(),
  loc: z.tuple([z.number(), z.number()]).optional(),
  direction: z.enum(['up', 'down', 'left', 'right']).optional(),
  stair: z.string().optional(),
  time: z.number().int().default(800),
}).strict()

export const FloorSchema = z.object({
  floorId: z.string(),
  title: z.string(),
  name: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  map: z.array(z.array(z.number().int().min(0).max(999))),
  bgmap: z.array(z.array(z.number().int())).default([]),
  fgmap: z.array(z.array(z.number().int())).default([]),
  firstArrive: EventListSchema.default([]),
  eachArrive: EventListSchema.default([]),
  parallelDo: EventListSchema.default([]),
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
}).strict()

export type Floor = z.infer<typeof FloorSchema>
