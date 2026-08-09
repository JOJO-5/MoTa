import { gameStore, dispatch } from '@modern-mota/core'
import type { GameState } from '@modern-mota/core'
import type { Floor, TowerContent } from '@modern-mota/data'
import { loadTowerContent } from '@modern-mota/data'

export type StateListener = (state: GameState) => void
const listeners = new Set<StateListener>()

export function subscribeState(listener: StateListener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

let towerData: TowerContent | null = null

;(globalThis as Record<string, unknown>)['__towerData'] = null

export async function initTower(gameId: string) {
  console.log('[bridge] initTower called, gameId:', gameId)
  try {
    const root = `./content/${gameId}`
    console.log('[bridge] loading from:', root)
    towerData = await loadTowerContent(root)
    console.log('[bridge] loaded, floors:', Object.keys(towerData.floors).length)
    ;(globalThis as Record<string, unknown>)['__towerData'] = towerData
    // Populate enemy data into the store so event-machine battles can resolve enemies
    dispatch({ type: 'SET_ENEMYS', enemys: towerData.enemys })
    const firstFloorId = towerData.main.startFloorId ?? towerData.main.floorIds[0]
    const firstFloor = towerData.floors[firstFloorId]
    console.log('[bridge] firstFloor:', firstFloorId)
    if (firstFloor) {
      dispatch({
        type: 'ENTER_FLOOR',
        floorId: firstFloorId,
        position: { x: 6, y: 6 },
        direction: 'up',
      })
      console.log('[bridge] dispatched, floorId:', firstFloorId)
    }
    return towerData
  } catch (err) {
    console.error('[bridge] initTower failed:', err)
    throw err
  }
}

export function getTowerData() {
  return towerData
}

export function getCurrentFloor(): Floor | null {
  if (!towerData) return null
  const { state } = gameStore.getState()
  return towerData.floors[state.floorId] ?? null
}
