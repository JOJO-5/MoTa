import { dispatch, State } from '../state/store.js'
import { evaluate } from './expr.js'
import { startBattle, endBattle } from './battle.js'
import type { Event } from '@modern-mota/data'

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
}

let machineState: EventMachineState = 'idle'
let currentContext: EventContext | null = null
let generator: Generator<unknown, void, unknown> | null = null

function* processEvents(events: Event[], context: EventContext): Generator<unknown, void, unknown> {
  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    currentContext = { ...context, eventIndex: i, eventCount: events.length }

    switch (event.type) {
      case 'setValue': {
        dispatch({ type: 'SET_VALUE', name: event.name, value: Number(evaluate(event.value)) })
        break
      }
      case 'addValue': {
        const current = State.values[event.name] ?? 0
        dispatch({ type: 'SET_VALUE', name: event.name, value: current + Number(evaluate(event.value)) })
        break
      }
      case 'setFlag': {
        const raw = event.value
        let value: unknown = raw
        if (raw === 'true') value = true
        else if (raw === 'false') value = false
        else if (typeof raw === 'string') value = evaluate(raw)
        dispatch({ type: 'SET_FLAG', name: event.name, value })
        break
      }
      case 'if': {
        const condition = evaluate(event.condition)
        const branch = (condition ? event.true : event.false) as Event[]
        yield* processEvents(branch, context)
        break
      }
      case 'tip': {
        dispatch({ type: 'SET_UI', ui: { floorMsg: event.text } })
        yield 'tip'
        break
      }
      case 'wait': {
        yield 'wait'
        break
      }
      case 'sleep': {
        yield 'sleep'
        break
      }
      case 'battle': {
        const enemy = State.enemys?.[event.id]
        if (enemy) {
          startBattle(enemy)
          yield 'battle'
          endBattle()
        }
        break
      }
      case 'getItem': {
        dispatch({ type: 'ADD_ITEM', itemId: event.id })
        break
      }
      case 'openDoor': {
        // TODO: floor-specific logic
        break
      }
      case 'changeFloor': {
        dispatch({ type: 'SET_FLOOR', floorId: event.floorId })
        if (event.loc) {
          const loc = Array.isArray(event.loc) ? event.loc : [event.loc, 0]
          dispatch({ type: 'SET_POSITION', position: { x: loc[0] as number, y: loc[1] as number } })
        }
        break
      }
      case 'exit': {
        return
      }
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
      step()
    }
  },
  stop() {
    machineState = 'idle'
    currentContext = null
    generator = null
  },
  getState() {
    return machineState
  },
  getContext() {
    return currentContext
  },
}

function step() {
  if (!generator || machineState !== 'running') return
  const result = generator.next()
  if (result.done) {
    machineState = 'idle'
    currentContext = null
    generator = null
  } else {
    // Yielded -> waiting for external resume
    machineState = 'waiting'
  }
}