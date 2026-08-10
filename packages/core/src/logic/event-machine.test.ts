import { describe, it, expect, beforeEach } from 'vitest'
import { eventMachine } from './event-machine.js'
import { dispatch, State, createInitialState } from '../state/store.js'
import type { Event } from '@modern-mota/data'

describe('eventMachine', () => {
  beforeEach(() => {
    eventMachine.stop()
    delete (globalThis as Record<string, unknown>).__towerData
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

  it('routes legacy key item values to the door key counters', () => {
    eventMachine.start(
      [
        { type: 'setValue', name: 'item:yellowKey', operator: '+=', value: '2' },
        { type: 'setValue', name: 'item:yellowKey', operator: '-=', value: '1' },
      ] as Event[],
      { floorId: 'MT5', x: 2, y: 1, eventIndex: 0, eventCount: 2 }
    )

    expect(State.hero.keys.yellowKey).toBe(1)
    expect(State.values['item:yellowKey']).toBeUndefined()
  })

  it('routes legacy equipment values through the equipment stat resolver', () => {
    ;(globalThis as Record<string, unknown>).__towerData = {
      items: {
        sword1: { cls: 'equips', name: '铁剑', equip: { type: 0, value: { atk: 8 } } },
        sword2: { cls: 'equips', name: '银光剑', equip: { type: 0, value: { atk: 26 } } },
      },
    }
    eventMachine.start(
      [
        { type: 'setValue', name: 'item:sword1', operator: '+=', value: 1 },
        { type: 'setValue', name: 'item:sword2', operator: '+=', value: 1 },
      ] as Event[],
      { floorId: 'MT11', x: 7, y: 1, eventIndex: 0, eventCount: 2 }
    )

    expect(State.hero.atk).toBe(36)
    expect(State.hero.equipment.weapon).toBe('sword2')
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

  it('moves a runtime actor and preserves the destination after a legacy move event', () => {
    ;(globalThis as Record<string, unknown>).__towerData = {
      floors: {
        JX21: { map: Array.from({ length: 15 }, (_, y) => (y === 13 ? [0, 0, 0, 0, 473] : [])) },
      },
      maps: { '473': { id: 'N473' } },
    }
    eventMachine.start(
      [
        {
          type: 'move',
          loc: [4, 13],
          keep: true,
          steps: ['right:1'],
        },
      ] as Event[],
      { floorId: 'JX21', x: 4, y: 13, eventIndex: 0, eventCount: 1 }
    )

    expect(State.tileOverrides.JX21['4,13']).toMatchObject({ hidden: true })
    expect(State.tileOverrides.JX21['5,13']).toMatchObject({ map: 'N473', hidden: false })
  })

  it('updates a floor property without changing the current floor', () => {
    eventMachine.start(
      [{ type: 'setFloor', name: 'canFlyFrom', floorId: 'MT25', value: true }] as Event[],
      { floorId: 'MT25', x: 4, y: 4, eventIndex: 0, eventCount: 1 }
    )

    expect(State.floorId).toBe('MT0')
    expect(State.floorProperties?.MT25?.canFlyFrom).toBe(true)
  })

  it('executes floor events wrapped in the original data container', () => {
    eventMachine.start(
      {
        trigger: 'action',
        enable: true,
        data: [{ type: 'setFlag', name: 'wrappedEventRan', value: true }],
      } as never,
      { floorId: 'JX1', x: 3, y: 4, eventIndex: 0, eventCount: 1 }
    )

    expect(State.flags.wrappedEventRan).toBe(true)
  })

  it('stops scripted boss progression when the battle is not won', () => {
    dispatch({
      type: 'SET_ENEMYS',
      enemys: {
        boss: {
          id: 'boss',
          name: 'Boss',
          hp: 9999,
          atk: 999,
          def: 999,
          money: 10,
          exp: 5,
          special: [],
          priority: 0,
        },
      },
    })
    eventMachine.start(
      [
        { type: 'battle', id: 'boss' },
        { type: 'setFlag', name: 'bossDefeated', value: true },
      ] as Event[],
      { floorId: 'JX1', x: 7, y: 4, eventIndex: 0, eventCount: 2 }
    )

    expect(State.flags.bossDefeated).toBeUndefined()
    expect(State.hero.hp).toBe(0)
  })

  it('awards scripted battle rewards before continuing the event', () => {
    dispatch({
      type: 'SET_ENEMYS',
      enemys: {
        boss: {
          id: 'boss',
          name: 'Boss',
          hp: 1,
          atk: 0,
          def: 0,
          money: 10,
          exp: 5,
          special: [],
          priority: 0,
        },
      },
    })
    eventMachine.start(
      [
        { type: 'battle', id: 'boss' },
        { type: 'setFlag', name: 'bossDefeated', value: true },
      ] as Event[],
      { floorId: 'JX1', x: 7, y: 4, eventIndex: 0, eventCount: 2 }
    )

    expect(State.flags.bossDefeated).toBe(true)
    expect(State.hero.money).toBe(10)
    expect(State.hero.exp).toBe(5)
  })

  it('opens a legacy shop and executes the selected affordable purchase', () => {
    dispatch({ type: 'SET_HERO', hero: { money: 30 } })
    ;(globalThis as Record<string, unknown>).__towerData = {
      shops: [
        {
          id: 'shop1',
          text: '花费${20+flag:shop1}金币提升能力：',
          choices: [
            {
              text: '攻击力3点',
              need: 'status:money>=20+flag:shop1',
              action: [
                { type: 'setValue', name: 'status:money', operator: '-=', value: '20+flag:shop1' },
                { type: 'setValue', name: 'flag:shop1', operator: '+=', value: '1' },
                { type: 'setValue', name: 'status:atk', operator: '+=', value: '3' },
              ],
            },
          ],
        },
      ],
    }

    eventMachine.start([{ type: 'openShop', id: 'shop1', open: true }] as Event[], {
      floorId: 'MT5',
      x: 2,
      y: 1,
      eventIndex: 0,
      eventCount: 1,
    })

    expect(State.ui.modal).toContain('花费20金币')
    expect(State.ui.modal).toContain('攻击力3点')
    eventMachine.resume()
    expect(State.hero.money).toBe(10)
    expect(State.hero.atk).toBe(13)
  })
})
