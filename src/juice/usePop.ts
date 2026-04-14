import { useState, useCallback, useRef } from 'react'
import type React from 'react'

export function usePop(): {
  style: React.CSSProperties
  trigger: () => void
} {
  const [scale, setScale] = useState(1)
  const rafRef = useRef<number | null>(null)
  const frameRef = useRef(0)

  const trigger = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
    }
    frameRef.current = 0

    // 120ms total, ~7 frames at 60fps
    // Frame 0-1: scale up to 1.08
    // Frame 2+: back to 1.0
    const step = () => {
      const f = frameRef.current
      if (f === 0) {
        setScale(1.08)
      } else if (f === 1) {
        setScale(1.08)
      } else {
        setScale(1)
        rafRef.current = null
        return
      }
      frameRef.current++
      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
  }, [])

  const style: React.CSSProperties = {
    transform: scale === 1 ? undefined : `scale(${scale})`,
  }

  return { style, trigger }
}
