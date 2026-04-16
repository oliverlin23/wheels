import type { LogEvent, PanelRef } from '../game/types'

/**
 * Timeline step kinds derived from LogEvent. Each step has a target duration
 * and enough data to drive animations (highlighted panels, attack overlay, etc).
 */
export type TimelineStep = {
  event: LogEvent
  durationMs: number
  highlightedPanels: PanelRef[]
  /** Attack kind to render during this step, if any */
  attack?: AttackSpec | undefined
}

export type AttackSpec = {
  kind: 'warrior' | 'mage' | 'archer' | 'engineer' | 'assassin' | 'priest' | 'bomb'
  attackerIdx: 0 | 1
  defenderIdx: 0 | 1
  /** Does the attack actually hit the crown (vs blocked by bulwark)? Determined by data.blocked. */
  hitsBulwark?: boolean | undefined
}

/** Default duration per event type (ms). */
const DURATIONS: Record<LogEvent['type'], number> = {
  panel_xp: 400,
  hammers: 500,
  energy: 500,
  activation: 700,
  damage: 500,
  heal: 400,
  bulwark_change: 400,
  delay: 400,
  bomb: 900,
  rank_up: 600,
  game_over: 1200,
}

/** Map figurine name to attack kind. */
function attackKindForFigurine(name: string): AttackSpec['kind'] | null {
  switch (name) {
    case 'warrior': return 'warrior'
    case 'mage': return 'mage'
    case 'archer': return 'archer'
    case 'engineer': return 'engineer'
    case 'assassin': return 'assassin'
    case 'priest': return 'priest'
    default: return null
  }
}

/**
 * Convert a flat event list into a timeline of steps. Each step carries
 * highlighted panels + optional attack overlay metadata.
 */
export function buildTimeline(events: LogEvent[]): TimelineStep[] {
  const steps: TimelineStep[] = []

  for (const event of events) {
    const duration = DURATIONS[event.type] ?? 500
    const highlightedPanels = event.panelRefs ?? []

    let attack: AttackSpec | undefined

    // Activation events: attach attack spec
    if (event.type === 'activation' || event.type === 'damage') {
      const data = (event.data ?? {}) as Record<string, unknown>
      const attackerIdx = data.attackerIdx as 0 | 1 | undefined
      const defenderIdx = data.defenderIdx as 0 | 1 | undefined
      const figurine = (data.figurine as string | undefined) ?? ''
      const kind = attackKindForFigurine(figurine)
      if (kind && attackerIdx !== undefined && defenderIdx !== undefined) {
        attack = {
          kind,
          attackerIdx,
          defenderIdx,
          hitsBulwark: (data.blocked as boolean | undefined) ?? false,
        }
      }
    }

    // Bomb event: always render bomb projectile
    if (event.type === 'bomb') {
      const data = (event.data ?? {}) as Record<string, unknown>
      const attackerIdx = (data.attackerIdx as 0 | 1 | undefined) ?? (event.player as 0 | 1 | undefined)
      const defenderIdx = data.defenderIdx as 0 | 1 | undefined
      if (attackerIdx !== undefined) {
        attack = {
          kind: 'bomb',
          attackerIdx,
          defenderIdx: defenderIdx ?? (attackerIdx === 0 ? 1 : 0),
          hitsBulwark: false,
        }
      }
    }

    const step: TimelineStep = {
      event,
      durationMs: duration,
      highlightedPanels,
    }
    if (attack !== undefined) {
      step.attack = attack
    }
    steps.push(step)
  }

  return steps
}

/** Total playback duration for a timeline, in ms. */
export function timelineDuration(timeline: TimelineStep[]): number {
  return timeline.reduce((sum, s) => sum + s.durationMs, 0)
}
