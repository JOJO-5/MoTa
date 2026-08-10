import Phaser from 'phaser'
import { TILE_SIZE } from './constants.js'
import { drawModernTile, resolveModernTileKind } from './modern-theme.js'
import { getTileSprite } from './icons.js'
import { getModernEnemyFrame } from './modern-assets.js'

/** Maps data from maps.json: tileId → { cls, id } */
type MapsData = Record<string, { cls: string; id: string; canPass?: boolean }>

function getMapsData(): MapsData {
  const td = (globalThis as Record<string, unknown>)['__towerData'] as {
    maps: MapsData
  } | null
  return td?.maps ?? {}
}

export class TileMapLayer {
  private scene: Phaser.Scene
  private sprites: Phaser.GameObjects.GameObject[] = []
  private mapsData: MapsData

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.mapsData = getMapsData()
  }

  render(
    map: number[][],
    bgmap: number[][] | null,
    fgmap: number[][] | null,
    _defaultGround: string | null = null,
    collectedTiles: string[] = [],
    opacities: Record<string, number> = {},
    stairPoints: Array<[number, number]> = []
  ) {
    this.destroy()

    const rows = map.length
    const cols = map[0]?.length ?? 0
    const collected = new Set(collectedTiles)

    // Pass 1: a warm, subdued dungeon floor. The generated texture supplies
    // hand-made material variation while the code-drawn grid keeps movement
    // cells obvious at phone size.
    const floor = this.scene.add.graphics().setDepth(-5)
    floor.fillStyle(0x21150e, 1)
    floor.fillRect(0, 0, cols * TILE_SIZE, rows * TILE_SIZE)
    this.sprites.push(floor)

    if (this.scene.textures.exists('modern-floor-texture')) {
      const floorTexture = this.scene.add
        .tileSprite(
          (cols * TILE_SIZE) / 2,
          (rows * TILE_SIZE) / 2,
          cols * TILE_SIZE,
          rows * TILE_SIZE,
          'modern-floor-texture'
        )
        .setAlpha(0.62)
        .setDepth(-4)
      this.sprites.push(floorTexture)
    }

    const grid = this.scene.add.graphics().setDepth(-3)
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = x * TILE_SIZE
        const py = y * TILE_SIZE
        grid.fillStyle((x + y) % 2 === 0 ? 0x4b321e : 0x2e2117, 0.12)
        grid.fillRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2)
        grid.lineStyle(1, 0x9a7444, 0.2)
        grid.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2)
        if ((x * 5 + y * 3) % 11 === 0) {
          grid.fillStyle(0x87904c, 0.32)
          grid.fillRect(px + 5, py + 24, 3, 2)
        }
      }
    }
    this.sprites.push(grid)

    // Pass 2: background layer overrides (only non-zero entries)
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (collected.has(`${x},${y}`)) continue
        const bgId = bgmap?.[y]?.[x] ?? 0
        if (bgId !== 0)
          this.drawTile(
            bgId,
            x * TILE_SIZE,
            y * TILE_SIZE,
            opacities[`${x},${y}`] ?? 1,
            'background'
          )
      }
    }

    // Pass 3: wall/object layer
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (collected.has(`${x},${y}`)) continue
        const wallId = map[y]?.[x] ?? 0
        if (wallId !== 0)
          this.drawTile(wallId, x * TILE_SIZE, y * TILE_SIZE, opacities[`${x},${y}`] ?? 1, 'map')
      }
    }

    // Pass 4: foreground layer
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (collected.has(`${x},${y}`)) continue
        const fgId = fgmap?.[y]?.[x] ?? 0
        if (fgId !== 0)
          this.drawTile(
            fgId,
            x * TILE_SIZE,
            y * TILE_SIZE,
            opacities[`${x},${y}`] ?? 1,
            'foreground'
          )
      }
    }

    // Legacy maps often use a subtle stair sprite. Keep the original art but
    // add a crisp gold frame so the next-floor entrance is discoverable on a
    // phone-sized canvas.
    for (const [x, y] of stairPoints) {
      const marker = this.scene.add.graphics()
      const px = x * TILE_SIZE
      const py = y * TILE_SIZE
      marker.fillStyle(0x2f260f, 0.92)
      marker.fillRoundedRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4, 6)
      marker.lineStyle(2, 0xffd166, 1)
      marker.strokeRoundedRect(px + 3, py + 3, TILE_SIZE - 6, TILE_SIZE - 6, 5)
      marker.fillStyle(0xffd166, 0.9)
      marker.fillTriangle(px + 16, py + 7, px + 8, py + 17, px + 24, py + 17)
      marker.setDepth(6)
      this.sprites.push(marker)
    }
  }

  private drawTile(
    tileId: number,
    px: number,
    py: number,
    opacity = 1,
    layer: 'background' | 'map' | 'foreground' = 'map'
  ) {
    const legacy = getTileSprite(tileId, this.mapsData)

    // Background and foreground are decoration layers, never collision walls.
    // Preserve their authored silhouette at restrained opacity instead of
    // converting every encoded tileset cell into a solid block.
    if (layer !== 'map') {
      if (!legacy || !this.scene.textures.exists(legacy.sheet)) return
      const decoration = this.scene.add
        .image(px + TILE_SIZE / 2, py + TILE_SIZE / 2, legacy.sheet, legacy.frame)
        .setAlpha(opacity * (layer === 'background' ? 0.34 : 0.82))
        .setDepth(layer === 'background' ? -2 : 5)
      this.sprites.push(decoration)
      return
    }

    const kind = resolveModernTileKind(tileId, this.mapsData)

    if (kind.kind === 'wall' && this.scene.textures.exists('modern-wall-texture')) {
      const cellX = Math.floor(px / TILE_SIZE)
      const cellY = Math.floor(py / TILE_SIZE)
      const cropX = Math.abs((cellX * 53 + cellY * 29) % (256 - TILE_SIZE))
      const cropY = Math.abs((cellX * 31 + cellY * 47) % (256 - TILE_SIZE))
      const wallTexture = this.scene.add
        .image(px, py, 'modern-wall-texture')
        .setOrigin(0, 0)
        .setCrop(cropX, cropY, TILE_SIZE, TILE_SIZE)
        .setDisplaySize(TILE_SIZE, TILE_SIZE)
        .setAlpha(opacity)
        .setDepth(1)
      this.sprites.push(wallTexture)
    }

    // Enemies and NPCs need silhouette detail at a glance. Use the restored
    // authored sprite art, framed by a semantic base that remains readable on
    // the new low-noise board.
    const modernEnemyFrame = kind.kind === 'enemy' ? getModernEnemyFrame(kind.variant) : undefined
    const hasModernEnemy =
      modernEnemyFrame !== undefined && this.scene.textures.exists('modern-enemies')
    const hasLegacyCharacter = Boolean(legacy && this.scene.textures.exists(legacy.sheet))
    if ((kind.kind === 'enemy' || kind.kind === 'npc') && (hasModernEnemy || hasLegacyCharacter)) {
      const frame = this.scene.add.graphics().setAlpha(opacity).setDepth(2)
      const accent = kind.kind === 'enemy' ? 0xd95c4f : 0xe0b85b
      frame.fillStyle(0x24150e, 0.82)
      frame.fillEllipse(px + 4, py + 22, TILE_SIZE - 8, 9)
      frame.lineStyle(2, accent, 0.82)
      frame.strokeCircle(px + 16, py + 16, 14)
      const sprite = hasModernEnemy
        ? this.scene.add
            .image(px + TILE_SIZE / 2, py + TILE_SIZE + 1, 'modern-enemies', modernEnemyFrame)
            .setOrigin(0.5, 1)
            .setDisplaySize(36, 36)
            .setAlpha(opacity)
            .setDepth(4)
        : this.scene.add
            .image(px + TILE_SIZE / 2, py + TILE_SIZE - 1, legacy!.sheet, legacy!.frame)
            .setOrigin(0.5, 1)
            .setAlpha(opacity)
            .setDepth(4)
      this.scene.tweens.add({
        targets: sprite,
        y: sprite.y - 1.5,
        duration: kind.kind === 'enemy' ? 720 : 980,
        ease: 'Sine.InOut',
        yoyo: true,
        repeat: -1,
      })
      this.sprites.push(frame, sprite)
      return
    }

    // The original item sheet is far more legible than abstract placeholder
    // geometry. A small glow plate separates it from the floor without turning
    // the whole tile into an obstacle.
    if (kind.kind === 'item' && legacy && this.scene.textures.exists(legacy.sheet)) {
      const plate = this.scene.add.graphics().setAlpha(opacity).setDepth(2)
      const accent =
        kind.variant === 'yellow-key'
          ? 0xffd166
          : kind.variant === 'blue-key'
            ? 0x59b8ff
            : kind.variant === 'red-key'
              ? 0xff667a
              : 0xe0b85b
      plate.fillStyle(accent, 0.14)
      plate.fillCircle(px + 16, py + 16, 14)
      plate.lineStyle(1, accent, 0.8)
      plate.strokeCircle(px + 16, py + 16, 13)
      const sprite = this.scene.add
        .image(px + TILE_SIZE / 2, py + TILE_SIZE / 2, legacy.sheet, legacy.frame)
        .setAlpha(opacity)
        .setDepth(4)
      this.sprites.push(plate, sprite)
      return
    }

    const modern = drawModernTile(this.scene, kind, px, py, opacity)
    modern.setDepth(1)
    this.sprites.push(modern)
  }

  destroy() {
    for (const s of this.sprites) {
      s.destroy()
    }
    this.sprites = []
  }
}
