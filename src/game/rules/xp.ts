import type { HeroState, LogEvent, PlayerState } from '../types.ts'

export const XP_THRESHOLD = 10

export function addXp(
  hero: HeroState,
  amount: number,
): { hero: HeroState; events: LogEvent[] } {
  const events: LogEvent[] = []
  let newXp = hero.xp + amount
  let newRank = hero.rank

  if (newXp >= XP_THRESHOLD) {
    newXp -= XP_THRESHOLD

    if (newRank === 'bronze') {
      newRank = 'silver'
      events.push({
        type: 'rank_up',
        detail: `${hero.name} ranks up to silver`,
        data: { figurine: hero.name, newRank: 'silver' },
      })
    } else if (newRank === 'silver') {
      newRank = 'gold'
      events.push({
        type: 'rank_up',
        detail: `${hero.name} ranks up to gold`,
        data: { figurine: hero.name, newRank: 'gold' },
      })
    } else {
      // Gold + threshold = bomb
      events.push({
        type: 'bomb',
        detail: `${hero.name} triggers a bomb!`,
        data: { figurine: hero.name },
      })
    }
  }

  return {
    hero: { ...hero, rank: newRank, xp: newXp },
    events,
  }
}

export function applyBomb(
  defender: PlayerState,
): { defender: PlayerState; events: LogEvent[] } {
  const damage = 2
  const newCrownHp = Math.max(0, defender.crownHp - damage)
  const events: LogEvent[] = [
    {
      type: 'damage',
      detail: `Bomb deals ${damage} crown damage (bypasses bulwark)`,
      data: { target: 'crown', amount: damage, source: 'bomb' },
    },
  ]

  return {
    defender: { ...defender, crownHp: newCrownHp },
    events,
  }
}
