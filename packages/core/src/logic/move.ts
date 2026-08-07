import { State, dispatch } from '../state/store.js'
import { Direction, Position } from '../types.js'

export function moveHero(direction: Direction, floorMap: number[][]) {
  const { position } = State
  const nextPos: Position = { ...position }

  switch (direction) {
    case 'up': nextPos.y -= 1; break
    case 'down': nextPos.y += 1; break
    case 'left': nextPos.x -= 1; break
    case 'right': nextPos.x += 1; break
  }

  // Validate bounds
  if (nextPos.y < 0 || nextPos.y >= floorMap.length || 
      nextPos.x < 0 || nextPos.x >= floorMap[0].length) {
    return false // Out of bounds
  }

  // Validate collision (assuming 0 is pass, > 0 is block - refine as needed)
  if (floorMap[nextPos.y][nextPos.x] !== 0) {
    return false // Blocked
  }

  dispatch({ type: 'SET_POSITION', position: nextPos })
  dispatch({ type: 'SET_DIRECTION', direction })
  return true
}