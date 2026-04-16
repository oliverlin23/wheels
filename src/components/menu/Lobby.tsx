import { useState } from 'react'
import { useLobbyStore } from '../../store/lobby'

type LobbyProps = {
  onBack: () => void
  roomId: string | null
  connected: boolean
  onCreateRoom: () => void
  onJoinRoom: (code: string) => void
}

export function Lobby({ onBack, roomId, connected, onCreateRoom, onJoinRoom }: LobbyProps) {
  const [joinCode, setJoinCode] = useState('')
  const { players, spectatorCount } = useLobbyStore()

  const baseButton: React.CSSProperties = {
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
  }

  const sectionStyle: React.CSSProperties = {
    border: '1px solid var(--color-ink)',
    padding: '16px',
    width: '320px',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '9px',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: 'var(--color-ink)',
    marginBottom: '12px',
  }

  const textStyle: React.CSSProperties = {
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '9px',
    color: 'var(--color-ink)',
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: 'var(--color-paper)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
      }}
    >
      <h1
        style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '14px',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: 'var(--color-ink)',
          letterSpacing: '0.1em',
        }}
      >
        LOBBY
      </h1>

      {!roomId && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <div style={sectionStyle}>
            <div style={labelStyle}>CREATE ROOM</div>
            <button style={baseButton} onClick={onCreateRoom}>
              [ CREATE ROOM ]
            </button>
          </div>

          <div style={sectionStyle}>
            <div style={labelStyle}>JOIN ROOM</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={4}
                placeholder="CODE"
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  border: '1px solid var(--color-ink)',
                  background: 'var(--color-paper)',
                  color: 'var(--color-ink)',
                  padding: '8px 12px',
                  borderRadius: '0px',
                  outline: 'none',
                  width: '80px',
                  letterSpacing: '0.15em',
                }}
              />
              <button
                style={{
                  ...baseButton,
                  opacity: joinCode.length === 4 ? 1 : 0.4,
                }}
                onClick={() => {
                  if (joinCode.length === 4) onJoinRoom(joinCode)
                }}
              >
                [ JOIN ]
              </button>
            </div>
          </div>
        </div>
      )}

      {roomId && (
        <div style={sectionStyle}>
          <div style={labelStyle}>CONNECTED PLAYERS</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={textStyle}>
              PLAYER 1: {players[0]?.name ?? 'waiting...'}
            </div>
            <div style={textStyle}>
              PLAYER 2: {players[1]?.name ?? 'waiting...'}
            </div>
            <div style={{ ...textStyle, marginTop: '8px', color: 'var(--color-ink-mid)' }}>
              SPECTATORS: {spectatorCount}
            </div>
            <div style={{ ...textStyle, marginTop: '8px' }}>
              ROOM: {roomId}
            </div>
            {!connected && (
              <div style={{ ...textStyle, marginTop: '8px', color: 'var(--color-red-ink)' }}>
                CONNECTING...
              </div>
            )}
          </div>
        </div>
      )}

      <button style={baseButton} onClick={onBack}>
        [ BACK ]
      </button>
    </div>
  )
}
