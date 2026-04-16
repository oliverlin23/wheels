import { useEffect, useMemo, useRef } from 'react'
import { useGameStore } from '../store/game'
import { useLogStore } from '../store/log'
import { usePlaybackStore } from './playbackStore'
import type { TimelineStep } from './playback'
import { applyEvents } from './applyEvents'
import type { GameState } from '../game/types'

/**
 * Drives the resolution playback timer. When isPlayingBack=true, advances
 * through the timeline one step at a time. When the timeline completes,
 * applies the final authoritative game state.
 */
export function useResolvePlayback(): {
  currentStep: TimelineStep | null
  isPlayingBack: boolean
  displayedGame: GameState
} {
  const game = useGameStore((s) => s.game)
  const currentStepIdx = usePlaybackStore((s) => s.currentStepIdx)
  const timeline = usePlaybackStore((s) => s.timeline)
  const preResolveGame = usePlaybackStore((s) => s.preResolveGame)
  const isPlayingBack = usePlaybackStore((s) => s.isPlayingBack)
  const advance = usePlaybackStore((s) => s.advance)
  const reset = usePlaybackStore((s) => s.reset)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // When currentStepIdx changes, schedule advance after step duration.
  // Also push the current step's event to the log.
  useEffect(() => {
    if (!isPlayingBack || currentStepIdx < 0) return

    const step = timeline[currentStepIdx]
    if (!step) return

    useLogStore.getState().pushEvents([step.event])

    timerRef.current = setTimeout(() => {
      const stillPlaying = advance()
      if (!stillPlaying) {
        const { pendingFinalGame } = usePlaybackStore.getState()
        if (pendingFinalGame) {
          useGameStore.getState().setGame(pendingFinalGame)
        }
        reset()
      }
    }, step.durationMs)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [currentStepIdx, isPlayingBack, timeline, advance, reset])

  const currentStep = currentStepIdx >= 0 && currentStepIdx < timeline.length
    ? timeline[currentStepIdx]
    : null

  // Derive the displayed game by applying events up to (but not including)
  // the current step. During a step, the displayed state shows the result
  // of all events UP TO that event — so the animation is what "produces" it.
  // At step N, we've displayed events 0..N-1. Event at N is currently animating.
  const displayedGame = useMemo(() => {
    if (!isPlayingBack || !preResolveGame) return game
    if (currentStepIdx < 0) return game
    // Apply events 0..currentStepIdx inclusive so the numbers update as
    // each step animates — damage pops up as the attack lands, not before.
    const applied = timeline.slice(0, currentStepIdx + 1).map((s) => s.event)
    return applyEvents(preResolveGame, applied)
  }, [game, isPlayingBack, preResolveGame, currentStepIdx, timeline])

  return { currentStep, isPlayingBack, displayedGame }
}

/** Hook for components that just want to read the current step without driving playback. */
export function useCurrentStep(): TimelineStep | null {
  const currentStepIdx = usePlaybackStore((s) => s.currentStepIdx)
  const timeline = usePlaybackStore((s) => s.timeline)
  if (currentStepIdx < 0 || currentStepIdx >= timeline.length) return null
  return timeline[currentStepIdx]
}
