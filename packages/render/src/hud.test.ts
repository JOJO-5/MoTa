// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
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
})
