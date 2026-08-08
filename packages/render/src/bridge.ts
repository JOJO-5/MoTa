import { gameStore, dispatch } from '@modern-mota/core'
import type { GameState } from '@modern-mota/core'
import type { Floor } from '@modern-mota/data'
import { loadTowerContent } from '@modern-mota/data'

export type StateListener = (state: GameState) => void
const listeners = new Set<StateListener>()

export function subscribeState(listener: StateListener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

let towerData: Awaited<ReturnType<typeof loadTowerContent>> | null = null

export async function initTower(gameId: string) {
  const root = `./content/${gameId}`
  towerData = await loadTowerContent(root)
  const firstFloorId = towerData.main.floorIds[0]
  const firstFloor = towerData.floors[firstFloorId]
  if (firstFloor) {
    dispatch({ type: 'SET_FLOOR', floorId: firstFloorId })
    dispatch({ type: 'SET_POSITION', position: { x: 6, y: 6 } })
    dispatch({ type: 'SET_DIRECTION', direction: 'up' })
  }
  return towerData
}

export function getTowerData() {
  return towerData
}

export function getCurrentFloor(): Floor | null {
  if (!towerData) return null
  return towerData.floors[gameStore.getState().state.floorId] ?? null
}
