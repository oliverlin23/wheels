import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../store/game'
import { useLogStore } from '../store/log'
import { useLobbyStore } from '../store/lobby'

export function Debug() {
  const [collapsed, setCollapsed] = useState(false)
  const game = useGameStore((s) => s.game)
  const spin = useGameStore((s) => s.spin)
  const lockWheel = useGameStore((s) => s.lockWheel)
  const confirmSpins = useGameStore((s) => s.confirmSpins)
  const startRound = useGameStore((s) => s.startRound)
  const resolveRound = useGameStore((s) => s.resolveRound)
  const events = useLogStore((s) => s.events)
  const clearLog = useLogStore((s) => s.clear)

  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [events])

  const myPlayer = useLobbyStore((s) => s.myPlayer)
  const lobbyPhase = useLobbyStore((s) => s.phase)

  const p1 = game.players[0]
  const p2 = game.players[1]
  const meIdx = (myPlayer === 0 || myPlayer === 1) ? myPlayer : 0
  const oppIdx: 0 | 1 = meIdx === 0 ? 1 : 0

  return (
    <div
      style={{
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: '11px',
        color: '#0F172A',
        background: '#F5F1E8',
        width: collapsed ? '28px' : '340px',
        height: '100vh',
        overflow: 'hidden',
        borderLeft: '1px solid #0F172A',
        boxSizing: 'border-box',
        transition: 'width 250ms ease-in-out',
        position: 'relative',
      }}
    >
      {/* Collapsed tab — always rendered, visible when collapsed */}
      <div
        onClick={() => setCollapsed(false)}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '28px',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          writingMode: 'vertical-rl',
          fontSize: '11px',
          opacity: collapsed ? 1 : 0,
          pointerEvents: collapsed ? 'auto' : 'none',
          transition: 'opacity 200ms ease-in-out',
        }}
      >
        ◀ DEBUG
      </div>

      {/* Expanded content — always rendered, hidden when collapsed */}
      <div
        style={{
          width: '340px',
          padding: '16px',
          height: '100vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxSizing: 'border-box',
          opacity: collapsed ? 0 : 1,
          pointerEvents: collapsed ? 'none' : 'auto',
          transition: 'opacity 200ms ease-in-out',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #0F172A', paddingBottom: '6px' }}>
          <span
            onClick={() => setCollapsed(true)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            DEBUG ▶
          </span>
          <span>R{String(game.round).padStart(2, '0')} {game.roundPhase.toUpperCase()}</span>
          <span>P1={game.confirmed[0] ? 'Y' : 'N'} P2={game.confirmed[1] ? 'Y' : 'N'}</span>
        </div>

        {/* State Machine */}
        <div style={{ borderTop: '1px solid #334155', paddingTop: '8px', fontSize: '10px' }}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>STATE MACHINE</div>
          <div>LOBBY: {lobbyPhase} | MY_PLAYER: {String(myPlayer)}</div>
          <div>ROUND_PHASE: {game.roundPhase}</div>
          <div>
            ME(P{meIdx + 1}): confirmed={String(game.confirmed[meIdx])} spins={game.wheels[meIdx].spinsRemaining} results={game.wheels[meIdx].results ? 'Y' : 'N'}
          </div>
          <div>
            OPP(P{oppIdx + 1}): confirmed={String(game.confirmed[oppIdx])} spins={game.wheels[oppIdx].spinsRemaining} results={game.wheels[oppIdx].results ? 'Y' : 'N'}
          </div>
          <div>WINNER: {String(game.winner)}</div>
        </div>

        {/* Players */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <PlayerPanel label="PLAYER 1" player={p1} />
          <PlayerPanel label="PLAYER 2" player={p2} />
        </div>

        {/* Wheels P1 */}
        <div style={{ borderTop: '1px solid #334155', paddingTop: '8px' }}>
          <div style={{ marginBottom: '6px' }}>P1 WHEELS (spins: {game.wheels[0].spinsRemaining})</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <button
                key={i}
                onClick={() => lockWheel(0, i)}
                style={{
                  fontFamily: 'inherit',
                  fontSize: '10px',
                  padding: '4px 6px',
                  border: `1px solid ${game.wheels[0].locked[i] ? '#6D28D9' : '#334155'}`,
                  background: game.wheels[0].locked[i] ? '#DBEAFE' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                W{i + 1}: {game.wheels[0].results ? `${game.wheels[0].results[i].symbol[0].toUpperCase()}${game.wheels[0].results[i].count > 1 ? game.wheels[0].results[i].count : ''}${game.wheels[0].results[i].xp ? '+' : ''}` : '--'}
                {game.wheels[0].locked[i] ? ' [L]' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Wheels P2 */}
        <div style={{ borderTop: '1px solid #334155', paddingTop: '8px' }}>
          <div style={{ marginBottom: '6px' }}>P2 WHEELS (spins: {game.wheels[1].spinsRemaining})</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <button
                key={i}
                onClick={() => lockWheel(1, i)}
                style={{
                  fontFamily: 'inherit',
                  fontSize: '10px',
                  padding: '4px 6px',
                  border: `1px solid ${game.wheels[1].locked[i] ? '#6D28D9' : '#334155'}`,
                  background: game.wheels[1].locked[i] ? '#DBEAFE' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                W{i + 1}: {game.wheels[1].results ? `${game.wheels[1].results[i].symbol[0].toUpperCase()}${game.wheels[1].results[i].count > 1 ? game.wheels[1].results[i].count : ''}${game.wheels[1].results[i].xp ? '+' : ''}` : '--'}
                {game.wheels[1].locked[i] ? ' [L]' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid #334155', paddingTop: '8px' }}>
          <ActionButton label="START ROUND" onClick={() => { startRound(); clearLog() }} />
          <ActionButton label="SPIN P1" onClick={() => spin(0)} />
          <ActionButton label="SPIN P2" onClick={() => spin(1)} />
          <ActionButton label="CONFIRM P1" onClick={() => confirmSpins(0)} />
          <ActionButton label="CONFIRM P2" onClick={() => confirmSpins(1)} />
          <ActionButton label="RESOLVE" onClick={() => resolveRound()} />
        </div>

        {/* Log */}
        <div
          ref={logRef}
          style={{
            flex: 1,
            borderTop: '1px solid #334155',
            paddingTop: '8px',
            overflow: 'auto',
            minHeight: '80px',
          }}
        >
          <div style={{ marginBottom: '4px' }}>LOG ({events.length})</div>
          {events.map((e, i) => (
            <div key={i} style={{ color: e.type === 'damage' ? '#B91C1C' : e.type === 'heal' ? '#1E40AF' : '#334155' }}>
              {e.detail}
            </div>
          ))}
        </div>

        {/* Winner */}
        {game.winner !== null && (
          <div style={{ background: '#6D28D9', color: '#F5F1E8', padding: '8px', textAlign: 'center', fontWeight: 600 }}>
            {game.winner === 'tie' ? 'TIE GAME' : `PLAYER ${(game.winner as number) + 1} WINS`}
          </div>
        )}
      </div>
    </div>
  )
}

function PlayerPanel({ label, player }: { label: string; player: import('../game/types').PlayerState }) {
  return (
    <div style={{ flex: 1, border: '1px solid #334155', padding: '8px' }}>
      <div style={{ fontWeight: 600, marginBottom: '6px' }}>{label}</div>
      <div style={{ marginBottom: '4px' }}>CROWN: {player.crownHp} | BULWARK: {player.bulwark}/5</div>
      {player.heroes.map((h, i) => (
        <div key={i} style={{ marginTop: '6px', paddingLeft: '6px', borderLeft: `2px solid ${h.slot === 'suns' ? '#D97706' : '#0F766E'}` }}>
          <div>{h.name.toUpperCase()} ({h.rank})</div>
          <div style={{ color: '#334155' }}>[{h.slot}]</div>
          <div>E: {h.energy} | XP: {h.xp}/10</div>
        </div>
      ))}
    </div>
  )
}

function ActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: '10px',
        padding: '4px 8px',
        border: '1px solid #0F172A',
        background: 'transparent',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}
