import { describe, it, expect } from 'vitest'
import { resolve } from '../src/game/rules/resolve'
import type { GameState, HeroState, Panel, PlayerState, WheelState } from '../src/game/types'

function makeHero(
  name: HeroState['name'],
  slot: HeroState['slot'],
  overrides: Partial<HeroState> = {},
): HeroState {
  return {
    name,
    rank: 'bronze',
    energy: 0,
    xp: 0,
    slot,
    ...overrides,
  }
}

function makePlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    crownHp: 10,
    bulwark: 0,
    heroes: [
      makeHero('warrior', 'squares'),
      makeHero('archer', 'diamonds'),
    ],
    ...overrides,
  }
}

function makeWheelState(results: [Panel, Panel, Panel, Panel, Panel] | null = null): WheelState {
  return {
    spinsRemaining: 0,
    locked: [true, true, true, true, true],
    results,
    resultIndices: results ? [0, 0, 0, 0, 0] : null,
  }
}

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    players: [makePlayer(), makePlayer()],
    round: 1,
    wheels: [makeWheelState(), makeWheelState()],
    roundPhase: 'resolving',
    confirmed: [true, true],
    winner: null,
    ...overrides,
  }
}

function p(symbol: Panel['symbol'], count: number, xp: boolean): Panel {
  return { symbol, count, xp }
}

describe('resolve', () => {
  it('returns unchanged state when no wheel results', () => {
    const state = makeState()
    const result = resolve(state)
    expect(result.events).toHaveLength(0)
    expect(result.state).toEqual(state)
  })

  it('Step 1: grants XP from starry panels', () => {
    const results: [Panel, Panel, Panel, Panel, Panel] = [
      p('square', 1, true),   // XP for squares hero
      p('diamond', 1, true),  // XP for diamonds hero
      p('hammer', 1, false),
      p('hammer', 1, false),
      p('square', 1, false),
    ]
    const state = makeState({
      wheels: [makeWheelState(results), makeWheelState()],
    })
    const result = resolve(state)
    // Squares hero (warrior) should have 1 XP
    expect(result.state.players[0].heroes[0].xp).toBe(1)
    // Diamonds hero (archer) should have 1 XP
    expect(result.state.players[0].heroes[1].xp).toBe(1)
  })

  it('Step 2: builds bulwark from 3+ hammers', () => {
    const results: [Panel, Panel, Panel, Panel, Panel] = [
      p('hammer', 1, false),
      p('hammer', 1, false),
      p('hammer', 1, false),
      p('square', 1, false),
      p('diamond', 1, false),
    ]
    const state = makeState({
      wheels: [makeWheelState(results), makeWheelState()],
    })
    const result = resolve(state)
    // 3 hammers - 2 = 1 bulwark
    expect(result.state.players[0].bulwark).toBe(1)
  })

  it('Step 3: adds energy from symbols', () => {
    const results: [Panel, Panel, Panel, Panel, Panel] = [
      p('square', 1, false),
      p('square', 1, false),
      p('square', 1, false),
      p('diamond', 1, false),
      p('diamond', 1, false),
    ]
    const state = makeState({
      wheels: [makeWheelState(results), makeWheelState()],
    })
    const result = resolve(state)
    // 3 squares - 2 = 1 energy for warrior (squares slot)
    expect(result.state.players[0].heroes[0].energy).toBe(1)
    // 2 diamonds = 0 energy (below threshold)
    expect(result.state.players[0].heroes[1].energy).toBe(0)
  })

  it('Step 3: warrior activates when energy threshold met', () => {
    const results: [Panel, Panel, Panel, Panel, Panel] = [
      p('square', 2, false),  // SS = 2
      p('square', 2, false),  // SS = 2
      p('square', 1, false),  // S = 1, total = 5
      p('diamond', 1, false),
      p('hammer', 1, false),
    ]
    const state = makeState({
      wheels: [makeWheelState(results), makeWheelState()],
    })
    // Warrior costs 3 energy. 5 squares - 2 = 3 energy. Should activate.
    const result = resolve(state)
    // Warrior activated: energy reset to 0
    expect(result.state.players[0].heroes[0].energy).toBe(0)
    // Warrior bronze deals 3 crown damage (opponent has no bulwark)
    expect(result.state.players[1].crownHp).toBe(7)
    // Warrior gets 2 XP from activation
    expect(result.state.players[0].heroes[0].xp).toBe(2)
  })

  it('Step 4: assassin acts before other heroes', () => {
    const player1 = makePlayer({
      heroes: [
        makeHero('assassin', 'squares', { energy: 3, rank: 'bronze' }),
        makeHero('warrior', 'diamonds', { energy: 2, rank: 'bronze' }),
      ],
    })
    const player2 = makePlayer({
      bulwark: 2,
    })
    const results: [Panel, Panel, Panel, Panel, Panel] = [
      p('square', 1, false),
      p('square', 1, false),
      p('diamond', 1, false),
      p('diamond', 1, false),
      p('diamond', 1, false),
    ]
    const state = makeState({
      players: [player1, player2],
      wheels: [makeWheelState(results), makeWheelState()],
    })
    // Assassin has enough energy (3/3), should act in step 4
    // 3 diamonds - 2 = 1 energy for warrior (diamonds slot), total 3/3, warrior activates in step 8
    const result = resolve(state)
    // Assassin dealt 1 crown damage (bypasses bulwark)
    // Assassin stripped 1 bulwark (2 -> 1)
    // Warrior then activates: bulwark is now 1 so warrior hits bulwark
    expect(result.state.players[1].crownHp).toBe(9) // 10 - 1 (assassin)
  })

  it('Step 5: priest heals and grants energy', () => {
    const player1 = makePlayer({
      crownHp: 7,
      heroes: [
        makeHero('priest', 'squares', { energy: 4, rank: 'bronze' }),
        makeHero('warrior', 'diamonds', { energy: 2, rank: 'bronze' }),
      ],
    })
    const results: [Panel, Panel, Panel, Panel, Panel] = [
      p('square', 1, false),
      p('diamond', 1, false),
      p('hammer', 1, false),
      p('hammer', 1, false),
      p('hammer', 1, false),
    ]
    const state = makeState({
      players: [player1, makePlayer()],
      wheels: [makeWheelState(results), makeWheelState()],
    })
    const result = resolve(state)
    // Priest heals 1 crown HP (7 -> 8)
    expect(result.state.players[0].crownHp).toBe(8)
    // Priest grants 1 energy to partner warrior (2 + 1 = 3, which is warrior's cost!)
    // Warrior should then activate in step 8
    expect(result.state.players[0].heroes[1].energy).toBe(0) // reset after activation
    // Warrior bronze deals 3 crown damage to opponent (no bulwark)
    expect(result.state.players[1].crownHp).toBe(7)
  })

  it('Step 6: engineer acts and builds bulwark', () => {
    const player1 = makePlayer({
      heroes: [
        makeHero('engineer', 'squares', { energy: 4, rank: 'bronze' }),
        makeHero('archer', 'diamonds'),
      ],
    })
    const results: [Panel, Panel, Panel, Panel, Panel] = [
      p('diamond', 1, false),
      p('diamond', 1, false),
      p('hammer', 1, false),
      p('hammer', 1, false),
      p('square', 1, false),
    ]
    const state = makeState({
      players: [player1, makePlayer()],
      wheels: [makeWheelState(results), makeWheelState()],
    })
    const result = resolve(state)
    // Engineer bronze deals 1 crown damage (opponent no bulwark)
    expect(result.state.players[1].crownHp).toBe(9)
    // Engineer raises own bulwark by 2
    expect(result.state.players[0].bulwark).toBe(2)
  })

  it('Step 10: detects game over when crown reaches 0', () => {
    const player2 = makePlayer({ crownHp: 3 })
    const player1 = makePlayer({
      heroes: [
        makeHero('warrior', 'squares', { energy: 3, rank: 'bronze' }),
        makeHero('archer', 'diamonds'),
      ],
    })
    const results: [Panel, Panel, Panel, Panel, Panel] = [
      p('diamond', 1, false),
      p('diamond', 1, false),
      p('hammer', 1, false),
      p('hammer', 1, false),
      p('square', 1, false),
    ]
    const state = makeState({
      players: [player1, player2],
      wheels: [makeWheelState(results), makeWheelState()],
    })
    const result = resolve(state)
    // Warrior bronze does 3 crown damage, killing opponent (3 -> 0)
    expect(result.state.players[1].crownHp).toBe(0)
    expect(result.state.winner).toBe(0)
    expect(result.state.roundPhase).toBe('done')
  })

  it('Step 10: tie when both crowns die same round', () => {
    // Player 1 has assassin that bypasses bulwark
    // Player 2 also has low HP but we simulate by manually setting
    const player1 = makePlayer({
      crownHp: 0, // will be detected as dead
      heroes: [
        makeHero('warrior', 'squares'),
        makeHero('archer', 'diamonds'),
      ],
    })
    const player2 = makePlayer({ crownHp: 0 })
    const results: [Panel, Panel, Panel, Panel, Panel] = [
      p('square', 1, false),
      p('diamond', 1, false),
      p('hammer', 1, false),
      p('hammer', 1, false),
      p('square', 1, false),
    ]
    const state = makeState({
      players: [player1, player2],
      wheels: [makeWheelState(results), makeWheelState()],
    })
    const result = resolve(state)
    expect(result.state.winner).toBe('tie')
    expect(result.state.roundPhase).toBe('done')
  })

  it('XP rank-up triggers bomb that deals damage', () => {
    // Hero at gold rank with 9 XP, about to get 1 XP from panel
    const player1 = makePlayer({
      heroes: [
        makeHero('warrior', 'squares', { rank: 'gold', xp: 9 }),
        makeHero('archer', 'diamonds'),
      ],
    })
    const results: [Panel, Panel, Panel, Panel, Panel] = [
      p('square', 1, true),   // +1 XP -> triggers bomb at 10
      p('diamond', 1, false),
      p('hammer', 1, false),
      p('square', 1, false),
      p('square', 1, false),
    ]
    const state = makeState({
      players: [player1, makePlayer()],
      wheels: [makeWheelState(results), makeWheelState()],
    })
    const result = resolve(state)
    // Bomb deals 2 crown damage to opponent
    const bombEvents = result.events.filter(e => e.type === 'bomb')
    expect(bombEvents.length).toBeGreaterThanOrEqual(1)
  })

  it('multi-symbol panels count correctly', () => {
    const results: [Panel, Panel, Panel, Panel, Panel] = [
      p('square', 2, false),  // SS = 2
      p('square', 2, false),  // SS = 2
      p('square', 1, false),  // S = 1, total = 5
      p('diamond', 2, false), // DD = 2
      p('diamond', 2, false), // DD = 2, total = 4
    ]
    const state = makeState({
      wheels: [makeWheelState(results), makeWheelState()],
    })
    const result = resolve(state)
    // 5 squares - 2 = 3 energy for warrior (cost 3) -> activates
    expect(result.state.players[0].heroes[0].energy).toBe(0) // reset
    // 4 diamonds - 2 = 2 energy for archer (cost 4) -> doesn't activate
    expect(result.state.players[0].heroes[1].energy).toBe(2)
    // Warrior dealt 3 crown damage
    expect(result.state.players[1].crownHp).toBe(7)
  })

  it('full scripted turn with fixed state', () => {
    // Scenario: Player has mage (squares, silver) and priest (diamonds, bronze)
    // Mage has 3 energy (needs 4), priest has 4 energy (needs 4, ready)
    // Roll: 4 squares (1 starry), 3 diamonds, 0 hammers
    const player1 = makePlayer({
      crownHp: 8,
      bulwark: 0,
      heroes: [
        makeHero('mage', 'squares', { rank: 'silver', energy: 3, xp: 5 }),
        makeHero('priest', 'diamonds', { rank: 'bronze', energy: 4, xp: 3 }),
      ],
    })
    const player2 = makePlayer({
      crownHp: 10,
      bulwark: 2,
    })
    const results: [Panel, Panel, Panel, Panel, Panel] = [
      p('square', 1, true),   // S+ (1 square, 1 XP for mage)
      p('square', 1, false),  // S
      p('square', 1, false),  // S
      p('diamond', 1, false), // D
      p('square', 1, false),  // S, total: 4 squares, 1 diamond
    ]
    const state = makeState({
      players: [player1, player2],
      wheels: [makeWheelState(results), makeWheelState()],
    })

    const result = resolve(state)

    // Mage silver: ground fireball (4 crown/3 bulwark), high fireball (2 crown)
    // Opponent has bulwark 2:
    //   Ground fireball height 0: bulwark > 0, hits bulwark for 3 (2 -> 0, capped at 0)
    //   High fireball height 6: always hits crown for 2 (10 -> 8)
    expect(result.state.players[1].bulwark).toBe(0)
    expect(result.state.players[1].crownHp).toBe(8) // 10 - 2 (high fireball)

    // Mage XP: 5 + 1 (panel) + 2 (activation) = 8
    expect(result.state.players[0].heroes[0].xp).toBe(8)

    // Priest healed crown: 8 -> 9
    expect(result.state.players[0].crownHp).toBe(9)

    // Priest XP: 3 + 2 (activation) = 5
    expect(result.state.players[0].heroes[1].xp).toBe(5)

    // Mage energy: had 3 + 2 (from panels) = 5, then priest gave 1 = 6, then activated (reset to 0)
    expect(result.state.players[0].heroes[0].energy).toBe(0)
  })

  it('resolves both players wheels in a single round', () => {
    // Player 0 has warrior ready to attack
    const player1 = makePlayer({
      heroes: [
        makeHero('warrior', 'squares', { energy: 3, rank: 'bronze' }),
        makeHero('archer', 'diamonds'),
      ],
    })
    // Player 1 has warrior ready to attack
    const player2 = makePlayer({
      heroes: [
        makeHero('warrior', 'squares', { energy: 3, rank: 'bronze' }),
        makeHero('archer', 'diamonds'),
      ],
    })
    const emptyResults: [Panel, Panel, Panel, Panel, Panel] = [
      p('square', 1, false),
      p('diamond', 1, false),
      p('hammer', 1, false),
      p('hammer', 1, false),
      p('square', 1, false),
    ]
    const state = makeState({
      players: [player1, player2],
      wheels: [makeWheelState(emptyResults), makeWheelState(emptyResults)],
    })
    const result = resolve(state)
    // Both warriors activate (they had enough pre-loaded energy)
    // Each deals 3 crown damage to the opponent
    expect(result.state.players[0].crownHp).toBe(7) // hit by player 1's warrior
    expect(result.state.players[1].crownHp).toBe(7) // hit by player 0's warrior
  })
})
