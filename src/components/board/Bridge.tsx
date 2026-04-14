import type { FC } from 'react'

export const Bridge: FC = () => {
  const ink = 'var(--color-ink)'
  const paperDim = 'var(--color-paper-dim)'
  const violet = 'var(--color-midline-violet)'

  return (
    <div
      style={{
        position: 'absolute',
        left: (480 - 48) / 2,
        width: 48,
        height: 24,
      }}
    >
      {/* Violet rule running horizontally through the bridge */}
      <div
        style={{
          position: 'absolute',
          left: -((480 - 48) / 2),
          top: 16,
          width: 480,
          height: 1,
          backgroundColor: violet,
        }}
      />

      {/* Arch SVG */}
      <svg
        width={48}
        height={24}
        viewBox="0 0 48 24"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {/* Arch: rectangle base with semicircle top */}
        <path
          d="M8,24 L8,12 Q8,0 24,0 Q40,0 40,12 L40,24"
          fill={paperDim}
          stroke={ink}
          strokeWidth={1}
        />
        {/* Base line */}
        <line x1={8} y1={24} x2={40} y2={24} stroke={ink} strokeWidth={1} />
      </svg>
    </div>
  )
}
