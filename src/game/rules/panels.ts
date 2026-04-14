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
    p('square', 1, false),
    p('diamond', 1, false),
    p('square', 1, false),
    p('square', 1, true),
    p('diamond', 1, false),
    p('hammer', 1, false),
    p('diamond', 2, true),
    p('hammer', 1, false),
  ],
  // Wheel 2: S+, D, SS, D+, S, H, DD, HH
  [
    p('square', 1, true),
    p('diamond', 1, false),
    p('square', 2, false),
    p('diamond', 1, true),
    p('square', 1, false),
    p('hammer', 1, false),
    p('diamond', 2, false),
    p('hammer', 2, false),
  ],
  // Wheel 3: S+, D, D+, S, D, HH, SS, HH
  [
    p('square', 1, true),
    p('diamond', 1, false),
    p('diamond', 1, true),
    p('square', 1, false),
    p('diamond', 1, false),
    p('hammer', 2, false),
    p('square', 2, false),
    p('hammer', 2, false),
  ],
  // Wheel 4: S, D, S+, D, HH, S, D+, HH
  [
    p('square', 1, false),
    p('diamond', 1, false),
    p('square', 1, true),
    p('diamond', 1, false),
    p('hammer', 2, false),
    p('square', 1, false),
    p('diamond', 1, true),
    p('hammer', 2, false),
  ],
  // Wheel 5: S, DD+, HH, SS, DD, SS+, D, HH
  [
    p('square', 1, false),
    p('diamond', 2, true),
    p('hammer', 2, false),
    p('square', 2, false),
    p('diamond', 2, false),
    p('square', 2, true),
    p('diamond', 1, false),
    p('hammer', 2, false),
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
 * 'squares' slot matches 'square' panels with xp=true.
 * 'diamonds' slot matches 'diamond' panels with xp=true.
 */
export function countXp(results: Panel[], slot: 'squares' | 'diamonds'): number {
  const symbol: PanelSymbol = slot === 'squares' ? 'square' : 'diamond'
  let total = 0
  for (const panel of results) {
    if (panel.xp && panel.symbol === symbol) {
      total += 1
    }
  }
  return total
}
