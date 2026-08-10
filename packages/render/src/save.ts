import { createInitialState, type GameState } from '@modern-mota/core'

const SAVE_KEY_PREFIX = 'modern-mota-save-'
const MAX_SAVE_SLOTS = 3
const SAVE_VERSION = 2

export type SaveRuntimeState = 'idle' | 'running' | 'waiting' | 'done' | 'error'

export interface SaveSlot {
  id: number
  timestamp: number
  version?: number
  floorId: string
  heroLevel: number
  data: GameState
}

export function canSaveGame(state: GameState, eventState: SaveRuntimeState = 'idle'): boolean {
  return eventState === 'idle' && state.battle === null && state.ui.modal === null
}

function sanitizeState(raw: unknown): GameState | null {
  if (!raw || typeof raw !== 'object') return null
  const candidate = raw as Partial<GameState>
  const hero = candidate.hero
  const position = candidate.position
  const base = createInitialState(
    typeof candidate.floorId === 'string' ? candidate.floorId : 'MT0',
    typeof position?.x === 'number' ? position.x : 6,
    typeof position?.y === 'number' ? position.y : 6
  )

  return {
    ...base,
    ...candidate,
    hero: {
      ...base.hero,
      ...(hero ?? {}),
      keys: { ...base.hero.keys, ...(hero?.keys ?? {}) },
      items: Array.isArray(hero?.items) ? [...hero.items] : [],
      equipment: { ...base.hero.equipment, ...(hero?.equipment ?? {}) },
    },
    position: {
      x: typeof position?.x === 'number' ? position.x : base.position.x,
      y: typeof position?.y === 'number' ? position.y : base.position.y,
    },
    actors: Array.isArray(candidate.actors) ? [...candidate.actors] : [],
    flags: candidate.flags && typeof candidate.flags === 'object' ? { ...candidate.flags } : {},
    values: candidate.values && typeof candidate.values === 'object' ? { ...candidate.values } : {},
    enemys: candidate.enemys && typeof candidate.enemys === 'object' ? { ...candidate.enemys } : {},
    // Dialogues, battle overlays, animations and event generators are transient.
    battle: null,
    ui: { modal: null, floorMsg: null, bgm: null },
    collectedTiles:
      candidate.collectedTiles && typeof candidate.collectedTiles === 'object'
        ? Object.fromEntries(
            Object.entries(candidate.collectedTiles).map(([floorId, locations]) => [
              floorId,
              Array.isArray(locations) ? [...locations] : [],
            ])
          )
        : {},
    visitedFloors: Array.isArray(candidate.visitedFloors) ? [...candidate.visitedFloors] : [],
    tileOverrides:
      candidate.tileOverrides && typeof candidate.tileOverrides === 'object'
        ? JSON.parse(JSON.stringify(candidate.tileOverrides))
        : {},
    floorProperties:
      candidate.floorProperties && typeof candidate.floorProperties === 'object'
        ? JSON.parse(JSON.stringify(candidate.floorProperties))
        : {},
  }
}

export function saveGame(slotId: number, state: GameState): boolean {
  if (slotId < 0 || slotId >= MAX_SAVE_SLOTS) return false
  const data = sanitizeState(state)
  if (!data) return false
  try {
    const save: SaveSlot = {
      id: slotId,
      timestamp: Date.now(),
      version: SAVE_VERSION,
      floorId: data.floorId,
      heroLevel: data.hero.level,
      data,
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
    const parsed = JSON.parse(raw) as Partial<SaveSlot>
    const data = sanitizeState(parsed.data)
    if (!data) return null
    return {
      id: typeof parsed.id === 'number' ? parsed.id : slotId,
      timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : 0,
      version: SAVE_VERSION,
      floorId: data.floorId,
      heroLevel: data.hero.level,
      data,
    }
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
