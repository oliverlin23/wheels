import type { FC } from 'react'

type MidlineRulesProps = {
  currentPlayer: 0 | 1
  turn: number
}

export const MidlineRules: FC<MidlineRulesProps> = ({ currentPlayer }) => {
  const violet = 'var(--color-midline-violet)'
  const paper = 'var(--color-paper)'
  const blueInk = 'var(--color-blue-ink)'
  const redInk = 'var(--color-red-ink)'

  const ruleStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    width: 480,
    height: 1,
    backgroundColor: violet,
  }

  const turnLabel =
    currentPlayer === 0 ? '◀ PLAYER 01' : 'OPPONENT 02 ▶'
  const turnColor = currentPlayer === 0 ? blueInk : redInk

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        width: 480,
        height: 12,
      }}
    >
      {/* Upper rule */}
      <div style={{ ...ruleStyle, top: 0 }} />

      {/* Centered label on the upper rule */}
      <div
        style={{
          position: 'absolute',
          top: -5,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 7,
          fontWeight: 400,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: violet,
          backgroundColor: paper,
          padding: '0 4px',
          whiteSpace: 'nowrap',
          fontFeatureSettings: '"tnum"',
        }}
      >
        [ NEUTRAL STAGE ]
      </div>

      {/* Lower rule */}
      <div style={{ ...ruleStyle, top: 12 }} />

      {/* Turn indicator */}
      <div
        style={{
          position: 'absolute',
          top: currentPlayer === 0 ? 12 - 5 : -5,
          right: 8,
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 7,
          fontWeight: 400,
          textTransform: 'uppercase',
          color: turnColor,
          backgroundColor: paper,
          padding: '0 4px',
          whiteSpace: 'nowrap',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {turnLabel}
      </div>
    </div>
  )
}
