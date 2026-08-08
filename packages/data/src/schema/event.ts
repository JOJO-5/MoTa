import { z } from 'zod'

const EventListSchema: z.ZodType<unknown[]> = z.lazy(() =>
  z.array(EventSchema)
)

const BaseEvent = z.object({ type: z.string() })

const LocSchema = z.union([
  z.tuple([z.number(), z.number()]),
  z.array(z.union([z.number(), z.tuple([z.number(), z.number()])])),
])

export const EventSchema = z.union([
  // Original mota-js dialog lines: "\t[speaker,icon]text"
  z.string(),
  BaseEvent.extend({ type: z.literal('setValue'), name: z.string(), value: z.string() }),
  BaseEvent.extend({ type: z.literal('addValue'), name: z.string(), value: z.string() }),
  BaseEvent.extend({ type: z.literal('setFlag'), name: z.string(), value: z.union([z.boolean(), z.string(), z.number()]) }),
  BaseEvent.extend({ type: z.literal('if'), condition: z.string(), true: EventListSchema.default([]), false: EventListSchema.default([]) }),
  BaseEvent.extend({ type: z.literal('switch'), condition: z.string(), caseList: z.array(z.object({ case: z.string(), action: EventListSchema })) }),
  BaseEvent.extend({ type: z.literal('while'), condition: z.string(), data: EventListSchema }),
  BaseEvent.extend({ type: z.literal('for'), variable: z.string(), from: z.string(), to: z.string(), step: z.string().default('1'), data: EventListSchema }),
  BaseEvent.extend({ type: z.literal('break') }),
  BaseEvent.extend({ type: z.literal('continue') }),
  BaseEvent.extend({ type: z.literal('tip'), text: z.string() }),
  BaseEvent.extend({ type: z.literal('choices'), text: z.string().optional(), choices: z.array(z.object({ text: z.string(), action: EventListSchema })) }),
  BaseEvent.extend({ type: z.literal('wait'), time: z.number().int().min(0) }),
  BaseEvent.extend({ type: z.literal('function'), function: z.string() }),
  BaseEvent.extend({ type: z.literal('showImage'), code: z.union([z.string(), z.number()]), image: z.string(), loc: LocSchema, dw: z.number(), dh: z.number(), opacity: z.number().default(1), time: z.number().default(0) }),
  BaseEvent.extend({ type: z.literal('hideImage'), code: z.union([z.string(), z.number()]), time: z.number().default(0) }),
  BaseEvent.extend({ type: z.literal('showText'), text: z.union([z.string(), z.array(z.string())]) }),
  BaseEvent.extend({ type: z.literal('battle'), id: z.string() }),
  BaseEvent.extend({ type: z.literal('openDoor'), id: z.string(), loc: LocSchema.optional() }),
  BaseEvent.extend({ type: z.literal('changeFloor'), floorId: z.string(), loc: LocSchema.optional(), direction: z.enum(['up','down','left','right']).optional(), stair: z.string().optional(), time: z.number().int().default(800) }),
  BaseEvent.extend({ type: z.literal('getItem'), id: z.string(), number: z.number().int().default(1) }),
  BaseEvent.extend({ type: z.literal('setItem'), id: z.string(), number: z.number().int() }),
  BaseEvent.extend({ type: z.literal('comment'), text: z.string() }),
  BaseEvent.extend({ type: z.literal('sleep'), time: z.number().int().min(0) }),
  BaseEvent.extend({ type: z.literal('exit') }),
  BaseEvent.extend({ type: z.literal('callSave'), slot: z.number().int().min(0).max(4) }),
  BaseEvent.extend({ type: z.literal('callLoad') }),
  BaseEvent.extend({ type: z.literal('setBlock'), loc: LocSchema, blockId: z.union([z.string(), z.number()]).optional(), number: z.union([z.string(), z.number()]).optional(), floorId: z.string().optional() }),
  BaseEvent.extend({ type: z.literal('hide'), loc: LocSchema, remove: z.boolean().optional() }),
  BaseEvent.extend({ type: z.literal('setBlockOpacity'), loc: LocSchema, floorId: z.string().optional(), opacity: z.number() }),
  BaseEvent.extend({ type: z.literal('animate'), animateId: z.string(), loc: LocSchema.optional() }),
  z.record(z.string(), z.unknown()),
])

export type Event = z.infer<typeof EventSchema>
