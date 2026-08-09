export type Direction = 'up' | 'down' | 'left' | 'right'

import type { Enemy } from '@modern-mota/data'

export interface Position {
  x: number
  y: number
}

export interface HeroSnapshot {
  hp: number
  hpMax: number
  atk: number
  def: number
  mdef: number
  money: number
  exp: number
  level: number
  keys: Record<string, number>
  items: string[]
  equipment: {
    weapon?: string
    shield?: string
    accessory?: string
  }
}

export interface ActorSnapshot {
  id: string
  x: number
  y: number
  sprite?: string
  direction?: Direction
}

export interface GameState {
  hero: HeroSnapshot
  floorId: string
  position: Position
  direction: Direction
  actors: ActorSnapshot[]
  flags: Record<string, unknown>
  values: Record<string, number>
  enemys: Record<string, Enemy>
  battle: BattleSnapshot | null
  ui: UiSnapshot
  /** Tiles picked up / cleared per floor: floorId -> ["x,y", ...] */
  collectedTiles: Record<string, string[]>
  /** Floors that have been entered, in first-visit order. */
  visitedFloors: string[]
  /** Runtime tile changes keyed by floor and coordinate; source JSON stays immutable. */
  tileOverrides: Record<string, Record<string, TileOverride>>
}

export type RuntimeTileValue = number | string | null

export interface TileOverride {
  map?: RuntimeTileValue
  bgmap?: RuntimeTileValue
  fgmap?: RuntimeTileValue
  hidden?: boolean
  opacity?: number
}

export interface BattleSnapshot {
  enemyId: string
  enemyHp: number
  turns: number
}

export interface UiSnapshot {
  modal: string | null
  floorMsg: string | null
  bgm: string | null
}

export type GameAction =
  | { type: 'SET_HERO'; hero: Partial<HeroSnapshot> }
  | { type: 'SET_FLOOR'; floorId: string }
  | { type: 'SET_POSITION'; position: Position }
  | { type: 'SET_DIRECTION'; direction: Direction }
  | { type: 'ENTER_FLOOR'; floorId: string; position?: Position; direction?: Direction }
  | { type: 'MARK_FLOOR_VISITED'; floorId: string }
  | { type: 'SET_TILE_OVERRIDE'; floorId: string; x: number; y: number; override: TileOverride }
  | { type: 'CLEAR_TILE_OVERRIDE'; floorId: string; x: number; y: number }
  | { type: 'SET_FLAG'; name: string; value: unknown }
  | { type: 'SET_VALUE'; name: string; value: number }
  | { type: 'ADD_ITEM'; itemId: string }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'USE_KEY'; keyType: string }
  | { type: 'SET_BATTLE'; battle: BattleSnapshot | null }
  | { type: 'SET_UI'; ui: Partial<UiSnapshot> }
  | { type: 'SET_ENEMYS'; enemys: Record<string, Enemy> }
  | { type: 'COLLECT_TILE'; floorId: string; x: number; y: number }
  | { type: 'LOAD_STATE'; state: GameState }
  | { type: 'RESET' }
