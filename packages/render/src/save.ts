import type { GameState } from '@modern-mota/core'

const SAVE_KEY_PREFIX = 'modern-mota-save-'
const MAX_SAVE_SLOTS = 3

export interface SaveSlot {
  id: number
  timestamp: number
  floorId: string
  heroLevel: number
  data: GameState
}

export function saveGame(slotId: number, state: GameState): boolean {
  if (slotId < 0 || slotId >= MAX_SAVE_SLOTS) return false
  try {
    const save: SaveSlot = {
      id: slotId,
      timestamp: Date.now(),
      floorId: state.floorId,
      heroLevel: state.hero.level,
      data: state,
    }
    localStorage.setItem(`${SAVE_KEY_PREFIX}${slotId}`, JSON.stringify(save))
    return true
  } catch {
    return false
  }
}

export function loadGame(slotId: number): SaveSlot | null {
  if (slotId < 0 || slotId >= MAX_SAVE_SLOTS) return null
  try {
    const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slotId}`)
    if (!raw) return null
    return JSON.parse(raw) as SaveSlot
  } catch {
    return null
  }
}

export function deleteSave(slotId: number): boolean {
  if (slotId < 0 || slotId >= MAX_SAVE_SLOTS) return false
  try {
    localStorage.removeItem(`${SAVE_KEY_PREFIX}${slotId}`)
    return true
  } catch {
    return false
  }
}

export function listSaves(): (SaveSlot | null)[] {
  return Array.from({ length: MAX_SAVE_SLOTS }, (_, i) => loadGame(i))
}
