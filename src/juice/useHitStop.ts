import { useState, useCallback, useRef } from 'react'

export function useHitStop(): {
  frozen: boolean
  trigger: (durationMs: number) => void
} {
  const [frozen, setFrozen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const trigger = useCallback((durationMs: number) => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
    }
    setFrozen(true)
    timerRef.current = setTimeout(() => {
      setFrozen(false)
      timerRef.current = null
    }, durationMs)
  }, [])

  return { frozen, trigger }
}
