import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, createInitialGameState } from '../src/store/game'
import { useLogStore } from '../src/store/log'
import { createRng } from '../src/game/rng'
import type { FigurineName } from '../src/game/types'

const P1: [FigurineName, FigurineName] = ['warrior', 'mage']
const P2: [FigurineName, FigurineName] = ['archer', 'priest']

function resetStore(seed = 42) {
  const initialGame = createInitialGameState(seed, P1, P2)
  useGameStore.setState({ game: initialGame, rng: createRng(seed) })
  useLogStore.getState().clear()
}

describe('useGameStore', () => {
  beforeEach(() => {
    resetStore()
  })

  it('initializes with correct default state', () => {
    const state = createInitialGameState(1, P1, P2)
    expect(state.currentPlayer).toBe(0)
    expect(state.turn).toBe(1)
    expect(state.phase).toBe('spinning')
    expect(state.winner).toBeNull()
    expect(state.wheels.spinsRemaining).toBe(3)
    expect(state.wheels.locked).toEqual([false, false, false, false, false])
    expect(state.wheels.results).toBeNull()
    expect(state.players[0].crownHp).toBe(10)
    expect(state.players[1].crownHp).toBe(10)
    expect(state.players[0].bulwark).toBe(0)
    expect(state.players[0].heroes[0].name).toBe('warrior')
    expect(state.players[0].heroes[0].slot).toBe('squares')
    expect(state.players[0].heroes[1].name).toBe('mage')
    expect(state.players[0].heroes[1].slot).toBe('diamonds')
    expect(state.players[1].heroes[0].name).toBe('archer')
    expect(state.players[1].heroes[1].name).toBe('priest')
  })

  it('spin() produces results for all 5 wheels', () => {
    useGameStore.getState().spin()
    const results = useGameStore.getState().game.wheels.results
    expect(results).not.toBeNull()
    expect(results).toHaveLength(5)
    for (const panel of results!) {
      expect(panel).toHaveProperty('symbol')
      expect(panel).toHaveProperty('count')
      expect(panel).toHaveProperty('xp')
    }
  })

  it('spin() with fixed seed is deterministic', () => {
    resetStore(123)
    useGameStore.getState().spin()
    const results1 = useGameStore.getState().game.wheels.results

    resetStore(123)
    useGameStore.getState().spin()
    const results2 = useGameStore.getState().game.wheels.results

    expect(results1).toEqual(results2)
  })

  it('spin() decrements spinsRemaining', () => {
    expect(useGameStore.getState().game.wheels.spinsRemaining).toBe(3)
    useGameStore.getState().spin()
    expect(useGameStore.getState().game.wheels.spinsRemaining).toBe(2)
  })

  it('lockWheel toggles lock state', () => {
    useGameStore.getState().lockWheel(2)
    expect(useGameStore.getState().game.wheels.locked[2]).toBe(true)
    useGameStore.getState().lockWheel(2)
    expect(useGameStore.getState().game.wheels.locked[2]).toBe(false)
  })

  it('locked wheels keep their results across spins', () => {
    useGameStore.getState().spin()
    const firstResults = useGameStore.getState().game.wheels.results!
    const lockedPanel = firstResults[1]

    useGameStore.getState().lockWheel(1)
    useGameStore.getState().spin()

    const secondResults = useGameStore.getState().game.wheels.results!
    expect(secondResults[1]).toEqual(lockedPanel)
  })

  it('startTurn resets wheels', () => {
    useGameStore.getState().spin()
    expect(useGameStore.getState().game.wheels.results).not.toBeNull()

    useGameStore.getState().startTurn()
    const { wheels } = useGameStore.getState().game
    expect(wheels.spinsRemaining).toBe(3)
    expect(wheels.locked).toEqual([false, false, false, false, false])
    expect(wheels.results).toBeNull()
  })

  it('resolveRoll updates state and pushes events to log store', () => {
    // Need results for resolve to do anything
    useGameStore.getState().spin()
    // Manually set phase to still be spinning so we can call resolveRoll
    const game = useGameStore.getState().game
    useGameStore.setState({ game: { ...game, phase: 'spinning' } })

    useLogStore.getState().clear()
    useGameStore.getState().resolveRoll()

    // resolve should have pushed events
    const events = useLogStore.getState().events
    expect(events.length).toBeGreaterThan(0)
  })

  it('endTurn switches current player', () => {
    expect(useGameStore.getState().game.currentPlayer).toBe(0)
    useGameStore.getState().endTurn()
    expect(useGameStore.getState().game.currentPlayer).toBe(1)
    useGameStore.getState().endTurn()
    expect(useGameStore.getState().game.currentPlayer).toBe(0)
  })

  it('full turn cycle: startTurn -> spin -> resolveRoll -> endTurn', () => {
    // Start turn
    useGameStore.getState().startTurn()
    expect(useGameStore.getState().game.wheels.spinsRemaining).toBe(3)

    // Spin (first spin)
    useGameStore.getState().spin()
    expect(useGameStore.getState().game.wheels.spinsRemaining).toBe(2)
    expect(useGameStore.getState().game.wheels.results).not.toBeNull()

    // Resolve
    useLogStore.getState().clear()
    useGameStore.getState().resolveRoll()
    expect(useLogStore.getState().events.length).toBeGreaterThan(0)

    // End turn
    useGameStore.getState().endTurn()
    expect(useGameStore.getState().game.currentPlayer).toBe(1)
    expect(useGameStore.getState().game.turn).toBe(2)
  })
})
