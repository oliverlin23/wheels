import { describe, it, expect } from 'vitest'
import { createRng, rollWheel } from '../src/game/rng.ts'
import { WHEELS } from '../src/game/rules/panels.ts'

describe('createRng', () => {
  it('same seed produces same sequence', () => {
    const rng1 = createRng(42)
    const rng2 = createRng(42)
    for (let i = 0; i < 100; i++) {
      expect(rng1()).toBe(rng2())
    }
  })

  it('different seeds produce different sequences', () => {
    const rng1 = createRng(42)
    const rng2 = createRng(99)
    const results1: number[] = []
    const results2: number[] = []
    for (let i = 0; i < 10; i++) {
      results1.push(rng1())
      results2.push(rng2())
    }
    // At least one value should differ
    const allSame = results1.every((v, i) => v === results2[i])
    expect(allSame).toBe(false)
  })

  it('output is in [0, 1)', () => {
    const rng = createRng(123)
    for (let i = 0; i < 1000; i++) {
      const val = rng()
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThan(1)
    }
  })
})

describe('rollWheel', () => {
  it('returns a valid panel from the wheel', () => {
    const rng = createRng(7)
    for (let wheelIndex = 0; wheelIndex < 5; wheelIndex++) {
      const panels = WHEELS[wheelIndex]
      for (let i = 0; i < 20; i++) {
        const result = rollWheel(rng, wheelIndex, panels)
        expect(panels).toContainEqual(result)
      }
    }
  })

  it('is deterministic with the same seed', () => {
    const rng1 = createRng(55)
    const rng2 = createRng(55)
    for (let wheelIndex = 0; wheelIndex < 5; wheelIndex++) {
      const panels = WHEELS[wheelIndex]
      const result1 = rollWheel(rng1, wheelIndex, panels)
      const result2 = rollWheel(rng2, wheelIndex, panels)
      expect(result1).toEqual(result2)
    }
  })
})
