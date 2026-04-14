import type { GameState, LogEvent, PlayerState } from '../types'
import { countSymbols, countXp } from './panels'
import { calculateEnergy } from './energy'
import { buildBulwark } from './bulwark'
import { getStats, activateFigurine } from './figurines'
import { addXp, applyBomb } from './xp'

/**
 * The 10-step resolution order from the rules doc.
 * Takes the current GameState (with wheel results set) and returns
 * the new GameState plus an ordered list of LogEvents.
 *
 * Steps:
 *  1. Panel XP: starry panels grant XP, level-ups trigger immediately
 *  2. Hammer panels: bulwark built from hammer results
 *  3. Energy panels: energy from squares/diamonds added to heroes
 *  4. Assassin acts (if enough energy). Gains 2 XP.
 *  5. Priest acts: heals crown, grants energy to partner. Gains 2 XP.
 *  6. Engineer acts. Gains 2 XP.
 *  7. Bombs triggered by steps 4-6 resolve.
 *  8. Remaining heroes act (Warrior, Mage, Archer). Gains 2 XP.
 *  9. Bombs triggered by step 8 resolve.
 * 10. 0 HP crown check (simultaneous for both players).
 */
export function resolve(state: GameState): { state: GameState; events: LogEvent[] } {
  const results = state.wheels.results
  if (results === null) {
    return { state, events: [] }
  }

  const events: LogEvent[] = []
  const cp = state.currentPlayer
  const op: 0 | 1 = cp === 0 ? 1 : 0

  let currentPlayer = deepCopyPlayer(state.players[cp])
  let opponent = deepCopyPlayer(state.players[op])

  // Pending bombs accumulate during resolution
  let pendingBombs: { source: string }[] = []

  // Step 1: Panel XP
  events.push({ type: 'panel_xp', detail: '> PANEL XP' })
  for (let i = 0; i < 2; i++) {
    const hero = currentPlayer.heroes[i]
    const xpCount = countXp(results, hero.slot)
    if (xpCount > 0) {
      const xpResult = addXp(hero, xpCount)
      currentPlayer.heroes[i] = xpResult.hero
      events.push({
        type: 'panel_xp',
        detail: `${hero.name} gains ${xpCount} XP from starry panels (${xpResult.hero.xp}/${10})`,
        data: { figurine: hero.name, amount: xpCount },
      })
      for (const evt of xpResult.events) {
        events.push(evt)
        if (evt.type === 'bomb') {
          pendingBombs.push({ source: hero.name })
        }
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
      detail: `HAMMERS x ${String(hammerCount).padStart(2, '0')} -> BULWARK +${hammerCount - 2} (${String(currentPlayer.bulwark).padStart(2, '0')}/${String(5).padStart(2, '0')})`,
      data: { count: hammerCount, gained: hammerCount - 2 },
    })
    for (const evt of bulwarkResult.events) {
      events.push(evt)
    }
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
      // Just accumulate energy here; activation check + reset happens in steps 4-8
      const newEnergy = hero.energy + energyGained
      currentPlayer.heroes[i] = { ...hero, energy: newEnergy }
      const symbolName = hero.slot === 'squares' ? 'SQUARES' : 'DIAMONDS'
      events.push({
        type: 'energy',
        detail: `${symbolName} x ${String(symbolCount).padStart(2, '0')} -> ${hero.name} +${energyGained} ENERGY (${newEnergy}/${stats.energyCost})`,
        data: { figurine: hero.name, symbolCount, gained: energyGained },
      })
    }
  }

  // Steps 4-6: Assassin, Priest, Engineer act (in that order)
  // Within each step, squares hero acts before diamonds hero
  const priorityOrder: Array<'assassin' | 'priest' | 'engineer'> = ['assassin', 'priest', 'engineer']

  for (const figurineName of priorityOrder) {
    const heroIndices = getHeroIndicesByName(currentPlayer, figurineName)
    for (const idx of heroIndices) {
      const hero = currentPlayer.heroes[idx]
      const stats = getStats(hero.name, hero.rank)
      if (hero.energy >= stats.energyCost) {
        // Activate
        const result = activateFigurine(hero, currentPlayer, opponent)
        currentPlayer = result.attacker
        opponent = result.defender
        for (const evt of result.events) {
          events.push(evt)
        }

        // Grant 2 XP after activation
        const xpResult = addXp(currentPlayer.heroes[idx], 2)
        currentPlayer.heroes[idx] = xpResult.hero
        events.push({
          type: 'panel_xp',
          detail: `${hero.name} gains 2 XP from activation (${xpResult.hero.xp}/${10})`,
        })
        for (const evt of xpResult.events) {
          events.push(evt)
          if (evt.type === 'bomb') {
            pendingBombs.push({ source: hero.name })
          }
        }
      }
    }
  }

  // Step 7: Bombs from steps 4-6
  for (const _bomb of pendingBombs) {
    const bombResult = applyBomb(opponent)
    opponent = bombResult.defender
    for (const evt of bombResult.events) {
      events.push(evt)
    }
  }
  pendingBombs = []

  // Step 8: Remaining heroes act (Warrior, Mage, Archer)
  // Also includes any hero pushed past threshold by Priest energy
  const remainingNames = new Set(['warrior', 'mage', 'archer'])
  // Squares hero (index 0) acts before diamonds hero (index 1)
  for (let i = 0; i < 2; i++) {
    const hero = currentPlayer.heroes[i]
    if (!remainingNames.has(hero.name)) continue
    const stats = getStats(hero.name, hero.rank)
    if (hero.energy >= stats.energyCost) {
      const result = activateFigurine(hero, currentPlayer, opponent)
      currentPlayer = result.attacker
      opponent = result.defender
      for (const evt of result.events) {
        events.push(evt)
      }

      // Grant 2 XP after activation
      const xpResult = addXp(currentPlayer.heroes[i], 2)
      currentPlayer.heroes[i] = xpResult.hero
      events.push({
        type: 'panel_xp',
        detail: `${hero.name} gains 2 XP from activation (${xpResult.hero.xp}/${10})`,
      })
      for (const evt of xpResult.events) {
        events.push(evt)
        if (evt.type === 'bomb') {
          pendingBombs.push({ source: hero.name })
        }
      }
    }
  }

  // Step 9: Bombs from step 8
  for (const _bomb of pendingBombs) {
    const bombResult = applyBomb(opponent)
    opponent = bombResult.defender
    for (const evt of bombResult.events) {
      events.push(evt)
    }
  }

  // Step 10: 0 HP crown check (simultaneous)
  const newPlayers: [PlayerState, PlayerState] = cp === 0
    ? [currentPlayer, opponent]
    : [opponent, currentPlayer]

  let winner: 0 | 1 | 'tie' | null = null
  const p1Dead = newPlayers[0].crownHp <= 0
  const p2Dead = newPlayers[1].crownHp <= 0

  if (p1Dead && p2Dead) {
    winner = 'tie'
    events.push({ type: 'game_over', detail: 'Both crowns destroyed - TIE!' })
  } else if (p1Dead) {
    winner = 1
    events.push({ type: 'game_over', detail: 'Player 1 crown destroyed - Player 2 wins!' })
  } else if (p2Dead) {
    winner = 0
    events.push({ type: 'game_over', detail: 'Player 2 crown destroyed - Player 1 wins!' })
  }

  return {
    state: {
      ...state,
      players: newPlayers,
      phase: winner !== null ? 'done' : state.phase,
      winner,
    },
    events,
  }
}

/**
 * Get hero indices sorted by slot (squares = 0 first, diamonds = 1 second)
 * for heroes matching the given name.
 */
function getHeroIndicesByName(
  player: PlayerState,
  name: string,
): number[] {
  const indices: number[] = []
  // Squares slot (index 0) always acts before diamonds (index 1)
  if (player.heroes[0].name === name) indices.push(0)
  if (player.heroes[1].name === name) indices.push(1)
  return indices
}

function deepCopyPlayer(player: PlayerState): PlayerState {
  return {
    crownHp: player.crownHp,
    bulwark: player.bulwark,
    heroes: [
      { ...player.heroes[0] },
      { ...player.heroes[1] },
    ],
  }
}
