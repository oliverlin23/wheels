import type { GameState, LogEvent, Panel, PlayerState } from '../types'
import { countSymbols, countXp } from './panels'
import { calculateEnergy } from './energy'
import { buildBulwark } from './bulwark'
import { getStats, activateFigurine } from './figurines'
import { addXp, applyBomb } from './xp'

/**
 * Resolve a round: process BOTH players' wheel results.
 *
 * Steps 1-9 run for Player 0 (attacking Player 1),
 * then steps 1-9 run for Player 1 (attacking Player 0),
 * then step 10 checks both crowns simultaneously.
 */
export function resolve(state: GameState): { state: GameState; events: LogEvent[] } {
  const events: LogEvent[] = []
  let players: [PlayerState, PlayerState] = [
    deepCopyPlayer(state.players[0]),
    deepCopyPlayer(state.players[1]),
  ]

  // Process Player 0's wheels (attacking Player 1)
  const results0 = state.wheels[0].results
  if (results0) {
    events.push({ type: 'panel_xp', detail: '> PLAYER 1 RESOLUTION' })
    const r = resolveOnePlayer(results0, players[0], players[1])
    players = [r.attacker, r.defender]
    events.push(...r.events)
  }

  // Process Player 1's wheels (attacking Player 0)
  const results1 = state.wheels[1].results
  if (results1) {
    events.push({ type: 'panel_xp', detail: '> PLAYER 2 RESOLUTION' })
    const r = resolveOnePlayer(results1, players[1], players[0])
    players = [r.defender, r.attacker]
    events.push(...r.events)
  }

  // Step 10: simultaneous 0 HP check
  let winner: 0 | 1 | 'tie' | null = null
  const p0Dead = players[0].crownHp <= 0
  const p1Dead = players[1].crownHp <= 0

  if (p0Dead && p1Dead) {
    winner = 'tie'
    events.push({ type: 'game_over', detail: 'Both crowns destroyed - TIE!' })
  } else if (p0Dead) {
    winner = 1
    events.push({ type: 'game_over', detail: 'Player 1 crown destroyed - Player 2 wins!' })
  } else if (p1Dead) {
    winner = 0
    events.push({ type: 'game_over', detail: 'Player 2 crown destroyed - Player 1 wins!' })
  }

  return {
    state: {
      ...state,
      players,
      roundPhase: winner !== null ? 'done' : 'resolving',
      winner,
    },
    events,
  }
}

/**
 * Steps 1-9 for one player's wheel results.
 * The "attacker" is the player whose wheels are being resolved.
 * The "defender" is their opponent.
 */
function resolveOnePlayer(
  results: [Panel, Panel, Panel, Panel, Panel],
  attacker: PlayerState,
  defender: PlayerState,
): { attacker: PlayerState; defender: PlayerState; events: LogEvent[] } {
  const events: LogEvent[] = []
  let currentPlayer = deepCopyPlayer(attacker)
  let opponent = deepCopyPlayer(defender)
  let pendingBombs: { source: string }[] = []

  // Step 1: Panel XP
  for (let i = 0; i < 2; i++) {
    const hero = currentPlayer.heroes[i]
    const xpCount = countXp(results, hero.slot)
    if (xpCount > 0) {
      const xpResult = addXp(hero, xpCount)
      currentPlayer.heroes[i] = xpResult.hero
      events.push({
        type: 'panel_xp',
        detail: `${hero.name} gains ${xpCount} XP from starry panels (${xpResult.hero.xp}/10)`,
        data: { figurine: hero.name, amount: xpCount },
      })
      for (const evt of xpResult.events) {
        events.push(evt)
        if (evt.type === 'bomb') pendingBombs.push({ source: hero.name })
      }
    }
  }

  // Step 2: Hammer panels
  const hammerCount = countSymbols(results, 'hammer')
  if (hammerCount >= 3) {
    const bulwarkResult = buildBulwark(currentPlayer, hammerCount)
    currentPlayer = bulwarkResult.player
    events.push({
      type: 'hammers',
      detail: `HAMMERS x${hammerCount} -> BULWARK +${hammerCount - 2} (${currentPlayer.bulwark}/5)`,
      data: { count: hammerCount, gained: hammerCount - 2 },
    })
    events.push(...bulwarkResult.events)
  }

  // Step 3: Energy panels
  const squareCount = countSymbols(results, 'square')
  const diamondCount = countSymbols(results, 'diamond')

  for (let i = 0; i < 2; i++) {
    const hero = currentPlayer.heroes[i]
    const symbolCount = hero.slot === 'squares' ? squareCount : diamondCount
    const energyGained = calculateEnergy(symbolCount)
    if (energyGained > 0) {
      const stats = getStats(hero.name, hero.rank)
      const newEnergy = hero.energy + energyGained
      currentPlayer.heroes[i] = { ...hero, energy: newEnergy }
      const symbolName = hero.slot === 'squares' ? 'SQUARES' : 'DIAMONDS'
      events.push({
        type: 'energy',
        detail: `${symbolName} x${symbolCount} -> ${hero.name} +${energyGained} ENERGY (${newEnergy}/${stats.energyCost})`,
        data: { figurine: hero.name, symbolCount, gained: energyGained },
      })
    }
  }

  // Steps 4-6: Assassin, Priest, Engineer (priority order)
  const priorityOrder: Array<'assassin' | 'priest' | 'engineer'> = ['assassin', 'priest', 'engineer']

  for (const figurineName of priorityOrder) {
    const heroIndices = getHeroIndicesByName(currentPlayer, figurineName)
    for (const idx of heroIndices) {
      const hero = currentPlayer.heroes[idx]
      const stats = getStats(hero.name, hero.rank)
      if (hero.energy >= stats.energyCost) {
        const result = activateFigurine(hero, currentPlayer, opponent)
        currentPlayer = result.attacker
        opponent = result.defender
        events.push(...result.events)

        const xpResult = addXp(currentPlayer.heroes[idx], 2)
        currentPlayer.heroes[idx] = xpResult.hero
        events.push({
          type: 'panel_xp',
          detail: `${hero.name} gains 2 XP from activation (${xpResult.hero.xp}/10)`,
        })
        for (const evt of xpResult.events) {
          events.push(evt)
          if (evt.type === 'bomb') pendingBombs.push({ source: hero.name })
        }
      }
    }
  }

  // Step 7: Bombs from steps 4-6
  for (const _bomb of pendingBombs) {
    const bombResult = applyBomb(opponent)
    opponent = bombResult.defender
    events.push(...bombResult.events)
  }
  pendingBombs = []

  // Step 8: Remaining heroes (Warrior, Mage, Archer)
  const remainingNames = new Set(['warrior', 'mage', 'archer'])
  for (let i = 0; i < 2; i++) {
    const hero = currentPlayer.heroes[i]
    if (!remainingNames.has(hero.name)) continue
    const stats = getStats(hero.name, hero.rank)
    if (hero.energy >= stats.energyCost) {
      const result = activateFigurine(hero, currentPlayer, opponent)
      currentPlayer = result.attacker
      opponent = result.defender
      events.push(...result.events)

      const xpResult = addXp(currentPlayer.heroes[i], 2)
      currentPlayer.heroes[i] = xpResult.hero
      events.push({
        type: 'panel_xp',
        detail: `${hero.name} gains 2 XP from activation (${xpResult.hero.xp}/10)`,
      })
      for (const evt of xpResult.events) {
        events.push(evt)
        if (evt.type === 'bomb') pendingBombs.push({ source: hero.name })
      }
    }
  }

  // Step 9: Bombs from step 8
  for (const _bomb of pendingBombs) {
    const bombResult = applyBomb(opponent)
    opponent = bombResult.defender
    events.push(...bombResult.events)
  }

  return { attacker: currentPlayer, defender: opponent, events }
}

function getHeroIndicesByName(player: PlayerState, name: string): number[] {
  const indices: number[] = []
  if (player.heroes[0].name === name) indices.push(0)
  if (player.heroes[1].name === name) indices.push(1)
  return indices
}

function deepCopyPlayer(player: PlayerState): PlayerState {
  return {
    crownHp: player.crownHp,
    bulwark: player.bulwark,
    heroes: [{ ...player.heroes[0] }, { ...player.heroes[1] }],
  }
}
