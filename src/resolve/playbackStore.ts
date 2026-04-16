import { create } from 'zustand'
import type { GameState, LogEvent } from '../game/types'
import type { TimelineStep } from './playback'
import { buildTimeline } from './playback'

interface PlaybackStore {
  /** The pre-resolve game state snapshot (starting point for incremental display). */
  preResolveGame: GameState | null
  /** The final post-resolve game state that will be applied when playback completes. */
  pendingFinalGame: GameState | null
  /** Timeline of steps to play back. */
  timeline: TimelineStep[]
  /** Index of the currently-playing step. -1 when idle. */
  currentStepIdx: number
  /** True during active playback. */
  isPlayingBack: boolean
  /** True during the brief reveal pause before playback starts. */
  isPendingPlayback: boolean

  /** Begin playback. Called when RESOLVE_UPDATE arrives. */
  startPlayback: (events: LogEvent[], finalGame: GameState, preResolveGame?: GameState) => void
  /** Reserve a playback slot during the pre-playback pause (so REVEAL messages queue instead of applying). */
  beginReveal: (preResolveGame: GameState) => void
  /** Advance to next step. Returns true if still playing. */
  advance: () => boolean
  /** Jump to end (apply final state immediately). */
  skipToEnd: () => void
  /** Clear state (called after final game applied). */
  reset: () => void
}

export const usePlaybackStore = create<PlaybackStore>((set, get) => ({
  preResolveGame: null,
  pendingFinalGame: null,
  timeline: [],
  currentStepIdx: -1,
  isPlayingBack: false,
  isPendingPlayback: false,

  beginReveal: (preResolveGame) => {
    set({ preResolveGame, isPendingPlayback: true })
  },

  startPlayback: (events, finalGame, preResolveGame) => {
    const timeline = buildTimeline(events)
    if (timeline.length === 0) {
      set({
        preResolveGame: null,
        pendingFinalGame: finalGame,
        timeline: [],
        currentStepIdx: -1,
        isPlayingBack: false,
        isPendingPlayback: false,
      })
      return
    }
    set({
      preResolveGame: preResolveGame ?? get().preResolveGame,
      pendingFinalGame: finalGame,
      timeline,
      currentStepIdx: 0,
      isPlayingBack: true,
      isPendingPlayback: false,
    })
  },

  advance: () => {
    const { currentStepIdx, timeline } = get()
    if (currentStepIdx < 0) return false
    const nextIdx = currentStepIdx + 1
    if (nextIdx >= timeline.length) {
      set({ currentStepIdx: -1, isPlayingBack: false })
      return false
    }
    set({ currentStepIdx: nextIdx })
    return true
  },

  skipToEnd: () => {
    set({ currentStepIdx: -1, isPlayingBack: false })
  },

  reset: () => {
    set({
      preResolveGame: null,
      pendingFinalGame: null,
      timeline: [],
      currentStepIdx: -1,
      isPlayingBack: false,
      isPendingPlayback: false,
    })
  },
}))

/** Get the current step, or null if idle. */
export function getCurrentStep(): TimelineStep | null {
  const { currentStepIdx, timeline } = usePlaybackStore.getState()
  if (currentStepIdx < 0 || currentStepIdx >= timeline.length) return null
  return timeline[currentStepIdx]
}
