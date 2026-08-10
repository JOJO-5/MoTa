// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { createInitialState } from '@modern-mota/core'
import { Hud } from './hud.js'

describe('Hud', () => {
  it('stays owned by the game host so unmounting the game removes it', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)

    const hud = new Hud(host)

    expect(host.querySelector('.mota-hud')).not.toBeNull()
    expect(document.body.querySelector(':scope > .mota-hud')).toBeNull()

    hud.destroy()
    host.remove()
  })

  it('renders a complete hero dossier with portrait, vitality, stats, keys and equipment', () => {
    const host = document.createElement('div')
    const hud = new Hud(host)
    const hero = createInitialState('MT0', 6, 6).hero
    hero.hp = 750
    hero.money = 42
    hero.equipment.weapon = 'sword1'

    hud.update(hero)

    expect(host.querySelector('.mota-hud')?.textContent).toContain('勇者档案')
    expect(host.querySelector('.mota-hud__portrait')).not.toBeNull()
    expect((host.querySelector('.mota-hud__hp-fill') as HTMLElement | null)?.style.width).toBe(
      '75%'
    )
    expect(host.querySelector('.mota-hud__equipment')?.textContent).toContain('sword1')
    expect(host.querySelector('.mota-hud__keys')?.textContent).toContain('黄0')

    hud.destroy()
  })
})
