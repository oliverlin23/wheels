import type { GameState, LogEvent, Panel, WheelState } from '../types'
import { decayBulwark } from './bulwark'
import { rollWheelWithIndex } from '../rng'

const INITIAL_WHEEL_STATE = {
  spinsRemaining: 3,
  locked: [false, false, false, false, false] as [boolean, boolean, boolean, boolean, boolean],
  results: null,
  resultIndices: null,
}

/** Start a new round: decay bulwark for BOTH players, reset BOTH wheel states. */
export function startRound(state: GameState): { state: GameState; events: LogEvent[] } {
  const events: LogEvent[] = []

  const { player: p0, events: e0 } = decayBulwark(state.players[0])
  const { player: p1, events: e1 } = decayBulwark(state.players[1])
  events.push(...e0, ...e1)

  return {
    state: {
      ...state,
      players: [p0, p1],
      wheels: [{ ...INITIAL_WHEEL_STATE }, { ...INITIAL_WHEEL_STATE }],
      roundPhase: 'spinning',
      confirmed: [false, false],
    },
    events,
  }
}

/** Spin a specific player's wheels. */
export function spin(
  state: GameState,
  playerIndex: 0 | 1,
  rng: () => number,
  wheels: Panel[][],
): GameState {
  const ws = state.wheels[playerIndex]
  if (state.roundPhase !== 'spinning' || ws.spinsRemaining <= 0 || state.confirmed[playerIndex]) {
    return state
  }

  const rolls = ([0, 1, 2, 3, 4] as const).map((i) => {
    if (ws.locked[i] && ws.results && ws.resultIndices) {
      return { panel: ws.results[i], index: ws.resultIndices[i] }
    }
    return rollWheelWithIndex(rng, i, wheels[i])
  })

  const newWs = {
    ...ws,
    results: rolls.map((r) => r.panel) as [Panel, Panel, Panel, Panel, Panel],
    resultIndices: rolls.map((r) => r.index) as [number, number, number, number, number],
    spinsRemaining: ws.spinsRemaining - 1,
  }

  const newWheels: [WheelState, WheelState] = playerIndex === 0
    ? [newWs, state.wheels[1]]
    : [state.wheels[0], newWs]

  return { ...state, wheels: newWheels }
}

/** Lock/unlock a specific player's wheel. */
export function lockWheel(state: GameState, playerIndex: 0 | 1, wheelIndex: number): GameState {
  if (state.roundPhase !== 'spinning' || state.confirmed[playerIndex]) {
    return state
  }

  const ws = state.wheels[playerIndex]
  const locked = ws.locked
  const toggle = (i: number): boolean => (i === wheelIndex ? !locked[i] : locked[i])
  const newLocked: [boolean, boolean, boolean, boolean, boolean] = [
    toggle(0), toggle(1), toggle(2), toggle(3), toggle(4),
  ]

  const newWs = { ...ws, locked: newLocked }
  const newWheels = playerIndex === 0
    ? [newWs, state.wheels[1]] as [typeof newWs, typeof newWs]
    : [state.wheels[0], newWs] as [typeof newWs, typeof newWs]

  return { ...state, wheels: newWheels }
}

/** Mark a player as done spinning. */
export function confirmSpins(state: GameState, playerIndex: 0 | 1): GameState {
  if (state.roundPhase !== 'spinning') return state

  const newConfirmed: [boolean, boolean] = playerIndex === 0
    ? [true, state.confirmed[1]]
    : [state.confirmed[0], true]

  return { ...state, confirmed: newConfirmed }
}

/** Check if both players are done spinning. */
export function bothConfirmed(state: GameState): boolean {
  return state.confirmed[0] && state.confirmed[1]
}

/** Transition to reveal phase. */
export function revealWheels(state: GameState): GameState {
  return { ...state, roundPhase: 'reveal' }
}

/** Check if a player can still spin. */
export function canSpin(state: GameState, playerIndex: 0 | 1): boolean {
  return (
    state.roundPhase === 'spinning' &&
    state.wheels[playerIndex].spinsRemaining > 0 &&
    !state.confirmed[playerIndex]
  )
}
