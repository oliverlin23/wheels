import { create } from 'zustand'
import type { GameState, FigurineName, WheelState } from '../game/types'
import { createRng } from '../game/rng'
import { WHEELS } from '../game/rules/panels'
import {
  startRound as startRoundAction,
  spin as spinAction,
  lockWheel as lockWheelAction,
  confirmSpins as confirmSpinsAction,
  bothConfirmed,
  revealWheels,
} from '../game/rules/actions'
import { resolve } from '../game/rules/resolve'
import { useLogStore } from './log'

const INITIAL_WHEEL_STATE: WheelState = {
  spinsRemaining: 3,
  locked: [false, false, false, false, false],
  results: null,
  resultIndices: null,
}

interface GameStore {
  game: GameState
  rng: () => number
  spinCount: number
  // Local actions (used by Debug panel and local testing)
  spin: (playerIndex: 0 | 1) => void
  lockWheel: (playerIndex: 0 | 1, wheelIndex: number) => void
  confirmSpins: (playerIndex: 0 | 1) => void
  startRound: () => void
  resolveRound: () => void
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
    wheels: [{ ...INITIAL_WHEEL_STATE }, { ...INITIAL_WHEEL_STATE }],
    round: 1,
    roundPhase: 'spinning',
    confirmed: [false, false],
    winner: null,
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: createInitialGameState(42, ['warrior', 'mage'], ['archer', 'priest']),
  rng: createRng(42),
  spinCount: 0,

  spin: (playerIndex) => {
    const { game, rng, spinCount } = get()
    const newGame = spinAction(game, playerIndex, rng, WHEELS)
    if (newGame === game) return
    set({ game: newGame, spinCount: spinCount + 1 })
  },

  lockWheel: (playerIndex, wheelIndex) => {
    const { game } = get()
    set({ game: lockWheelAction(game, playerIndex, wheelIndex) })
  },

  confirmSpins: (playerIndex) => {
    const { game } = get()
    let newGame = confirmSpinsAction(game, playerIndex)
    // If both confirmed, auto-reveal and resolve
    if (bothConfirmed(newGame)) {
      newGame = revealWheels(newGame)
      set({ game: newGame })
      get().resolveRound()
      return
    }
    set({ game: newGame })
  },

  startRound: () => {
    const { game } = get()
    const result = startRoundAction(game)
    useLogStore.getState().pushEvents(result.events)
    set({ game: result.state })
  },

  resolveRound: () => {
    const { game } = get()
    const result = resolve(game)
    useLogStore.getState().pushEvents(result.events)
    set({ game: result.state })
  },

  reset: (seed, p1Heroes, p2Heroes) => {
    useLogStore.getState().clear()
    set({
      game: createInitialGameState(seed, p1Heroes, p2Heroes),
      rng: createRng(seed),
      spinCount: 0,
    })
  },

  setGame: (game) => set({ game }),
  incrementSpinCount: () => set((s) => ({ spinCount: s.spinCount + 1 })),
}))
