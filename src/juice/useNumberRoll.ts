import { useState, useCallback, useRef } from 'react'

export function useNumberRoll(): {
  displayValue: string
  trigger: (from: number, to: number, durationMs: number, padLength?: number) => void
} {
  const [displayValue, setDisplayValue] = useState('00')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stepsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const trigger = useCallback(
    (from: number, to: number, durationMs: number, padLength: number = 2) => {
      // Clear any existing roll
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
      for (const t of stepsRef.current) {
        clearTimeout(t)
      }
      stepsRef.current = []

      const fromStr = String(from).padStart(padLength, '0')
      const toStr = String(to).padStart(padLength, '0')

      // Number of discrete steps for the roll
      const totalSteps = Math.max(4, Math.min(10, Math.abs(to - from)))
      const stepInterval = durationMs / totalSteps

      setDisplayValue(fromStr)

      for (let step = 1; step <= totalSteps; step++) {
        const t = setTimeout(() => {
          if (step === totalSteps) {
            setDisplayValue(toStr)
            return
          }

          // Interpolate each digit independently
          const progress = step / totalSteps
          const digits: string[] = []
          for (let d = 0; d < padLength; d++) {
            const fromDigit = parseInt(fromStr[d] ?? '0', 10)
            const toDigit = parseInt(toStr[d] ?? '0', 10)
            const current = Math.round(fromDigit + (toDigit - fromDigit) * progress)
            digits.push(String(Math.abs(current) % 10))
          }
          setDisplayValue(digits.join(''))
        }, stepInterval * step)
        stepsRef.current.push(t)
      }
    },
    [],
  )

  return { displayValue, trigger }
}
