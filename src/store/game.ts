import { create } from 'zustand'
import type { GameState, FigurineName, Panel } from '../game/types'
import { createRng, rollWheel } from '../game/rng'
import { WHEELS } from '../game/rules/panels'
import {
  startTurn as startTurnAction,
  lockWheel as lockWheelAction,
  endTurn as endTurnAction,
} from '../game/rules/actions'
import { resolve } from '../game/rules/resolve'
import { useLogStore } from './log'

interface GameStore {
  game: GameState
  rng: () => number
  // Actions
  spin: () => void
  lockWheel: (index: number) => void
  startTurn: () => void
  resolveRoll: () => void
  endTurn: () => void
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
    },
  }
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: createInitialGameState(42, ['warrior', 'mage'], ['archer', 'priest']),
  rng: createRng(42),

  spin: () => {
    const { game, rng } = get()
    if (game.phase !== 'spinning' || game.wheels.spinsRemaining <= 0) return

    const currentResults = game.wheels.results
    const newResults: [Panel, Panel, Panel, Panel, Panel] = [
      game.wheels.locked[0] && currentResults ? currentResults[0] : rollWheel(rng, 0, WHEELS[0]),
      game.wheels.locked[1] && currentResults ? currentResults[1] : rollWheel(rng, 1, WHEELS[1]),
      game.wheels.locked[2] && currentResults ? currentResults[2] : rollWheel(rng, 2, WHEELS[2]),
      game.wheels.locked[3] && currentResults ? currentResults[3] : rollWheel(rng, 3, WHEELS[3]),
      game.wheels.locked[4] && currentResults ? currentResults[4] : rollWheel(rng, 4, WHEELS[4]),
    ]

    const newSpinsRemaining = game.wheels.spinsRemaining - 1

    const newGame: GameState = {
      ...game,
      wheels: {
        ...game.wheels,
        results: newResults,
        spinsRemaining: newSpinsRemaining,
      },
    }

    set({ game: newGame })

    // Auto-resolve if this was the last spin
    if (newSpinsRemaining === 0) {
      get().resolveRoll()
    }
  },

  lockWheel: (index: number) => {
    const { game } = get()
    const newGame = lockWheelAction(game, index)
    set({ game: newGame })
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
    const newGame = endTurnAction(game)
    set({ game: newGame })
  },
}))
