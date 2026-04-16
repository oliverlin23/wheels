import { describe, it, expect } from 'vitest'
import { startRound, lockWheel, canSpin, confirmSpins, bothConfirmed } from '../src/game/rules/actions'
import type { GameState, HeroState, PlayerState, WheelState } from '../src/game/types'

function makeHero(slot: 'suns' | 'moons'): HeroState {
  return { name: 'warrior', rank: 'bronze', energy: 0, xp: 0, slot }
}

function makePlayer(bulwark: number): PlayerState {
  return { crownHp: 20, bulwark, heroes: [makeHero('suns'), makeHero('moons')] }
}

function makeWheelState(overrides?: Partial<WheelState>): WheelState {
  return {
    spinsRemaining: 3,
    locked: [false, false, false, false, false],
    results: null,
    resultIndices: null,
    ...overrides,
  }
}

function makeGameState(overrides?: Partial<GameState>): GameState {
  return {
    players: [makePlayer(2), makePlayer(0)],
    round: 1,
    wheels: [makeWheelState(), makeWheelState()],
    roundPhase: 'spinning',
    confirmed: [false, false],
    winner: null,
    ...overrides,
  }
}

describe('startRound', () => {
  it('decays bulwark for both players', () => {
    const state = makeGameState()
    const result = startRound(state)
    // Player 0 had bulwark 2 -> decays to 1
    expect(result.state.players[0].bulwark).toBe(1)
    // Player 1 had bulwark 0 -> stays 0
    expect(result.state.players[1].bulwark).toBe(0)
    expect(result.events.length).toBeGreaterThan(0)
  })

  it('resets both wheel states', () => {
    const state = makeGameState({
      wheels: [
        makeWheelState({ spinsRemaining: 0, locked: [true, true, true, true, true] }),
        makeWheelState({ spinsRemaining: 1, locked: [true, false, true, false, true] }),
      ],
    })
    const result = startRound(state)
    for (const ws of result.state.wheels) {
      expect(ws.spinsRemaining).toBe(3)
      expect(ws.locked).toEqual([false, false, false, false, false])
      expect(ws.results).toBeNull()
    }
  })

  it('resets confirmed flags', () => {
    const state = makeGameState({ confirmed: [true, true] })
    const result = startRound(state)
    expect(result.state.confirmed).toEqual([false, false])
  })

  it('sets roundPhase to spinning', () => {
    const state = makeGameState({ roundPhase: 'resolving' })
    const result = startRound(state)
    expect(result.state.roundPhase).toBe('spinning')
  })

  it('does not mutate original state', () => {
    const state = makeGameState()
    const originalBulwark = state.players[0].bulwark
    startRound(state)
    expect(state.players[0].bulwark).toBe(originalBulwark)
  })
})

describe('lockWheel', () => {
  it('toggles a wheel lock on for player 0', () => {
    const state = makeGameState()
    const result = lockWheel(state, 0, 2)
    expect(result.wheels[0].locked[2]).toBe(true)
    expect(result.wheels[0].locked[0]).toBe(false)
  })

  it('toggles a wheel lock on for player 1', () => {
    const state = makeGameState()
    const result = lockWheel(state, 1, 2)
    expect(result.wheels[1].locked[2]).toBe(true)
    expect(result.wheels[0].locked[2]).toBe(false) // player 0 unaffected
  })

  it('toggles a wheel lock off', () => {
    const state = makeGameState({
      wheels: [
        makeWheelState({ spinsRemaining: 2, locked: [false, false, true, false, false] }),
        makeWheelState(),
      ],
    })
    const result = lockWheel(state, 0, 2)
    expect(result.wheels[0].locked[2]).toBe(false)
  })

  it('does not toggle when phase is not spinning', () => {
    const state = makeGameState({ roundPhase: 'resolving' })
    const result = lockWheel(state, 0, 0)
    expect(result.wheels[0].locked[0]).toBe(false)
  })

  it('does not toggle when player has confirmed', () => {
    const state = makeGameState({ confirmed: [true, false] })
    const result = lockWheel(state, 0, 0)
    expect(result.wheels[0].locked[0]).toBe(false)
  })
})

describe('canSpin', () => {
  it('returns true when spins remain and phase is spinning', () => {
    expect(canSpin(makeGameState(), 0)).toBe(true)
    expect(canSpin(makeGameState(), 1)).toBe(true)
  })

  it('returns false when no spins remain', () => {
    const state = makeGameState({
      wheels: [
        makeWheelState({ spinsRemaining: 0 }),
        makeWheelState(),
      ],
    })
    expect(canSpin(state, 0)).toBe(false)
    expect(canSpin(state, 1)).toBe(true)
  })

  it('returns false when phase is not spinning', () => {
    expect(canSpin(makeGameState({ roundPhase: 'resolving' }), 0)).toBe(false)
  })

  it('returns false when player has confirmed', () => {
    const state = makeGameState({ confirmed: [true, false] })
    expect(canSpin(state, 0)).toBe(false)
    expect(canSpin(state, 1)).toBe(true)
  })
})

describe('confirmSpins', () => {
  it('marks player 0 as confirmed', () => {
    const state = makeGameState()
    const result = confirmSpins(state, 0)
    expect(result.confirmed).toEqual([true, false])
  })

  it('marks player 1 as confirmed', () => {
    const state = makeGameState()
    const result = confirmSpins(state, 1)
    expect(result.confirmed).toEqual([false, true])
  })

  it('does not change state when phase is not spinning', () => {
    const state = makeGameState({ roundPhase: 'resolving' })
    const result = confirmSpins(state, 0)
    expect(result.confirmed).toEqual([false, false])
  })
})

describe('bothConfirmed', () => {
  it('returns true when both players confirmed', () => {
    const state = makeGameState({ confirmed: [true, true] })
    expect(bothConfirmed(state)).toBe(true)
  })

  it('returns false when only one confirmed', () => {
    expect(bothConfirmed(makeGameState({ confirmed: [true, false] }))).toBe(false)
    expect(bothConfirmed(makeGameState({ confirmed: [false, true] }))).toBe(false)
  })

  it('returns false when neither confirmed', () => {
    expect(bothConfirmed(makeGameState())).toBe(false)
  })
})
