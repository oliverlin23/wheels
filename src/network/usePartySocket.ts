import { useEffect, useRef, useCallback, useState } from 'react'
import PartySocket from 'partysocket'
import type { ClientMessage, ServerMessage } from './protocol'
import type { WheelState } from '../game/types'
import { useGameStore } from '../store/game'
import { useLogStore } from '../store/log'
import { useLobbyStore } from '../store/lobby'

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

        case 'OPPONENT_READY': {
          const game = useGameStore.getState().game
          const myIdx = useLobbyStore.getState().myPlayer as 0 | 1
          const oppIdx: 0 | 1 = myIdx === 0 ? 1 : 0
          const newConfirmed = [...game.confirmed] as [boolean, boolean]
          newConfirmed[oppIdx] = true
          useGameStore.getState().setGame({ ...game, confirmed: newConfirmed })
          break
        }

        case 'REVEAL':
          useGameStore.getState().setGame(msg.game)
          break

        case 'RESOLVE_UPDATE':
          useGameStore.getState().setGame(msg.game)
          useLogStore.getState().pushEvents(msg.events)
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
