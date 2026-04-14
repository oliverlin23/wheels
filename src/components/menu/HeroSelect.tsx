import { useState } from 'react'
import type { FigurineName } from '../../game/types'
import type { ClientMessage } from '../../network/protocol'
import { getStats } from '../../game/rules/figurines'

type HeroSelectProps = {
  send: (msg: ClientMessage) => void
  myPlayer: 0 | 1 | 'spectator' | null
  onBack: () => void
}

const ALL_HEROES: FigurineName[] = ['warrior', 'mage', 'archer', 'engineer', 'assassin', 'priest']

const ROLE_DESC: Record<FigurineName, string> = {
  warrior: 'Ground fighter. High damage.',
  mage: 'Two fireballs. Bypasses walls.',
  archer: 'Ranged. Hits crown over low walls.',
  engineer: 'Attacks + builds defense.',
  assassin: 'Bypasses walls. Disrupts.',
  priest: 'Heals crown. Boosts ally.',
}

export function HeroSelect({ send, myPlayer, onBack }: HeroSelectProps) {
  const [selected, setSelected] = useState<FigurineName[]>([])
  const [confirmed, setConfirmed] = useState(false)

  if (myPlayer === 'spectator') {
    return (
      <div
        style={{
          width: '100vw',
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
          SELECT YOUR HEROES
        </h1>
        <p
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '9px',
            color: 'var(--color-ink-mid)',
            textTransform: 'uppercase',
          }}
        >
          SPECTATING - waiting for players to select heroes
        </p>
        <button
          onClick={onBack}
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '10px',
            textTransform: 'uppercase',
            border: '1px solid var(--color-ink)',
            background: 'var(--color-paper)',
            color: 'var(--color-ink)',
            padding: '10px 24px',
            cursor: 'pointer',
            borderRadius: '0px',
          }}
        >
          [ BACK ]
        </button>
      </div>
    )
  }

  const playerIndex = myPlayer as 0 | 1
  const accentColor = playerIndex === 0 ? 'var(--color-blue-ink)' : 'var(--color-red-ink)'

  const toggleHero = (name: FigurineName) => {
    if (confirmed) return
    if (selected.includes(name)) {
      setSelected(selected.filter((h) => h !== name))
    } else if (selected.length < 2) {
      setSelected([...selected, name])
    }
  }

  const slotTag = (name: FigurineName): string | null => {
    const idx = selected.indexOf(name)
    if (idx === 0) return '[SQ]'
    if (idx === 1) return '[DI]'
    return null
  }

  const handleConfirm = () => {
    if (selected.length !== 2) return
    send({ type: 'SELECT_HEROES', heroes: [selected[0], selected[1]] as [FigurineName, FigurineName] })
    setConfirmed(true)
  }

  const baseButton: React.CSSProperties = {
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '10px',
    textTransform: 'uppercase',
    border: '1px solid var(--color-ink)',
    background: 'var(--color-paper)',
    color: 'var(--color-ink)',
    padding: '10px 24px',
    cursor: 'pointer',
    borderRadius: '0px',
  }

  return (
    <div
      style={{
        width: '100vw',
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
        SELECT YOUR HEROES
      </h1>

      <h2
        style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: accentColor,
        }}
      >
        PLAYER {playerIndex + 1}
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          width: '360px',
          opacity: confirmed ? 0.5 : 1,
          pointerEvents: confirmed ? 'none' : 'auto',
        }}
      >
        {ALL_HEROES.map((name) => {
          const isSelected = selected.includes(name)
          const stats = getStats(name, 'bronze')
          const tag = slotTag(name)

          return (
            <button
              key={name}
              onClick={() => toggleHero(name)}
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '9px',
                textTransform: 'uppercase',
                background: 'var(--color-paper-dim)',
                border: isSelected ? `2px solid ${accentColor}` : '1px solid var(--color-ink)',
                padding: isSelected ? '7px' : '8px',
                cursor: confirmed ? 'default' : 'pointer',
                textAlign: 'left',
                borderRadius: '0px',
                color: 'var(--color-ink)',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '2px' }}>
                {name}
                {tag && (
                  <span style={{ color: accentColor, marginLeft: '6px', fontSize: '8px' }}>{tag}</span>
                )}
              </div>
              <div style={{ fontSize: '7px', color: 'var(--color-ink-mid)' }}>
                energy: {stats.energyCost}
              </div>
              <div style={{ fontSize: '7px', color: 'var(--color-ink-mid)', marginTop: '2px' }}>
                {ROLE_DESC[name]}
              </div>
            </button>
          )
        })}
      </div>

      {confirmed && (
        <p
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '9px',
            color: 'var(--color-ink-mid)',
            textTransform: 'uppercase',
          }}
        >
          WAITING FOR OPPONENT...
        </p>
      )}

      <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
        <button style={baseButton} onClick={onBack}>
          [ BACK ]
        </button>

        {selected.length === 2 && !confirmed && (
          <button
            onClick={handleConfirm}
            style={{
              ...baseButton,
              outline: '1px solid var(--color-ink)',
              outlineOffset: '2px',
            }}
          >
            [ CONFIRM ]
          </button>
        )}
      </div>
    </div>
  )
}
