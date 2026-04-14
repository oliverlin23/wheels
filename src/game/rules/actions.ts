import type { GameState, LogEvent, Panel, PlayerState } from '../types'
import { decayBulwark } from './bulwark'
import { rollWheelWithIndex } from '../rng'

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

export function spin(
  state: GameState,
  rng: () => number,
  wheels: Panel[][],
): GameState {
  if (state.phase !== 'spinning' || state.wheels.spinsRemaining <= 0) return state
  const rolls = ([0, 1, 2, 3, 4] as const).map((i) => {
    if (state.wheels.locked[i] && state.wheels.results && state.wheels.resultIndices) {
      return { panel: state.wheels.results[i], index: state.wheels.resultIndices[i] }
    }
    return rollWheelWithIndex(rng, i, wheels[i])
  })
  return {
    ...state,
    wheels: {
      ...state.wheels,
      results: rolls.map((r) => r.panel) as [Panel, Panel, Panel, Panel, Panel],
      resultIndices: rolls.map((r) => r.index) as [number, number, number, number, number],
      spinsRemaining: state.wheels.spinsRemaining - 1,
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
