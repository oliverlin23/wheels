import { create } from 'zustand'
import type { GameState, FigurineName } from '../game/types'
import { createRng } from '../game/rng'
import { WHEELS } from '../game/rules/panels'
import {
  startTurn as startTurnAction,
  lockWheel as lockWheelAction,
  endTurn as endTurnAction,
  spin as spinAction,
} from '../game/rules/actions'
import { resolve } from '../game/rules/resolve'
import { useLogStore } from './log'

interface GameStore {
  game: GameState
  rng: () => number
  spinCount: number
  // Local actions (used by Debug panel and tests)
  spin: () => void
  lockWheel: (index: number) => void
  startTurn: () => void
  resolveRoll: () => void
  endTurn: () => void
  reset: (seed: number, p1Heroes: [FigurineName, FigurineName], p2Heroes: [FigurineName, FigurineName]) => void
  // Network actions (server pushes state)
  setGame: (game: GameState) => void
  incrementSpinCount: () => void
}

export function createInitialGameState(
  _seed: number,
  p1Heroes: [FigurineName, FigurineName],
  p2Heroes: [FigurineName, FigurineName],
): GameState {
  return {
    players: [
      {
        crownHp: 10,
        bulwark: 0,
        heroes: [
          { name: p1Heroes[0], rank: 'bronze', energy: 0, xp: 0, slot: 'squares' },
          { name: p1Heroes[1], rank: 'bronze', energy: 0, xp: 0, slot: 'diamonds' },
        ],
      },
      {
        crownHp: 10,
        bulwark: 0,
        heroes: [
          { name: p2Heroes[0], rank: 'bronze', energy: 0, xp: 0, slot: 'squares' },
          { name: p2Heroes[1], rank: 'bronze', energy: 0, xp: 0, slot: 'diamonds' },
        ],
      },
    ],
    currentPlayer: 0,
    turn: 1,
    phase: 'spinning',
    winner: null,
    wheels: {
      spinsRemaining: 3,
      locked: [false, false, false, false, false],
      results: null,
      resultIndices: null,
    },
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: createInitialGameState(42, ['warrior', 'mage'], ['archer', 'priest']),
  rng: createRng(42),
  spinCount: 0,

  spin: () => {
    const { game, rng, spinCount } = get()
    const newGame = spinAction(game, rng, WHEELS)
    if (newGame === game) return
    set({ game: newGame, spinCount: spinCount + 1 })
    if (newGame.wheels.spinsRemaining === 0) {
      get().resolveRoll()
    }
  },

  lockWheel: (index: number) => {
    const { game } = get()
    set({ game: lockWheelAction(game, index) })
  },

  startTurn: () => {
    const { game } = get()
    const result = startTurnAction(game)
    useLogStore.getState().pushEvents(result.events)
    set({ game: result.state })
  },

  resolveRoll: () => {
    const { game } = get()
    const result = resolve(game)
    useLogStore.getState().pushEvents(result.events)
    set({ game: result.state })
  },

  endTurn: () => {
    const { game } = get()
    set({ game: endTurnAction(game) })
  },

  reset: (seed, p1Heroes, p2Heroes) => {
    useLogStore.getState().clear()
    set({
      game: createInitialGameState(seed, p1Heroes, p2Heroes),
      rng: createRng(seed),
      spinCount: 0,
    })
  },

  // Server pushes state directly
  setGame: (game) => set({ game }),
  incrementSpinCount: () => set((s) => ({ spinCount: s.spinCount + 1 })),
}))
