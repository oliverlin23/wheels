import { describe, it, expect } from 'vitest'
import { WHEELS, countSymbols, countXp } from '../src/game/rules/panels.ts'
import type { Panel, PanelSymbol } from '../src/game/types.ts'

function symbolCount(wheel: Panel[], symbol: PanelSymbol): number {
  return wheel.filter((p) => p.symbol === symbol).length
}

describe('WHEELS', () => {
  it('has exactly 5 wheels', () => {
    expect(WHEELS).toHaveLength(5)
  })

  it('each wheel has exactly 8 panels', () => {
    for (const wheel of WHEELS) {
      expect(wheel).toHaveLength(8)
    }
  })

  it('wheels 1-4 each have 3 square panels, 3 diamond panels, 2 hammer panels', () => {
    for (let i = 0; i < 4; i++) {
      expect(symbolCount(WHEELS[i], 'square')).toBe(3)
      expect(symbolCount(WHEELS[i], 'diamond')).toBe(3)
      expect(symbolCount(WHEELS[i], 'hammer')).toBe(2)
    }
  })

  it('wheel 5 has the correct distribution', () => {
    const wheel5 = WHEELS[4]
    // S, DD+, HH, SS, DD, SS+, D, HH
    // squares: S, SS, SS+ = 3 panels
    // diamonds: DD+, DD, D = 3 panels
    // hammers: HH, HH = 2 panels
    expect(symbolCount(wheel5, 'square')).toBe(3)
    expect(symbolCount(wheel5, 'diamond')).toBe(3)
    expect(symbolCount(wheel5, 'hammer')).toBe(2)
  })
})

describe('countSymbols', () => {
  it('counts single-symbol panels correctly', () => {
    const results: Panel[] = [
      { symbol: 'square', count: 1, xp: false },
      { symbol: 'diamond', count: 1, xp: false },
      { symbol: 'hammer', count: 1, xp: false },
      { symbol: 'square', count: 1, xp: true },
      { symbol: 'diamond', count: 1, xp: false },
    ]
    expect(countSymbols(results, 'square')).toBe(2)
    expect(countSymbols(results, 'diamond')).toBe(2)
    expect(countSymbols(results, 'hammer')).toBe(1)
  })

  it('counts multi-symbol panels correctly', () => {
    const results: Panel[] = [
      { symbol: 'square', count: 2, xp: false },
      { symbol: 'diamond', count: 2, xp: true },
      { symbol: 'hammer', count: 2, xp: false },
      { symbol: 'square', count: 1, xp: false },
      { symbol: 'diamond', count: 1, xp: false },
    ]
    expect(countSymbols(results, 'square')).toBe(3)
    expect(countSymbols(results, 'diamond')).toBe(3)
    expect(countSymbols(results, 'hammer')).toBe(2)
  })

  it('returns 0 when no matching symbols', () => {
    const results: Panel[] = [
      { symbol: 'square', count: 1, xp: false },
    ]
    expect(countSymbols(results, 'hammer')).toBe(0)
  })
})

describe('countXp', () => {
  it('counts XP panels for squares slot', () => {
    const results: Panel[] = [
      { symbol: 'square', count: 1, xp: true },
      { symbol: 'square', count: 1, xp: false },
      { symbol: 'diamond', count: 1, xp: true },
      { symbol: 'square', count: 2, xp: true },
      { symbol: 'hammer', count: 1, xp: false },
    ]
    expect(countXp(results, 'squares')).toBe(2)
  })

  it('counts XP panels for diamonds slot', () => {
    const results: Panel[] = [
      { symbol: 'square', count: 1, xp: true },
      { symbol: 'diamond', count: 1, xp: true },
      { symbol: 'diamond', count: 2, xp: true },
      { symbol: 'diamond', count: 1, xp: false },
      { symbol: 'hammer', count: 2, xp: false },
    ]
    expect(countXp(results, 'diamonds')).toBe(2)
  })

  it('returns 0 when no XP panels match', () => {
    const results: Panel[] = [
      { symbol: 'square', count: 1, xp: false },
      { symbol: 'diamond', count: 1, xp: false },
    ]
    expect(countXp(results, 'squares')).toBe(0)
    expect(countXp(results, 'diamonds')).toBe(0)
  })
})
