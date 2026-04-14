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

  return (
    <div
      style={{
        width: 440,
        height: 56,
        backgroundColor: bgColor,
        border: '1px solid var(--color-ink)',
        borderRadius: 8,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Section label */}
      <div
        style={{
          position: 'absolute',
          top: 4,
          left: 8,
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 8,
          color: 'var(--color-ink-mid)',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </div>

      {/* Main content: Platform -- wiring -- CrownBox -- wiring -- Platform */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          marginTop: 8,
        }}
      >
        {/* Left platform */}
        <Platform hero={playerState.heroes[0]} />

        {/* Left wiring channel */}
        <div
          style={{
            width: 40,
            height: 1,
            backgroundColor: 'var(--color-ink)',
            flexShrink: 0,
          }}
        />

        {/* Crown box */}
        <CrownBox playerState={playerState} side={side} />

        {/* Right wiring channel */}
        <div
          style={{
            width: 40,
            height: 1,
            backgroundColor: 'var(--color-ink)',
            flexShrink: 0,
          }}
        />

        {/* Right platform */}
        <Platform hero={playerState.heroes[1]} />
      </div>
    </div>
  )
}
