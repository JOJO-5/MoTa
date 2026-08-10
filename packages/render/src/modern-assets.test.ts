import { describe, expect, it } from 'vitest'
import { getModernEnemyFrame } from './modern-assets.js'

describe('modern generated enemy atlas', () => {
  it('maps the common legacy ids to their fixed 4x4 atlas cells', () => {
    expect(getModernEnemyFrame('greenSlime')).toBe(0)
    expect(getModernEnemyFrame('redSlime')).toBe(1)
    expect(getModernEnemyFrame('blackSlime')).toBe(2)
    expect(getModernEnemyFrame('bat')).toBe(3)
    expect(getModernEnemyFrame('bigBat')).toBe(4)
    expect(getModernEnemyFrame('skeleton')).toBe(5)
    expect(getModernEnemyFrame('skeletonCaptain')).toBe(6)
    expect(getModernEnemyFrame('zombie')).toBe(7)
    expect(getModernEnemyFrame('zombieKnight')).toBe(8)
    expect(getModernEnemyFrame('rock')).toBe(9)
    expect(getModernEnemyFrame('bluePriest')).toBe(10)
    expect(getModernEnemyFrame('redPriest')).toBe(11)
    expect(getModernEnemyFrame('yellowKnight')).toBe(12)
    expect(getModernEnemyFrame('blueKnight')).toBe(13)
    expect(getModernEnemyFrame('vampire')).toBe(14)
    expect(getModernEnemyFrame('dragon')).toBe(15)
  })

  it('keeps uncommon legacy monsters on their authored fallback art', () => {
    expect(getModernEnemyFrame('octopus')).toBeUndefined()
  })
})
