import type { FC } from 'react'

type HeaderProps = {
  turn: number
}

export const Header: FC<HeaderProps> = ({ turn }) => {
  const ink = 'var(--color-ink)'
  const inkMid = 'var(--color-ink-mid)'
  const turnStr = String(turn).padStart(2, '0')

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 480,
        height: 16,
        borderBottom: `1px solid ${ink}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 8,
        fontWeight: 400,
        textTransform: 'uppercase',
        fontFeatureSettings: '"tnum"',
      }}
    >
      <span style={{ color: ink }}>TURN {turnStr}</span>
      <span style={{ color: ink }}>WHEELS</span>
      <span style={{ color: inkMid, cursor: 'pointer' }}>?</span>
    </div>
  )
}
