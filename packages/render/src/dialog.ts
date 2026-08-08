import Phaser from 'phaser'
import { GAME_WIDTH } from './constants.js'

export type DialogButton = { text: string; value: string }

export class DialogBox {
  private container: Phaser.GameObjects.Container
  private textEl: Phaser.GameObjects.Text
  private buttons: Phaser.GameObjects.Text[] = []
  private callback: ((value: string) => void) | null = null

  constructor(scene: Phaser.Scene, onSelect?: (value: string) => void) {
    this.callback = onSelect ?? null

    const bg = scene.add.rectangle(
      GAME_WIDTH / 2, 380,
      GAME_WIDTH - 20, 60,
      0x000000, 0.85
    )
    bg.setStrokeStyle(2, 0xffffff)

    this.textEl = scene.add.text(20, 350, '', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff',
      wordWrap: { width: GAME_WIDTH - 50 },
    })

    this.container = scene.add.container(0, 0, [bg, this.textEl])
    this.container.setDepth(200)
    this.container.setVisible(false)
  }

  show(text: string, buttons?: DialogButton[], onSelect?: (value: string) => void) {
    this.textEl.setText(text)
    this.container.setVisible(true)

    this.buttons.forEach(b => b.destroy())
    this.buttons = []
    this.callback = onSelect ?? null

    if (buttons && buttons.length > 0) {
      const scene = this.textEl.scene
      buttons.forEach((btn, i) => {
        const btnEl = scene.add.text(
          GAME_WIDTH - 100 - i * 90, 395,
          `[${btn.text}]`,
          { fontFamily: 'monospace', fontSize: '12px', color: '#ffff00' }
        )
        btnEl.setInteractive({ useHandCursor: true })
        btnEl.on('pointerdown', () => this.select(btn.value))
        this.container.add(btnEl)
        this.buttons.push(btnEl)
      })
    }
  }

  hide() {
    this.container.setVisible(false)
    this.textEl.setText('')
  }

  private select(value: string) {
    if (this.callback) this.callback(value)
    this.hide()
  }

  destroy() {
    this.container.destroy()
  }
}
