export type StairLocation = [number, number]

export interface StairMetadata {
  upFloor?: unknown
  downFloor?: unknown
}

export function getStairPoints(changeFloor: Record<string, unknown> | undefined): StairLocation[] {
  if (!changeFloor) return []
  return Object.keys(changeFloor).flatMap((key) => {
    const [x, y] = key.split(',').map(Number)
    return Number.isInteger(x) && Number.isInteger(y) ? [[x, y] as StairLocation] : []
  })
}

function asStairLocation(value: unknown): StairLocation | undefined {
  if (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((part) => typeof part === 'number')
  ) {
    return [value[0] as number, value[1] as number]
  }
  return undefined
}

/**
 * Resolve the landing cell for a legacy stair link.
 *
 * A destination floor can contain several stairs of the same tile type, so
 * scanning the map is only a compatibility fallback. The floor metadata is
 * the authoritative landing point.
 */
export function resolveStairLanding(
  target: StairMetadata,
  destinationStair: string | undefined,
  map: number[][]
): StairLocation | undefined {
  const declaredLanding =
    destinationStair === 'downFloor'
      ? asStairLocation(target.downFloor)
      : destinationStair === 'upFloor'
        ? asStairLocation(target.upFloor)
        : undefined
  if (declaredLanding) return declaredLanding

  const targetTile =
    destinationStair === 'downFloor' ? 88 : destinationStair === 'upFloor' ? 87 : null
  if (targetTile === null) return undefined

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < (map[0]?.length ?? 0); x++) {
      if (map[y]?.[x] === targetTile) return [x, y]
    }
  }
  return undefined
}
