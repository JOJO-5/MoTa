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

    hero.items.push('book', 'pickaxe', 'bomb')
    hud.update(
      hero,
      {
        sword1: { cls: 'equips', name: '铁剑', text: '普通的攻击武器' },
        book: { cls: 'constants', name: '心镜', text: '洞察敌人信息' },
        pickaxe: { cls: 'tools', name: '破墙镐', text: '可以破坏勇士面前的墙' },
        bomb: { cls: 'tools', name: '爆裂卷轴', text: '直接解决角色周围的魔物' },
      },
      { 'item:book': 1, 'item:pickaxe': 2, 'item:bomb': 1 }
    )

    expect(host.querySelector('.mota-hud')?.textContent).toContain('勇者档案')
    expect(host.querySelector('.mota-hud__portrait')).not.toBeNull()
    expect((host.querySelector('.mota-hud__hp-fill') as HTMLElement | null)?.style.width).toBe(
      '75%'
    )
    expect(host.querySelector('.mota-hud__equipment')?.textContent).toContain('铁剑')
    expect(host.querySelector('.mota-hud__equipment')?.textContent).not.toContain('sword1')
    expect(host.querySelector('.mota-hud__items')?.textContent).toContain('心镜')
    expect(host.querySelector('.mota-hud__items')?.textContent).toContain('破墙镐')
    expect(host.querySelector('.mota-hud__items')?.textContent).toContain('×2')
    expect(host.querySelector('[data-item-id="book"]')).not.toBeNull()
    expect(host.querySelector('[data-item-id="pickaxe"]')).not.toBeNull()
    expect(host.querySelector('[data-item-id="bomb"]')).not.toBeNull()
    expect(host.querySelector('.mota-hud__keys')?.textContent).toContain('黄0')

    hud.destroy()
  })

  it('sends the selected usable item to the game scene', () => {
    const host = document.createElement('div')
    const used: string[] = []
    const hud = new Hud(host, (itemId) => used.push(itemId))
    const hero = createInitialState('MT0', 6, 6).hero
    hero.items.push('pickaxe')

    hud.update(
      hero,
      { pickaxe: { cls: 'tools', name: '破墙镐', text: '可以破坏勇士面前的墙' } },
      { 'item:pickaxe': 1 }
    )
    ;(host.querySelector('[data-item-id="pickaxe"]') as HTMLButtonElement).click()

    expect(used).toEqual(['pickaxe'])
    hud.destroy()
  })

  it('makes the teleport wand an explicit usable action', () => {
    const host = document.createElement('div')
    const hud = new Hud(host)
    const hero = createInitialState('MT0', 6, 6).hero
    hero.items.push('fly')

    hud.update(
      hero,
      { fly: { cls: 'constants', name: '楼层传送器', useItemEffect: 'openFly()' } },
      { 'item:fly': 1 }
    )

    expect(host.querySelector('.mota-hud__items')?.textContent).toContain('使用')
    expect(host.querySelector('[data-item-id="fly"]')).not.toBeNull()
    hud.destroy()
  })
})
