import { useEffect, useRef, useCallback, useState } from 'react'
import PartySocket from 'partysocket'
import type { ClientMessage, ServerMessage } from './protocol'
import type { WheelState } from '../game/types'
import { useGameStore } from '../store/game'
import { useLogStore } from '../store/log'
import { useLobbyStore } from '../store/lobby'
import { usePlaybackStore } from '../resolve/playbackStore'

export function usePartySocket(roomId: string | null): {
  connected: boolean
  send: (msg: ClientMessage) => void
} {
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<PartySocket | null>(null)

  useEffect(() => {
    if (!roomId) {
      setConnected(false)
      return
    }

    const host = import.meta.env.DEV
      ? 'localhost:1999'
      : window.location.host

    const ws = new PartySocket({
      host,
      room: roomId,
    })
    wsRef.current = ws

    ws.addEventListener('open', () => {
      setConnected(true)
    })

    ws.addEventListener('close', () => {
      setConnected(false)
    })

    ws.addEventListener('message', (event: MessageEvent) => {
      const msg = JSON.parse(event.data as string) as ServerMessage

      switch (msg.type) {
        case 'LOBBY_STATE':
          useLobbyStore.getState().setLobbyState(msg.players, msg.spectators, msg.phase)
          if (msg.yourPlayer !== undefined) {
            useLobbyStore.getState().setMyPlayer(msg.yourPlayer)
          }
          break

        case 'MATCH_START':
          useLobbyStore.getState().setMyPlayer(msg.yourPlayer)
          useLobbyStore.getState().setLobbyState(
            useLobbyStore.getState().players,
            useLobbyStore.getState().spectatorCount,
            'playing',
          )
          useGameStore.getState().setGame(msg.game)
          useLogStore.getState().clear()
          break

        case 'YOUR_WHEELS': {
          const game = useGameStore.getState().game
          const myIdx = useLobbyStore.getState().myPlayer as 0 | 1
          const newWheels = [...game.wheels] as [WheelState, WheelState]
          newWheels[myIdx] = msg.wheels
          useGameStore.getState().setGame({ ...game, wheels: newWheels })
          if (msg.spinIndices) useGameStore.getState().incrementSpinCount()
          break
        }

        case 'CONFIRMED': {
          // Server acknowledged our confirm — set our own confirmed flag
          const myIdx = useLobbyStore.getState().myPlayer as 0 | 1
          const game = useGameStore.getState().game
          const confirmed = [...game.confirmed] as [boolean, boolean]
          confirmed[myIdx] = true
          useGameStore.getState().setGame({ ...game, confirmed })
          break
        }

        case 'OPPONENT_READY': {
          // Opponent confirmed — set their confirmed flag
          const myIdx = useLobbyStore.getState().myPlayer as 0 | 1
          const oppIdx: 0 | 1 = myIdx === 0 ? 1 : 0
          const game = useGameStore.getState().game
          const confirmed = [...game.confirmed] as [boolean, boolean]
          confirmed[oppIdx] = true
          useGameStore.getState().setGame({ ...game, confirmed })
          break
        }

        case 'REVEAL': {
          // During an active playback OR during the reveal pause before
          // playback starts, REVEAL messages should update the pending final
          // game (so we land on the latest state) rather than overwriting the
          // currently-displayed state.
          const pb = usePlaybackStore.getState()
          if (pb.isPlayingBack || pb.isPendingPlayback) {
            usePlaybackStore.setState({ pendingFinalGame: msg.game })
          } else {
            useGameStore.getState().setGame(msg.game)
          }
          break
        }

        case 'RESOLVE_UPDATE': {
          // Reveal moment: show wheels for ~1200ms before starting playback.
          // During this pause, isPendingPlayback is true so subsequent REVEAL
          // messages (next round state) queue instead of clobbering the display.
          const preResolve = useGameStore.getState().game
          usePlaybackStore.getState().beginReveal(preResolve)
          const events = msg.events
          const finalGame = msg.game
          setTimeout(() => {
            usePlaybackStore.getState().startPlayback(events, finalGame, preResolve)
          }, 1200)
          break
        }

        case 'RETURN_TO_LOBBY':
          // Server reset the room for rematch — go back to hero-select
          useLobbyStore.getState().setLobbyState(
            useLobbyStore.getState().players,
            useLobbyStore.getState().spectatorCount,
            'hero-select',
          )
          break

        case 'ERROR':
          console.error('Server error:', msg.message)
          break
      }
    })

    return () => {
      ws.close()
      wsRef.current = null
      setConnected(false)
    }
  }, [roomId])

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg))
    }
  }, [])

  return { connected, send }
}
