import Phaser from 'phaser'

export function registerAnimations(scene: Phaser.Scene) {
  if (!scene.textures.exists('hero')) return

  const dirs = ['down', 'left', 'right', 'up']
  dirs.forEach((dir, i) => {
    if (scene.textures.exists('hero')) {
      scene.anims.create({
        key: `walk_${dir}`,
        frames: [{ key: 'hero', frame: `${i}_0` }, { key: 'hero', frame: `${i}_1` }],
        frameRate: 8,
        repeat: -1,
      })
    }
  })

  dirs.forEach((dir, i) => {
    if (scene.textures.exists('hero')) {
      scene.anims.create({
        key: `idle_${dir}`,
        frames: [{ key: 'hero', frame: `${i}_0` }],
        frameRate: 1,
        repeat: -1,
      })
    }
  })

  const enemyTextures = scene.textures.getAll()
    .filter(t => t.key.startsWith('enemy_'))
    
  enemyTextures.forEach((texture) => {
    const enemyId = texture.key.replace('enemy_', '')
    scene.anims.create({
      key: `enemy_idle_${enemyId}`,
      frames: [{ key: `enemy_${enemyId}`, frame: '0' }],
      frameRate: 1,
      repeat: -1,
    })
  })
}
