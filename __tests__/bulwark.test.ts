import { describe, it, expect } from 'vitest'
import { decayBulwark, buildBulwark, damageBulwark, MAX_BULWARK } from '../src/game/rules/bulwark'
import type { PlayerState, HeroState } from '../src/game/types'

function makePlayer(bulwark: number): PlayerState {
  const hero: HeroState = {
    name: 'warrior',
    rank: 'bronze',
    energy: 0,
    xp: 0,
    slot: 'suns',
  }
  return { crownHp: 20, bulwark, heroes: [hero, { ...hero, slot: 'moons' }] }
}

describe('decayBulwark', () => {
  it('reduces bulwark by 1', () => {
    const result = decayBulwark(makePlayer(3))
    expect(result.player.bulwark).toBe(2)
    expect(result.events).toHaveLength(1)
    expect(result.events[0].type).toBe('bulwark_change')
  })

  it('stops at 0', () => {
    const result = decayBulwark(makePlayer(0))
    expect(result.player.bulwark).toBe(0)
    expect(result.events).toHaveLength(0)
  })

  it('decays from 1 to 0', () => {
    const result = decayBulwark(makePlayer(1))
    expect(result.player.bulwark).toBe(0)
    expect(result.events).toHaveLength(1)
  })
})

describe('buildBulwark', () => {
  it('3 shields = +1', () => {
    const result = buildBulwark(makePlayer(0), 3)
    expect(result.player.bulwark).toBe(1)
  })

  it('4 shields = +2', () => {
    const result = buildBulwark(makePlayer(0), 4)
    expect(result.player.bulwark).toBe(2)
  })

  it('5 shields = +3', () => {
    const result = buildBulwark(makePlayer(0), 5)
    expect(result.player.bulwark).toBe(3)
  })

  it('caps at MAX_BULWARK (5)', () => {
    const result = buildBulwark(makePlayer(4), 5)
    expect(result.player.bulwark).toBe(MAX_BULWARK)
  })

  it('2 shields = no change', () => {
    const result = buildBulwark(makePlayer(1), 2)
    expect(result.player.bulwark).toBe(1)
    expect(result.events).toHaveLength(0)
  })

  it('1 shield = no change', () => {
    const result = buildBulwark(makePlayer(0), 1)
    expect(result.player.bulwark).toBe(0)
    expect(result.events).toHaveLength(0)
  })
})

describe('damageBulwark', () => {
  it('reduces bulwark by damage amount', () => {
    const result = damageBulwark(makePlayer(3), 2)
    expect(result.player.bulwark).toBe(1)
    expect(result.events).toHaveLength(1)
  })

  it('floors at 0', () => {
    const result = damageBulwark(makePlayer(2), 5)
    expect(result.player.bulwark).toBe(0)
  })

  it('no event when damage is 0', () => {
    const result = damageBulwark(makePlayer(3), 0)
    expect(result.player.bulwark).toBe(3)
    expect(result.events).toHaveLength(0)
  })

  it('no event when bulwark is already 0', () => {
    const result = damageBulwark(makePlayer(0), 3)
    expect(result.player.bulwark).toBe(0)
    expect(result.events).toHaveLength(0)
  })
})
