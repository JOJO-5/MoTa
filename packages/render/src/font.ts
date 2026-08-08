import Phaser from 'phaser'
import { GAME_WIDTH } from './constants.js'

export interface TextStyle {
  fontSize?: number
  color?: string
  stroke?: string
  strokeThickness?: number
  shadow?: { offsetX: number; offsetY: number; color: string; blur: number }
  align?: 'left' | 'center' | 'right'
}

export class FontRenderer {
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  drawFloorTitle(title: string, y: number = 20) {
    const text = this.scene.add.text(GAME_WIDTH / 2, y, title, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    })
    text.setOrigin(0.5, 0)
    text.setScrollFactor(0)
    text.setDepth(100)
    this.scene.tweens.add({
      targets: text,
      alpha: 0,
      delay: 1500,
      duration: 500,
      onComplete: () => text.destroy()
    })
    return text
  }

  drawMessage(text: string, y: number = 300) {
    const msgText = this.scene.add.text(GAME_WIDTH / 2, y, text, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 1,
      wordWrap: { width: GAME_WIDTH - 40 },
      align: 'center',
    })
    msgText.setOrigin(0.5, 0.5)
    msgText.setScrollFactor(0)
    msgText.setDepth(100)
    return msgText
  }

  drawDamage(x: number, y: number, damage: number, color: string = '#ff4444') {
    const text = this.scene.add.text(
      x * 32 + 16,
      y * 32,
      `-${damage}`,
      {
        fontFamily: 'monospace',
        fontSize: '14px',
        color,
        stroke: '#000000',
        strokeThickness: 2,
      }
    )
    text.setOrigin(0.5, 0)
    this.scene.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy()
    })
  }

  drawFloatingText(x: number, y: number, content: string, color: string = '#ffffff') {
    const text = this.scene.add.text(
      x * 32 + 16,
      y * 32,
      content,
      {
        fontFamily: 'monospace',
        fontSize: '12px',
        color,
        stroke: '#000000',
        strokeThickness: 1,
      }
    )
    text.setOrigin(0.5, 0)
    this.scene.tweens.add({
      targets: text,
      y: text.y - 20,
      alpha: 0,
      duration: 600,
      onComplete: () => text.destroy()
    })
  }
}
