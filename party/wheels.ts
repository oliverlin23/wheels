import type * as Party from "partykit/server"
import type { FigurineName, GameState, LogEvent } from '../src/game/types'
import type { ClientMessage, ServerMessage, RoomPhase } from '../src/network/protocol'
import { startRound, spin, lockWheel, confirmSpins, bothConfirmed, revealWheels } from '../src/game/rules/actions'
import { resolve } from '../src/game/rules/resolve'
import { createRng } from '../src/game/rng'
import { WHEELS } from '../src/game/rules/panels'
import { createInitialGameState } from '../src/store/game'

type RoomState = {
  phase: RoomPhase
  players: { id: string; name: string; heroes?: [FigurineName, FigurineName] }[]
  spectatorIds: Set<string>
  game: GameState | null
  rng: [(() => number), (() => number)] | null
  seed: number
  spinTimer: ReturnType<typeof setTimeout> | null
}

const SPIN_TIMEOUT_MS = 60_000

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
    }
  }

  onConnect(conn: Party.Connection) {
    if (this.state.phase === 'lobby' && this.state.players.length < 2) {
      this.state.players.push({
        id: conn.id,
        name: `Player ${this.state.players.length + 1}`,
      })
    } else {
      this.state.spectatorIds.add(conn.id)
    }

    this.broadcastLobbyState()

    if (this.state.players.length === 2 && this.state.phase === 'lobby') {
      this.state.phase = 'hero-select'
      this.broadcastLobbyState()
    }
  }

  onClose(conn: Party.Connection) {
    const playerIndex = this.state.players.findIndex(p => p.id === conn.id)

    if (playerIndex !== -1) {
      this.state.players.splice(playerIndex, 1)

      if (this.state.phase === 'playing' && this.state.game && this.state.players.length === 1) {
        this.clearSpinTimer()
        const winnerIndex: 0 | 1 = playerIndex === 0 ? 1 : 0
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
      const { state: nextRoundState, events: roundEvents } = startRound(this.state.game)
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
    this.broadcast({
      type: 'LOBBY_STATE',
      players: this.state.players.map(p => ({
        id: p.id,
        name: p.name,
        ready: p.heroes !== undefined,
      })),
      spectators: this.state.spectatorIds.size,
      phase: this.state.phase,
    })
  }
}
