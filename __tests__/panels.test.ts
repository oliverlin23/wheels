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

  it('wheels 1-4 each have 3 sun panels, 3 moon panels, 2 shield panels', () => {
    for (let i = 0; i < 4; i++) {
      expect(symbolCount(WHEELS[i], 'sun')).toBe(3)
      expect(symbolCount(WHEELS[i], 'moon')).toBe(3)
      expect(symbolCount(WHEELS[i], 'shield')).toBe(2)
    }
  })

  it('wheel 5 has the correct distribution', () => {
    const wheel5 = WHEELS[4]
    // S, DD+, HH, SS, DD, SS+, D, HH
    // suns: S, SS, SS+ = 3 panels
    // moons: DD+, DD, D = 3 panels
    // shields: HH, HH = 2 panels
    expect(symbolCount(wheel5, 'sun')).toBe(3)
    expect(symbolCount(wheel5, 'moon')).toBe(3)
    expect(symbolCount(wheel5, 'shield')).toBe(2)
  })
})

describe('countSymbols', () => {
  it('counts single-symbol panels correctly', () => {
    const results: Panel[] = [
      { symbol: 'sun', count: 1, xp: false },
      { symbol: 'moon', count: 1, xp: false },
      { symbol: 'shield', count: 1, xp: false },
      { symbol: 'sun', count: 1, xp: true },
      { symbol: 'moon', count: 1, xp: false },
    ]
    expect(countSymbols(results, 'sun')).toBe(2)
    expect(countSymbols(results, 'moon')).toBe(2)
    expect(countSymbols(results, 'shield')).toBe(1)
  })

  it('counts multi-symbol panels correctly', () => {
    const results: Panel[] = [
      { symbol: 'sun', count: 2, xp: false },
      { symbol: 'moon', count: 2, xp: true },
      { symbol: 'shield', count: 2, xp: false },
      { symbol: 'sun', count: 1, xp: false },
      { symbol: 'moon', count: 1, xp: false },
    ]
    expect(countSymbols(results, 'sun')).toBe(3)
    expect(countSymbols(results, 'moon')).toBe(3)
    expect(countSymbols(results, 'shield')).toBe(2)
  })

  it('returns 0 when no matching symbols', () => {
    const results: Panel[] = [
      { symbol: 'sun', count: 1, xp: false },
    ]
    expect(countSymbols(results, 'shield')).toBe(0)
  })
})

describe('countXp', () => {
  it('counts XP panels for suns slot', () => {
    const results: Panel[] = [
      { symbol: 'sun', count: 1, xp: true },
      { symbol: 'sun', count: 1, xp: false },
      { symbol: 'moon', count: 1, xp: true },
      { symbol: 'sun', count: 2, xp: true },
      { symbol: 'shield', count: 1, xp: false },
    ]
    expect(countXp(results, 'suns')).toBe(2)
  })

  it('counts XP panels for moons slot', () => {
    const results: Panel[] = [
      { symbol: 'sun', count: 1, xp: true },
      { symbol: 'moon', count: 1, xp: true },
      { symbol: 'moon', count: 2, xp: true },
      { symbol: 'moon', count: 1, xp: false },
      { symbol: 'shield', count: 2, xp: false },
    ]
    expect(countXp(results, 'moons')).toBe(2)
  })

  it('returns 0 when no XP panels match', () => {
    const results: Panel[] = [
      { symbol: 'sun', count: 1, xp: false },
      { symbol: 'moon', count: 1, xp: false },
    ]
    expect(countXp(results, 'suns')).toBe(0)
    expect(countXp(results, 'moons')).toBe(0)
  })
})
