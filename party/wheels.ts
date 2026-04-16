import type * as Party from "partykit/server"
import type { FigurineName, GameState, LogEvent } from '../src/game/types'
import type { ClientMessage, ServerMessage, RoomPhase } from '../src/network/protocol'
import { startRound, spin, lockWheel, confirmSpins, bothConfirmed, revealWheels } from '../src/game/rules/actions'
import { resolve } from '../src/game/rules/resolve'
import { createRng } from '../src/game/rng'
import { WHEELS } from '../src/game/rules/panels'
import { createInitialGameState } from '../src/store/game'

type PlayerEntry = {
  id: string
  name: string
  heroes?: [FigurineName, FigurineName]
  connected: boolean
}

type RoomState = {
  phase: RoomPhase
  players: PlayerEntry[]
  spectatorIds: Set<string>
  game: GameState | null
  rng: [(() => number), (() => number)] | null
  seed: number
  spinTimer: ReturnType<typeof setTimeout> | null
  disconnectTimers: [ReturnType<typeof setTimeout> | null, ReturnType<typeof setTimeout> | null]
  rematchVotes: [boolean, boolean]
}

const SPIN_TIMEOUT_MS = 60_000
const DISCONNECT_TIMEOUT_MS = 60_000

export default class WheelsServer implements Party.Server {
  state: RoomState

  constructor(readonly room: Party.Room) {
    this.state = {
      phase: 'lobby',
      players: [],
      spectatorIds: new Set(),
      game: null,
      rng: null,
      seed: Math.floor(Math.random() * 0xFFFFFFFF),
      spinTimer: null,
      disconnectTimers: [null, null],
      rematchVotes: [false, false],
    }
  }

  onConnect(conn: Party.Connection) {
    // Try to reclaim a disconnected player slot during an active game
    const disconnectedIdx = this.state.players.findIndex(p => !p.connected)
    if (disconnectedIdx !== -1 && (this.state.phase === 'playing' || this.state.phase === 'done' || this.state.phase === 'hero-select')) {
      this.state.players[disconnectedIdx].id = conn.id
      this.state.players[disconnectedIdx].connected = true

      // Clear disconnect timer
      if (this.state.disconnectTimers[disconnectedIdx as 0 | 1] !== null) {
        clearTimeout(this.state.disconnectTimers[disconnectedIdx as 0 | 1]!)
        this.state.disconnectTimers[disconnectedIdx as 0 | 1] = null
      }

      // Send current game state so the reconnected client catches up
      if (this.state.game) {
        this.sendTo(conn, {
          type: 'MATCH_START',
          game: this.state.game,
          yourPlayer: disconnectedIdx as 0 | 1,
        })
      }

      this.broadcastLobbyState()
      return
    }

    // Normal connection: join as player or spectator
    if (this.state.phase === 'lobby' && this.state.players.length < 2) {
      this.state.players.push({
        id: conn.id,
        name: `Player ${this.state.players.length + 1}`,
        connected: true,
      })
    } else {
      this.state.spectatorIds.add(conn.id)
    }

    this.broadcastLobbyState()

    if (this.state.players.length === 2 && this.state.phase === 'lobby' &&
        this.state.players.every(p => p.connected)) {
      this.state.phase = 'hero-select'
      this.broadcastLobbyState()
    }
  }

  onClose(conn: Party.Connection) {
    const playerIndex = this.state.players.findIndex(p => p.id === conn.id)

    if (playerIndex !== -1) {
      if (this.state.phase === 'playing' || this.state.phase === 'done') {
        // During active game or post-game: mark disconnected, start forfeit timer
        this.state.players[playerIndex].connected = false

        if (this.state.phase === 'playing') {
          this.state.disconnectTimers[playerIndex as 0 | 1] = setTimeout(() => {
            this.onDisconnectTimeout(playerIndex as 0 | 1)
          }, DISCONNECT_TIMEOUT_MS)
        }
      } else {
        // In lobby or hero-select: actually remove the player and revert to lobby
        this.state.players.splice(playerIndex, 1)
        if (this.state.phase === 'hero-select') {
          this.state.phase = 'lobby'
        }
      }
    } else {
      this.state.spectatorIds.delete(conn.id)
    }

    this.broadcastLobbyState()
  }

  onMessage(message: string, sender: Party.Connection) {
    let parsed: ClientMessage
    try {
      parsed = JSON.parse(message as string) as ClientMessage
    } catch {
      this.sendTo(sender, { type: 'ERROR', message: 'Invalid JSON' })
      return
    }

    const playerIndex = this.state.players.findIndex(p => p.id === sender.id)
    if (playerIndex === -1) {
      this.sendTo(sender, { type: 'ERROR', message: 'Spectators cannot send actions' })
      return
    }

    switch (parsed.type) {
      case 'SELECT_HEROES':
        this.handleSelectHeroes(parsed.heroes, playerIndex)
        break
      case 'SPIN':
        this.handleSpin(playerIndex as 0 | 1, sender)
        break
      case 'LOCK_WHEEL':
        this.handleLockWheel(parsed.index, playerIndex as 0 | 1, sender)
        break
      case 'CONFIRM':
        this.handleConfirm(playerIndex as 0 | 1, sender)
        break
      case 'REMATCH':
        this.handleRematch(playerIndex as 0 | 1)
        break
    }
  }

  private handleSelectHeroes(heroes: [FigurineName, FigurineName], playerIndex: number) {
    if (this.state.phase !== 'hero-select') return

    this.state.players[playerIndex].heroes = heroes
    this.broadcastLobbyState()

    if (this.state.players.every(p => p.heroes !== undefined)) {
      const p1Heroes = this.state.players[0].heroes!
      const p2Heroes = this.state.players[1].heroes!

      const game = createInitialGameState(this.state.seed, p1Heroes, p2Heroes)
      this.state.rng = [
        createRng(this.state.seed),
        createRng(this.state.seed + 1),
      ]
      this.state.phase = 'playing'

      // Start the first round
      const { state: gameAfterStart } = startRound(game)
      this.state.game = gameAfterStart

      // Send MATCH_START to each connection with their yourPlayer value
      for (const conn of this.room.getConnections()) {
        const connPlayerIndex = this.state.players.findIndex(p => p.id === conn.id)
        const yourPlayer: 0 | 1 | 'spectator' =
          connPlayerIndex === 0 ? 0 :
          connPlayerIndex === 1 ? 1 :
          'spectator'

        this.sendTo(conn, {
          type: 'MATCH_START',
          game: this.state.game,
          yourPlayer,
        })
      }

      this.startSpinTimer()
    }
  }

  private handleSpin(playerIndex: 0 | 1, sender: Party.Connection) {
    if (this.state.phase !== 'playing' || !this.state.game || !this.state.rng) return
    if (this.state.game.roundPhase !== 'spinning') return
    if (this.state.game.confirmed[playerIndex]) {
      this.sendTo(sender, { type: 'ERROR', message: 'Already confirmed' })
      return
    }

    const ws = this.state.game.wheels[playerIndex]
    if (ws.spinsRemaining <= 0) {
      this.sendTo(sender, { type: 'ERROR', message: 'No spins remaining' })
      return
    }

    this.state.game = spin(this.state.game, playerIndex, this.state.rng[playerIndex], WHEELS)

    // Send YOUR_WHEELS only to this player
    const updatedWs = this.state.game.wheels[playerIndex]
    this.sendTo(sender, {
      type: 'YOUR_WHEELS',
      wheels: updatedWs,
      spinIndices: updatedWs.resultIndices ? [...updatedWs.resultIndices] : undefined,
    })
  }

  private handleLockWheel(index: number, playerIndex: 0 | 1, sender: Party.Connection) {
    if (this.state.phase !== 'playing' || !this.state.game) return
    if (this.state.game.roundPhase !== 'spinning') return
    if (this.state.game.confirmed[playerIndex]) {
      this.sendTo(sender, { type: 'ERROR', message: 'Already confirmed' })
      return
    }

    this.state.game = lockWheel(this.state.game, playerIndex, index)

    // Send updated wheel state only to this player
    this.sendTo(sender, {
      type: 'YOUR_WHEELS',
      wheels: this.state.game.wheels[playerIndex],
    })
  }

  private handleConfirm(playerIndex: 0 | 1, sender: Party.Connection) {
    if (this.state.phase !== 'playing' || !this.state.game) return
    if (this.state.game.roundPhase !== 'spinning') return
    if (this.state.game.confirmed[playerIndex]) {
      this.sendTo(sender, { type: 'ERROR', message: 'Already confirmed' })
      return
    }

    this.state.game = confirmSpins(this.state.game, playerIndex)

    // Acknowledge to the sender that their confirm went through
    this.sendTo(sender, { type: 'CONFIRMED' })

    // Notify the opponent that this player is ready
    const opponentIndex = playerIndex === 0 ? 1 : 0
    const opponentConn = this.getPlayerConnection(opponentIndex)
    if (opponentConn) {
      this.sendTo(opponentConn, { type: 'OPPONENT_READY' })
    }

    if (bothConfirmed(this.state.game)) {
      this.proceedToRevealAndResolve()
    }
  }

  private handleRematch(playerIndex: 0 | 1) {
    if (this.state.phase !== 'done') return

    this.state.rematchVotes[playerIndex] = true

    // Both players voted: reset to hero-select
    if (this.state.rematchVotes[0] && this.state.rematchVotes[1]) {
      this.state.phase = 'hero-select'
      this.state.game = null
      this.state.rng = null
      this.state.seed = Math.floor(Math.random() * 0xFFFFFFFF)
      this.state.rematchVotes = [false, false]
      this.state.players.forEach(p => { p.heroes = undefined })

      this.broadcast({ type: 'RETURN_TO_LOBBY' })
      this.broadcastLobbyState()
    }
  }

  private proceedToRevealAndResolve() {
    if (!this.state.game) return

    this.clearSpinTimer()

    // Reveal phase: broadcast full game state with both wheels visible
    this.state.game = revealWheels(this.state.game)
    this.broadcast({ type: 'REVEAL', game: this.state.game })

    // Resolve phase
    const { state: resolvedState, events } = resolve(this.state.game)
    this.state.game = resolvedState

    this.broadcast({ type: 'RESOLVE_UPDATE', game: this.state.game, events })

    if (this.state.game.winner !== null) {
      // Game over
      this.state.phase = 'done'
    } else {
      // Start next round
      this.state.game = { ...this.state.game, round: this.state.game.round + 1 }
      const { state: nextRoundState } = startRound(this.state.game)
      this.state.game = nextRoundState

      // Broadcast the new round state so clients know spinning has restarted
      this.broadcast({ type: 'REVEAL', game: this.state.game })

      this.startSpinTimer()
    }
  }

  private startSpinTimer() {
    this.clearSpinTimer()
    this.state.spinTimer = setTimeout(() => {
      this.onSpinTimerExpired()
    }, SPIN_TIMEOUT_MS)
  }

  private clearSpinTimer() {
    if (this.state.spinTimer !== null) {
      clearTimeout(this.state.spinTimer)
      this.state.spinTimer = null
    }
  }

  private onSpinTimerExpired() {
    this.state.spinTimer = null
    if (!this.state.game || this.state.game.roundPhase !== 'spinning') return

    // Auto-confirm any unconfirmed players
    if (!this.state.game.confirmed[0]) {
      this.state.game = confirmSpins(this.state.game, 0)
    }
    if (!this.state.game.confirmed[1]) {
      this.state.game = confirmSpins(this.state.game, 1)
    }

    this.proceedToRevealAndResolve()
  }

  private onDisconnectTimeout(playerIndex: 0 | 1) {
    this.state.disconnectTimers[playerIndex] = null
    if (!this.state.game || this.state.phase !== 'playing') return

    // Player didn't reconnect in time — opponent wins by forfeit
    const winnerIndex: 0 | 1 = playerIndex === 0 ? 1 : 0
    this.clearSpinTimer()
    this.state.game = {
      ...this.state.game,
      roundPhase: 'done',
      winner: winnerIndex,
    }
    this.state.phase = 'done'
    this.broadcast({
      type: 'RESOLVE_UPDATE',
      game: this.state.game,
      events: [{ type: 'game_over', detail: `Player ${winnerIndex + 1} wins by forfeit!` }],
    })
  }

  private getPlayerConnection(playerIndex: number): Party.Connection | null {
    const playerId = this.state.players[playerIndex]?.id
    if (!playerId) return null
    for (const conn of this.room.getConnections()) {
      if (conn.id === playerId) return conn
    }
    return null
  }

  private sendTo(conn: Party.Connection, msg: ServerMessage) {
    conn.send(JSON.stringify(msg))
  }

  private broadcast(msg: ServerMessage) {
    this.room.broadcast(JSON.stringify(msg))
  }

  private broadcastLobbyState() {
    const players = this.state.players.map(p => ({
      id: p.id,
      name: p.name,
      ready: p.heroes !== undefined,
    }))
    const spectators = this.state.spectatorIds.size
    const phase = this.state.phase

    for (const conn of this.room.getConnections()) {
      const playerIndex = this.state.players.findIndex(p => p.id === conn.id)
      const yourPlayer: 0 | 1 | 'spectator' =
        playerIndex === 0 ? 0 :
        playerIndex === 1 ? 1 :
        'spectator'

      this.sendTo(conn, {
        type: 'LOBBY_STATE',
        players,
        spectators,
        phase,
        yourPlayer,
      })
    }
  }
}
