export const AUTOTILE_SHAPES: Record<number, number[]> = {
  // tileId -> [bitmask pattern]
  // 0: all sides solid
  // Simplified autotile: uses 4-bit neighbor detection
}

export function getAutotileBitmask(
  x: number, y: number,
  map: number[][],
  tileId: number
): number {
  const rows = map.length
  const cols = map[0].length
  let bit = 0
  if (y > 0 && map[y - 1][x] === tileId) bit |= 1   // top
  if (y < rows - 1 && map[y + 1][x] === tileId) bit |= 2 // bottom
  if (x > 0 && map[y][x - 1] === tileId) bit |= 4   // left
  if (x < cols - 1 && map[y][x + 1] === tileId) bit |= 8 // right
  return bit
}
