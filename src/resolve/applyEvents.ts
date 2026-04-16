import type { GameState, LogEvent, PlayerState } from '../game/types'

/**
 * Apply a single event to a game state, producing a new game state.
 * This is a "display" simulator — it only mutates fields the player sees
 * change incrementally (crownHp, bulwark, heroes' energy/xp/rank).
 *
 * Other field changes (e.g. hero activation side-effects) rely on the
 * authoritative final state at end of playback.
 */
export function applyEvent(game: GameState, event: LogEvent): GameState {
  const data = (event.data ?? {}) as Record<string, unknown>
  const attackerIdx = data.attackerIdx as 0 | 1 | undefined
  const defenderIdx = data.defenderIdx as 0 | 1 | undefined
  const target = data.target as 'crown' | 'bulwark' | undefined
  const amount = (data.amount as number | undefined) ?? 0

  switch (event.type) {
    case 'damage': {
      if (defenderIdx === undefined) return game
      const players = [...game.players] as [PlayerState, PlayerState]
      const def = players[defenderIdx]
      if (target === 'crown') {
        players[defenderIdx] = { ...def, crownHp: Math.max(0, def.crownHp - amount) }
      } else if (target === 'bulwark') {
        players[defenderIdx] = { ...def, bulwark: Math.max(0, def.bulwark - amount) }
      }
      return { ...game, players }
    }

    case 'bomb': {
      // Bomb always deals 2 crown damage and bypasses bulwark
      if (defenderIdx === undefined) return game
      const players = [...game.players] as [PlayerState, PlayerState]
      const def = players[defenderIdx]
      const bombAmount = amount || 2
      players[defenderIdx] = { ...def, crownHp: Math.max(0, def.crownHp - bombAmount) }
      return { ...game, players }
    }

    case 'heal': {
      // Heal applies to the attacker's (emitter's) own crown
      const healerIdx = attackerIdx ?? event.player
      if (healerIdx !== 0 && healerIdx !== 1) return game
      const players = [...game.players] as [PlayerState, PlayerState]
      const healer = players[healerIdx]
      players[healerIdx] = { ...healer, crownHp: Math.min(12, healer.crownHp + amount) }
      return { ...game, players }
    }

    case 'bulwark_change': {
      // Positive amount: attacker builds own bulwark. Negative: defender strip.
      const isStrip = amount < 0
      const idx = isStrip ? defenderIdx : (attackerIdx ?? event.player)
      if (idx !== 0 && idx !== 1) return game
      const players = [...game.players] as [PlayerState, PlayerState]
      const p = players[idx]
      const delta = isStrip ? amount : amount
      const newBulwark = Math.max(0, Math.min(5, p.bulwark + delta))
      players[idx] = { ...p, bulwark: newBulwark }
      return { ...game, players }
    }

    case 'hammers': {
      // Bulwark built from hammer panels — amount = gained (in data.gained)
      const gained = (data.gained as number | undefined) ?? 0
      const idx = event.player
      if (idx !== 0 && idx !== 1) return game
      if (gained <= 0) return game
      const players = [...game.players] as [PlayerState, PlayerState]
      const p = players[idx]
      players[idx] = { ...p, bulwark: Math.max(0, Math.min(5, p.bulwark + gained)) }
      return { ...game, players }
    }

    default:
      return game
  }
}

/**
 * Apply a sequence of events to a starting game state, one at a time.
 */
export function applyEvents(game: GameState, events: LogEvent[]): GameState {
  let current = game
  for (const event of events) {
    current = applyEvent(current, event)
  }
  return current
}
