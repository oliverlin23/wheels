import type { FC } from 'react'

type MidlineRulesProps = {
  roundPhase: 'spinning' | 'reveal' | 'resolving' | 'done'
}

export const MidlineRules: FC<MidlineRulesProps> = ({ roundPhase }) => {
  const violet = 'var(--color-midline-violet)'
  const paper = 'var(--color-paper)'

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
        width: 520,
        height: 8,
      }}
    >
      {/* Single violet rule */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 4,
        width: 520,
        height: 1,
        backgroundColor: violet,
      }} />

      {/* Phase label — centered, punches through rule */}
      <div
        style={{
          position: 'absolute',
          top: -1,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 7,
          fontWeight: 400,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: violet,
          backgroundColor: paper,
          padding: '0 8px',
          whiteSpace: 'nowrap',
          lineHeight: '10px',
        }}
      >
        {phaseLabel}
      </div>
    </div>
  )
}
