import { useState, useEffect, useCallback } from 'react'
import { Stage } from './components/Stage'
import { Debug } from './dev/Debug'
import { MainMenu } from './components/menu/MainMenu'
import { Lobby } from './components/menu/Lobby'
import { HeroSelect } from './components/menu/HeroSelect'
import { MatchEnd } from './components/menu/MatchEnd'
import { Settings } from './components/menu/Settings'
import { useGameStore } from './store/game'
import { useLobbyStore } from './store/lobby'
import { usePartySocket } from './network/usePartySocket'
import type { ClientMessage } from './network/protocol'

type Screen = 'menu' | 'lobby' | 'hero-select' | 'settings' | 'match' | 'match-end'

function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [roomId, setRoomId] = useState<string | null>(null)
  const game = useGameStore((s) => s.game)
  const lobbyPhase = useLobbyStore((s) => s.phase)
  const myPlayer = useLobbyStore((s) => s.myPlayer)
  const lobbyReset = useLobbyStore((s) => s.reset)
  const lobbySetRoomId = useLobbyStore((s) => s.setRoomId)

  // Connect to PartyKit when roomId is set
  const { connected, send } = usePartySocket(roomId)

  // Navigate when lobby phase changes
  useEffect(() => {
    if (lobbyPhase === 'hero-select' && screen === 'lobby') {
      setScreen('hero-select')
    }
    if (lobbyPhase === 'playing' && (screen === 'hero-select' || screen === 'lobby')) {
      setScreen('match')
    }
  }, [lobbyPhase, screen])

  // Watch for game over during match
  useEffect(() => {
    if (screen === 'match' && game.winner !== null) {
      setScreen('match-end')
    }
  }, [screen, game.winner])

  const handleCreateRoom = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
    setRoomId(code)
    lobbySetRoomId(code)
  }, [lobbySetRoomId])

  const handleJoinRoom = useCallback((code: string) => {
    setRoomId(code.toUpperCase())
    lobbySetRoomId(code.toUpperCase())
  }, [lobbySetRoomId])

  const handleSend = useCallback((msg: ClientMessage) => {
    send(msg)
  }, [send])

  const handlePlayAgain = () => {
    setScreen('lobby')
  }

  const handleMainMenu = () => {
    setRoomId(null)
    lobbyReset()
    setScreen('menu')
  }

  switch (screen) {
    case 'menu':
      return (
        <MainMenu
          onNewMatch={() => setScreen('lobby')}
          onSettings={() => setScreen('settings')}
        />
      )

    case 'lobby':
      return (
        <Lobby
          onBack={handleMainMenu}
          roomId={roomId}
          connected={connected}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      )

    case 'hero-select':
      return (
        <HeroSelect
          send={handleSend}
          myPlayer={myPlayer ?? 0}
          onBack={() => setScreen('lobby')}
        />
      )

    case 'settings':
      return <Settings onBack={handleMainMenu} />

    case 'match':
      return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Stage send={handleSend} myPlayer={myPlayer} />
          </div>
          <div style={{ width: '340px', borderLeft: '1px solid #0F172A', flexShrink: 0 }}>
            <Debug />
          </div>
        </div>
      )

    case 'match-end':
      return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
          <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Stage send={handleSend} myPlayer={myPlayer} />
            </div>
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <MatchEnd
              winner={game.winner ?? 0}
              myPlayer={myPlayer}
              turn={game.turn}
              onPlayAgain={handlePlayAgain}
              onMainMenu={handleMainMenu}
            />
          </div>
        </div>
      )
  }
}

export default App
