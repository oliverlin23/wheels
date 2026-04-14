import { create } from 'zustand'
import type { GameState, FigurineName, Panel } from '../game/types'
import { createRng, rollWheelWithIndex } from '../game/rng'
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
  spinCount: number
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
    if (game.phase !== 'spinning' || game.wheels.spinsRemaining <= 0) return

    const currentResults = game.wheels.results
    const currentIndices = game.wheels.resultIndices

    const rolls = ([0, 1, 2, 3, 4] as const).map((i) => {
      if (game.wheels.locked[i] && currentResults && currentIndices) {
        return { panel: currentResults[i], index: currentIndices[i] }
      }
      return rollWheelWithIndex(rng, i, WHEELS[i])
    })

    const newResults = rolls.map((r) => r.panel) as [Panel, Panel, Panel, Panel, Panel]
    const newIndices = rolls.map((r) => r.index) as [number, number, number, number, number]
    const newSpinsRemaining = game.wheels.spinsRemaining - 1

    const newGame: GameState = {
      ...game,
      wheels: {
        ...game.wheels,
        results: newResults,
        resultIndices: newIndices,
        spinsRemaining: newSpinsRemaining,
      },
    }

    set({ game: newGame, spinCount: spinCount + 1 })

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
