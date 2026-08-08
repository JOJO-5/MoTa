import { State, dispatch } from '../state/store.js'
import type { Direction, Position } from '../types.js'
import type { Floor } from '@modern-mota/data'

export type MapBlockInfo = {
  cls: string
  id: string
  doorInfo?: unknown
}

/** Blocking terrain ids that don't carry doorInfo in this project. */
const BLOCKING_TERRAIN_IDS = new Set([
  'sWallT', 'sWallL', 'sWallR', 'sWallB',
  'sWallTL', 'sWallTR', 'sWallBL', 'sWallBR',
  'sWallTB', 'sWallLR', 'sWallBLR', 'sWallTLR', 'sWallTBR', 'sWallTBL',
])

/**
 * Determine whether a tile blocks hero movement.
 *
 * Rules (matching original mota-js behaviour):
 * - 0 is always passable.
 * - Tileset ids (>= 10000) are blocking by default (used for walls).
 * - Any tile with `doorInfo` is a wall/door and blocks.
 * - Specific terrain ids known to be walls block.
 * - Everything else (items, enemies, npcs, autotiles, stairs) is passable.
 */
export function isBlocked(
  tileId: number,
  maps: Record<string, MapBlockInfo> | undefined | null
): boolean {
  if (tileId === 0) return false
  if (tileId >= 10000) return true

  const entry = maps?.[String(tileId)]
  if (!entry) return false

  if (entry.doorInfo != null) return true
  if (entry.cls === 'terrains' && BLOCKING_TERRAIN_IDS.has(entry.id)) return true

  return false
}

/**
 * Check whether a direction from a position is blocked by the floor's
 * `cannotMove` metadata.
 */
function isCannotMove(
  floor: Pick<Floor, 'cannotMove'>,
  x: number,
  y: number,
  direction: Direction
): boolean {
  const blocked = floor.cannotMove?.[`${x},${y}`]
  if (!Array.isArray(blocked)) return false
  return blocked.some((d) => d === direction)
}

export function moveHero(
  direction: Direction,
  floor: Pick<Floor, 'map' | 'cannotMove'>,
  maps?: Record<string, MapBlockInfo> | null
): boolean {
  const { position } = State
  const nextPos: Position = { ...position }

  switch (direction) {
    case 'up': nextPos.y -= 1; break
    case 'down': nextPos.y += 1; break
    case 'left': nextPos.x -= 1; break
    case 'right': nextPos.x += 1; break
  }

  const floorMap = floor.map
  const rows = floorMap.length
  const cols = floorMap[0]?.length ?? 0

  // Validate bounds
  if (nextPos.y < 0 || nextPos.y >= rows || nextPos.x < 0 || nextPos.x >= cols) {
    return false
  }

  // Validate floor-specific cannotMove
  if (isCannotMove(floor, position.x, position.y, direction)) {
    return false
  }

  // Validate collision
  const targetTile = floorMap[nextPos.y][nextPos.x]
  if (isBlocked(targetTile, maps)) {
    return false
  }

  dispatch({ type: 'SET_POSITION', position: nextPos })
  dispatch({ type: 'SET_DIRECTION', direction })
  return true
}
