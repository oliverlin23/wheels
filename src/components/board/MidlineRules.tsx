import type { FC } from 'react'

type MidlineRulesProps = {
  round: number
  roundPhase: 'spinning' | 'reveal' | 'resolving' | 'done'
}

export const MidlineRules: FC<MidlineRulesProps> = ({ roundPhase }) => {
  const violet = 'var(--color-midline-violet)'
  const paper = 'var(--color-paper)'

  const ruleStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    width: 480,
    height: 1,
    backgroundColor: violet,
  }

  const phaseLabel =
    roundPhase === 'spinning' ? 'SPINNING'
    : roundPhase === 'reveal' ? 'REVEAL'
    : roundPhase === 'resolving' ? 'RESOLVING'
    : 'DONE'

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

      {/* Phase indicator */}
      <div
        style={{
          position: 'absolute',
          top: -5,
          right: 8,
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 7,
          fontWeight: 400,
          textTransform: 'uppercase',
          color: violet,
          backgroundColor: paper,
          padding: '0 4px',
          whiteSpace: 'nowrap',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {phaseLabel}
      </div>
    </div>
  )
}
