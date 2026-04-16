import type { FC } from 'react'

type FooterProps = {
  spinsRemaining: number
  onSpin: () => void
  onConfirm: () => void
  canSpin: boolean
  canConfirm: boolean
  confirmed: boolean
}

export const Footer: FC<FooterProps> = ({ spinsRemaining, onSpin, onConfirm, canSpin, canConfirm, confirmed }) => {
  const ink = 'var(--color-ink)'
  const inkMid = 'var(--color-ink-mid)'
  const maxSpins = 3

  const spinActive = canSpin
  const confirmActive = canConfirm && !confirmed

  const pips = Array.from({ length: maxSpins }, (_, i) => {
    const filled = i < spinsRemaining
    return (
      <div
        key={i}
        style={{
          width: 10,
          height: 5,
          backgroundColor: filled ? ink : ink,
          opacity: filled ? 1 : 0.12,
        }}
      />
    )
  })

  return (
    <div
      style={{
        width: 520,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
      }}
    >
      {/* SPIN button */}
      <div
        onClick={spinActive ? onSpin : undefined}
        style={{
          padding: '3px 20px',
          border: `1px solid ${spinActive ? ink : inkMid}`,
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 11,
          fontWeight: 400,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: spinActive ? ink : inkMid,
          cursor: spinActive ? 'pointer' : 'default',
          userSelect: 'none',
          transition: 'background-color 80ms',
          backgroundColor: 'transparent',
        }}
        onMouseEnter={(e) => {
          if (spinActive) (e.target as HTMLElement).style.backgroundColor = 'var(--color-paper-dim)'
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLElement).style.backgroundColor = 'transparent'
        }}
      >
        [ SPIN ]
      </div>

      {/* Spins remaining — compact readout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <span style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 7,
          color: inkMid,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontFeatureSettings: '"tnum"',
        }}>
          SPINS
        </span>
        <div style={{ display: 'flex', gap: 2 }}>{pips}</div>
        <span style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 7,
          fontFeatureSettings: '"tnum"',
          color: ink,
        }}>
          {String(spinsRemaining).padStart(2, '0')}/{String(maxSpins).padStart(2, '0')}
        </span>
      </div>

      {/* CONFIRM button */}
      <div
        onClick={confirmActive ? onConfirm : undefined}
        style={{
          padding: '3px 16px',
          border: `1px solid ${confirmed ? 'var(--color-midline-violet)' : confirmActive ? ink : inkMid}`,
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 11,
          fontWeight: 400,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: confirmed ? 'var(--color-midline-violet)' : confirmActive ? ink : inkMid,
          cursor: confirmActive ? 'pointer' : 'default',
          userSelect: 'none',
          backgroundColor: confirmed ? 'rgba(109, 40, 217, 0.06)' : 'transparent',
          transition: 'background-color 80ms',
        }}
        onMouseEnter={(e) => {
          if (confirmActive) (e.target as HTMLElement).style.backgroundColor = 'var(--color-paper-dim)'
        }}
        onMouseLeave={(e) => {
          if (!confirmed) (e.target as HTMLElement).style.backgroundColor = 'transparent'
        }}
      >
        {confirmed ? '[ READY ]' : '[ CONFIRM ]'}
      </div>
    </div>
  )
}
