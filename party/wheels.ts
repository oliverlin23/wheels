import type * as Party from "partykit/server"
import type { FigurineName, GameState, LogEvent } from '../src/game/types'
import type { ClientMessage, ServerMessage, RoomPhase } from '../src/network/protocol'
import { spin, startTurn, lockWheel, endTurn } from '../src/game/rules/actions'
import { resolve } from '../src/game/rules/resolve'
import { createRng } from '../src/game/rng'
import { WHEELS } from '../src/game/rules/panels'
import { createInitialGameState } from '../src/store/game'

type RoomState = {
  phase: RoomPhase
  players: { id: string; name: string; heroes?: [FigurineName, FigurineName] }[]
  spectatorIds: Set<string>
  game: GameState | null
  rng: (() => number) | null
  seed: number
}

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
        // Remaining player wins by forfeit
        const remainingId = this.state.players[0].id
        // Find which player index the remaining player was
        // Since one was removed, we need to figure out the winner
        // The remaining player's original index: if playerIndex was 0, remaining was 1; if 1, remaining was 0
        const winnerIndex: 0 | 1 = playerIndex === 0 ? 1 : 0
        this.state.game = {
          ...this.state.game,
          phase: 'done',
          winner: winnerIndex,
        }
        this.state.phase = 'done'
        this.broadcastStateUpdate([
          { type: 'game_over', detail: `Player ${winnerIndex + 1} wins by forfeit!` },
        ])
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
      sender.send(JSON.stringify({ type: 'ERROR', message: 'Invalid JSON' } satisfies ServerMessage))
      return
    }

    // Validate sender is a player
    const playerIndex = this.state.players.findIndex(p => p.id === sender.id)
    if (playerIndex === -1) {
      sender.send(JSON.stringify({ type: 'ERROR', message: 'Spectators cannot send actions' } satisfies ServerMessage))
      return
    }

    switch (parsed.type) {
      case 'SELECT_HEROES':
        this.handleSelectHeroes(parsed.heroes, playerIndex)
        break
      case 'SPIN':
        this.handleSpin(playerIndex, sender)
        break
      case 'LOCK_WHEEL':
        this.handleLockWheel(parsed.index, playerIndex, sender)
        break
    }
  }

  private handleSelectHeroes(heroes: [FigurineName, FigurineName], playerIndex: number) {
    if (this.state.phase !== 'hero-select') return

    this.state.players[playerIndex].heroes = heroes
    this.broadcastLobbyState()

    // Check if both players have selected heroes
    if (this.state.players.every(p => p.heroes !== undefined)) {
      const p1Heroes = this.state.players[0].heroes!
      const p2Heroes = this.state.players[1].heroes!

      const game = createInitialGameState(this.state.seed, p1Heroes, p2Heroes)
      const rng = createRng(this.state.seed)

      // Run startTurn for the first turn
      const { state: gameAfterStart, events } = startTurn(game)

      this.state.game = gameAfterStart
      this.state.rng = rng
      this.state.phase = 'playing'

      // Send MATCH_START to each connection with their yourPlayer value
      for (const conn of this.room.getConnections()) {
        const connPlayerIndex = this.state.players.findIndex(p => p.id === conn.id)
        const yourPlayer: 0 | 1 | 'spectator' =
          connPlayerIndex === 0 ? 0 :
          connPlayerIndex === 1 ? 1 :
          'spectator'

        const msg: ServerMessage = {
          type: 'MATCH_START',
          game: this.state.game,
          yourPlayer,
        }
        conn.send(JSON.stringify(msg))
      }
    }
  }

  private handleSpin(playerIndex: number, sender: Party.Connection) {
    if (this.state.phase !== 'playing' || !this.state.game || !this.state.rng) return

    // Validate it's the current player's turn
    if (playerIndex !== this.state.game.currentPlayer) {
      sender.send(JSON.stringify({ type: 'ERROR', message: 'Not your turn' } satisfies ServerMessage))
      return
    }

    this.state.game = spin(this.state.game, this.state.rng, WHEELS)
    const spinIndices = this.state.game.wheels.resultIndices
      ? [...this.state.game.wheels.resultIndices] as number[]
      : undefined

    if (this.state.game.wheels.spinsRemaining === 0) {
      // Auto-resolve, end turn, start next turn
      const resolveResult = resolve(this.state.game)
      this.state.game = resolveResult.state
      const events = resolveResult.events

      if (this.state.game.phase === 'done') {
        // Game over after resolution
        this.state.phase = 'done'
        this.broadcastStateUpdate(events, spinIndices)
        return
      }

      this.state.game = endTurn(this.state.game)
      const { state: nextTurnState, events: turnEvents } = startTurn(this.state.game)
      this.state.game = nextTurnState

      this.broadcastStateUpdate([...events, ...turnEvents], spinIndices)
    } else {
      this.broadcastStateUpdate([], spinIndices)
    }
  }

  private handleLockWheel(index: number, playerIndex: number, sender: Party.Connection) {
    if (this.state.phase !== 'playing' || !this.state.game) return

    if (playerIndex !== this.state.game.currentPlayer) {
      sender.send(JSON.stringify({ type: 'ERROR', message: 'Not your turn' } satisfies ServerMessage))
      return
    }

    this.state.game = lockWheel(this.state.game, index)
    this.broadcastStateUpdate([])
  }

  private broadcastLobbyState() {
    const msg: ServerMessage = {
      type: 'LOBBY_STATE',
      players: this.state.players.map(p => ({
        id: p.id,
        name: p.name,
        ready: p.heroes !== undefined,
      })),
      spectators: this.state.spectatorIds.size,
      phase: this.state.phase,
    }
    this.room.broadcast(JSON.stringify(msg))
  }

  private broadcastStateUpdate(events: LogEvent[], spinIndices?: number[]) {
    const msg: ServerMessage = {
      type: 'STATE_UPDATE',
      game: this.state.game!,
      events,
      spinIndices,
    }
    this.room.broadcast(JSON.stringify(msg))
  }
}
