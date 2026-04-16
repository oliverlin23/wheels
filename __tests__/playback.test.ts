import { describe, it, expect } from 'vitest'
import { buildTimeline, timelineDuration } from '../src/resolve/playback'
import type { LogEvent } from '../src/game/types'

describe('buildTimeline', () => {
  it('returns empty for no events', () => {
    expect(buildTimeline([])).toEqual([])
  })

  it('converts each event to a timeline step with duration', () => {
    const events: LogEvent[] = [
      { type: 'panel_xp', detail: 'warrior +1 xp', player: 0 },
      { type: 'hammers', detail: 'shields x3 -> bulwark', player: 0 },
      { type: 'damage', detail: '3 damage', player: 0, data: { attackerIdx: 0, defenderIdx: 1, figurine: 'warrior' } },
    ]
    const tl = buildTimeline(events)
    expect(tl).toHaveLength(3)
    expect(tl[0].durationMs).toBeGreaterThan(0)
    expect(tl[1].durationMs).toBeGreaterThan(0)
    expect(tl[2].durationMs).toBeGreaterThan(0)
  })

  it('attaches attack spec for damage events with figurine data', () => {
    const events: LogEvent[] = [
      {
        type: 'damage',
        detail: 'Warrior strikes crown',
        player: 0,
        data: { attackerIdx: 0, defenderIdx: 1, figurine: 'warrior', blocked: false },
      },
    ]
    const tl = buildTimeline(events)
    expect(tl[0].attack).toBeDefined()
    expect(tl[0].attack?.kind).toBe('warrior')
    expect(tl[0].attack?.attackerIdx).toBe(0)
    expect(tl[0].attack?.defenderIdx).toBe(1)
  })

  it('attaches bomb attack spec for bomb events', () => {
    const events: LogEvent[] = [
      {
        type: 'bomb',
        detail: 'BOMB! 2 damage',
        player: 0,
        data: { attackerIdx: 0, defenderIdx: 1, figurine: 'warrior' },
      },
    ]
    const tl = buildTimeline(events)
    expect(tl[0].attack?.kind).toBe('bomb')
  })

  it('populates highlightedPanels from event.panelRefs', () => {
    const events: LogEvent[] = [
      {
        type: 'energy',
        detail: 'suns x4',
        player: 0,
        panelRefs: [
          { player: 0, wheelIdx: 0 },
          { player: 0, wheelIdx: 2 },
        ],
      },
    ]
    const tl = buildTimeline(events)
    expect(tl[0].highlightedPanels).toHaveLength(2)
    expect(tl[0].highlightedPanels[0]).toEqual({ player: 0, wheelIdx: 0 })
  })

  it('empty highlightedPanels when panelRefs absent', () => {
    const events: LogEvent[] = [
      { type: 'panel_xp', detail: 'message' },
    ]
    const tl = buildTimeline(events)
    expect(tl[0].highlightedPanels).toEqual([])
  })
})

describe('timelineDuration', () => {
  it('sums step durations', () => {
    const events: LogEvent[] = [
      { type: 'panel_xp', detail: 'a' },
      { type: 'hammers', detail: 'b' },
    ]
    const tl = buildTimeline(events)
    const total = timelineDuration(tl)
    expect(total).toBe(tl[0].durationMs + tl[1].durationMs)
  })

  it('returns 0 for empty timeline', () => {
    expect(timelineDuration([])).toBe(0)
  })
})
