import { describe, it, expect } from 'vitest'
import { calculateEnergy, addEnergy, removeEnergy } from '../src/game/rules/energy'
import type { HeroState } from '../src/game/types'

function makeHero(energy: number): HeroState {
  return {
    name: 'warrior',
    rank: 'bronze',
    energy,
    xp: 0,
    slot: 'squares',
  }
}

describe('calculateEnergy', () => {
  it('0 symbols = 0', () => expect(calculateEnergy(0)).toBe(0))
  it('1 symbol = 0', () => expect(calculateEnergy(1)).toBe(0))
  it('2 symbols = 0', () => expect(calculateEnergy(2)).toBe(0))
  it('3 symbols = 1', () => expect(calculateEnergy(3)).toBe(1))
  it('4 symbols = 2', () => expect(calculateEnergy(4)).toBe(2))
  it('5 symbols = 3', () => expect(calculateEnergy(5)).toBe(3))
  it('10 symbols = 8', () => expect(calculateEnergy(10)).toBe(8))
})

describe('addEnergy', () => {
  it('accumulates energy below threshold', () => {
    const result = addEnergy(makeHero(0), 1, 3)
    expect(result.hero.energy).toBe(1)
    expect(result.activated).toBe(false)
  })

  it('activates when energy reaches threshold', () => {
    const result = addEnergy(makeHero(2), 1, 3)
    expect(result.activated).toBe(true)
    expect(result.hero.energy).toBe(0)
  })

  it('activates when energy exceeds threshold', () => {
    const result = addEnergy(makeHero(1), 5, 3)
    expect(result.activated).toBe(true)
    expect(result.hero.energy).toBe(0)
  })

  it('excess energy is lost on activation (2/3 + 3 = activate, reset to 0)', () => {
    const result = addEnergy(makeHero(2), 3, 3)
    expect(result.activated).toBe(true)
    expect(result.hero.energy).toBe(0)
  })

  it('does not activate when below threshold', () => {
    const result = addEnergy(makeHero(0), 2, 5)
    expect(result.hero.energy).toBe(2)
    expect(result.activated).toBe(false)
  })
})

describe('removeEnergy', () => {
  it('reduces energy', () => {
    const result = removeEnergy(makeHero(3), 1)
    expect(result.energy).toBe(2)
  })

  it('floors at 0', () => {
    const result = removeEnergy(makeHero(1), 5)
    expect(result.energy).toBe(0)
  })

  it('no change when removing 0', () => {
    const result = removeEnergy(makeHero(3), 0)
    expect(result.energy).toBe(3)
  })
})
