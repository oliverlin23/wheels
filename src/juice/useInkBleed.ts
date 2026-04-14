import { useState, useCallback, useRef } from 'react'
import type React from 'react'

export function useInkBleed(): {
  style: React.CSSProperties
  trigger: (color: string) => void
} {
  const [activeColor, setActiveColor] = useState<string | null>(null)
  const rafRef = useRef<number | null>(null)

  const trigger = useCallback((color: string) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
    }

    setActiveColor(color)

    // Revert after 1 frame
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setActiveColor(null)
        rafRef.current = null
      })
    })
  }, [])

  const style: React.CSSProperties = activeColor
    ? { borderColor: activeColor, backgroundColor: activeColor }
    : {}

  return { style, trigger }
}
