import { describe, expect, it } from 'vitest'
import { resolveModernTileKind } from './modern-theme.js'

describe('modern gameplay skin mapping', () => {
  const maps = {
    '1': { cls: 'terrains', id: 'ground' },
    '6': { cls: 'terrains', id: 'upFloor' },
    '20': { cls: 'animates', id: 'yellowDoor' },
    '21': { cls: 'animates', id: 'blueDoor' },
    '22': { cls: 'animates', id: 'steelDoor' },
    '100': { cls: 'items', id: 'yellowKey' },
    '101': { cls: 'items', id: 'redPotion' },
    '200': { cls: 'enemys', id: 'bat' },
    '201': { cls: 'enemys', id: 'dragon' },
    '300': { cls: 'npcs', id: 'wizard' },
    '10113': { cls: 'tileset', id: 'X10113', canPass: true },
  }

  it('maps legacy semantic entries to modern visual roles', () => {
    expect(resolveModernTileKind(1, maps)).toEqual({ kind: 'ground', variant: 'stone' })
    expect(resolveModernTileKind(6, maps)).toEqual({ kind: 'stair', variant: 'up' })
    expect(resolveModernTileKind(20, maps)).toEqual({ kind: 'door', variant: 'yellow' })
    expect(resolveModernTileKind(21, maps)).toEqual({ kind: 'door', variant: 'blue' })
    expect(resolveModernTileKind(22, maps)).toEqual({ kind: 'door', variant: 'steel' })
    expect(resolveModernTileKind(100, maps)).toEqual({ kind: 'item', variant: 'yellow-key' })
    expect(resolveModernTileKind(101, maps)).toEqual({ kind: 'item', variant: 'potion' })
    expect(resolveModernTileKind(200, maps)).toEqual({ kind: 'enemy', variant: 'bat' })
    expect(resolveModernTileKind(201, maps)).toEqual({ kind: 'enemy', variant: 'dragon' })
    expect(resolveModernTileKind(300, maps)).toEqual({ kind: 'npc', variant: 'sage' })
  })

  it('gives encoded wall tiles a visible modern role instead of a black fallback', () => {
    expect(resolveModernTileKind(10001, maps)).toEqual({ kind: 'wall', variant: 'basalt' })
    expect(resolveModernTileKind(20706, maps)).toEqual({ kind: 'wall', variant: 'basalt' })
    expect(resolveModernTileKind(9999, maps)).toEqual({ kind: 'unknown', variant: 'rune' })
  })

  it('keeps explicitly passable tileset cells visually walkable', () => {
    expect(resolveModernTileKind(10113, maps)).toEqual({ kind: 'ground', variant: 'stone' })
  })
})
