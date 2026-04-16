import type { Panel, PanelSymbol } from '../types.ts'

function p(symbol: PanelSymbol, count: number, xp: boolean): Panel {
  return { symbol, count, xp }
}

/**
 * The 5 wheels, each with 8 panels.
 *
 * Notation from the rules:
 *   S = Square(1), D = Diamond(1), H = Hammer(1)
 *   SS = Square(2), DD = Diamond(2), HH = Hammer(2)
 *   + suffix = starry/XP background
 */
export const WHEELS: Panel[][] = [
  // Wheel 1: S, D, S, S+, D, H, DD+, H
  [
    p('sun', 1, false),
    p('moon', 1, false),
    p('sun', 1, false),
    p('sun', 1, true),
    p('moon', 1, false),
    p('shield', 1, false),
    p('moon', 2, true),
    p('shield', 1, false),
  ],
  // Wheel 2: S+, D, SS, D+, S, H, DD, HH
  [
    p('sun', 1, true),
    p('moon', 1, false),
    p('sun', 2, false),
    p('moon', 1, true),
    p('sun', 1, false),
    p('shield', 1, false),
    p('moon', 2, false),
    p('shield', 2, false),
  ],
  // Wheel 3: S+, D, D+, S, D, HH, SS, HH
  [
    p('sun', 1, true),
    p('moon', 1, false),
    p('moon', 1, true),
    p('sun', 1, false),
    p('moon', 1, false),
    p('shield', 2, false),
    p('sun', 2, false),
    p('shield', 2, false),
  ],
  // Wheel 4: S, D, S+, D, HH, S, D+, HH
  [
    p('sun', 1, false),
    p('moon', 1, false),
    p('sun', 1, true),
    p('moon', 1, false),
    p('shield', 2, false),
    p('sun', 1, false),
    p('moon', 1, true),
    p('shield', 2, false),
  ],
  // Wheel 5: S, DD+, HH, SS, DD, SS+, D, HH
  [
    p('sun', 1, false),
    p('moon', 2, true),
    p('shield', 2, false),
    p('sun', 2, false),
    p('moon', 2, false),
    p('sun', 2, true),
    p('moon', 1, false),
    p('shield', 2, false),
  ],
]

/**
 * Count total symbols of a given type across results, respecting count
 * (e.g. SS = 2 squares).
 */
export function countSymbols(results: Panel[], symbol: PanelSymbol): number {
  let total = 0
  for (const panel of results) {
    if (panel.symbol === symbol) {
      total += panel.count
    }
  }
  return total
}

/**
 * Count XP panels matching a slot's symbol.
 * 'suns' slot matches 'sun' panels with xp=true.
 * 'moons' slot matches 'moon' panels with xp=true.
 */
export function countXp(results: Panel[], slot: 'suns' | 'moons'): number {
  const symbol: PanelSymbol = slot === 'suns' ? 'sun' : 'moon'
  let total = 0
  for (const panel of results) {
    if (panel.xp && panel.symbol === symbol) {
      total += 1
    }
  }
  return total
}
