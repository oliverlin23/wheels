import { describe, it, expect } from 'vitest'
import { addXp, applyBomb, XP_THRESHOLD } from '../src/game/rules/xp.ts'
import type { HeroState, PlayerState } from '../src/game/types.ts'

function makeHero(overrides: Partial<HeroState> = {}): HeroState {
  return {
    name: 'warrior',
    rank: 'bronze',
    energy: 0,
    xp: 0,
    slot: 'squares',
    ...overrides,
  }
}

describe('XP_THRESHOLD', () => {
  it('is 10', () => {
    expect(XP_THRESHOLD).toBe(10)
  })
})

describe('addXp', () => {
  it('accumulates XP correctly', () => {
    const hero = makeHero({ xp: 3 })
    const result = addXp(hero, 4)

    expect(result.hero.xp).toBe(7)
    expect(result.hero.rank).toBe('bronze')
    expect(result.events).toHaveLength(0)
  })

  it('ranks up from bronze to silver at 10 XP', () => {
    const hero = makeHero({ rank: 'bronze', xp: 7 })
    const result = addXp(hero, 3)

    expect(result.hero.rank).toBe('silver')
    expect(result.hero.xp).toBe(0)
    expect(result.events).toHaveLength(1)
    expect(result.events[0].type).toBe('rank_up')
  })

  it('ranks up from silver to gold at 10 XP', () => {
    const hero = makeHero({ rank: 'silver', xp: 5 })
    const result = addXp(hero, 5)

    expect(result.hero.rank).toBe('gold')
    expect(result.hero.xp).toBe(0)
    expect(result.events).toHaveLength(1)
    expect(result.events[0].type).toBe('rank_up')
  })

  it('triggers bomb after gold at 10 XP', () => {
    const hero = makeHero({ rank: 'gold', xp: 8 })
    const result = addXp(hero, 2)

    expect(result.hero.rank).toBe('gold') // stays gold
    expect(result.hero.xp).toBe(0)
    expect(result.events).toHaveLength(1)
    expect(result.events[0].type).toBe('bomb')
  })

  it('excess XP carries over on rank-up', () => {
    const hero = makeHero({ rank: 'bronze', xp: 7 })
    const result = addXp(hero, 5)

    expect(result.hero.rank).toBe('silver')
    expect(result.hero.xp).toBe(2) // 7 + 5 = 12, 12 - 10 = 2
  })

  it('excess XP carries over on bomb', () => {
    const hero = makeHero({ rank: 'gold', xp: 9 })
    const result = addXp(hero, 3)

    expect(result.hero.rank).toBe('gold')
    expect(result.hero.xp).toBe(2) // 9 + 3 = 12, 12 - 10 = 2
    expect(result.events[0].type).toBe('bomb')
  })

  it('does not rank up twice in one call', () => {
    // Even with 20+ XP in one call, only one rank-up happens
    const hero = makeHero({ rank: 'bronze', xp: 0 })
    const result = addXp(hero, 15)

    expect(result.hero.rank).toBe('silver')
    expect(result.hero.xp).toBe(5) // 15 - 10 = 5
    expect(result.events).toHaveLength(1)
  })

  it('does not mutate input hero', () => {
    const hero = makeHero({ rank: 'bronze', xp: 9 })
    const original = { ...hero }

    addXp(hero, 3)

    expect(hero).toEqual(original)
  })
})

describe('applyBomb', () => {
  it('deals 2 crown damage bypassing bulwark', () => {
    const defender: PlayerState = {
      crownHp: 10,
      bulwark: 5,
      heroes: [makeHero(), makeHero({ name: 'mage', slot: 'diamonds' })],
    }

    const result = applyBomb(defender)

    expect(result.defender.crownHp).toBe(8) // 10 - 2
    expect(result.defender.bulwark).toBe(5) // untouched
    expect(result.events).toHaveLength(1)
    expect(result.events[0].type).toBe('damage')
  })

  it('does not reduce crown below 0', () => {
    const defender: PlayerState = {
      crownHp: 1,
      bulwark: 3,
      heroes: [makeHero(), makeHero({ name: 'mage', slot: 'diamonds' })],
    }

    const result = applyBomb(defender)

    expect(result.defender.crownHp).toBe(0)
  })

  it('does not mutate input state', () => {
    const defender: PlayerState = {
      crownHp: 10,
      bulwark: 5,
      heroes: [makeHero(), makeHero({ name: 'mage', slot: 'diamonds' })],
    }
    const original = JSON.parse(JSON.stringify(defender))

    applyBomb(defender)

    expect(defender).toEqual(original)
  })
})
