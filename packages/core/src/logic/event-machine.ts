import { dispatch, State } from '../state/store.js'
import { evaluate } from './expr.js'
import { startBattle, endBattle } from './battle.js'
import type { Event } from '@modern-mota/data'
import type { Direction, HeroSnapshot, RuntimeTileValue, TileOverride } from '../types.js'

export type EventContext = {
  floorId: string
  x: number
  y: number
  eventIndex: number
  eventCount: number
}

export type EventMachineState = 'idle' | 'running' | 'waiting' | 'done' | 'error'

export interface EventMachine {
  start(events: Event[], context: EventContext): void
  pause(): void
  resume(): void
  stop(): void
  getState(): EventMachineState
  getContext(): EventContext | null
  moveChoice(direction: Direction): void
}

type LegacyEvent = {
  type: string
  [key: string]: unknown
}

type PendingChoice = {
  choices: Array<{ text: string; action: Event[] }>
  index: number
}

let machineState: EventMachineState = 'idle'
let currentContext: EventContext | null = null
let generator: Generator<unknown, void, unknown> | null = null
let pendingChoice: PendingChoice | null = null
const queuedStarts: Array<{ events: Event[]; context: EventContext }> = []

function asLegacyEvent(event: Event): LegacyEvent | null {
  return typeof event === 'object' && event !== null ? (event as LegacyEvent) : null
}

function parseLegacyValue(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw
  const value = raw.trim()
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  const evaluated = evaluate(value)
  return evaluated === null ? value : evaluated
}

function readLegacyValue(name: string): unknown {
  if (name.startsWith('flag:') || name.startsWith('switch:')) {
    return State.flags[name.slice(name.indexOf(':') + 1)] ?? 0
  }
  if (name.startsWith('status:')) {
    return State.hero[name.slice(7) as keyof HeroSnapshot] ?? 0
  }
  if (name.startsWith('item:')) {
    return State.values[name] ?? (State.hero.items.includes(name.slice(5)) ? 1 : 0)
  }
  return State.values[name] ?? 0
}

function applyOperator(current: unknown, next: unknown, operator: unknown): unknown {
  const op = typeof operator === 'string' ? operator : '='
  if (op === '=' || op === '==') return next
  const left = Number(current) || 0
  const right = Number(next) || 0
  if (op === '+=') return left + right
  if (op === '-=') return left - right
  if (op === '*=') return left * right
  if (op === '/=') return right === 0 ? left : Math.floor(left / right)
  return next
}

function writeLegacyValue(name: string, value: unknown) {
  if (name.startsWith('flag:') || name.startsWith('switch:')) {
    dispatch({ type: 'SET_FLAG', name: name.slice(name.indexOf(':') + 1), value })
    return
  }
  if (name.startsWith('status:')) {
    const key = name.slice(7) as keyof HeroSnapshot
    if (['hp', 'hpMax', 'atk', 'def', 'mdef', 'money', 'exp', 'level'].includes(key)) {
      dispatch({ type: 'SET_HERO', hero: { [key]: Number(value) || 0 } })
      return
    }
  }
  dispatch({ type: 'SET_VALUE', name, value: Number(value) || 0 })
}

function normalizeLocations(raw: unknown, context: EventContext): Array<[number, number]> {
  if (!Array.isArray(raw)) return [[context.x, context.y]]
  if (raw.length === 2 && raw.every((value) => typeof value === 'number')) {
    return [[raw[0] as number, raw[1] as number]]
  }
  return raw.flatMap((value) => {
    if (
      Array.isArray(value) &&
      value.length === 2 &&
      value.every((item) => typeof item === 'number')
    ) {
      return [[value[0] as number, value[1] as number]]
    }
    return []
  })
}

function blockValue(raw: LegacyEvent): RuntimeTileValue | undefined {
  const value = raw.blockId !== undefined ? raw.blockId : raw.number
  if (value === undefined) return undefined
  if (value === null || value === 'null') return null
  return typeof value === 'number' ? value : String(value)
}

function applyTileOverride(
  floorId: string,
  locations: Array<[number, number]>,
  override: TileOverride
) {
  for (const [x, y] of locations) {
    dispatch({ type: 'SET_TILE_OVERRIDE', floorId, x, y, override })
  }
}

function formatChoices(text: string, choices: PendingChoice['choices'], index: number) {
  const title = text ? `${text}\n\n` : ''
  return `${title}${choices.map((choice, i) => `${i === index ? '▶' : ' '} ${i + 1}. ${choice.text}`).join('\n')}`
}

function* processEvents(events: Event[], context: EventContext): Generator<unknown, void, unknown> {
  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    currentContext = { ...context, eventIndex: i, eventCount: events.length }

    // Original mota-js dialog format: strings like "\t[speaker,icon]text"
    if (typeof event === 'string') {
      const trimmed = event.replace(/^\t/, '').trim()
      const m = trimmed.match(/^\[([^\]]*)\]([\s\S]*)/)
      const text = m ? m[2].trim() : trimmed
      dispatch({ type: 'SET_UI', ui: { modal: text } })
      yield 'dialog'
      continue
    }

    const raw = asLegacyEvent(event)
    if (!raw) continue

    switch (raw.type) {
      case 'setValue': {
        const name = String(raw.name ?? '')
        const next = parseLegacyValue(raw.value)
        writeLegacyValue(name, applyOperator(readLegacyValue(name), next, raw.operator))
        break
      }
      case 'addValue': {
        const name = String(raw.name ?? '')
        const next = parseLegacyValue(raw.value)
        writeLegacyValue(name, applyOperator(readLegacyValue(name), next, '+='))
        break
      }
      case 'setFlag': {
        dispatch({
          type: 'SET_FLAG',
          name: String(raw.name ?? ''),
          value: parseLegacyValue(raw.value),
        })
        break
      }
      case 'if': {
        const condition = evaluate(String(raw.condition ?? 'false'))
        const branch = (condition ? raw.true : raw.false) as Event[] | undefined
        yield* processEvents(branch ?? [], context)
        break
      }
      case 'switch': {
        const value = evaluate(String(raw.condition ?? ''))
        const cases = Array.isArray(raw.caseList)
          ? (raw.caseList as Array<Record<string, unknown>>)
          : []
        const selected =
          cases.find((item) => String(item.case) === String(value)) ??
          cases.find((item) => item.case === 'default')
        if (selected && Array.isArray(selected.action))
          yield* processEvents(selected.action as Event[], context)
        break
      }
      case 'while': {
        const data = Array.isArray(raw.data) ? (raw.data as Event[]) : []
        let guard = 0
        while (Boolean(evaluate(String(raw.condition ?? 'false'))) && guard++ < 1000) {
          yield* processEvents(data, context)
        }
        break
      }
      case 'for': {
        const variable = String(raw.variable ?? '')
        const from = Number(parseLegacyValue(raw.from)) || 0
        const to = Number(parseLegacyValue(raw.to)) || 0
        const stepValue = Number(parseLegacyValue(raw.step ?? '1')) || 1
        const data = Array.isArray(raw.data) ? (raw.data as Event[]) : []
        if (stepValue !== 0) {
          for (let value = from; stepValue > 0 ? value <= to : value >= to; value += stepValue) {
            writeLegacyValue(variable, value)
            yield* processEvents(data, context)
          }
        }
        break
      }
      case 'tip': {
        dispatch({ type: 'SET_UI', ui: { floorMsg: String(raw.text ?? '') } })
        break
      }
      case 'choices': {
        const choices = Array.isArray(raw.choices)
          ? raw.choices
              .filter((choice): choice is { text: string; action: Event[] } =>
                Boolean(
                  choice &&
                  typeof choice === 'object' &&
                  Array.isArray((choice as Record<string, unknown>).action)
                )
              )
              .map((choice) => ({
                text: String((choice as Record<string, unknown>).text ?? ''),
                action: (choice as Record<string, unknown>).action as Event[],
              }))
          : []
        if (choices.length === 0) break
        pendingChoice = { choices, index: 0 }
        dispatch({
          type: 'SET_UI',
          ui: { modal: formatChoices(String(raw.text ?? ''), choices, 0) },
        })
        const selectedIndex = yield 'choice'
        const choice =
          pendingChoice.choices[
            Math.max(0, Math.min(pendingChoice.choices.length - 1, Number(selectedIndex) || 0))
          ]
        pendingChoice = null
        if (choice) yield* processEvents(choice.action, context)
        break
      }
      case 'showText': {
        const text = Array.isArray(raw.text) ? raw.text.join('\n') : String(raw.text ?? '')
        dispatch({ type: 'SET_UI', ui: { modal: text } })
        yield 'dialog'
        break
      }
      case 'wait':
      case 'sleep': {
        // No timed animation system yet; treat as instant to avoid deadlock.
        break
      }
      case 'battle': {
        const enemy = State.enemys?.[String(raw.id ?? '')]
        if (enemy) {
          startBattle(enemy)
          endBattle()
        }
        break
      }
      case 'getItem': {
        const id = String(raw.id ?? '')
        const number = Math.max(1, Number(raw.number) || 1)
        for (let i = 0; i < number; i++) dispatch({ type: 'ADD_ITEM', itemId: id })
        break
      }
      case 'setItem': {
        const id = String(raw.id ?? '')
        writeLegacyValue(`item:${id}`, Number(raw.number) || 0)
        break
      }
      case 'changeFloor': {
        const position = raw.loc
          ? (() => {
              const loc = Array.isArray(raw.loc) ? raw.loc : [raw.loc, 0]
              return { x: loc[0] as number, y: loc[1] as number }
            })()
          : undefined
        dispatch({
          type: 'ENTER_FLOOR',
          floorId: String(raw.floorId ?? ''),
          ...(position ? { position } : {}),
          ...(raw.direction ? { direction: raw.direction as Direction } : {}),
        })
        break
      }
      case 'loadBgm':
      case 'playBgm': {
        dispatch({ type: 'SET_UI', ui: { bgm: String(raw.name ?? '') } })
        break
      }
      case 'win':
      case 'lose':
      case 'openShop': {
        dispatch({ type: 'SET_UI', ui: { modal: String(raw.reason ?? raw.id ?? '事件已触发') } })
        yield 'dialog'
        break
      }
      case 'exit': {
        return
      }
      case 'setBlock': {
        const value = blockValue(raw)
        if (value !== undefined) {
          applyTileOverride(
            String(raw.floorId ?? context.floorId),
            normalizeLocations(raw.loc, context),
            { map: value, hidden: false }
          )
        }
        break
      }
      case 'hide': {
        const remove = raw.remove !== false
        applyTileOverride(
          String(raw.floorId ?? context.floorId),
          normalizeLocations(raw.loc, context),
          remove ? { hidden: true } : { opacity: 0 }
        )
        break
      }
      case 'show': {
        applyTileOverride(
          String(raw.floorId ?? context.floorId),
          normalizeLocations(raw.loc, context),
          { hidden: false, opacity: 1 }
        )
        break
      }
      case 'setBlockOpacity': {
        applyTileOverride(
          String(raw.floorId ?? context.floorId),
          normalizeLocations(raw.loc, context),
          { opacity: Math.max(0, Math.min(1, Number(raw.opacity) || 0)) }
        )
        break
      }
      case 'openDoor': {
        applyTileOverride(
          String(raw.floorId ?? context.floorId),
          normalizeLocations(raw.loc, context),
          { map: 0, hidden: false }
        )
        break
      }
      case 'closeDoor': {
        const value = blockValue(raw)
        const floorId = String(raw.floorId ?? context.floorId)
        for (const [x, y] of normalizeLocations(raw.loc, context)) {
          if (value === undefined) dispatch({ type: 'CLEAR_TILE_OVERRIDE', floorId, x, y })
          else
            dispatch({
              type: 'SET_TILE_OVERRIDE',
              floorId,
              x,
              y,
              override: { map: value, hidden: false },
            })
        }
        break
      }
      case 'setFloor': {
        const floorId = String(raw.floorId ?? raw.name ?? '')
        if (floorId) dispatch({ type: 'ENTER_FLOOR', floorId })
        break
      }
      case 'turnBlock': {
        const value = blockValue(raw)
        if (value !== undefined) {
          applyTileOverride(
            String(raw.floorId ?? context.floorId),
            normalizeLocations(raw.loc, context),
            { map: value }
          )
        } else {
          console.warn(
            '[event-machine] legacy turnBlock has no block value; visual rotation is not available',
            raw
          )
        }
        break
      }
      // Pure visual/audio commands are explicitly logged until their Phaser
      // animation/audio bridge is available; gameplay-changing commands above
      // must never be silently skipped.
      case 'playSound':
      case 'waitAsync':
      case 'animate':
      case 'setCurtain':
      case 'setText':
      case 'move':
      case 'input':
      case 'comment':
      case 'function':
        console.warn(
          `[event-machine] legacy event ${raw.type} is deferred to the render bridge`,
          raw
        )
        break
      default:
        console.warn(`[event-machine] unknown legacy event ${raw.type}`, raw)
        break
    }
  }
}

export const eventMachine: EventMachine = {
  start(events, context) {
    if (machineState === 'running' || machineState === 'waiting') {
      queuedStarts.push({ events, context })
      return
    }
    startSequence(events, context)
  },
  pause() {
    if (machineState === 'running') {
      machineState = 'waiting'
    }
  },
  resume() {
    if (machineState === 'waiting' && generator) {
      machineState = 'running'
      step(pendingChoice?.index)
    }
  },
  stop() {
    machineState = 'idle'
    currentContext = null
    generator = null
    pendingChoice = null
    queuedStarts.length = 0
  },
  getState() {
    return machineState
  },
  getContext() {
    return currentContext
  },
  moveChoice(direction) {
    if (machineState !== 'waiting' || !pendingChoice) return
    const delta = direction === 'up' || direction === 'left' ? -1 : 1
    pendingChoice.index =
      (pendingChoice.index + delta + pendingChoice.choices.length) % pendingChoice.choices.length
    dispatch({
      type: 'SET_UI',
      ui: { modal: formatChoices('', pendingChoice.choices, pendingChoice.index) },
    })
  },
}

function startSequence(events: Event[], context: EventContext) {
  currentContext = context
  pendingChoice = null
  machineState = 'running'
  generator = processEvents(events, context)
  step()
}

function step(input?: unknown) {
  if (!generator || machineState !== 'running') return
  const result = generator.next(input)
  if (result.done) {
    const next = queuedStarts.shift()
    machineState = 'idle'
    currentContext = null
    generator = null
    pendingChoice = null
    // Close any dialog/message left open by the event sequence.
    dispatch({ type: 'SET_UI', ui: { modal: null } })
    if (next) startSequence(next.events, next.context)
  } else {
    // Yielded -> waiting for external resume
    machineState = 'waiting'
  }
}
