import { useState, useEffect, useCallback, type CSSProperties } from 'react'
import { Stage } from './components/Stage'
import { Debug } from './dev/Debug'
import { MainMenu } from './components/menu/MainMenu'
import { Lobby } from './components/menu/Lobby'
import { HeroSelect } from './components/menu/HeroSelect'
import { MatchEnd } from './components/menu/MatchEnd'
import { Settings } from './components/menu/Settings'
import { HelpModal } from './components/menu/HelpModal'
import { useGameStore } from './store/game'
import { useLobbyStore } from './store/lobby'
import { usePartySocket } from './network/usePartySocket'
import type { ClientMessage } from './network/protocol'

type Screen = 'menu' | 'lobby' | 'hero-select' | 'settings' | 'match' | 'match-end'

function App() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [roomId, setRoomId] = useState<string | null>(() => {
    return sessionStorage.getItem('wheels_roomId')
  })
  const game = useGameStore((s) => s.game)
  const lobbyPhase = useLobbyStore((s) => s.phase)
  const myPlayer = useLobbyStore((s) => s.myPlayer)
  const lobbyReset = useLobbyStore((s) => s.reset)
  const lobbySetRoomId = useLobbyStore((s) => s.setRoomId)

  // Persist roomId across reloads
  useEffect(() => {
    if (roomId) {
      sessionStorage.setItem('wheels_roomId', roomId)
    } else {
      sessionStorage.removeItem('wheels_roomId')
    }
  }, [roomId])

  // Connect to PartyKit when roomId is set
  const { connected, send } = usePartySocket(roomId)

  // Navigate when lobby phase changes
  useEffect(() => {
    if (lobbyPhase === 'hero-select' && screen === 'lobby') {
      setScreen('hero-select')
    }
    if (lobbyPhase === 'hero-select' && (screen === 'match' || screen === 'match-end')) {
      // Rematch: server reset the room — go back to hero select
      setScreen('hero-select')
    }
    if (lobbyPhase === 'playing' && (screen === 'hero-select' || screen === 'lobby')) {
      setScreen('match')
    }
    if (lobbyPhase === 'playing' && screen === 'menu') {
      // Reconnected to an active game
      setScreen('match')
    }
    if ((lobbyPhase === 'lobby' || lobbyPhase === 'hero-select') && screen === 'menu' && roomId) {
      // Reconnected to a room that isn't in a game yet
      setScreen(lobbyPhase === 'hero-select' ? 'hero-select' : 'lobby')
    }
  }, [lobbyPhase, screen])

  // Watch for game over during match
  useEffect(() => {
    if (screen === 'match' && game.winner !== null && game.roundPhase === 'done') {
      setScreen('match-end')
    }
  }, [screen, game.winner, game.roundPhase])

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
    if (roomId) {
      // Multiplayer: send rematch vote, wait for server to reset
      send({ type: 'REMATCH' })
    } else {
      setScreen('hero-select')
    }
  }

  const [menuOpen, setMenuOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const handleMainMenu = () => {
    setRoomId(null)
    lobbyReset()
    setMenuOpen(false)
    setScreen('menu')
  }

  const handleLeaveMatch = () => {
    setRoomId(null)
    lobbyReset()
    setMenuOpen(false)
    setScreen('lobby')
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
          myPlayer={myPlayer}
          onBack={() => setScreen('lobby')}
        />
      )

    case 'settings':
      return <Settings onBack={handleMainMenu} />

    case 'match':
      return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
            <Stage send={handleSend} myPlayer={myPlayer} onHelp={() => setHelpOpen(true)} />
            {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
            {/* Menu toggle */}
            <div
              onClick={() => setMenuOpen(true)}
              style={{
                position: 'absolute',
                top: 4,
                left: 4,
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: 8,
                color: 'var(--color-ink-mid)',
                border: '1px solid var(--color-ink-mid)',
                padding: '2px 6px',
                cursor: 'pointer',
                userSelect: 'none',
                zIndex: 10,
                background: 'var(--color-paper)',
              }}
            >
              MENU
            </div>
            {/* In-game menu overlay */}
            {menuOpen && (
              <InGameMenu
                roomId={roomId}
                onResume={() => setMenuOpen(false)}
                onLeaveMatch={handleLeaveMatch}
                onMainMenu={handleMainMenu}
              />
            )}
          </div>
          <div style={{ flexShrink: 0 }}>
            <Debug />
          </div>
        </div>
      )

    case 'match-end':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
          <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Stage send={handleSend} myPlayer={myPlayer} />
            </div>
          </div>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <MatchEnd
              winner={game.winner ?? 0}
              myPlayer={myPlayer}
              turn={game.round}
              onPlayAgain={handlePlayAgain}
              onMainMenu={handleMainMenu}
            />
          </div>
        </div>
      )
  }
}

const menuButton: CSSProperties = {
  fontFamily: '"IBM Plex Mono", monospace',
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  border: '1px solid var(--color-ink)',
  background: 'var(--color-paper)',
  color: 'var(--color-ink)',
  padding: '10px 24px',
  cursor: 'pointer',
  borderRadius: '0px',
  width: '100%',
}

function InGameMenu({
  roomId,
  onResume,
  onLeaveMatch,
  onMainMenu,
}: {
  roomId: string | null
  onResume: () => void
  onLeaveMatch: () => void
  onMainMenu: () => void
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(237, 231, 214, 0.92)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        gap: 12,
      }}
    >
      <div
        style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--color-ink)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 8,
        }}
      >
        MENU
      </div>

      {roomId && (
        <div
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 8,
            color: 'var(--color-ink-mid)',
            marginBottom: 8,
          }}
        >
          ROOM: {roomId}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 200 }}>
        <button style={menuButton} onClick={onResume}>
          [ RESUME ]
        </button>
        <button style={menuButton} onClick={onLeaveMatch}>
          [ LEAVE MATCH ]
        </button>
        <button style={menuButton} onClick={onMainMenu}>
          [ MAIN MENU ]
        </button>
      </div>
    </div>
  )
}

export default App
