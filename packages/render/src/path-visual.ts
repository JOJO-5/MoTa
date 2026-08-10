import type { Direction, Position } from '@modern-mota/core'

export type RoutePoint = Position & { direction: Direction }

export function buildRoutePoints(start: Position, path: Direction[]): RoutePoint[] {
  const position = { ...start }

  return path.map((direction) => {
    if (direction === 'up') position.y--
    if (direction === 'down') position.y++
    if (direction === 'left') position.x--
    if (direction === 'right') position.x++
    return { ...position, direction }
  })
}
