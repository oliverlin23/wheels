import { describe, it, expect } from 'vitest'
import { startTurn, lockWheel, canSpin, allLocked, endTurn } from '../src/game/rules/actions'
import type { GameState, HeroState, PlayerState } from '../src/game/types'

function makeHero(slot: 'squares' | 'diamonds'): HeroState {
  return { name: 'warrior', rank: 'bronze', energy: 0, xp: 0, slot }
}

function makePlayer(bulwark: number): PlayerState {
  return { crownHp: 20, bulwark, heroes: [makeHero('squares'), makeHero('diamonds')] }
}

function makeGameState(overrides?: Partial<GameState>): GameState {
  return {
    players: [makePlayer(2), makePlayer(0)],
    currentPlayer: 0,
    turn: 1,
    wheels: {
      spinsRemaining: 3,
      locked: [false, false, false, false, false],
      results: null,
    },
    phase: 'spinning',
    winner: null,
    ...overrides,
  }
}

describe('startTurn', () => {
  it('decays bulwark for current player', () => {
    const state = makeGameState()
    const result = startTurn(state)
    expect(result.state.players[0].bulwark).toBe(1)
    expect(result.events.length).toBeGreaterThan(0)
  })

  it('resets wheel state', () => {
    const state = makeGameState({
      wheels: {
        spinsRemaining: 0,
        locked: [true, true, true, true, true],
        results: null,
      },
    })
    const result = startTurn(state)
    expect(result.state.wheels.spinsRemaining).toBe(3)
    expect(result.state.wheels.locked).toEqual([false, false, false, false, false])
    expect(result.state.wheels.results).toBeNull()
  })

  it('does not mutate original state', () => {
    const state = makeGameState()
    const originalBulwark = state.players[0].bulwark
    startTurn(state)
    expect(state.players[0].bulwark).toBe(originalBulwark)
  })
})

describe('lockWheel', () => {
  it('toggles a wheel lock on', () => {
    const state = makeGameState()
    const result = lockWheel(state, 2)
    expect(result.wheels.locked[2]).toBe(true)
    expect(result.wheels.locked[0]).toBe(false)
  })

  it('toggles a wheel lock off', () => {
    const state = makeGameState({
      wheels: {
        spinsRemaining: 2,
        locked: [false, false, true, false, false],
        results: null,
      },
    })
    const result = lockWheel(state, 2)
    expect(result.wheels.locked[2]).toBe(false)
  })

  it('does not toggle when no spins remain', () => {
    const state = makeGameState({
      wheels: { spinsRemaining: 0, locked: [false, false, false, false, false], results: null },
    })
    const result = lockWheel(state, 0)
    expect(result.wheels.locked[0]).toBe(false)
  })

  it('does not toggle when phase is not spinning', () => {
    const state = makeGameState({ phase: 'resolving' })
    const result = lockWheel(state, 0)
    expect(result.wheels.locked[0]).toBe(false)
  })
})

describe('canSpin', () => {
  it('returns true when spins remain and phase is spinning', () => {
    expect(canSpin(makeGameState())).toBe(true)
  })

  it('returns false when no spins remain', () => {
    const state = makeGameState({
      wheels: { spinsRemaining: 0, locked: [false, false, false, false, false], results: null },
    })
    expect(canSpin(state)).toBe(false)
  })

  it('returns false when phase is not spinning', () => {
    expect(canSpin(makeGameState({ phase: 'resolving' }))).toBe(false)
  })
})

describe('allLocked', () => {
  it('returns true when all wheels are locked', () => {
    const state = makeGameState({
      wheels: { spinsRemaining: 2, locked: [true, true, true, true, true], results: null },
    })
    expect(allLocked(state)).toBe(true)
  })

  it('returns false when some wheels are unlocked', () => {
    expect(allLocked(makeGameState())).toBe(false)
  })
})

describe('endTurn', () => {
  it('switches player from 0 to 1', () => {
    const result = endTurn(makeGameState({ currentPlayer: 0 }))
    expect(result.currentPlayer).toBe(1)
  })

  it('switches player from 1 to 0', () => {
    const result = endTurn(makeGameState({ currentPlayer: 1 }))
    expect(result.currentPlayer).toBe(0)
  })

  it('increments turn', () => {
    const state = makeGameState({ turn: 5 })
    const result = endTurn(state)
    expect(result.turn).toBe(6)
  })
})
