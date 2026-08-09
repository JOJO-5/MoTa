import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

type LegacyEvent = {
  type?: string
  remove?: boolean
  true?: LegacyEvent[]
  choices?: Array<{ action: LegacyEvent[] }>
}

describe('2014 entrance sage event', () => {
  it('keeps the sage on the map after either dialogue choice', () => {
    const source = readFileSync(
      new URL('../../../content/mota-2014/floors/MT0.json', import.meta.url),
      'utf8'
    )
    const floor = JSON.parse(source) as {
      events: Record<string, LegacyEvent[]>
    }
    const outerIf = floor.events['13,3']?.[0]
    const premiumIf = outerIf?.true?.[0] ?? outerIf
    const choices = premiumIf?.true?.[0]?.choices ?? premiumIf?.choices

    expect(outerIf?.condition).toBe('(flag:sageTalked != true)')
    expect(choices).toHaveLength(2)
    expect(
      choices?.every(({ action }) =>
        action.every((event) => !(event.type === 'hide' && event.remove !== false))
      )
    ).toBe(true)
  })
})
