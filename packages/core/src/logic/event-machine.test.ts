import { describe, it, expect, beforeEach } from 'vitest'
import { eventMachine } from './event-machine.js'
import { dispatch, State, createInitialState } from '../state/store.js'
import type { Event } from '@modern-mota/data'

describe('eventMachine', () => {
  beforeEach(() => {
    eventMachine.stop()
    dispatch({ type: 'LOAD_STATE', state: createInitialState('MT0', 6, 6) })
  })

  it('handles simple events', () => {
    const events: Event[] = [
      { type: 'setValue', name: 'coins', value: '100' },
      { type: 'setFlag', name: 'talked', value: true },
    ]
    eventMachine.start(events, { floorId: 'MT0', x: 6, y: 6, eventIndex: 0, eventCount: 2 })
    expect(State.values.coins).toBe(100)
    expect(State.flags.talked).toBe(true)
  })

  it('handles if/else branching', () => {
    const events: Event[] = [
      {
        type: 'if',
        condition: '1 < 2',
        true: [{ type: 'setFlag', name: 'branch', value: 'true' }],
        false: [{ type: 'setFlag', name: 'branch', value: 'false' }],
      },
    ]
    eventMachine.start(events, { floorId: 'MT0', x: 6, y: 6, eventIndex: 0, eventCount: 1 })
    expect(State.flags.branch).toBe(true)
  })

  it('shows tip messages without blocking the event flow', () => {
    const events: Event[] = [
      { type: 'tip', text: '你好！' },
      { type: 'setFlag', name: 'afterTip', value: true },
    ]
    eventMachine.start(events, { floorId: 'MT0', x: 6, y: 6, eventIndex: 0, eventCount: 2 })
    expect(eventMachine.getState()).toBe('idle')
    expect(State.ui.floorMsg).toBe('你好！')
    expect(State.flags.afterTip).toBe(true)
  })

  it('stops on exit event', () => {
    const events: Event[] = [{ type: 'exit' }, { type: 'setFlag', name: 'afterExit', value: true }]
    eventMachine.start(events, { floorId: 'MT0', x: 6, y: 6, eventIndex: 0, eventCount: 2 })
    expect(State.flags.afterExit).toBeUndefined()
    expect(eventMachine.getState()).toBe('idle')
  })

  it('handles wait events without blocking', () => {
    const events: Event[] = [{ type: 'wait', time: 500 }]
    eventMachine.start(events, { floorId: 'MT0', x: 6, y: 6, eventIndex: 0, eventCount: 1 })
    expect(eventMachine.getState()).toBe('idle')
  })

  it('shows dialog lines one by one, waiting for resume between them', () => {
    const events = [
      '\t[勇者,hero]你好！',
      '\t[魔女,N406]欢迎来到魔塔。',
      { type: 'setFlag', name: 'talked', value: true } as Event,
    ]
    eventMachine.start(events as Event[], {
      floorId: 'MT1',
      x: 7,
      y: 7,
      eventIndex: 0,
      eventCount: 3,
    })
    expect(eventMachine.getState()).toBe('waiting')
    expect(State.ui.modal).toBe('你好！')

    eventMachine.resume()
    expect(eventMachine.getState()).toBe('waiting')
    expect(State.ui.modal).toBe('欢迎来到魔塔。')

    eventMachine.resume()
    expect(eventMachine.getState()).toBe('idle')
    expect(State.flags.talked).toBe(true)
    expect(State.ui.modal).toBeNull()
  })

  it('keeps legacy value operators and status/flag prefixes working', () => {
    const events = [
      { type: 'setValue', name: 'flag:ancientSwitch', value: '1' },
      { type: 'setValue', name: 'flag:ancientSwitch', operator: '+=', value: '2' },
      { type: 'setValue', name: 'status:atk', operator: '+=', value: '5' },
      { type: 'setValue', name: 'item:oldKey', operator: '+=', value: '1' },
    ] as Event[]

    eventMachine.start(events, {
      floorId: 'MT0',
      x: 6,
      y: 6,
      eventIndex: 0,
      eventCount: events.length,
    })

    expect(State.flags.ancientSwitch).toBe(3)
    expect(State.hero.atk).toBe(15)
    expect(State.values['item:oldKey']).toBe(1)
  })

  it('runs a legacy choice branch selected by the mobile/keyboard action flow', () => {
    const events = [
      {
        type: 'choices',
        text: '选择路线',
        choices: [
          { text: '左路', action: [{ type: 'setFlag', name: 'route', value: 'left' }] },
          { text: '右路', action: [{ type: 'setFlag', name: 'route', value: 'right' }] },
        ],
      },
    ] as Event[]

    eventMachine.start(events, { floorId: 'MT0', x: 6, y: 6, eventIndex: 0, eventCount: 1 })
    expect(eventMachine.getState()).toBe('waiting')
    eventMachine.moveChoice('down')
    eventMachine.resume()

    expect(State.flags.route).toBe('right')
    expect(eventMachine.getState()).toBe('idle')
  })

  it('queues a new event sequence requested while the current sequence is waiting', () => {
    eventMachine.start([{ type: 'showText', text: 'first event' }], {
      floorId: 'MT0',
      x: 6,
      y: 6,
      eventIndex: 0,
      eventCount: 1,
    })
    expect(eventMachine.getState()).toBe('waiting')

    eventMachine.start([{ type: 'setFlag', name: 'arrivalHandled', value: true }], {
      floorId: 'MT1',
      x: 7,
      y: 13,
      eventIndex: 0,
      eventCount: 1,
    })
    expect(State.flags.arrivalHandled).toBeUndefined()

    eventMachine.resume()

    expect(State.flags.arrivalHandled).toBe(true)
    expect(eventMachine.getState()).toBe('idle')
    expect(eventMachine.getContext()).toBeNull()
  })

  it('persists legacy map-changing events as runtime tile overrides', () => {
    eventMachine.start(
      [
        { type: 'setBlock', number: 'blueGem', loc: [[3, 4]] },
        { type: 'hide', loc: [[5, 6]], remove: true },
        { type: 'show', loc: [[5, 6]] },
        { type: 'setBlockOpacity', loc: [[7, 8]], opacity: 0.4 },
        { type: 'openDoor', loc: [9, 10] },
      ] as Event[],
      { floorId: 'MT0', x: 6, y: 6, eventIndex: 0, eventCount: 5 }
    )

    expect(State.tileOverrides.MT0['3,4']).toMatchObject({ map: 'blueGem' })
    expect(State.tileOverrides.MT0['5,6']).toMatchObject({ hidden: false })
    expect(State.tileOverrides.MT0['7,8']).toMatchObject({ opacity: 0.4 })
    expect(State.tileOverrides.MT0['9,10']).toMatchObject({ map: 0 })
  })
})
