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

// Phase durations (ms)
const ANTICIPATION_DURATION = 150
const SPIN_BASE_DURATION = 1200
const SPIN_VARIANCE = 600 // each drum gets a slightly different spin time
const SETTLE_DURATION = 300
const STAGGER_DELAY = 80

// Physics
const ANTICIPATION_ANGLE = 0.17 // ~10 degrees backward
const SPIN_SPEED_BASE = 17 // rad/s base
const SPIN_SPEED_VARIANCE = 3 // rad/s per-drum offset
const OVERSHOOT_ANGLE = 0.087 // ~5 degrees overshoot during settle
const MIN_FULL_ROTATIONS = 4

type DrumAnimState = {
  phase: DrumPhase
  startTime: number
  spinDuration: number
  baseRotation: number // rotation at start of this animation
  targetRotation: number
  spinSpeed: number
  settleStartRotation: number
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export function useSpinAnimation(): SpinAnimationResult {
  const [drums, setDrums] = useState<DrumState[]>(
    Array.from({ length: 5 }, () => ({ rotation: 0, phase: 'idle' as const })),
  )
  const [allSettled, setAllSettled] = useState(true)

  const animStateRef = useRef<DrumAnimState[]>([])
  const rafRef = useRef<number>(0)
  const drumsRef = useRef(drums)
  drumsRef.current = drums

  const tick = useCallback(() => {
    const now = performance.now()
    const animStates = animStateRef.current
    const newDrums: DrumState[] = []
    let anyActive = false

    for (let i = 0; i < 5; i++) {
      const anim = animStates[i]
      if (!anim || anim.phase === 'idle' || anim.phase === 'settled') {
        newDrums.push({
          rotation: anim ? anim.targetRotation : drumsRef.current[i].rotation,
          phase: anim ? anim.phase : drumsRef.current[i].phase,
        })
        continue
      }

      anyActive = true
      const elapsed = now - anim.startTime

      if (anim.phase === 'anticipation') {
        if (elapsed >= ANTICIPATION_DURATION) {
          // Transition to spinning
          anim.phase = 'spinning'
          anim.startTime = now
          anim.baseRotation = anim.baseRotation - ANTICIPATION_ANGLE
          newDrums.push({ rotation: anim.baseRotation, phase: 'spinning' })
        } else {
          const t = elapsed / ANTICIPATION_DURATION
          const easedT = easeInOutQuad(t)
          const rotation = anim.baseRotation - ANTICIPATION_ANGLE * easedT
          newDrums.push({ rotation, phase: 'anticipation' })
        }
      } else if (anim.phase === 'spinning') {
        if (elapsed >= anim.spinDuration) {
          // Transition to settling (with stagger delay)
          const staggerDelay = i * STAGGER_DELAY
          const settleStart = anim.spinDuration + staggerDelay
          if (elapsed >= settleStart) {
            anim.phase = 'settling'
            anim.startTime = now
            // Compute where we are at end of spin
            anim.settleStartRotation =
              anim.baseRotation + anim.spinSpeed * (anim.spinDuration / 1000)
            newDrums.push({ rotation: anim.settleStartRotation, phase: 'settling' })
          } else {
            // Still waiting for stagger, keep spinning at decreasing speed
            const speed = anim.spinSpeed * (1 - easeOutCubic(Math.min(1, (elapsed - anim.spinDuration) / (staggerDelay + 100))))
            const rotation = anim.baseRotation + anim.spinSpeed * (anim.spinDuration / 1000) +
              speed * ((elapsed - anim.spinDuration) / 1000)
            newDrums.push({ rotation, phase: 'spinning' })
          }
        } else {
          // Accelerate slightly then maintain speed
          const t = elapsed / anim.spinDuration
          const speedMul = t < 0.1 ? easeOutCubic(t / 0.1) : 1
          const rotation = anim.baseRotation + anim.spinSpeed * speedMul * (elapsed / 1000)
          newDrums.push({ rotation, phase: 'spinning' })
        }
      } else if (anim.phase === 'settling') {
        if (elapsed >= SETTLE_DURATION) {
          anim.phase = 'settled'
          newDrums.push({ rotation: anim.targetRotation, phase: 'settled' })
        } else {
          const t = elapsed / SETTLE_DURATION
          // Overshoot then snap back: go past target, then ease to target
          const overshootT = Math.sin(t * Math.PI) * OVERSHOOT_ANGLE * (1 - t)
          const easedT = easeOutCubic(t)
          const rotation =
            anim.settleStartRotation +
            (anim.targetRotation - anim.settleStartRotation) * easedT +
            overshootT
          newDrums.push({ rotation, phase: 'settling' })
        }
      } else {
        newDrums.push(drumsRef.current[i])
      }
    }

    setDrums(newDrums)

    const allDone = animStates.every(
      (a) => !a || a.phase === 'settled' || a.phase === 'idle',
    )
    if (allDone) {
      setAllSettled(true)
    }

    if (anyActive) {
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [])

  const triggerSpin = useCallback(
    (targetPanelIndices: number[]) => {
      // Cancel any running animation
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      setAllSettled(false)
      const now = performance.now()
      const currentDrums = drumsRef.current

      const newAnimStates: DrumAnimState[] = targetPanelIndices.map((targetIndex, i) => {
        const currentRotation = currentDrums[i].rotation

        // If this drum is already settled and we don't need to re-spin (locked),
        // keep it where it is
        if (targetIndex < 0) {
          return {
            phase: 'settled' as const,
            startTime: now,
            spinDuration: 0,
            baseRotation: currentRotation,
            targetRotation: currentRotation,
            spinSpeed: 0,
            settleStartRotation: currentRotation,
          }
        }

        const spinDuration =
          SPIN_BASE_DURATION + (i / 4) * SPIN_VARIANCE
        const spinSpeed = SPIN_SPEED_BASE + (i - 2) * (SPIN_SPEED_VARIANCE / 2)

        // Calculate how much rotation happens during the spin phase
        const spinRotation = spinSpeed * (spinDuration / 1000)

        // Target: land on the face at targetIndex
        // We need total rotation to be a multiple of FACE_ANGLE landing on targetIndex
        const targetFaceAngle = targetIndex * FACE_ANGLE
        // Current rotation mod full circle to know our starting face
        const totalSpinEstimate = spinRotation + ANTICIPATION_ANGLE
        const fullRotations = Math.max(
          MIN_FULL_ROTATIONS,
          Math.ceil(totalSpinEstimate / (Math.PI * 2)),
        )
        const targetRotation =
          currentRotation +
          fullRotations * Math.PI * 2 +
          (targetFaceAngle - ((currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2))

        // Ensure we're always going forward
        const adjustedTarget =
          targetRotation > currentRotation
            ? targetRotation
            : targetRotation + Math.PI * 2

        return {
          phase: 'anticipation' as DrumPhase,
          startTime: now,
          spinDuration,
          baseRotation: currentRotation,
          targetRotation: adjustedTarget,
          spinSpeed,
          settleStartRotation: 0,
        }
      })

      animStateRef.current = newAnimStates

      // Initialize drum states for anticipation
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
