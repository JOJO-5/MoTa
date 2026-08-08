import { useSyncExternalStore } from 'react'
import { gameStore } from '@modern-mota/core'

export function useGameState() {
  return useSyncExternalStore(
    (onStoreChange) => gameStore.subscribe(onStoreChange),
    () => gameStore.getState().state
  )
}
