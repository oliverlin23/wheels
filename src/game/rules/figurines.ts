import type { FigurineName, FigurineStats, HeroState, LogEvent, PlayerState, Rank } from '../types.ts'

function heroTuple(a: HeroState, b: HeroState): [HeroState, HeroState] {
  return [a, b]
}

const STAT_TABLE: Record<FigurineName, Record<Rank, FigurineStats>> = {
  warrior: {
    bronze: { energyCost: 3, crownDamage: 3, bulwarkDamage: 3, attackHeight: 0 },
    silver: { energyCost: 3, crownDamage: 5, bulwarkDamage: 5, attackHeight: 0 },
    gold: { energyCost: 3, crownDamage: 7, bulwarkDamage: 5, attackHeight: 0 },
  },
  mage: {
    bronze: {
      energyCost: 5,
      groundFireball: { crownDamage: 2, bulwarkDamage: 2 },
      highFireball: { crownDamage: 1 },
    },
    silver: {
      energyCost: 4,
      groundFireball: { crownDamage: 4, bulwarkDamage: 3 },
      highFireball: { crownDamage: 2 },
    },
    gold: {
      energyCost: 4,
      groundFireball: { crownDamage: 6, bulwarkDamage: 4 },
      highFireball: { crownDamage: 3 },
    },
  },
  archer: {
    bronze: { energyCost: 4, crownDamage: 3, bulwarkDamage: 1, attackHeight: 3 },
    silver: { energyCost: 3, crownDamage: 4, bulwarkDamage: 2, attackHeight: 3 },
    gold: { energyCost: 3, crownDamage: 6, bulwarkDamage: 3, attackHeight: 3 },
  },
  engineer: {
    bronze: { energyCost: 4, crownDamage: 1, bulwarkDamage: 3, attackHeight: 0 },
    silver: { energyCost: 4, crownDamage: 2, bulwarkDamage: 5, attackHeight: 0 },
    gold: { energyCost: 3, crownDamage: 4, bulwarkDamage: 5, attackHeight: 0 },
  },
  assassin: {
    bronze: { energyCost: 3, crownDamage: 1, delay: 1, bulwarkStripped: 1 },
    silver: { energyCost: 3, crownDamage: 2, delay: 1, bulwarkStripped: 1 },
    gold: { energyCost: 3, crownDamage: 2, delay: 2, bulwarkStripped: 1 },
  },
  priest: {
    bronze: { energyCost: 4, healing: 1, energyGranted: 1 },
    silver: { energyCost: 3, healing: 1, energyGranted: 1 },
    gold: { energyCost: 3, healing: 2, energyGranted: 2 },
  },
}

export function getStats(name: FigurineName, rank: Rank): FigurineStats {
  return STAT_TABLE[name][rank]
}

export function activateFigurine(
  hero: HeroState,
  attacker: PlayerState,
  defender: PlayerState,
): { attacker: PlayerState; defender: PlayerState; events: LogEvent[] } {
  const stats = getStats(hero.name, hero.rank)
  const events: LogEvent[] = []

  // Find the hero index in attacker's heroes
  const heroIndex = attacker.heroes[0].name === hero.name && attacker.heroes[0].slot === hero.slot ? 0 : 1
  const partnerIndex = heroIndex === 0 ? 1 : 0

  events.push({
    type: 'activation',
    detail: `${hero.name} (${hero.rank}) activates`,
    data: { figurine: hero.name, rank: hero.rank },
  })

  let newAttacker = { ...attacker, heroes: heroTuple(attacker.heroes[0], attacker.heroes[1]) }
  let newDefender = { ...defender, heroes: heroTuple(defender.heroes[0], defender.heroes[1]) }

  // Reset energy to 0 after activation
  newAttacker.heroes[heroIndex] = { ...newAttacker.heroes[heroIndex], energy: 0 }

  switch (hero.name) {
    case 'warrior': {
      // Attack height 0: always hits bulwark if one exists
      const wBulwarkDmg = stats.bulwarkDamage ?? 0
      const wCrownDmg = stats.crownDamage ?? 0
      if (newDefender.bulwark > 0) {
        newDefender = { ...newDefender, bulwark: Math.max(0, newDefender.bulwark - wBulwarkDmg) }
        events.push({
          type: 'damage',
          detail: `Warrior deals ${wBulwarkDmg} bulwark damage`,
          data: { target: 'bulwark', amount: wBulwarkDmg },
        })
      } else {
        newDefender = { ...newDefender, crownHp: Math.max(0, newDefender.crownHp - wCrownDmg) }
        events.push({
          type: 'damage',
          detail: `Warrior deals ${wCrownDmg} crown damage`,
          data: { target: 'crown', amount: wCrownDmg },
        })
      }
      break
    }

    case 'mage': {
      const ground = stats.groundFireball ?? { crownDamage: 0, bulwarkDamage: 0 }
      const high = stats.highFireball ?? { crownDamage: 0 }

      // Ground fireball (height 0): blocked by bulwark if > 0
      if (newDefender.bulwark > 0) {
        newDefender = { ...newDefender, bulwark: Math.max(0, newDefender.bulwark - ground.bulwarkDamage) }
        events.push({
          type: 'damage',
          detail: `Mage ground fireball deals ${ground.bulwarkDamage} bulwark damage`,
          data: { target: 'bulwark', amount: ground.bulwarkDamage },
        })
      } else {
        newDefender = { ...newDefender, crownHp: Math.max(0, newDefender.crownHp - ground.crownDamage) }
        events.push({
          type: 'damage',
          detail: `Mage ground fireball deals ${ground.crownDamage} crown damage`,
          data: { target: 'crown', amount: ground.crownDamage },
        })
      }

      // High fireball (height 6): always hits crown
      newDefender = { ...newDefender, crownHp: Math.max(0, newDefender.crownHp - high.crownDamage) }
      events.push({
        type: 'damage',
        detail: `Mage high fireball deals ${high.crownDamage} crown damage`,
        data: { target: 'crown', amount: high.crownDamage },
      })
      break
    }

    case 'archer': {
      // Attack height 3: hits crown when bulwark < 3, hits bulwark when bulwark >= 3
      const aCrownDmg = stats.crownDamage ?? 0
      const aBulwarkDmg = stats.bulwarkDamage ?? 0
      if (newDefender.bulwark < 3) {
        newDefender = { ...newDefender, crownHp: Math.max(0, newDefender.crownHp - aCrownDmg) }
        events.push({
          type: 'damage',
          detail: `Archer deals ${aCrownDmg} crown damage`,
          data: { target: 'crown', amount: aCrownDmg },
        })
      } else {
        newDefender = { ...newDefender, bulwark: Math.max(0, newDefender.bulwark - aBulwarkDmg) }
        events.push({
          type: 'damage',
          detail: `Archer deals ${aBulwarkDmg} bulwark damage`,
          data: { target: 'bulwark', amount: aBulwarkDmg },
        })
      }
      break
    }

    case 'engineer': {
      // Attack (height 0): hits bulwark if > 0, else crown
      const eBulwarkDmg = stats.bulwarkDamage ?? 0
      const eCrownDmg = stats.crownDamage ?? 0
      if (newDefender.bulwark > 0) {
        newDefender = { ...newDefender, bulwark: Math.max(0, newDefender.bulwark - eBulwarkDmg) }
        events.push({
          type: 'damage',
          detail: `Engineer deals ${eBulwarkDmg} bulwark damage`,
          data: { target: 'bulwark', amount: eBulwarkDmg },
        })
      } else {
        newDefender = { ...newDefender, crownHp: Math.max(0, newDefender.crownHp - eCrownDmg) }
        events.push({
          type: 'damage',
          detail: `Engineer deals ${eCrownDmg} crown damage`,
          data: { target: 'crown', amount: eCrownDmg },
        })
      }

      // Raise own bulwark by 2 (max 5)
      const oldBulwark = newAttacker.bulwark
      newAttacker = { ...newAttacker, bulwark: Math.min(5, newAttacker.bulwark + 2) }
      const gained = newAttacker.bulwark - oldBulwark
      if (gained > 0) {
        events.push({
          type: 'bulwark_change',
          detail: `Engineer raises bulwark by ${gained}`,
          data: { amount: gained },
        })
      }
      break
    }

    case 'assassin': {
      // Bypass bulwark: always hits crown
      const asnCrownDmg = stats.crownDamage ?? 0
      newDefender = { ...newDefender, crownHp: Math.max(0, newDefender.crownHp - asnCrownDmg) }
      events.push({
        type: 'damage',
        detail: `Assassin deals ${asnCrownDmg} crown damage (bypasses bulwark)`,
        data: { target: 'crown', amount: asnCrownDmg },
      })

      // Delay opponent's hero closest to activating
      const delayAmount = stats.delay ?? 0
      const defHeroes = heroTuple(newDefender.heroes[0], newDefender.heroes[1])

      // Find which defender hero is closest to activating (most energy relative to cost)
      const defStats0 = getStats(defHeroes[0].name, defHeroes[0].rank)
      const defStats1 = getStats(defHeroes[1].name, defHeroes[1].rank)
      const ratio0 = defHeroes[0].energy / defStats0.energyCost
      const ratio1 = defHeroes[1].energy / defStats1.energyCost
      const targetIdx = ratio0 >= ratio1 ? 0 : 1

      defHeroes[targetIdx] = {
        ...defHeroes[targetIdx],
        energy: Math.max(0, defHeroes[targetIdx].energy - delayAmount),
      }
      events.push({
        type: 'delay',
        detail: `Assassin delays ${defHeroes[targetIdx].name} by ${delayAmount} energy`,
        data: { target: defHeroes[targetIdx].name, amount: delayAmount },
      })

      // Strip 1 bulwark
      const stripped = stats.bulwarkStripped ?? 0
      if (newDefender.bulwark > 0) {
        const actualStrip = Math.min(stripped, newDefender.bulwark)
        newDefender = { ...newDefender, heroes: defHeroes, bulwark: newDefender.bulwark - actualStrip }
        events.push({
          type: 'bulwark_change',
          detail: `Assassin strips ${actualStrip} bulwark`,
          data: { amount: -actualStrip },
        })
      } else {
        newDefender = { ...newDefender, heroes: defHeroes }
      }
      break
    }

    case 'priest': {
      // Heal own crown (max 12)
      const healAmount = stats.healing ?? 0
      const oldHp = newAttacker.crownHp
      newAttacker = { ...newAttacker, crownHp: Math.min(12, newAttacker.crownHp + healAmount) }
      const actualHeal = newAttacker.crownHp - oldHp
      if (actualHeal > 0) {
        events.push({
          type: 'heal',
          detail: `Priest heals crown for ${actualHeal}`,
          data: { amount: actualHeal },
        })
      }

      // Grant energy to partner hero
      const energyAmount = stats.energyGranted ?? 0
      const heroes = heroTuple(newAttacker.heroes[0], newAttacker.heroes[1])
      heroes[partnerIndex] = {
        ...heroes[partnerIndex],
        energy: heroes[partnerIndex].energy + energyAmount,
      }
      newAttacker = { ...newAttacker, heroes }
      events.push({
        type: 'energy',
        detail: `Priest grants ${energyAmount} energy to ${heroes[partnerIndex].name}`,
        data: { target: heroes[partnerIndex].name, amount: energyAmount },
      })
      break
    }
  }

  return { attacker: newAttacker, defender: newDefender, events }
}
