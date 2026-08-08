export class SoundSystem {
  private bgm: Phaser.Sound.WebAudioSound | null = null
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene) {
    this.scene = scene
  }

  playBGM(key: string, volume: number = 0.3) {
    if (this.bgm) this.bgm.stop()
    this.bgm = this.scene.sound.add(key) as Phaser.Sound.WebAudioSound
    this.bgm.setLoop(true)
    this.bgm.setVolume(volume)
    this.bgm.play()
  }

  stopBGM() {
    this.bgm?.stop()
    this.bgm = null
  }

  playSFX(key: string, volume: number = 0.5) {
    this.scene.sound.add(key).setVolume(volume).play()
  }

  setBGMVolume(volume: number) {
    this.bgm?.setVolume(Math.max(0, Math.min(1, volume)))
  }
}
