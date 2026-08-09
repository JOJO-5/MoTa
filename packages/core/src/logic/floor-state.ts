import type { GameState, RuntimeTileValue, TileOverride } from '../types.js'

export type TileLayer = 'map' | 'bgmap' | 'fgmap'

export type TileMapInfo = {
  id: string
  canPass?: boolean
  cls?: string
  doorInfo?: unknown
}

function overridesFor(state: GameState, floorId: string) {
  return state.tileOverrides?.[floorId] ?? {}
}

export function getRuntimeLayer(
  floorId: string,
  layer: TileLayer,
  base: number[][],
  state: GameState
): Array<Array<RuntimeTileValue>> {
  const overrides = overridesFor(state, floorId)
  return base.map((row, y) =>
    row.map((value, x) => {
      const override = overrides[`${x},${y}`]
      if (override?.hidden) return 0
      return override && override[layer] !== undefined
        ? (override[layer] as RuntimeTileValue)
        : value
    })
  )
}

export function resolveRuntimeTileValue(
  value: RuntimeTileValue,
  maps: Record<string, TileMapInfo> | undefined | null
): number {
  if (value === null || value === 'null') return 0
  if (typeof value === 'number') return value
  const numericId = Number(value)
  if (Number.isInteger(numericId) && String(numericId) === value) return numericId
  const match = Object.entries(maps ?? {}).find(([, entry]) => entry.id === value)
  return match ? Number(match[0]) : 0
}

export function getRuntimeMap(
  floorId: string,
  base: number[][],
  state: GameState,
  maps: Record<string, TileMapInfo> | undefined | null = null
): number[][] {
  return getRuntimeLayer(floorId, 'map', base, state).map((row) =>
    row.map((value) => resolveRuntimeTileValue(value, maps))
  )
}

export function getHiddenTiles(floorId: string, state: GameState): Set<string> {
  return new Set(
    Object.entries(overridesFor(state, floorId))
      .filter(([, override]) => override.hidden)
      .map(([key]) => key)
  )
}

export function getTileOpacities(floorId: string, state: GameState): Record<string, number> {
  return Object.fromEntries(
    Object.entries(overridesFor(state, floorId))
      .filter(([, override]) => override.opacity !== undefined)
      .map(([key, override]) => [key, Math.max(0, Math.min(1, override.opacity as number))])
  )
}

export function getTileOverride(
  floorId: string,
  x: number,
  y: number,
  state: GameState
): TileOverride | undefined {
  return overridesFor(state, floorId)[`${x},${y}`]
}
