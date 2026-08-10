// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { EnemyGuide } from './enemy-guide.js'

describe('EnemyGuide', () => {
  it('shows a readable current-floor enemy list and can close it', () => {
    const host = document.createElement('div')
    const guide = new EnemyGuide(host)

    guide.showFloor([
      {
        id: 'greenSlime',
        name: '绿头怪',
        hp: 50,
        atk: 20,
        def: 1,
        money: 1,
        exp: 1,
        damage: 12,
        outcome: 'victory',
      },
    ])

    expect(host.querySelector('.mota-enemy-guide')?.textContent).toContain('本层怪物')
    expect(guide.isVisible()).toBe(true)
    expect(host.querySelector('.mota-enemy-guide')?.textContent).toContain('绿头怪')
    expect(host.querySelector('.mota-enemy-guide')?.textContent).toContain('预计损伤 12')
    ;(host.querySelector('.mota-enemy-guide__close') as HTMLButtonElement).click()
    expect(host.querySelector('.mota-enemy-guide')).toBeNull()
    expect(guide.isVisible()).toBe(false)
  })
})
