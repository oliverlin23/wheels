import type { FC } from 'react'

type FooterProps = {
  spinsRemaining: number
  onSpin: () => void
  canSpin: boolean
}

export const Footer: FC<FooterProps> = ({ spinsRemaining, onSpin, canSpin }) => {
  const ink = 'var(--color-ink)'
  const inkMid = 'var(--color-ink-mid)'
  const maxSpins = 3

  const buttonColor = canSpin ? ink : inkMid
  const buttonCursor = canSpin ? 'pointer' : 'default'

  const pips = Array.from({ length: maxSpins }, (_, i) => {
    const filled = i < spinsRemaining
    return (
      <div
        key={i}
        style={{
          width: 8,
          height: 4,
          backgroundColor: filled ? ink : ink,
          opacity: filled ? 1 : 0.15,
          marginLeft: i > 0 ? 2 : 0,
        }}
      />
    )
  })

  const spinCountStr = String(spinsRemaining).padStart(2, '0')

  return (
    <div
      style={{
        width: 480,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        fontFamily: '"IBM Plex Mono", monospace',
        fontFeatureSettings: '"tnum"',
      }}
    >
      {/* SPIN button with double border */}
      <div
        onClick={canSpin ? onSpin : undefined}
        style={{
          position: 'relative',
          padding: '2px 12px',
          border: `1px solid ${buttonColor}`,
          outline: `1px solid ${buttonColor}`,
          outlineOffset: 2,
          fontSize: 10,
          fontWeight: 400,
          textTransform: 'uppercase',
          color: buttonColor,
          cursor: buttonCursor,
          fontFamily: '"IBM Plex Mono", monospace',
          fontFeatureSettings: '"tnum"',
          userSelect: 'none',
        }}
      >
        [ SPIN ]
      </div>

      {/* Spins remaining */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 7,
          fontWeight: 400,
          textTransform: 'uppercase',
          color: ink,
          fontFamily: '"IBM Plex Mono", monospace',
          fontFeatureSettings: '"tnum"',
        }}
      >
        <span>SPINS</span>
        <div style={{ display: 'flex', alignItems: 'center' }}>{pips}</div>
        <span>
          {spinCountStr}/{String(maxSpins).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}
