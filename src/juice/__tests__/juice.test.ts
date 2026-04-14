import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useHitStop } from '../useHitStop'
import { useShake } from '../useShake'
import { useNumberRoll } from '../useNumberRoll'
import { usePop } from '../usePop'
import { useInkBleed } from '../useInkBleed'

describe('useHitStop', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('sets frozen to true on trigger and back to false after duration', () => {
    const { result } = renderHook(() => useHitStop())

    expect(result.current.frozen).toBe(false)

    act(() => {
      result.current.trigger(100)
    })

    expect(result.current.frozen).toBe(true)

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current.frozen).toBe(false)
  })

  it('resets duration on multiple triggers', () => {
    const { result } = renderHook(() => useHitStop())

    act(() => {
      result.current.trigger(100)
    })
    expect(result.current.frozen).toBe(true)

    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(result.current.frozen).toBe(true)

    // Re-trigger resets the timer
    act(() => {
      result.current.trigger(100)
    })
    expect(result.current.frozen).toBe(true)

    act(() => {
      vi.advanceTimersByTime(80)
    })
    // Should still be frozen because we re-triggered 50ms in
    expect(result.current.frozen).toBe(true)

    act(() => {
      vi.advanceTimersByTime(20)
    })
    expect(result.current.frozen).toBe(false)
  })
})

describe('useShake', () => {
  let rafCallbacks: FrameRequestCallback[]
  let rafId: number

  beforeEach(() => {
    rafCallbacks = []
    rafId = 0
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb)
      return ++rafId
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  function flushRAF() {
    const cbs = [...rafCallbacks]
    rafCallbacks = []
    for (const cb of cbs) {
      cb(performance.now())
    }
  }

  it('produces non-zero offsets that return to {0,0}', () => {
    const { result } = renderHook(() => useShake())

    expect(result.current.offset).toEqual({ x: 0, y: 0 })

    act(() => {
      result.current.trigger(2, 6)
    })

    // Run through all frames
    let hadNonZero = false
    for (let i = 0; i < 10; i++) {
      act(() => {
        flushRAF()
      })
      if (result.current.offset.x !== 0 || result.current.offset.y !== 0) {
        hadNonZero = true
      }
    }

    expect(hadNonZero).toBe(true)
    expect(result.current.offset).toEqual({ x: 0, y: 0 })
  })

  it('offsets are always whole integers', () => {
    const { result } = renderHook(() => useShake())

    act(() => {
      result.current.trigger(2, 6)
    })

    for (let i = 0; i < 10; i++) {
      act(() => {
        flushRAF()
      })
      expect(Number.isInteger(result.current.offset.x)).toBe(true)
      expect(Number.isInteger(result.current.offset.y)).toBe(true)
    }
  })
})

describe('useNumberRoll', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('changes displayValue and eventually reaches target', () => {
    const { result } = renderHook(() => useNumberRoll())

    act(() => {
      result.current.trigger(10, 7, 200, 2)
    })

    // Initially set to "10"
    expect(result.current.displayValue).toBe('10')

    // Advance partially - should have intermediate value
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // Advance to completion
    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current.displayValue).toBe('07')
  })

  it('pads with leading zeros', () => {
    const { result } = renderHook(() => useNumberRoll())

    act(() => {
      result.current.trigger(5, 3, 200, 3)
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current.displayValue).toBe('003')
  })
})

describe('usePop', () => {
  let rafCallbacks: FrameRequestCallback[]
  let rafId: number

  beforeEach(() => {
    rafCallbacks = []
    rafId = 0
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb)
      return ++rafId
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  function flushRAF() {
    const cbs = [...rafCallbacks]
    rafCallbacks = []
    for (const cb of cbs) {
      cb(performance.now())
    }
  }

  it('trigger changes style.transform then reverts', () => {
    const { result } = renderHook(() => usePop())

    // Initially no transform
    expect(result.current.style.transform).toBeUndefined()

    act(() => {
      result.current.trigger()
    })

    // First frame: scaled up
    act(() => {
      flushRAF()
    })
    expect(result.current.style.transform).toBe('scale(1.08)')

    // Second frame: still scaled
    act(() => {
      flushRAF()
    })
    expect(result.current.style.transform).toBe('scale(1.08)')

    // Third frame: back to normal
    act(() => {
      flushRAF()
    })
    expect(result.current.style.transform).toBeUndefined()
  })
})

describe('useInkBleed', () => {
  let rafCallbacks: FrameRequestCallback[]
  let rafId: number

  beforeEach(() => {
    rafCallbacks = []
    rafId = 0
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb)
      return ++rafId
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  function flushRAF() {
    const cbs = [...rafCallbacks]
    rafCallbacks = []
    for (const cb of cbs) {
      cb(performance.now())
    }
  }

  it('trigger sets color then reverts', () => {
    const { result } = renderHook(() => useInkBleed())

    // Initially empty style
    expect(result.current.style.borderColor).toBeUndefined()
    expect(result.current.style.backgroundColor).toBeUndefined()

    act(() => {
      result.current.trigger('#ff0000')
    })

    // Color should be set immediately (after React batch)
    expect(result.current.style.borderColor).toBe('#ff0000')
    expect(result.current.style.backgroundColor).toBe('#ff0000')

    // After 1 frame: still active (outer raf)
    act(() => {
      flushRAF()
    })

    // After 2nd frame: reverted (inner raf)
    act(() => {
      flushRAF()
    })
    expect(result.current.style.borderColor).toBeUndefined()
    expect(result.current.style.backgroundColor).toBeUndefined()
  })
})
