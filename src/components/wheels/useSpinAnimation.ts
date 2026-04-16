import { useState, useCallback, useRef } from 'react'

export type DrumPhase = 'idle' | 'anticipation' | 'spinning' | 'settling' | 'settled'

export type DrumState = {
  rotation: number
  phase: DrumPhase
}

export type SpinAnimationResult = {
  drums: DrumState[]
  allSettled: boolean
  triggerSpin: (targetPanelIndices: number[]) => void
}

const PANEL_COUNT = 8
const FACE_ANGLE = (Math.PI * 2) / PANEL_COUNT // 0.7854 rad (45 deg)

// Rotation that puts face 0 front-facing (toward camera at +z).
// Geometry uses negative angles: face i center at -(i+0.5)*FACE_ANGLE.
// Front-facing when that angle + R = π/2, so R = π/2 + (i+0.5)*FACE_ANGLE.
// For face 0: R = π/2 + π/8 = 5π/8
const FACE_FRONT_OFFSET = Math.PI / 2 + 0.5 * FACE_ANGLE

// Phase durations (ms)
const ANTICIPATION_DURATION = 150
const SPIN_DURATION = 1400
const SETTLE_DURATION = 350
const STAGGER_DELAY = 100 // ms between each drum starting to settle

// Physics
const ANTICIPATION_ANGLE = 0.17 // ~10 degrees backward
const SPIN_SPEED = 18 // rad/s (constant for all drums)
const MIN_FULL_ROTATIONS = 3

type DrumAnimState = {
  phase: DrumPhase
  phaseStartTime: number
  phaseStartRotation: number // actual rotation when this phase began
  targetRotation: number
  spinSpeed: number
  staggerDelay: number // ms to wait after spin before settling
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

/** Compute the rotation value at a given time for a drum's animation. */
function computeRotation(anim: DrumAnimState, now: number): { rotation: number; phase: DrumPhase } {
  const elapsed = now - anim.phaseStartTime

  switch (anim.phase) {
    case 'anticipation': {
      if (elapsed >= ANTICIPATION_DURATION) {
        // Transition to spinning
        const rotation = anim.phaseStartRotation - ANTICIPATION_ANGLE
        anim.phase = 'spinning'
        anim.phaseStartTime = now
        anim.phaseStartRotation = rotation
        return { rotation, phase: 'spinning' }
      }
      const t = easeInOutQuad(elapsed / ANTICIPATION_DURATION)
      return {
        rotation: anim.phaseStartRotation - ANTICIPATION_ANGLE * t,
        phase: 'anticipation',
      }
    }

    case 'spinning': {
      // Spin at constant speed, then wait for stagger, then settle
      const rotation = anim.phaseStartRotation + anim.spinSpeed * (elapsed / 1000)
      if (elapsed >= SPIN_DURATION + anim.staggerDelay) {
        // Start settling from wherever we actually are right now
        anim.phase = 'settling'
        anim.phaseStartTime = now
        anim.phaseStartRotation = rotation
        return { rotation, phase: 'settling' }
      }
      return { rotation, phase: 'spinning' }
    }

    case 'settling': {
      if (elapsed >= SETTLE_DURATION) {
        anim.phase = 'settled'
        return { rotation: anim.targetRotation, phase: 'settled' }
      }
      const t = easeOutCubic(elapsed / SETTLE_DURATION)
      const rotation = anim.phaseStartRotation +
        (anim.targetRotation - anim.phaseStartRotation) * t
      return { rotation, phase: 'settling' }
    }

    case 'settled':
      return { rotation: anim.targetRotation, phase: 'settled' }

    default:
      return { rotation: anim.targetRotation, phase: anim.phase }
  }
}

export function useSpinAnimation(): SpinAnimationResult {
  const [drums, setDrums] = useState<DrumState[]>(
    Array.from({ length: 5 }, () => ({ rotation: FACE_FRONT_OFFSET, phase: 'idle' as const })),
  )
  const [allSettled, setAllSettled] = useState(true)

  const animStateRef = useRef<DrumAnimState[]>([])
  const rafRef = useRef<number>(0)
  const drumsRef = useRef(drums)
  drumsRef.current = drums

  const tick = useCallback(() => {
    const now = performance.now()
    const animStates = animStateRef.current
    let anyActive = false

    const newDrums: DrumState[] = animStates.map((anim, i) => {
      if (!anim || anim.phase === 'idle') {
        return drumsRef.current[i]
      }
      if (anim.phase === 'settled') {
        return { rotation: anim.targetRotation, phase: 'settled' as const }
      }
      anyActive = true
      return computeRotation(anim, now)
    })

    // Pad if animStates is shorter than 5
    while (newDrums.length < 5) {
      newDrums.push(drumsRef.current[newDrums.length])
    }

    setDrums(newDrums)

    if (animStates.every((a) => !a || a.phase === 'settled' || a.phase === 'idle')) {
      setAllSettled(true)
    }

    if (anyActive) {
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [])

  const triggerSpin = useCallback(
    (targetPanelIndices: number[]) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      setAllSettled(false)
      const now = performance.now()
      const currentDrums = drumsRef.current

      const newAnimStates: DrumAnimState[] = targetPanelIndices.map((targetIndex, i) => {
        const currentRotation = currentDrums[i].rotation

        // Locked drum: keep where it is
        if (targetIndex < 0) {
          return {
            phase: 'settled' as DrumPhase,
            phaseStartTime: now,
            phaseStartRotation: currentRotation,
            targetRotation: currentRotation,
            spinSpeed: 0,
            staggerDelay: 0,
          }
        }

        // Target rotation: face `targetIndex` should be front-facing
        const targetAngleMod = ((FACE_FRONT_OFFSET + targetIndex * FACE_ANGLE) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)

        // Find target ahead of current position + full rotations
        const currentMod = ((currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
        const angleDiff = ((targetAngleMod - currentMod) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)
        const targetRotation = currentRotation + MIN_FULL_ROTATIONS * Math.PI * 2 + angleDiff

        return {
          phase: 'anticipation' as DrumPhase,
          phaseStartTime: now,
          phaseStartRotation: currentRotation,
          targetRotation,
          spinSpeed: SPIN_SPEED,
          staggerDelay: i * STAGGER_DELAY,
        }
      })

      animStateRef.current = newAnimStates

      setDrums(
        newAnimStates.map((anim, i) => ({
          rotation: currentDrums[i].rotation,
          phase: anim.phase,
        })),
      )

      rafRef.current = requestAnimationFrame(tick)
    },
    [tick],
  )

  return { drums, allSettled, triggerSpin }
}
