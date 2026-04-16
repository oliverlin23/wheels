import type { FC } from 'react'
import type { Panel } from '../../game/types'
import { SYMBOL_LABEL, SYMBOL_COLOR } from '../../game/symbols'

type WheelStripProps = {
  results: [Panel, Panel, Panel, Panel, Panel] | null
  locked: [boolean, boolean, boolean, boolean, boolean]
  onLockWheel: (index: number) => void
}

function formatPanel(panel: Panel): string {
  const letter = SYMBOL_LABEL[panel.symbol]
  const base = panel.count > 1 ? letter.repeat(panel.count) : letter
  return panel.xp ? base + '+' : base
}

export const WheelStrip: FC<WheelStripProps> = ({ results, locked, onLockWheel }) => {
  const ink = 'var(--color-ink)'
  const inkMid = 'var(--color-ink-mid)'
  const violet = 'var(--color-midline-violet)'

  // 5 slots * 40px + 4 gaps * 8px = 232px; brackets add a bit
  const slotWidth = 40
  const slotHeight = 16
  const gap = 8
  const slotCount = 5
  const railWidth = slotCount * slotWidth + (slotCount - 1) * gap
  const totalWidth = railWidth + 16 // 8px bracket on each side
  const railLeft = 8

  return (
    <div
      style={{
        position: 'relative',
        width: totalWidth,
        height: slotHeight,
        margin: '0 auto',
        fontFamily: '"IBM Plex Mono", monospace',
        fontFeatureSettings: '"tnum"',
      }}
    >
      {/* Horizontal rail line */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: Math.floor(slotHeight / 2),
          width: totalWidth,
          height: 1,
          backgroundColor: ink,
        }}
      />

      {/* Left bracket */}
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 8,
          color: ink,
          lineHeight: 1,
        }}
      >
        ├
      </span>

      {/* Right bracket */}
      <span
        style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 8,
          color: ink,
          lineHeight: 1,
        }}
      >
        ┤
      </span>

      {/* Panel slots */}
      {Array.from({ length: slotCount }, (_, i) => {
        const panel = results ? results[i] : null
        const isLocked = locked[i]
        const x = railLeft + i * (slotWidth + gap)

        const border = isLocked
          ? `2px solid ${violet}`
          : `1px solid ${ink}`
        const bg = isLocked ? 'rgba(109, 40, 217, 0.08)' : 'var(--color-paper)'

        const label = panel ? formatPanel(panel) : '--'
        const color = panel ? SYMBOL_COLOR[panel.symbol] : inkMid
        const panelSrc = panel
          ? `/sprites/panel-${panel.symbol}${panel.xp ? '-xp' : ''}.png`
          : null

        return (
          <div
            key={i}
            onClick={() => onLockWheel(i)}
            style={{
              position: 'absolute',
              left: x,
              top: 0,
              width: slotWidth,
              height: slotHeight,
              border,
              backgroundColor: bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              fontSize: 7,
              fontWeight: 400,
              color,
              cursor: 'pointer',
              userSelect: 'none',
              boxSizing: 'border-box',
            }}
          >
            {panelSrc && (
              <img
                src={panelSrc}
                width={12}
                height={12}
                style={{ imageRendering: 'pixelated' as const }}
                alt=""
              />
            )}
            <span>{label}</span>
          </div>
        )
      })}
    </div>
  )
}
