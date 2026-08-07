import { z } from 'zod'

const EventListSchema: z.ZodType<unknown[]> = z.lazy(() =>
  z.array(EventSchema)
)

export const EventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('setValue'), name: z.string(), value: z.string() }).strict(),
  z.object({ type: z.literal('addValue'), name: z.string(), value: z.string() }).strict(),
  z.object({ type: z.literal('setFlag'), name: z.string(), value: z.union([z.boolean(), z.string(), z.number()]) }).strict(),
  z.object({ type: z.literal('if'), condition: z.string(), true: EventListSchema, false: EventListSchema.default([]) }).strict(),
  z.object({ type: z.literal('switch'), condition: z.string(), caseList: z.array(z.object({ case: z.string(), action: EventListSchema })) }).strict(),
  z.object({ type: z.literal('while'), condition: z.string(), data: EventListSchema }).strict(),
  z.object({ type: z.literal('for'), variable: z.string(), from: z.string(), to: z.string(), step: z.string().default('1'), data: EventListSchema }).strict(),
  z.object({ type: z.literal('break') }).strict(),
  z.object({ type: z.literal('continue') }).strict(),
  z.object({ type: z.literal('tip'), text: z.string() }).strict(),
  z.object({ type: z.literal('choices'), choices: z.array(z.object({ text: z.string(), action: EventListSchema })) }).strict(),
  z.object({ type: z.literal('wait'), time: z.number().int().min(0) }).strict(),
  z.object({ type: z.literal('function'), function: z.string() }).strict(),
  z.object({ type: z.literal('showImage'), code: z.union([z.string(), z.number()]), image: z.string(), loc: z.tuple([z.number(), z.number()]), dw: z.number(), dh: z.number(), opacity: z.number().default(1), time: z.number().default(0) }).strict(),
  z.object({ type: z.literal('hideImage'), code: z.union([z.string(), z.number()]), time: z.number().default(0) }).strict(),
  z.object({ type: z.literal('showText'), text: z.union([z.string(), z.array(z.string())]) }).strict(),
  z.object({ type: z.literal('battle'), id: z.string() }).strict(),
  z.object({ type: z.literal('openDoor'), id: z.string(), loc: z.union([z.tuple([z.number(), z.number()]), z.array(z.tuple([z.number(), z.number()]))]).optional() }).strict(),
  z.object({ type: z.literal('changeFloor'), floorId: z.string(), loc: z.tuple([z.number(), z.number()]).optional(), direction: z.enum(['up','down','left','right']).optional(), stair: z.string().optional(), time: z.number().int().default(800) }).strict(),
  z.object({ type: z.literal('getItem'), id: z.string(), number: z.number().int().default(1) }).strict(),
  z.object({ type: z.literal('setItem'), id: z.string(), number: z.number().int() }).strict(),
  z.object({ type: z.literal('comment'), text: z.string() }).strict(),
  z.object({ type: z.literal('sleep'), time: z.number().int().min(0) }).strict(),
  z.object({ type: z.literal('exit') }).strict(),
  z.object({ type: z.literal('callSave'), slot: z.number().int().min(0).max(4) }).strict(),
  z.object({ type: z.literal('callLoad') }).strict(),
  z.object({ type: z.literal('setBlock'), loc: z.tuple([z.number(), z.number()]), blockId: z.number().int() }).strict(),
  z.object({ type: z.literal('animate'), animateId: z.string(), loc: z.tuple([z.number(), z.number()]).optional() }).strict(),
])

export type Event = z.infer<typeof EventSchema>
