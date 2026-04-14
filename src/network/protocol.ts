import type { FigurineName, GameState, LogEvent } from '../game/types'

// Room phases
export type RoomPhase = 'lobby' | 'hero-select' | 'playing' | 'done'

export type LobbyPlayer = { id: string; name: string; ready: boolean }

// Client -> Server messages
export type ClientMessage =
  | { type: 'SELECT_HEROES'; heroes: [FigurineName, FigurineName] }
  | { type: 'SPIN' }
  | { type: 'LOCK_WHEEL'; index: number }

// Server -> Client messages
export type ServerMessage =
  | { type: 'LOBBY_STATE'; players: LobbyPlayer[]; spectators: number; phase: RoomPhase }
  | { type: 'MATCH_START'; game: GameState; yourPlayer: 0 | 1 | 'spectator' }
  | { type: 'STATE_UPDATE'; game: GameState; events: LogEvent[]; spinIndices?: number[] }
  | { type: 'ERROR'; message: string }
