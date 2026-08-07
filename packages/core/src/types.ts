export type Direction = 'up' | 'down' | 'left' | 'right'

export interface Position {
  x: number
  y: number
}

export interface HeroSnapshot {
  hp: number
  hpMax: number
  atk: number
  def: number
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
  battle: BattleSnapshot | null
  ui: UiSnapshot
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
  | { type: 'SET_FLAG'; name: string; value: unknown }
  | { type: 'SET_VALUE'; name: string; value: number }
  | { type: 'ADD_ITEM'; itemId: string }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'USE_KEY'; keyType: string }
  | { type: 'SET_BATTLE'; battle: BattleSnapshot | null }
  | { type: 'SET_UI'; ui: Partial<UiSnapshot> }
  | { type: 'LOAD_STATE'; state: GameState }
  | { type: 'RESET' }
