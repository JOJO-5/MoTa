// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { UiLayer } from './layer.js'

describe('in-game UI safe areas', () => {
  it('keeps the persistent HP and floor labels in a dedicated top rail', () => {
    const host = document.createElement('div')
    const ui = new UiLayer(host)

    const rail = host.querySelector('.mota-ui-top-rail')
    expect(rail).not.toBeNull()
    expect(rail?.querySelector('.mota-hp-bar')).not.toBeNull()
    expect(rail?.querySelector('.mota-floor-name')).not.toBeNull()

    ui.destroy()
  })
})
