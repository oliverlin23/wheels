export type PanelSymbol = 'sun' | 'moon' | 'shield'

/** A panel on a wheel. count = how many symbols (e.g. SS = square with count 2). xp = starry background */
export type Panel = {
  symbol: PanelSymbol
  count: number
  xp: boolean
}

export type Rank = 'bronze' | 'silver' | 'gold'

export type FigurineName = 'warrior' | 'mage' | 'archer' | 'engineer' | 'assassin' | 'priest'

/** Stats for a figurine at a given rank */
export type FigurineStats = {
  energyCost: number
  crownDamage?: number | undefined
  bulwarkDamage?: number | undefined
  groundFireball?: { crownDamage: number; bulwarkDamage: number } | undefined
  highFireball?: { crownDamage: number } | undefined
  delay?: number | undefined
  bulwarkStripped?: number | undefined
  healing?: number | undefined
  energyGranted?: number | undefined
  attackHeight?: number | undefined
}

export type HeroState = {
  name: FigurineName
  rank: Rank
  energy: number
  xp: number
  slot: 'suns' | 'moons'
}

export type PlayerState = {
  crownHp: number
  bulwark: number
  heroes: [HeroState, HeroState]
}

export type WheelState = {
  spinsRemaining: number
  locked: [boolean, boolean, boolean, boolean, boolean]
  results: [Panel, Panel, Panel, Panel, Panel] | null
  resultIndices: [number, number, number, number, number] | null
}

export type GameState = {
  players: [PlayerState, PlayerState]
  wheels: [WheelState, WheelState]
  round: number
  roundPhase: 'spinning' | 'reveal' | 'resolving' | 'done'
  confirmed: [boolean, boolean]
  winner: 0 | 1 | 'tie' | null
}

/** A reference to a panel on a specific player's wheel. */
export type PanelRef = {
  player: 0 | 1
  wheelIdx: 0 | 1 | 2 | 3 | 4
}

export type LogEvent = {
  type:
    | 'panel_xp'
    | 'hammers'
    | 'energy'
    | 'activation'
    | 'damage'
    | 'heal'
    | 'bulwark_change'
    | 'delay'
    | 'bomb'
    | 'rank_up'
    | 'game_over'
  detail: string
  /** Player index this event belongs to (the actor/attacker). Undefined for game-level events. */
  player?: 0 | 1 | undefined
  /** Which panels (on which wheel) contributed to this event. */
  panelRefs?: PanelRef[] | undefined
  data?: Record<string, unknown> | undefined
}
