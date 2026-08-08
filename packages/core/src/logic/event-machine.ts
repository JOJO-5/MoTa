import { dispatch, State } from '../state/store.js'
import { evaluate } from './expr.js'
import { startBattle, endBattle } from './battle.js'
import type { Event } from '@modern-mota/data'
import type { Direction, HeroSnapshot } from '../types.js'

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

function asLegacyEvent(event: Event): LegacyEvent | null {
  return typeof event === 'object' && event !== null ? event as LegacyEvent : null
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
        dispatch({ type: 'SET_FLAG', name: String(raw.name ?? ''), value: parseLegacyValue(raw.value) })
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
        const cases = Array.isArray(raw.caseList) ? raw.caseList as Array<Record<string, unknown>> : []
        const selected = cases.find((item) => String(item.case) === String(value)) ?? cases.find((item) => item.case === 'default')
        if (selected && Array.isArray(selected.action)) yield* processEvents(selected.action as Event[], context)
        break
      }
      case 'while': {
        const data = Array.isArray(raw.data) ? raw.data as Event[] : []
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
        const data = Array.isArray(raw.data) ? raw.data as Event[] : []
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
          ? raw.choices.filter((choice): choice is { text: string; action: Event[] } => Boolean(choice && typeof choice === 'object' && Array.isArray((choice as Record<string, unknown>).action))).map((choice) => ({
              text: String((choice as Record<string, unknown>).text ?? ''),
              action: (choice as Record<string, unknown>).action as Event[],
            }))
          : []
        if (choices.length === 0) break
        pendingChoice = { choices, index: 0 }
        dispatch({ type: 'SET_UI', ui: { modal: formatChoices(String(raw.text ?? ''), choices, 0) } })
        const selectedIndex = yield 'choice'
        const choice = pendingChoice.choices[Math.max(0, Math.min(pendingChoice.choices.length - 1, Number(selectedIndex) || 0))]
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
        dispatch({ type: 'SET_FLOOR', floorId: String(raw.floorId ?? '') })
        if (raw.loc) {
          const loc = Array.isArray(raw.loc) ? raw.loc : [raw.loc, 0]
          dispatch({ type: 'SET_POSITION', position: { x: loc[0] as number, y: loc[1] as number } })
        }
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
      // These are visual/audio commands from mota-js. They are intentionally
      // safe no-ops until their Phaser equivalents are available; importantly,
      // they no longer abort the rest of a legacy event chain.
      case 'playSound':
      case 'waitAsync':
      case 'setBlock':
      case 'setBlockOpacity':
      case 'hide':
      case 'show':
      case 'animate':
      case 'openDoor':
      case 'closeDoor':
      case 'setFloor':
      case 'setCurtain':
      case 'setText':
      case 'turnBlock':
      case 'move':
      case 'input':
      case 'comment':
      case 'function':
      default:
        break
    }
  }
}

export const eventMachine: EventMachine = {
  start(events, context) {
    if (machineState === 'running') return
    currentContext = context
    pendingChoice = null
    machineState = 'running'
    generator = processEvents(events, context)
    step()
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
    pendingChoice.index = (pendingChoice.index + delta + pendingChoice.choices.length) % pendingChoice.choices.length
    dispatch({ type: 'SET_UI', ui: { modal: formatChoices('', pendingChoice.choices, pendingChoice.index) } })
  },
}

function step(input?: unknown) {
  if (!generator || machineState !== 'running') return
  const result = generator.next(input)
  if (result.done) {
    machineState = 'idle'
    currentContext = null
    generator = null
    // Close any dialog/message left open by the event sequence
    dispatch({ type: 'SET_UI', ui: { modal: null } })
  } else {
    // Yielded -> waiting for external resume
    machineState = 'waiting'
  }
}
