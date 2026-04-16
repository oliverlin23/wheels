import type { GameState, LogEvent, Panel, PanelRef, PlayerState } from '../types'
import { countSymbols, countXp } from './panels'
import { calculateEnergy } from './energy'
import { buildBulwark } from './bulwark'
import { getStats, activateFigurine } from './figurines'
import { addXp, applyBomb } from './xp'

type WheelIdx = 0 | 1 | 2 | 3 | 4

/** Build PanelRef array for panels matching the given symbol (optionally requiring xp=true). */
function refsForSymbol(
  results: [Panel, Panel, Panel, Panel, Panel],
  player: 0 | 1,
  symbol: 'sun' | 'moon' | 'shield',
  requireXp = false,
): PanelRef[] {
  const refs: PanelRef[] = []
  for (let i = 0; i < 5; i++) {
    const p = results[i]
    if (p.symbol === symbol && (!requireXp || p.xp)) {
      refs.push({ player, wheelIdx: i as WheelIdx })
    }
  }
  return refs
}

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
    events.push({ type: 'panel_xp', detail: '> PLAYER 1 RESOLUTION', player: 0 })
    const r = resolveOnePlayer(results0, players[0], players[1], 0)
    players = [r.attacker, r.defender]
    events.push(...r.events)
  }

  // Process Player 1's wheels (attacking Player 0)
  const results1 = state.wheels[1].results
  if (results1) {
    events.push({ type: 'panel_xp', detail: '> PLAYER 2 RESOLUTION', player: 1 })
    const r = resolveOnePlayer(results1, players[1], players[0], 1)
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
  attackerIdx: 0 | 1,
): { attacker: PlayerState; defender: PlayerState; events: LogEvent[] } {
  const events: LogEvent[] = []
  let currentPlayer = deepCopyPlayer(attacker)
  let opponent = deepCopyPlayer(defender)
  let pendingBombs: { source: string }[] = []
  const defenderIdx: 0 | 1 = attackerIdx === 0 ? 1 : 0

  /** Tag events emitted by sub-resolvers with player + optional panel refs. */
  const tagEvents = (evts: LogEvent[], panelRefs?: PanelRef[]): LogEvent[] =>
    evts.map((e) => ({
      ...e,
      player: e.player ?? attackerIdx,
      ...(panelRefs !== undefined && e.panelRefs === undefined ? { panelRefs } : {}),
    }))

  // Step 1: Panel XP
  for (let i = 0; i < 2; i++) {
    const hero = currentPlayer.heroes[i]
    const xpCount = countXp(results, hero.slot)
    if (xpCount > 0) {
      const xpResult = addXp(hero, xpCount)
      currentPlayer.heroes[i] = xpResult.hero
      const symbol = hero.slot === 'suns' ? 'sun' : 'moon'
      const refs = refsForSymbol(results, attackerIdx, symbol, true)
      events.push({
        type: 'panel_xp',
        detail: `${hero.name} gains ${xpCount} XP from starry panels (${xpResult.hero.xp}/10)`,
        player: attackerIdx,
        panelRefs: refs,
        data: { figurine: hero.name, amount: xpCount },
      })
      for (const evt of tagEvents(xpResult.events, refs)) {
        events.push(evt)
        if (evt.type === 'bomb') pendingBombs.push({ source: hero.name })
      }
    }
  }

  // Step 2: Hammer panels
  const shieldCount = countSymbols(results, 'shield')
  if (shieldCount >= 3) {
    const bulwarkResult = buildBulwark(currentPlayer, shieldCount)
    currentPlayer = bulwarkResult.player
    const shieldRefs = refsForSymbol(results, attackerIdx, 'shield')
    events.push({
      type: 'hammers',
      detail: `SHIELDS x${shieldCount} -> BULWARK +${shieldCount - 2} (${currentPlayer.bulwark}/5)`,
      player: attackerIdx,
      panelRefs: shieldRefs,
      data: { count: shieldCount, gained: shieldCount - 2 },
    })
    events.push(...tagEvents(bulwarkResult.events, shieldRefs))
  }

  // Step 3: Energy panels
  const sunCount = countSymbols(results, 'sun')
  const moonCount = countSymbols(results, 'moon')

  for (let i = 0; i < 2; i++) {
    const hero = currentPlayer.heroes[i]
    const symbolCount = hero.slot === 'suns' ? sunCount : moonCount
    const energyGained = calculateEnergy(symbolCount)
    if (energyGained > 0) {
      const stats = getStats(hero.name, hero.rank)
      const newEnergy = hero.energy + energyGained
      currentPlayer.heroes[i] = { ...hero, energy: newEnergy }
      const symbolName = hero.slot === 'suns' ? 'SUNS' : 'MOONS'
      const symbol = hero.slot === 'suns' ? 'sun' : 'moon'
      const energyRefs = refsForSymbol(results, attackerIdx, symbol)
      events.push({
        type: 'energy',
        detail: `${symbolName} x${symbolCount} -> ${hero.name} +${energyGained} ENERGY (${newEnergy}/${stats.energyCost})`,
        player: attackerIdx,
        panelRefs: energyRefs,
        data: { figurine: hero.name, symbolCount, gained: energyGained, slot: hero.slot },
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
        // Activation events: tag with attacker & defender context
        for (const evt of result.events) {
          events.push({
            ...evt,
            player: evt.player ?? attackerIdx,
            data: {
              ...(evt.data ?? {}),
              attackerIdx,
              defenderIdx,
              figurine: hero.name,
              slot: hero.slot,
            },
          })
        }

        const xpResult = addXp(currentPlayer.heroes[idx], 2)
        currentPlayer.heroes[idx] = xpResult.hero
        events.push({
          type: 'panel_xp',
          detail: `${hero.name} gains 2 XP from activation (${xpResult.hero.xp}/10)`,
          player: attackerIdx,
          data: { figurine: hero.name, source: 'activation' },
        })
        for (const evt of tagEvents(xpResult.events)) {
          events.push(evt)
          if (evt.type === 'bomb') pendingBombs.push({ source: hero.name })
        }
      }
    }
  }

  // Step 7: Bombs from steps 4-6
  for (const bomb of pendingBombs) {
    const bombResult = applyBomb(opponent)
    opponent = bombResult.defender
    for (const evt of bombResult.events) {
      events.push({
        ...evt,
        player: attackerIdx,
        data: { ...(evt.data ?? {}), attackerIdx, defenderIdx, figurine: bomb.source },
      })
    }
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
      for (const evt of result.events) {
        events.push({
          ...evt,
          player: evt.player ?? attackerIdx,
          data: {
            ...(evt.data ?? {}),
            attackerIdx,
            defenderIdx,
            figurine: hero.name,
            slot: hero.slot,
          },
        })
      }

      const xpResult = addXp(currentPlayer.heroes[i], 2)
      currentPlayer.heroes[i] = xpResult.hero
      events.push({
        type: 'panel_xp',
        detail: `${hero.name} gains 2 XP from activation (${xpResult.hero.xp}/10)`,
        player: attackerIdx,
        data: { figurine: hero.name, source: 'activation' },
      })
      for (const evt of tagEvents(xpResult.events)) {
        events.push(evt)
        if (evt.type === 'bomb') pendingBombs.push({ source: hero.name })
      }
    }
  }

  // Step 9: Bombs from step 8
  for (const bomb of pendingBombs) {
    const bombResult = applyBomb(opponent)
    opponent = bombResult.defender
    for (const evt of bombResult.events) {
      events.push({
        ...evt,
        player: attackerIdx,
        data: { ...(evt.data ?? {}), attackerIdx, defenderIdx, figurine: bomb.source },
      })
    }
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
