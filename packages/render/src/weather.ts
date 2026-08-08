import Phaser from 'phaser'

export type WeatherType = 'none' | 'rain' | 'snow' | 'fog'

export class WeatherSystem {
  private scene: Phaser.Scene
  private particles: Phaser.GameObjects.Particles.ParticleEmitter | null = null

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  setWeather(type: WeatherType) {
    this.clear()

    switch (type) {
      case 'rain':
        this.startRain()
        break
      case 'snow':
        this.startSnow()
        break
      case 'fog':
        this.startFog()
        break
    }
  }

  private startRain() {
    const rain = this.scene.add.particles(0, 0, '', {
      speed: { min: 300, max: 500 },
      angle: { min: 80, max: 100 },
      scale: { start: 0.1, end: 0.3 },
      alpha: { start: 0.6, end: 0.1 },
      lifespan: 1000,
      frequency: 20,
    })
    rain.setDepth(300)
    this.particles = rain as any
  }

  private startSnow() {
    const snow = this.scene.add.particles(0, 0, '', {
      speed: { min: 20, max: 60 },
      angle: { min: -30, max: 30 },
      scale: { start: 0.2, end: 0.4 },
      alpha: { start: 0.8, end: 0.2 },
      lifespan: 5000,
      frequency: 50,
    })
    snow.setDepth(300)
    this.particles = snow as any
  }

  private startFog() {
    const fog = this.scene.add.rectangle(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
      this.scene.cameras.main.width,
      this.scene.cameras.main.height,
      0xaaaaaa, 0.15
    )
    fog.setScrollFactor(0)
    fog.setDepth(290)
  }

  private clear() {
    this.particles?.destroy()
    this.particles = null
  }

  destroy() {
    this.clear()
  }
}
