import type { Panel } from './types.ts'

/**
 * Create a seeded PRNG using the mulberry32 algorithm.
 * Returns a function that produces deterministic floats in [0, 1).
 */
export function createRng(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Given the panels for a wheel, pick one randomly using the rng.
 * Each panel has equal probability.
 */
export function rollWheel(rng: () => number, _wheelIndex: number, panels: Panel[]): Panel {
  const index = Math.floor(rng() * panels.length)
  return panels[index]
}
