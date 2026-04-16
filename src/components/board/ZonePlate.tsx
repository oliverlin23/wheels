import type { PlayerState } from '../../game/types'
import Platform from './Platform'
import CrownBox from './CrownBox'

type ZonePlateProps = {
  side: 'player' | 'opponent'
  playerState: PlayerState
}

export default function ZonePlate({ side, playerState }: ZonePlateProps) {
  const bgColor =
    side === 'player' ? 'var(--color-blue-wash)' : 'var(--color-red-wash)'
  const label = side === 'player' ? '// PLAYER' : '// OPPONENT'
  const accentColor = side === 'player' ? 'var(--color-blue-ink)' : 'var(--color-red-ink)'

  return (
    <div
      style={{
        width: 480,
        height: 88,
        backgroundColor: bgColor,
        border: '1px solid var(--color-ink)',
        borderRadius: 4,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Section label — code-comment style */}
      <div
        style={{
          position: 'absolute',
          top: 4,
          left: 8,
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 7,
          color: accentColor,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          opacity: 0.6,
        }}
      >
        {label}
      </div>

      {/* Accent line at inner top edge */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: accentColor,
        opacity: 0.15,
      }} />

      {/* Main content: Platform — wiring — CrownBox — wiring — Platform */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          marginTop: 4,
        }}
      >
        <Platform hero={playerState.heroes[0]} />

        {/* Left wiring — dashed for schematic feel */}
        <div
          style={{
            width: 32,
            height: 0,
            borderTop: '1px dashed var(--color-ink)',
            opacity: 0.3,
            flexShrink: 0,
          }}
        />

        <CrownBox playerState={playerState} side={side} />

        {/* Right wiring */}
        <div
          style={{
            width: 32,
            height: 0,
            borderTop: '1px dashed var(--color-ink)',
            opacity: 0.3,
            flexShrink: 0,
          }}
        />

        <Platform hero={playerState.heroes[1]} />
      </div>
    </div>
  )
}
