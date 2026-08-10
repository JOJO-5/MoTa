import { State, dispatch } from '../state/store.js'
import type { Direction, Position } from '../types.js'
import type { Floor } from '@modern-mota/data'
import { resolveStepHazards } from './step-hazards.js'

export type MapBlockInfo = {
  cls: string
  id: string
  canPass?: boolean
  doorInfo?: unknown
}

/** Blocking terrain ids that don't carry doorInfo in this project. */
const BLOCKING_TERRAIN_IDS = new Set([
  'sWallT',
  'sWallL',
  'sWallR',
  'sWallB',
  'sWallTL',
  'sWallTR',
  'sWallBL',
  'sWallBR',
  'sWallTB',
  'sWallLR',
  'sWallBLR',
  'sWallTLR',
  'sWallTBR',
  'sWallTBL',
])

/**
 * Determine whether a tile blocks hero movement.
 *
 * Rules (matching original mota-js behaviour):
 * - 0 is always passable.
 * - Any tile with `canPass: true` is passable (e.g. stairs mapped as tileset tiles).
 * - Tileset ids (>= 10000) are blocking by default (used for walls), unless canPass.
 * - Any tile with `doorInfo` is a wall/door and blocks.
 * - Specific terrain ids known to be walls block.
 * - Everything else (items, enemies, npcs, autotiles, stairs) is passable.
 */
export function isBlocked(
  tileId: number,
  maps: Record<string, MapBlockInfo> | undefined | null
): boolean {
  if (tileId === 0) return false

  const entry = maps?.[String(tileId)]
  if (entry?.canPass) return false

  if (tileId >= 10000) return true
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

const PATH_DIRECTIONS: Array<{ direction: Direction; dx: number; dy: number }> = [
  { direction: 'up', dx: 0, dy: -1 },
  { direction: 'down', dx: 0, dy: 1 },
  { direction: 'left', dx: -1, dy: 0 },
  { direction: 'right', dx: 1, dy: 0 },
]

export function findPath(
  start: Position,
  target: Position,
  floor: Pick<Floor, 'map' | 'cannotMove' | 'changeFloor'>,
  maps?: Record<string, MapBlockInfo> | null,
  options: { allowBlockedTarget?: boolean } = {}
): Direction[] | null {
  const rows = floor.map.length
  const cols = floor.map[0]?.length ?? 0
  if (
    start.x < 0 ||
    start.y < 0 ||
    target.x < 0 ||
    target.y < 0 ||
    start.x >= cols ||
    target.x >= cols ||
    start.y >= rows ||
    target.y >= rows
  ) {
    return null
  }
  if (start.x === target.x && start.y === target.y) return []

  const queue: Array<{ position: Position; path: Direction[] }> = [{ position: start, path: [] }]
  const visited = new Set([`${start.x},${start.y}`])

  for (let index = 0; index < queue.length; index++) {
    const current = queue[index]
    for (const { direction, dx, dy } of PATH_DIRECTIONS) {
      if (isCannotMove(floor, current.position.x, current.position.y, direction)) continue
      const next = { x: current.position.x + dx, y: current.position.y + dy }
      if (next.x < 0 || next.y < 0 || next.x >= cols || next.y >= rows) continue
      const key = `${next.x},${next.y}`
      if (visited.has(key)) continue

      const isTarget = next.x === target.x && next.y === target.y
      const isStair = floor.changeFloor?.[key] != null
      const blocked = !isStair && isBlocked(floor.map[next.y][next.x], maps)
      if (blocked && !(isTarget && options.allowBlockedTarget)) continue

      const path = [...current.path, direction]
      if (isTarget) return path
      visited.add(key)
      queue.push({ position: next, path })
    }
  }

  return null
}

export function moveHero(
  direction: Direction,
  floor: Pick<Floor, 'map' | 'cannotMove' | 'changeFloor'> & { floorId?: string },
  maps?: Record<string, MapBlockInfo> | null
): boolean {
  if (State.hero.hp <= 0) return false
  const { position } = State
  const nextPos: Position = { ...position }

  switch (direction) {
    case 'up':
      nextPos.y -= 1
      break
    case 'down':
      nextPos.y += 1
      break
    case 'left':
      nextPos.x -= 1
      break
    case 'right':
      nextPos.x += 1
      break
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

  // Validate collision (stairs listed in changeFloor are always passable)
  const isStair = floor.changeFloor?.[`${nextPos.x},${nextPos.y}`] != null
  const targetTile = floorMap[nextPos.y][nextPos.x]
  if (!isStair && isBlocked(targetTile, maps)) {
    return false
  }

  dispatch({ type: 'SET_POSITION', position: nextPos })
  dispatch({ type: 'SET_DIRECTION', direction })
  if (State.flags.poison) {
    dispatch({ type: 'SET_HERO', hero: { hp: Math.max(0, State.hero.hp - 10) } })
  }
  const hazards = resolveStepHazards(
    nextPos,
    floorMap,
    maps ?? undefined,
    State.enemys,
    State.hero.hp,
    State.flags
  )
  if (hazards.damage > 0) {
    dispatch({ type: 'SET_HERO', hero: { hp: Math.max(0, State.hero.hp - hazards.damage) } })
    dispatch({
      type: 'SET_UI',
      ui: { floorMsg: `受到${hazards.types.join('、') || '额外'}${hazards.damage}点伤害` },
    })
  }
  for (const repulse of hazards.repulses) {
    dispatch({
      type: 'SET_TILE_OVERRIDE',
      floorId: floor.floorId ?? State.floorId,
      x: repulse.from.x,
      y: repulse.from.y,
      override: { hidden: true },
    })
    dispatch({
      type: 'SET_TILE_OVERRIDE',
      floorId: floor.floorId ?? State.floorId,
      x: repulse.to.x,
      y: repulse.to.y,
      override: { map: repulse.map, hidden: false },
    })
  }
  return true
}
