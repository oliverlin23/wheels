import { useState, useCallback, useRef } from 'react'

export function useShake(): {
  offset: { x: number; y: number }
  trigger: (intensity: number, frames: number) => void
} {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const frameRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const trigger = useCallback((intensity: number, frames: number) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
    }
    frameRef.current = 0

    const step = () => {
      if (frameRef.current >= frames) {
        setOffset({ x: 0, y: 0 })
        rafRef.current = null
        return
      }

      const progress = frameRef.current / frames
      const damping = 1 - progress
      const maxDisp = Math.max(1, Math.round(intensity * damping))

      const x = Math.round((Math.random() * 2 - 1) * maxDisp)
      const y = Math.round((Math.random() * 2 - 1) * maxDisp)

      setOffset({ x, y })
      frameRef.current++
      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
  }, [])

  return { offset, trigger }
}
