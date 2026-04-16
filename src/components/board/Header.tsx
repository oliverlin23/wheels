import type { FC } from 'react'

type HeaderProps = {
  turn: number
  onHelp?: (() => void) | undefined
}

export const Header: FC<HeaderProps> = ({ turn, onHelp }) => {
  const turnStr = String(turn).padStart(2, '0')

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 520,
        height: 18,
        borderBottom: '1px solid var(--color-ink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
      }}
    >
      {/* Turn counter — technical label */}
      <span style={{
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 7,
        fontWeight: 400,
        color: 'var(--color-ink-mid)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontFeatureSettings: '"tnum"',
      }}>
        TURN {turnStr}
      </span>

      {/* Title — display font, bold */}
      <span style={{
        fontFamily: '"Space Grotesk", sans-serif',
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--color-ink)',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
      }}>
        WHEELS
      </span>

      {/* Help — pixel font accent */}
      <span
        onClick={onHelp}
        style={{
          fontFamily: '"Press Start 2P", cursive',
          fontSize: 5,
          color: 'var(--color-ink-mid)',
          cursor: 'pointer',
          opacity: 0.6,
        }}
      >
        ?
      </span>
    </div>
  )
}
