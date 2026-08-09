/**
 * Sprite sheet frame index mapping.
 * Converted from original mota-js icons.js
 *
 * Each `cls` maps to a sprite sheet image. The `id` within each cls
 * maps to a frame index (0-based, left-to-right, top-to-bottom).
 */

export type SpriteSheetKey =
  | 'terrains' | 'animates' | 'npcs' | 'npc48'
  | 'enemys' | 'enemy48' | 'items' | 'autotile'
  | 'tileset' | 'hero'

/** Frame layout for each sprite sheet */
export const SHEET_CONFIG: Record<SpriteSheetKey, {
  frameWidth: number
  frameHeight: number
}> = {
  terrains:  { frameWidth: 32, frameHeight: 32 },
  animates:  { frameWidth: 32, frameHeight: 32 },
  npcs:      { frameWidth: 32, frameHeight: 32 },
  npc48:     { frameWidth: 32, frameHeight: 48 },
  enemys:    { frameWidth: 32, frameHeight: 32 },
  enemy48:   { frameWidth: 32, frameHeight: 48 },
  items:     { frameWidth: 32, frameHeight: 32 },
  autotile:  { frameWidth: 32, frameHeight: 32 },
  tileset:   { frameWidth: 32, frameHeight: 32 },
  hero:      { frameWidth: 32, frameHeight: 48 },
}

/** Columns per row in each sprite sheet (imageWidth / 32).
 *
 * The original mota-js icons.js stores the ROW index (posY) for each tile,
 * not the frame index. The actual frame in a Phaser spritesheet is:
 *   frame = row * cols + animFrame
 * where cols = imageWidth / 32. Terrains/items are 1-col tall strips,
 * npcs/enemys are 2-col (animated pairs), animates/npc48/enemy48 are 4-col.
 */
export const SHEET_COLS: Record<SpriteSheetKey, number> = {
  terrains: 1,
  animates: 4,
  npcs:     2,
  npc48:    4,
  enemys:   2,
  enemy48:  4,
  items:    1,
  autotile: 1,
  tileset:  8,
  hero:     4,
}

/** cls → id → frame index (exact copy of original Magictower2014 icons.js) */
export const ICONS: Record<string, Record<string, number>> = {
  terrains: {
    ground: 0, grass: 1, grass2: 2, ground2: 3, ground3: 4,
    downFloor: 5, upFloor: 6, blueShopLeft: 7, pinkShopLeft: 8,
    blueShopRight: 9, pinkShopRight: 10, arrowUp: 11, arrowDown: 12,
    arrowLeft: 13, arrowRight: 14, light: 15, darkLight: 16,
    ski: 17, flower: 18, box: 19, boxed: 20,
    sWallT: 21, sWallL: 22, sWallR: 23, sWallB: 24,
    sWallTL: 25, sWallBR: 26, sWallTR: 27, sWallBL: 28,
    sWallTB: 29, sWallLR: 30, sWallBLR: 31, sWallTLR: 32,
    sWallTBR: 33, sWallTBL: 34, T339: 35, T340: 36,
    T341: 37, T342: 38, hole: 39, T491: 40,
    T492: 41, T493: 42, T495: 43, T498: 44,
    T499: 45, T500: 46,
  },
  animates: {
    star: 0, lava: 1, blueLava: 2, water: 3,
    yellowDoor: 4, blueDoor: 5, redDoor: 6, greenDoor: 7,
    specialDoor: 8, steelDoor: 9, yellowWall: 10, whiteWall: 11,
    blueWall: 12, crystalUp: 13, crystalBottom: 14, starPortal: 15,
    fire: 16, portal: 17, switch: 18, lavaNet: 19,
    poisonNet: 20, weakNet: 21, curseNet: 22, downPortal: 23,
    leftPortal: 24, rightPortal: 25, upPortal: 26,
    ice: 27, magentaWall: 28, A363: 29, A364: 30,
    A365: 31, A366: 32, A367: 33, A368: 34,
    A369: 35, A370: 36, A371: 37, A418: 38,
    A419: 39, A420: 40, A421: 41, A422: 42,
    A423: 43, A459: 44, A460: 45, A461: 46,
    A465: 47, IceNet: 48, A479: 49, A480: 50,
    A481: 51, A482: 52, A487: 53, A488: 54,
  },
  npcs: {
    man: 0, trader: 1, thief: 2, fairy: 3, wizard: 4,
    recluse: 5, king: 6, youngMan: 7, sign: 8, expShop: 9,
    moneyShop: 10, princess: 11, greenMan: 12, blueTrader: 13,
  },
  npc48: {
    npc0: 0, npc1: 1, npc2: 2, npc3: 3,
    tallYellowDoor: 4, tallBlueDoor: 5, tallRedDoor: 6, tallGreenDoor: 7,
    tallSpecialDoor: 8, tallSteelDoor: 9, N406: 10, N407: 11,
    N408: 12, N409: 13, N410: 14, N411: 15,
    N412: 16, N413: 17, N414: 18, N415: 19,
    N416: 20, N417: 21, N473: 22, N474: 23,
    N475: 24, N476: 25,
  },
  enemys: {
    greenSlime: 0, redSlime: 1, blackSlime: 2, slimelord: 3,
    bat: 4, bigBat: 5, redBat: 6, vampire: 7,
    skeleton: 8, skeletonWarrior: 9, skeletonCaptain: 10, ghostSoldier: 11,
    zombie: 12, zombieKnight: 13, rock: 14, slimeman: 15,
    bluePriest: 16, redPriest: 17, brownWizard: 18, redWizard: 19,
    yellowGateKeeper: 20, blueGateKeeper: 21, redGateKeeper: 22, swordsman: 23,
    soldier: 24, yellowKnight: 25, redKnight: 26, darkKnight: 27,
    blackKing: 28, yellowKing: 29, greenKing: 30, blueKnight: 31,
    goldSlime: 32, poisonSkeleton: 33, poisonBat: 34, ironRock: 35,
    skeletonPriest: 36, skeletonKing: 37, skeletonPresbyter: 38, skeletonKnight: 39,
    evilHero: 40, devilWarrior: 41, demonPriest: 42, goldHornSlime: 43,
    redKing: 44, blueKing: 45, magicMaster: 46, silverSlime: 47,
    blademaster: 48, whiteHornSlime: 49, evilPrincess: 50, evilFairy: 51,
    yellowPriest: 52, redSwordsman: 53, whiteSlimeman: 54, poisonZombie: 55,
    dragon: 56, octopus: 57, fairyEnemy: 58, princessEnemy: 59,
    silverSlimelord: 60, goldSlimelord: 61, grayRock: 62, greenKnight: 63,
    bowman: 64, purpleBowman: 65, watcherSlime: 66, frostBat: 67,
    devilKnight: 68, grayPriest: 69, greenGateKeeper: 70, keiskeiFairy: 71,
    tulipFairy: 72, E331: 73, E332: 74, E333: 75,
    E334: 76, E335: 77, E336: 78, E337: 79,
    E338: 80, E424: 81, E425: 82, E426: 83,
    E427: 84, E428: 85, E429: 86, E430: 87,
    E431: 88, E432: 89, E433: 90, E434: 91,
    E435: 92, E436: 93, E437: 94, E438: 95,
    E439: 96, E440: 97, E441: 98, E442: 99,
    E443: 100, E444: 101, E445: 102, E446: 103,
    E447: 104, E448: 105, E449: 106, E450: 107,
    E462: 108, E463: 109, E464: 110, E466: 111,
    E467: 112, E468: 113, E469: 114, E470: 115,
    E471: 116, E472: 117, E477: 118, E489: 119,
    E494: 120,
  },
  enemy48: {
    angel: 0, elemental: 1, steelGuard: 2, evilBat: 3,
    bearDown: 4, bearLeft: 5, bearRight: 6, bearUp: 7,
    E343: 8, E344: 9, E345: 10, E372: 11,
    E373: 12, E374: 13, E375: 14, E376: 15,
    E377: 16, E378: 17, E379: 18, E380: 19,
    E381: 20, E382: 21, E383: 22, E384: 23,
    E385: 24, E386: 25, E387: 26, E388: 27,
    E389: 28, E390: 29, E391: 30, E392: 31,
    E393: 32, E394: 33, E395: 34, E396: 35,
    E397: 36, E398: 37, E399: 38, E400: 39,
    E401: 40, E402: 41, E403: 42, E404: 43,
    E405: 44, E483: 45, E484: 46, E485: 47,
    E486: 48,
  },
  items: {
    yellowKey: 0, blueKey: 1, redKey: 2, greenKey: 3,
    steelKey: 4, MagicKey: 5, bigKey: 6, I347: 7,
    earthquake: 8, book: 9, wand: 10, coin: 11,
    fly: 12, centerFly: 13, downFly: 14, upFly: 15,
    redGem: 16, blueGem: 17, greenGem: 18, yellowGem: 19,
    redPotion: 20, bluePotion: 21, greenPotion: 22, yellowPotion: 23,
    poisonWine: 24, weakWine: 25, I348: 26, curseWine: 27,
    superWine: 28, superPotion: 29, skill1: 30, I349: 31,
    I350: 32, lifeWand: 33, I351: 34, I352: 35,
    I353: 36, I354: 37, I355: 38, I356: 39,
    cross: 40, freezeBadge: 41, dagger: 42, bomb: 43,
    icePickaxe: 44, pickaxe: 45, pack: 46, amulet: 47,
    hammer: 48, jumpShoes: 49, sword1: 50, sword2: 51,
    sword3: 52, sword4: 53, sword5: 54, shield1: 55,
    shield2: 56, shield3: 57, shield4: 58, shield5: 59,
    sword0: 60, shield0: 61, I357: 62, I358: 63,
    I359: 64, I360: 65, I361: 66, I362: 67,
    I451: 68, I452: 69, I453: 70, I454: 71,
    I455: 72, I456: 73, I457: 74, I458: 75,
    I496: 76, I497: 77,
  },
  autotile: {
    autotile: 0, autotile1: 0, autotile2: 0, autotile3: 0,
    autotile4: 0, autotile5: 0, autotile6: 0, autotile7: 0, autotile8: 0,
  },
}

/** Hero sprite frame layout: 4 rows (down/left/right/up), 4 columns per row */
export const HERO_FRAMES = {
  down:  { row: 0, stop: 0, leftFoot: 1, rightFoot: 3 },
  left:  { row: 1, stop: 0, leftFoot: 1, rightFoot: 3 },
  right: { row: 2, stop: 0, leftFoot: 1, rightFoot: 3 },
  up:    { row: 3, stop: 0, leftFoot: 1, rightFoot: 3 },
}

/** Columns per row for hero spritesheet (128px / 32px = 4) */
export const HERO_COLS = 4

/**
 * Frames in the restored 2014 tileset that contain no usable artwork.
 * Mobile Phaser builds may use ImageBitmap sources, so canvas pixel
 * inspection cannot be the only protection against these frames.
 */
export const LEGACY_BLANK_TILE_IDS = new Set([
  10133, 20302, 20312, 20316, 20509,
  20519, 20671, 20679, 20852, 20896,
])

/**
 * Get sprite info for a tile ID.
 * Returns { sheet, frame } or null if not found.
 */
export function getTileSprite(
  tileId: number,
  maps: Record<string, { cls: string; id: string }>,
  tilesetFrameCount: number = 2264
): { sheet: SpriteSheetKey; frame: number } | null {
  if (tileId === 0) return null

  if (LEGACY_BLANK_TILE_IDS.has(tileId)) return null

  // Tileset tiles are encoded with two legacy bases in mota-js data:
  // 10xxx and 20xxx both refer to the frame after removing their base. The
  // 20xxx form is common in the restored special floors (e.g. 20706 -> 706).
  // Treating every ID as 10xxx sends those tiles far past the spritesheet and
  // makes them fall back to a dark/black-looking frame.
  if (tileId >= 10000) {
    const base = tileId >= 20000 ? 20000 : 10000
    const frame = tileId - base
    if (frame < 0 || frame >= tilesetFrameCount) return null
    return { sheet: 'tileset', frame }
  }

  const entry = maps[String(tileId)]
  if (!entry) return null

  const { cls, id } = entry

  // Autotile tiles
  if (cls === 'autotile') {
    return { sheet: 'autotile', frame: 0 }
  }

  // Standard sprite sheets: icons value is the ROW index, frame = row * cols.
  const clsMap = ICONS[cls]
  if (!clsMap) return null
  const row = clsMap[id]
  if (row === undefined) return null
  const cols = SHEET_COLS[cls as SpriteSheetKey] ?? 1

  return { sheet: cls as SpriteSheetKey, frame: row * cols }
}
