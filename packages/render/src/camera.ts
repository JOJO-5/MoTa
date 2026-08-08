import Phaser from 'phaser'
import { CANVAS_HEIGHT, CANVAS_WIDTH, GAME_WIDTH, GAME_HEIGHT, TILE_SIZE } from './constants.js'

export class CameraSystem {
  private camera: Phaser.Cameras.Scene2D.Camera
  private worldWidth: number
  private worldHeight: number

  constructor(scene: Phaser.Scene, worldWidth: number, worldHeight: number) {
    this.camera = scene.cameras.main
    this.worldWidth = worldWidth * TILE_SIZE
    this.worldHeight = worldHeight * TILE_SIZE
    this.camera.setBounds(0, 0, this.worldWidth, this.worldHeight)
    // The 13x13 playfield is centered inside Phaser's 480x480 presentation canvas.
    // The old code derived the viewport offset from world dimensions, which made
    // larger floors shift the viewport and left small floors visually off-center.
    const vx = Math.floor((CANVAS_WIDTH - GAME_WIDTH) / 2)
    const vy = Math.floor((CANVAS_HEIGHT - GAME_HEIGHT) / 2)
    this.camera.setViewport(vx, vy, GAME_WIDTH, GAME_HEIGHT)
    if (this.worldWidth <= GAME_WIDTH && this.worldHeight <= GAME_HEIGHT) {
      this.camera.centerOn(this.worldWidth / 2, this.worldHeight / 2)
    }
  }

  follow(target: Phaser.GameObjects.GameObject, lerp: number = 0.1) {
    this.camera.startFollow(target, true, lerp, lerp)
  }

  shake(intensity: number = 0.005, duration: number = 200) {
    this.camera.shake(duration, intensity)
  }

  flash(color: number = 0xffffff, duration: number = 100) {
    const r = (color >> 16) & 0xff
    const g = (color >> 8) & 0xff
    const b = color & 0xff
    this.camera.flash(duration, r, g, b)
  }

  fadeIn(duration: number = 500) {
    this.camera.fadeIn(duration)
  }

  fadeOut(duration: number = 500) {
    this.camera.fadeOut(duration)
    return this.camera
  }

  setZoom(zoom: number) {
    this.camera.setZoom(zoom)
  }
}
