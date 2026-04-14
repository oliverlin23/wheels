import { describe, it, expect } from 'vitest'
import { getStats, activateFigurine } from '../src/game/rules/figurines.ts'
import type { HeroState, PlayerState, Rank } from '../src/game/types.ts'

function makeHero(overrides: Partial<HeroState> = {}): HeroState {
  return {
    name: 'warrior',
    rank: 'bronze',
    energy: 3,
    xp: 0,
    slot: 'squares',
    ...overrides,
  }
}

function makePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    crownHp: 12,
    bulwark: 0,
    heroes: [
      makeHero({ name: 'warrior', slot: 'squares' }),
      makeHero({ name: 'mage', slot: 'diamonds', energy: 0 }),
    ],
    ...overrides,
  }
}

// ─── getStats ───

describe('getStats', () => {
  const ranks: Rank[] = ['bronze', 'silver', 'gold']

  describe('warrior', () => {
    it.each([
      ['bronze', 3, 3, 3, 0],
      ['silver', 3, 5, 5, 0],
      ['gold', 3, 7, 5, 0],
    ] as const)('%s rank', (rank, energy, crown, bulwark, height) => {
      const s = getStats('warrior', rank)
      expect(s.energyCost).toBe(energy)
      expect(s.crownDamage).toBe(crown)
      expect(s.bulwarkDamage).toBe(bulwark)
      expect(s.attackHeight).toBe(height)
    })
  })

  describe('mage', () => {
    it.each([
      ['bronze', 5, 2, 2, 1],
      ['silver', 4, 4, 3, 2],
      ['gold', 4, 6, 4, 3],
    ] as const)('%s rank', (rank, energy, groundCrown, groundBulwark, highCrown) => {
      const s = getStats('mage', rank)
      expect(s.energyCost).toBe(energy)
      expect(s.groundFireball).toEqual({ crownDamage: groundCrown, bulwarkDamage: groundBulwark })
      expect(s.highFireball).toEqual({ crownDamage: highCrown })
    })
  })

  describe('archer', () => {
    it.each([
      ['bronze', 4, 3, 1, 3],
      ['silver', 3, 4, 2, 3],
      ['gold', 3, 6, 3, 3],
    ] as const)('%s rank', (rank, energy, crown, bulwark, height) => {
      const s = getStats('archer', rank)
      expect(s.energyCost).toBe(energy)
      expect(s.crownDamage).toBe(crown)
      expect(s.bulwarkDamage).toBe(bulwark)
      expect(s.attackHeight).toBe(height)
    })
  })

  describe('engineer', () => {
    it.each([
      ['bronze', 4, 1, 3, 0],
      ['silver', 4, 2, 5, 0],
      ['gold', 3, 4, 5, 0],
    ] as const)('%s rank', (rank, energy, crown, bulwark, height) => {
      const s = getStats('engineer', rank)
      expect(s.energyCost).toBe(energy)
      expect(s.crownDamage).toBe(crown)
      expect(s.bulwarkDamage).toBe(bulwark)
      expect(s.attackHeight).toBe(height)
    })
  })

  describe('assassin', () => {
    it.each([
      ['bronze', 3, 1, 1, 1],
      ['silver', 3, 2, 1, 1],
      ['gold', 3, 2, 2, 1],
    ] as const)('%s rank', (rank, energy, crown, delay, stripped) => {
      const s = getStats('assassin', rank)
      expect(s.energyCost).toBe(energy)
      expect(s.crownDamage).toBe(crown)
      expect(s.delay).toBe(delay)
      expect(s.bulwarkStripped).toBe(stripped)
    })
  })

  describe('priest', () => {
    it.each([
      ['bronze', 4, 1, 1],
      ['silver', 3, 1, 1],
      ['gold', 3, 2, 2],
    ] as const)('%s rank', (rank, energy, healing, granted) => {
      const s = getStats('priest', rank)
      expect(s.energyCost).toBe(energy)
      expect(s.healing).toBe(healing)
      expect(s.energyGranted).toBe(granted)
    })
  })
})

// ─── activateFigurine ───

describe('activateFigurine', () => {
  describe('warrior', () => {
    it('hits bulwark when defender has bulwark > 0', () => {
      const hero = makeHero({ name: 'warrior', rank: 'bronze', energy: 3 })
      const attacker = makePlayer({
        heroes: [hero, makeHero({ name: 'mage', slot: 'diamonds', energy: 0 })],
      })
      const defender = makePlayer({ bulwark: 5 })

      const result = activateFigurine(hero, attacker, defender)

      expect(result.defender.bulwark).toBe(2) // 5 - 3
      expect(result.defender.crownHp).toBe(12) // untouched
      expect(result.attacker.heroes[0].energy).toBe(0) // reset
    })

    it('hits crown when defender has no bulwark', () => {
      const hero = makeHero({ name: 'warrior', rank: 'silver', energy: 3 })
      const attacker = makePlayer({
        heroes: [hero, makeHero({ name: 'mage', slot: 'diamonds', energy: 0 })],
      })
      const defender = makePlayer({ bulwark: 0 })

      const result = activateFigurine(hero, attacker, defender)

      expect(result.defender.crownHp).toBe(7) // 12 - 5
      expect(result.defender.bulwark).toBe(0)
    })
  })

  describe('mage', () => {
    it('ground fireball blocked by bulwark, high fireball always hits crown', () => {
      const hero = makeHero({ name: 'mage', rank: 'bronze', energy: 5, slot: 'diamonds' })
      const attacker = makePlayer({
        heroes: [makeHero({ name: 'warrior', slot: 'squares' }), hero],
      })
      const defender = makePlayer({ bulwark: 3 })

      const result = activateFigurine(hero, attacker, defender)

      // Ground fireball: 2 bulwark damage -> 3-2 = 1
      expect(result.defender.bulwark).toBe(1)
      // High fireball: 1 crown damage -> 12-1 = 11
      expect(result.defender.crownHp).toBe(11)
    })

    it('ground fireball hits crown when no bulwark', () => {
      const hero = makeHero({ name: 'mage', rank: 'silver', energy: 4, slot: 'diamonds' })
      const attacker = makePlayer({
        heroes: [makeHero({ name: 'warrior', slot: 'squares' }), hero],
      })
      const defender = makePlayer({ bulwark: 0 })

      const result = activateFigurine(hero, attacker, defender)

      // Ground: 4 crown, High: 2 crown -> 12-4-2 = 6
      expect(result.defender.crownHp).toBe(6)
      expect(result.defender.bulwark).toBe(0)
    })
  })

  describe('archer', () => {
    it('hits crown when defender bulwark < 3', () => {
      const hero = makeHero({ name: 'archer', rank: 'bronze', energy: 4 })
      const attacker = makePlayer({
        heroes: [hero, makeHero({ name: 'mage', slot: 'diamonds', energy: 0 })],
      })
      const defender = makePlayer({ bulwark: 2 })

      const result = activateFigurine(hero, attacker, defender)

      expect(result.defender.crownHp).toBe(9) // 12 - 3
      expect(result.defender.bulwark).toBe(2) // untouched
    })

    it('hits bulwark when defender bulwark >= 3', () => {
      const hero = makeHero({ name: 'archer', rank: 'gold', energy: 3 })
      const attacker = makePlayer({
        heroes: [hero, makeHero({ name: 'mage', slot: 'diamonds', energy: 0 })],
      })
      const defender = makePlayer({ bulwark: 4 })

      const result = activateFigurine(hero, attacker, defender)

      expect(result.defender.bulwark).toBe(1) // 4 - 3
      expect(result.defender.crownHp).toBe(12) // untouched
    })
  })

  describe('engineer', () => {
    it('deals damage and raises own bulwark', () => {
      const hero = makeHero({ name: 'engineer', rank: 'bronze', energy: 4 })
      const attacker = makePlayer({
        bulwark: 1,
        heroes: [hero, makeHero({ name: 'mage', slot: 'diamonds', energy: 0 })],
      })
      const defender = makePlayer({ bulwark: 0 })

      const result = activateFigurine(hero, attacker, defender)

      // Attack: no bulwark on defender -> 1 crown damage
      expect(result.defender.crownHp).toBe(11)
      // Raise own bulwark: 1 + 2 = 3
      expect(result.attacker.bulwark).toBe(3)
    })

    it('caps own bulwark at 5', () => {
      const hero = makeHero({ name: 'engineer', rank: 'silver', energy: 4 })
      const attacker = makePlayer({
        bulwark: 4,
        heroes: [hero, makeHero({ name: 'mage', slot: 'diamonds', energy: 0 })],
      })
      const defender = makePlayer({ bulwark: 0 })

      const result = activateFigurine(hero, attacker, defender)

      expect(result.attacker.bulwark).toBe(5) // capped
    })

    it('hits defender bulwark when present', () => {
      const hero = makeHero({ name: 'engineer', rank: 'silver', energy: 4 })
      const attacker = makePlayer({
        bulwark: 0,
        heroes: [hero, makeHero({ name: 'mage', slot: 'diamonds', energy: 0 })],
      })
      const defender = makePlayer({ bulwark: 3 })

      const result = activateFigurine(hero, attacker, defender)

      // 5 bulwark damage to defender's 3 bulwark -> 0
      expect(result.defender.bulwark).toBe(0)
      expect(result.defender.crownHp).toBe(12)
    })
  })

  describe('assassin', () => {
    it('bypasses bulwark, delays opponent hero, strips bulwark', () => {
      const hero = makeHero({ name: 'assassin', rank: 'bronze', energy: 3 })
      const defHero0 = makeHero({ name: 'warrior', slot: 'squares', energy: 2 })
      const defHero1 = makeHero({ name: 'mage', slot: 'diamonds', energy: 4 })
      const attacker = makePlayer({
        heroes: [hero, makeHero({ name: 'mage', slot: 'diamonds', energy: 0 })],
      })
      const defender = makePlayer({
        bulwark: 3,
        heroes: [defHero0, defHero1],
      })

      const result = activateFigurine(hero, attacker, defender)

      // Crown damage bypasses bulwark: 12 - 1 = 11
      expect(result.defender.crownHp).toBe(11)
      // Delays hero closest to activating (mage has 4/5 = 0.8 ratio vs warrior 2/3 = 0.67)
      // mage delayed by 1 -> 4 - 1 = 3
      expect(result.defender.heroes[1].energy).toBe(3)
      expect(result.defender.heroes[0].energy).toBe(2) // untouched
      // Strip 1 bulwark: 3 - 1 = 2
      expect(result.defender.bulwark).toBe(2)
    })

    it('does not strip bulwark below 0', () => {
      const hero = makeHero({ name: 'assassin', rank: 'silver', energy: 3 })
      const attacker = makePlayer({
        heroes: [hero, makeHero({ name: 'mage', slot: 'diamonds', energy: 0 })],
      })
      const defender = makePlayer({ bulwark: 0 })

      const result = activateFigurine(hero, attacker, defender)

      expect(result.defender.bulwark).toBe(0)
      expect(result.defender.crownHp).toBe(10) // 12 - 2
    })
  })

  describe('priest', () => {
    it('heals crown and grants energy to partner', () => {
      const hero = makeHero({ name: 'priest', rank: 'bronze', energy: 4, slot: 'diamonds' })
      const partner = makeHero({ name: 'warrior', slot: 'squares', energy: 1 })
      const attacker = makePlayer({
        crownHp: 8,
        heroes: [partner, hero],
      })
      const defender = makePlayer()

      const result = activateFigurine(hero, attacker, defender)

      // Heal: 8 + 1 = 9
      expect(result.attacker.crownHp).toBe(9)
      // Energy to partner: 1 + 1 = 2
      expect(result.attacker.heroes[0].energy).toBe(2)
      // Priest energy reset
      expect(result.attacker.heroes[1].energy).toBe(0)
    })

    it('caps healing at 12', () => {
      const hero = makeHero({ name: 'priest', rank: 'gold', energy: 3, slot: 'diamonds' })
      const partner = makeHero({ name: 'warrior', slot: 'squares', energy: 0 })
      const attacker = makePlayer({
        crownHp: 11,
        heroes: [partner, hero],
      })
      const defender = makePlayer()

      const result = activateFigurine(hero, attacker, defender)

      // Heal: min(12, 11 + 2) = 12
      expect(result.attacker.crownHp).toBe(12)
      // Energy granted: 0 + 2 = 2
      expect(result.attacker.heroes[0].energy).toBe(2)
    })
  })

  it('does not mutate input states', () => {
    const hero = makeHero({ name: 'warrior', rank: 'bronze', energy: 3 })
    const attacker = makePlayer({
      heroes: [hero, makeHero({ name: 'mage', slot: 'diamonds', energy: 0 })],
    })
    const defender = makePlayer({ crownHp: 10, bulwark: 0 })

    const originalAttacker = JSON.parse(JSON.stringify(attacker))
    const originalDefender = JSON.parse(JSON.stringify(defender))

    activateFigurine(hero, attacker, defender)

    expect(attacker).toEqual(originalAttacker)
    expect(defender).toEqual(originalDefender)
  })
})
