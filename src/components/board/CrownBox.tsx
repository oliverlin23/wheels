import type { PlayerState } from '../../game/types'
import { Sprite } from '../Sprite'

type CrownBoxProps = {
  playerState: PlayerState
  side: 'player' | 'opponent'
}

const MAX_BULWARK = 5

export default function CrownBox({ playerState }: CrownBoxProps) {
  const { crownHp, bulwark } = playerState
  const hpColor = crownHp < 4 ? 'var(--color-red-ink)' : 'var(--color-ink)'

  const bulwarkSegments = []
  for (let i = 0; i < MAX_BULWARK; i++) {
    bulwarkSegments.push(
      <div
        key={i}
        style={{
          width: 8,
          height: 4,
          backgroundColor:
            i < bulwark ? 'var(--color-hammer-steel)' : 'var(--color-ink)',
          opacity: i < bulwark ? 1 : 0.15,
        }}
      />,
    )
  }

  return (
    <div
      style={{
        width: 72,
        height: 56,
        border: '1px solid var(--color-ink)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Inner border (inset 3px: 1px outer + 2px gap) */}
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: 3,
          right: 3,
          bottom: 3,
          border: '1px solid var(--color-ink)',
        }}
      />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Crown sprite */}
        <Sprite
          src="/sprites/crown.png"
          frame={{ x: 0, y: 0, w: 24, h: 24 }}
          style={{ width: 16, height: 16, backgroundSize: '16px 16px' }}
        />

        {/* HP number */}
        <div
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 18,
            fontWeight: 600,
            fontFeatureSettings: '"tnum"',
            color: hpColor,
            lineHeight: 1,
          }}
        >
          {String(crownHp).padStart(2, '0')}
        </div>

        {/* Bulwark section */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <div style={{ display: 'flex', gap: 1 }}>{bulwarkSegments}</div>
          <div
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 8,
              fontFeatureSettings: '"tnum"',
              color: 'var(--color-ink)',
            }}
          >
            {String(bulwark).padStart(2, '0')}/{String(MAX_BULWARK).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  )
}
