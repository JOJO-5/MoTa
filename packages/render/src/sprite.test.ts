// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import type Phaser from 'phaser'
import { HeroSprite } from './sprite.js'

function chainable() {
  return {
    setStrokeStyle() {
      return this
    },
    setOrigin() {
      return this
    },
    setCrop() {
      return this
    },
    setScale() {
      return this
    },
    setFrame() {
      return this
    },
  }
}

describe('HeroSprite', () => {
  it('renders the tall hero above map tiles on the first floor paint', () => {
    const container = {
      ...chainable(),
      depth: 0,
      add() {
        return this
      },
      setDepth(depth: number) {
        this.depth = depth
        return this
      },
      setPosition() {
        return this
      },
      destroy() {},
    }
    const scene = {
      add: {
        container: () => container,
        rectangle: () => chainable(),
        ellipse: () => chainable(),
        image: () => ({ ...chainable(), texture: { key: 'modern-hero' } }),
        text: () => chainable(),
      },
      textures: { exists: () => true },
      tweens: { add() {} },
    } as unknown as Phaser.Scene

    new HeroSprite(scene, 6, 6)

    expect(container.depth).toBeGreaterThan(6)
  })
})
