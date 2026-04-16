import type { FigurineName, GameState, LogEvent, WheelState } from '../game/types'

export type RoomPhase = 'lobby' | 'hero-select' | 'playing' | 'done'

export type LobbyPlayer = { id: string; name: string; ready: boolean }

// Client -> Server messages
export type ClientMessage =
  | { type: 'SELECT_HEROES'; heroes: [FigurineName, FigurineName] }
  | { type: 'SPIN' }
  | { type: 'LOCK_WHEEL'; index: number }
  | { type: 'CONFIRM' }
  | { type: 'REMATCH' }

// Server -> Client messages
export type ServerMessage =
  | { type: 'LOBBY_STATE'; players: LobbyPlayer[]; spectators: number; phase: RoomPhase; yourPlayer?: 0 | 1 | 'spectator' }
  | { type: 'MATCH_START'; game: GameState; yourPlayer: 0 | 1 | 'spectator' }
  | { type: 'YOUR_WHEELS'; wheels: WheelState; spinIndices?: number[] }
  | { type: 'OPPONENT_READY' }
  | { type: 'CONFIRMED' }
  | { type: 'REVEAL'; game: GameState }
  | { type: 'RESOLVE_UPDATE'; game: GameState; events: LogEvent[] }
  | { type: 'RETURN_TO_LOBBY' }
  | { type: 'ERROR'; message: string }
