import type { HeroState } from '../types'

export function calculateEnergy(symbolCount: number): number {
  return Math.max(0, symbolCount - 2)
}

export function addEnergy(
  hero: HeroState,
  amount: number,
  energyCost: number,
): { hero: HeroState; activated: boolean } {
  const newEnergy = hero.energy + amount

  if (newEnergy >= energyCost) {
    return {
      hero: { ...hero, energy: 0 },
      activated: true,
    }
  }

  return {
    hero: { ...hero, energy: newEnergy },
    activated: false,
  }
}

export function removeEnergy(hero: HeroState, amount: number): HeroState {
  return { ...hero, energy: Math.max(0, hero.energy - amount) }
}
