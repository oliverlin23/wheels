import { useEffect, useRef, useState } from 'react'
import { createActor } from 'xstate'
import { turnMachine } from '../machine/turn'
import { useGameStore } from '../store/game'
import { useLogStore } from '../store/log'

const actor = createActor(turnMachine)
actor.start()

export function Debug() {
  const game = useGameStore((s) => s.game)
  const spin = useGameStore((s) => s.spin)
  const lockWheel = useGameStore((s) => s.lockWheel)
  const startTurn = useGameStore((s) => s.startTurn)
  const resolveRoll = useGameStore((s) => s.resolveRoll)
  const endTurn = useGameStore((s) => s.endTurn)
  const events = useLogStore((s) => s.events)
  const clearLog = useLogStore((s) => s.clear)

  const [machineState, setMachineState] = useState(actor.getSnapshot().value)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sub = actor.subscribe((snapshot) => {
      setMachineState(snapshot.value)
    })
    return () => sub.unsubscribe()
  }, [])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [events])

  const handleSpin = () => {
    spin()
    actor.send({ type: 'SPIN' })
  }

  const handleSettle = () => {
    actor.send({ type: 'SETTLE_DONE' })
  }

  const handleResolve = () => {
    resolveRoll()
    actor.send({ type: 'RESOLVE_DONE' })
  }

  const handleActDone = () => {
    actor.send({ type: 'ACT_DONE' })
  }

  const handleNextTurn = () => {
    endTurn()
    startTurn()
    actor.send({ type: 'NEXT_TURN' })
  }

  const handleGameOver = () => {
    actor.send({ type: 'GAME_OVER' })
  }

  const cp = game.players[game.currentPlayer]
  const op = game.players[game.currentPlayer === 0 ? 1 : 0]

  return (
    <div
      style={{
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: '11px',
        color: '#0F172A',
        background: '#F5F1E8',
        padding: '12px',
        height: '100vh',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #0F172A', paddingBottom: '4px' }}>
        <span>TURN {String(game.turn).padStart(2, '0')} | P{game.currentPlayer + 1}</span>
        <span>FSM: {String(machineState).toUpperCase()}</span>
        <span>{game.phase.toUpperCase()}</span>
      </div>

      {/* Players */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <PlayerPanel label="CURRENT" player={cp} />
        <PlayerPanel label="OPPONENT" player={op} />
      </div>

      {/* Wheels */}
      <div style={{ borderTop: '1px solid #334155', paddingTop: '4px' }}>
        <div>WHEELS (spins: {game.wheels.spinsRemaining})</div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <button
              key={i}
              onClick={() => lockWheel(i)}
              style={{
                fontFamily: 'inherit',
                fontSize: '10px',
                padding: '4px 6px',
                border: `1px solid ${game.wheels.locked[i] ? '#6D28D9' : '#334155'}`,
                background: game.wheels.locked[i] ? '#DBEAFE' : 'transparent',
                cursor: 'pointer',
              }}
            >
              W{i + 1}: {game.wheels.results ? `${game.wheels.results[i].symbol[0].toUpperCase()}${game.wheels.results[i].count > 1 ? game.wheels.results[i].count : ''}${game.wheels.results[i].xp ? '+' : ''}` : '--'}
              {game.wheels.locked[i] ? ' [L]' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid #334155', paddingTop: '4px' }}>
        <ActionButton label="START TURN" onClick={() => { startTurn(); clearLog() }} />
        <ActionButton label="SPIN" onClick={handleSpin} />
        <ActionButton label="SETTLE" onClick={handleSettle} />
        <ActionButton label="RESOLVE" onClick={handleResolve} />
        <ActionButton label="ACT DONE" onClick={handleActDone} />
        <ActionButton label="NEXT TURN" onClick={handleNextTurn} />
        <ActionButton label="GAME OVER" onClick={handleGameOver} />
      </div>

      {/* Log */}
      <div
        ref={logRef}
        style={{
          flex: 1,
          borderTop: '1px solid #334155',
          paddingTop: '4px',
          overflow: 'auto',
          minHeight: '100px',
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
  )
}

function PlayerPanel({ label, player }: { label: string; player: import('../game/types').PlayerState }) {
  return (
    <div style={{ flex: 1, border: '1px solid #334155', padding: '6px' }}>
      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{label}</div>
      <div>CROWN: {player.crownHp} | BULWARK: {player.bulwark}/5</div>
      {player.heroes.map((h, i) => (
        <div key={i} style={{ marginTop: '4px', paddingLeft: '4px', borderLeft: `2px solid ${h.slot === 'squares' ? '#D97706' : '#0F766E'}` }}>
          <div>{h.name.toUpperCase()} ({h.rank}) [{h.slot}]</div>
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
