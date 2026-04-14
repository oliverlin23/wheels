import type { FC } from 'react'
import type { Panel, PanelSymbol } from '../../game/types'

type WheelRailProps = {
  results: [Panel, Panel, Panel, Panel, Panel] | null
  locked: [boolean, boolean, boolean, boolean, boolean]
  settled: boolean[]
  onLockWheel: (index: number) => void
}

const SYMBOL_LETTER: Record<PanelSymbol, string> = {
  square: 'SQ',
  diamond: 'DD',
  hammer: 'HM',
}

const SYMBOL_COLOR: Record<PanelSymbol, string> = {
  square: 'var(--color-square-gold)',
  diamond: 'var(--color-diamond-teal)',
  hammer: 'var(--color-hammer-steel)',
}

function formatPanel(panel: Panel): string {
  const letter = SYMBOL_LETTER[panel.symbol]
  const base = panel.count > 1 ? letter + panel.count.toString() : letter
  return panel.xp ? base + '+' : base
}

export const WheelRail: FC<WheelRailProps> = ({ results, locked, settled, onLockWheel }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        width: '100%',
        height: '100%',
        fontFamily: '"IBM Plex Mono", monospace',
        fontFeatureSettings: '"tnum"',
        fontSize: 7,
      }}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const panel = results ? results[i] : null
        const isLocked = locked[i]
        const isSettled = settled[i] ?? false
        const showResult = (isSettled && panel != null) || (isLocked && panel != null)

        if (!showResult) {
          return (
            <div
              key={i}
              style={{
                width: 48,
                height: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-ink-mid)',
                border: '1px solid var(--color-ink)',
                opacity: 0.3,
                backgroundColor: 'var(--color-paper)',
              }}
            >
              --
            </div>
          )
        }

        const label = isLocked ? 'LOCKED' : formatPanel(panel)
        const color = isLocked ? '#6D28D9' : (panel ? SYMBOL_COLOR[panel.symbol] : 'var(--color-ink)')
        const border = isLocked
          ? '2px solid #6D28D9'
          : '1px solid var(--color-ink)'
        const bg = isLocked
          ? 'rgba(109, 40, 217, 0.08)'
          : 'var(--color-paper)'

        return (
          <div
            key={i}
            onClick={() => onLockWheel(i)}
            style={{
              width: 48,
              height: 10,
              border,
              backgroundColor: bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
              cursor: 'pointer',
              userSelect: 'none',
              boxSizing: 'border-box',
            }}
          >
            {label}
          </div>
        )
      })}
    </div>
  )
}
