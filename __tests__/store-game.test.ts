import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, createInitialGameState } from '../src/store/game'
import { useLogStore } from '../src/store/log'
import { createRng } from '../src/game/rng'
import type { FigurineName } from '../src/game/types'

const P1: [FigurineName, FigurineName] = ['warrior', 'mage']
const P2: [FigurineName, FigurineName] = ['archer', 'priest']

function resetStore(seed = 42) {
  const initialGame = createInitialGameState(seed, P1, P2)
  useGameStore.setState({ game: initialGame, rng: createRng(seed), spinCount: 0 })
  useLogStore.getState().clear()
}

describe('useGameStore', () => {
  beforeEach(() => {
    resetStore()
  })

  it('initializes with correct default state', () => {
    const state = createInitialGameState(1, P1, P2)
    expect(state.round).toBe(1)
    expect(state.roundPhase).toBe('spinning')
    expect(state.winner).toBeNull()
    expect(state.confirmed).toEqual([false, false])
    // Both players have their own wheel state
    expect(state.wheels[0].spinsRemaining).toBe(3)
    expect(state.wheels[0].locked).toEqual([false, false, false, false, false])
    expect(state.wheels[0].results).toBeNull()
    expect(state.wheels[1].spinsRemaining).toBe(3)
    expect(state.wheels[1].locked).toEqual([false, false, false, false, false])
    expect(state.wheels[1].results).toBeNull()
    expect(state.players[0].crownHp).toBe(10)
    expect(state.players[1].crownHp).toBe(10)
    expect(state.players[0].bulwark).toBe(0)
    expect(state.players[0].heroes[0].name).toBe('warrior')
    expect(state.players[0].heroes[0].slot).toBe('suns')
    expect(state.players[0].heroes[1].name).toBe('mage')
    expect(state.players[0].heroes[1].slot).toBe('moons')
    expect(state.players[1].heroes[0].name).toBe('archer')
    expect(state.players[1].heroes[1].name).toBe('priest')
  })

  it('spin(0) produces results for player 0 wheels', () => {
    useGameStore.getState().spin(0)
    const results = useGameStore.getState().game.wheels[0].results
    expect(results).not.toBeNull()
    expect(results).toHaveLength(5)
    for (const panel of results!) {
      expect(panel).toHaveProperty('symbol')
      expect(panel).toHaveProperty('count')
      expect(panel).toHaveProperty('xp')
    }
    // Player 1 wheels unaffected
    expect(useGameStore.getState().game.wheels[1].results).toBeNull()
  })

  it('spin() with fixed seed is deterministic', () => {
    resetStore(123)
    useGameStore.getState().spin(0)
    const results1 = useGameStore.getState().game.wheels[0].results

    resetStore(123)
    useGameStore.getState().spin(0)
    const results2 = useGameStore.getState().game.wheels[0].results

    expect(results1).toEqual(results2)
  })

  it('spin() decrements spinsRemaining for the correct player', () => {
    expect(useGameStore.getState().game.wheels[0].spinsRemaining).toBe(3)
    expect(useGameStore.getState().game.wheels[1].spinsRemaining).toBe(3)
    useGameStore.getState().spin(0)
    expect(useGameStore.getState().game.wheels[0].spinsRemaining).toBe(2)
    expect(useGameStore.getState().game.wheels[1].spinsRemaining).toBe(3) // unaffected
  })

  it('lockWheel toggles lock state for specific player', () => {
    useGameStore.getState().lockWheel(0, 2)
    expect(useGameStore.getState().game.wheels[0].locked[2]).toBe(true)
    expect(useGameStore.getState().game.wheels[1].locked[2]).toBe(false) // unaffected
    useGameStore.getState().lockWheel(0, 2)
    expect(useGameStore.getState().game.wheels[0].locked[2]).toBe(false)
  })

  it('locked wheels keep their results across spins', () => {
    useGameStore.getState().spin(0)
    const firstResults = useGameStore.getState().game.wheels[0].results!
    const lockedPanel = firstResults[1]

    useGameStore.getState().lockWheel(0, 1)
    useGameStore.getState().spin(0)

    const secondResults = useGameStore.getState().game.wheels[0].results!
    expect(secondResults[1]).toEqual(lockedPanel)
  })

  it('startRound resets both players wheels', () => {
    useGameStore.getState().spin(0)
    useGameStore.getState().spin(1)
    expect(useGameStore.getState().game.wheels[0].results).not.toBeNull()
    expect(useGameStore.getState().game.wheels[1].results).not.toBeNull()

    useGameStore.getState().startRound()
    for (const ws of useGameStore.getState().game.wheels) {
      expect(ws.spinsRemaining).toBe(3)
      expect(ws.locked).toEqual([false, false, false, false, false])
      expect(ws.results).toBeNull()
    }
  })

  it('resolveRound queues events in playback store', async () => {
    // Need results for resolve to do anything
    useGameStore.getState().spin(0)
    useLogStore.getState().clear()

    // Import lazily to avoid circular import issues in tests
    const { usePlaybackStore } = await import('../src/resolve/playbackStore')
    usePlaybackStore.getState().reset()

    useGameStore.getState().resolveRound()

    // Resolve should have loaded a timeline into the playback store
    const timeline = usePlaybackStore.getState().timeline
    expect(timeline.length).toBeGreaterThan(0)
    expect(usePlaybackStore.getState().isPlayingBack).toBe(true)
  })

  it('confirmSpins marks player as confirmed', () => {
    useGameStore.getState().confirmSpins(0)
    expect(useGameStore.getState().game.confirmed).toEqual([true, false])
  })

  it('full round cycle: startRound -> spin both -> confirmSpins both -> auto-resolve', async () => {
    // Start round
    useGameStore.getState().startRound()
    expect(useGameStore.getState().game.wheels[0].spinsRemaining).toBe(3)
    expect(useGameStore.getState().game.wheels[1].spinsRemaining).toBe(3)

    // Spin (both players)
    useGameStore.getState().spin(0)
    expect(useGameStore.getState().game.wheels[0].spinsRemaining).toBe(2)
    expect(useGameStore.getState().game.wheels[0].results).not.toBeNull()

    useGameStore.getState().spin(1)
    expect(useGameStore.getState().game.wheels[1].spinsRemaining).toBe(2)
    expect(useGameStore.getState().game.wheels[1].results).not.toBeNull()

    // Confirm spins -- when both confirm, auto-reveal and resolve kicks in
    const { usePlaybackStore } = await import('../src/resolve/playbackStore')
    usePlaybackStore.getState().reset()
    useLogStore.getState().clear()

    useGameStore.getState().confirmSpins(0)
    expect(useGameStore.getState().game.confirmed[0]).toBe(true)

    useGameStore.getState().confirmSpins(1)
    // After both confirm, resolution is queued into the playback store
    const timeline = usePlaybackStore.getState().timeline
    expect(timeline.length).toBeGreaterThan(0)
  })
})
