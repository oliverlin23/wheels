import type { GameState, LogEvent, PlayerState } from '../types'
import { decayBulwark } from './bulwark'

export function startTurn(state: GameState): { state: GameState; events: LogEvent[] } {
  const currentPlayer = state.players[state.currentPlayer]
  const { player: decayedPlayer, events } = decayBulwark(currentPlayer)

  const newPlayers: [PlayerState, PlayerState] =
    state.currentPlayer === 0
      ? [decayedPlayer, state.players[1]]
      : [state.players[0], decayedPlayer]

  return {
    state: {
      ...state,
      players: newPlayers,
      wheels: {
        spinsRemaining: 3,
        locked: [false, false, false, false, false],
        results: null,
        resultIndices: null,
      },
    },
    events,
  }
}

export function lockWheel(state: GameState, wheelIndex: number): GameState {
  if (state.phase !== 'spinning' || state.wheels.spinsRemaining <= 0) {
    return state
  }

  const locked = state.wheels.locked
  const toggle = (i: number): boolean => (i === wheelIndex ? !locked[i] : locked[i])
  const newLocked: [boolean, boolean, boolean, boolean, boolean] = [
    toggle(0),
    toggle(1),
    toggle(2),
    toggle(3),
    toggle(4),
  ]

  return {
    ...state,
    wheels: {
      ...state.wheels,
      locked: newLocked,
    },
  }
}

export function canSpin(state: GameState): boolean {
  return state.phase === 'spinning' && state.wheels.spinsRemaining > 0
}

export function allLocked(state: GameState): boolean {
  return state.wheels.locked.every((l) => l)
}

export function endTurn(state: GameState): GameState {
  return {
    ...state,
    currentPlayer: state.currentPlayer === 0 ? 1 : 0,
    turn: state.turn + 1,
  }
}
