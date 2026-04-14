import { setup, createActor } from 'xstate'

export type TurnContext = {
  // The machine is a pure choreographer -- game state lives in Zustand.
  // Context is intentionally minimal.
}

export type TurnEvent =
  | { type: 'SPIN' }
  | { type: 'LOCK_WHEEL'; index: number }
  | { type: 'SETTLE_DONE' }
  | { type: 'RESOLVE_DONE' }
  | { type: 'ACT_DONE' }
  | { type: 'NEXT_TURN' }
  | { type: 'GAME_OVER' }

export const turnMachine = setup({
  types: {
    context: {} as TurnContext,
    events: {} as TurnEvent,
  },
}).createMachine({
  id: 'turn',
  initial: 'idle',
  context: {},
  states: {
    idle: {
      on: {
        SPIN: { target: 'rolling' },
        LOCK_WHEEL: { target: 'idle' },
      },
    },
    rolling: {
      on: {
        SETTLE_DONE: { target: 'settling' },
      },
    },
    settling: {
      on: {
        SETTLE_DONE: { target: 'resolving' },
      },
    },
    resolving: {
      on: {
        RESOLVE_DONE: { target: 'acting' },
      },
    },
    acting: {
      on: {
        ACT_DONE: { target: 'cleanup' },
      },
    },
    cleanup: {
      on: {
        NEXT_TURN: { target: 'idle' },
        GAME_OVER: { target: 'done' },
      },
    },
    done: {
      type: 'final',
    },
  },
})

/** Convenience factory for creating a turn-flow actor. */
export function createTurnActor() {
  return createActor(turnMachine)
}
