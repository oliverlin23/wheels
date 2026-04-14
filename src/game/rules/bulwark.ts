import type { PlayerState, LogEvent } from '../types'

export const MAX_BULWARK = 5

export function decayBulwark(player: PlayerState): { player: PlayerState; events: LogEvent[] } {
  if (player.bulwark <= 0) {
    return { player, events: [] }
  }

  const newBulwark = player.bulwark - 1
  return {
    player: { ...player, bulwark: newBulwark },
    events: [
      {
        type: 'bulwark_change',
        detail: `Bulwark decayed from ${player.bulwark} to ${newBulwark}`,
        data: { previous: player.bulwark, current: newBulwark },
      },
    ],
  }
}

export function buildBulwark(
  player: PlayerState,
  hammerCount: number,
): { player: PlayerState; events: LogEvent[] } {
  if (hammerCount < 3) {
    return { player, events: [] }
  }

  const gained = hammerCount - 2
  const newBulwark = Math.min(player.bulwark + gained, MAX_BULWARK)

  if (newBulwark === player.bulwark) {
    return { player, events: [] }
  }

  return {
    player: { ...player, bulwark: newBulwark },
    events: [
      {
        type: 'bulwark_change',
        detail: `Bulwark built from ${player.bulwark} to ${newBulwark} (${hammerCount} hammers)`,
        data: { previous: player.bulwark, current: newBulwark, hammers: hammerCount },
      },
    ],
  }
}

export function damageBulwark(
  player: PlayerState,
  damage: number,
): { player: PlayerState; events: LogEvent[] } {
  if (damage <= 0 || player.bulwark <= 0) {
    return { player, events: [] }
  }

  const newBulwark = Math.max(0, player.bulwark - damage)
  return {
    player: { ...player, bulwark: newBulwark },
    events: [
      {
        type: 'bulwark_change',
        detail: `Bulwark took ${damage} damage, reduced from ${player.bulwark} to ${newBulwark}`,
        data: { previous: player.bulwark, current: newBulwark, damage },
      },
    ],
  }
}
