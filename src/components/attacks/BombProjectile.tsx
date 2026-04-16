import type { AttackProps } from './types'
import { crownY, platformY, LEFT_PLATFORM_X, CROWN_X } from './types'

/**
 * Bomb: high-arc projectile that ALWAYS bypasses the bulwark.
 * Total ~900ms, split into three phases:
 *   1. Spawn  (  0 - 200ms): pulsing violet diamond glyph hovers above the
 *      attacker platform.
 *   2. Arc    (200 - 700ms): an 8x8 violet-magenta sprite launches on a HIGH
 *      grid-stepped parabola that peaks well above the opponent zone plate,
 *      trailing 4 stepped magenta dots.
 *   3. Impact (700 - 900ms): hit-stop feel — full-screen magenta flash overlay
 *      (subtle alpha), a 2px jolt, a pulsing ring at the crown, and a floating
 *      `-2` label in violet-magenta.
 *
 * Every animation is CSS-only and uses `steps(...)` easing to enforce a chunky,
 * grid-aligned pixel-art feel (no smooth interpolation).
 */
export function BombProjectile(props: AttackProps) {
  const { attackerSide, defenderSide } = props
  // Ignore hitsBulwark entirely — bomb always bypasses.

  const startX = LEFT_PLATFORM_X
  const startY = platformY(attackerSide)
  const endX = CROWN_X
  const endY = crownY(defenderSide)

  // High peak — well above the opponent zone plate.
  const isAttackerBottom = attackerSide === 'bottom'
  const peakY = isAttackerBottom ? 40 : 320

  // Parabola y(t) = a*t^2 + b*t + startY, through (0.5, peakY) and (1, endY)
  const b = 4 * (peakY - startY) - (endY - startY)
  const a = endY - startY - b
  const xAt = (t: number) => startX + (endX - startX) * t
  const yAt = (t: number) => a * t * t + b * t + startY

  // Spawn glyph hovers slightly above attacker platform.
  const spawnX = startX
  const spawnY = isAttackerBottom ? startY - 18 : startY + 18

  // Keyframe stops (7 samples → very chunky stepped arc).
  const stops = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1]
  const xFrames = stops
    .map((t) => `${(t * 100).toFixed(0)}% { left: ${xAt(t).toFixed(2)}px; }`)
    .join('\n')
  const yFrames = stops
    .map((t) => `${(t * 100).toFixed(0)}% { top: ${yAt(t).toFixed(2)}px; }`)
    .join('\n')

  const PHASE_SPAWN_MS = 200
  const PHASE_ARC_MS = 500
  const PHASE_IMPACT_MS = 200
  const ARC_START_MS = PHASE_SPAWN_MS
  const IMPACT_START_MS = PHASE_SPAWN_MS + PHASE_ARC_MS

  // Pixel-art box style — crisp edges, no blur.
  const pixelStyle: React.CSSProperties = {
    imageRendering: 'pixelated',
    boxSizing: 'border-box',
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {/* ============================================================
          PHASE 1 — Spawn glyph: violet diamond above attacker.
          ============================================================ */}
      <div
        style={{
          position: 'absolute',
          left: spawnX,
          top: spawnY,
          transform: 'translate(-50%, -50%)',
          color: 'var(--color-midline-violet)',
          fontFamily: 'monospace',
          fontSize: 18,
          fontWeight: 700,
          lineHeight: 1,
          textShadow: '0 0 0 var(--color-ink)',
          animation: `bomb-spawn-pulse ${PHASE_SPAWN_MS}ms steps(4, end) both`,
          animationFillMode: 'both',
          opacity: 0,
          ...pixelStyle,
        }}
      >
        ◆
      </div>

      {/* ============================================================
          PHASE 2 — Arc: 4 trailing dots + core 8x8 sprite.
          ============================================================ */}
      {/* Four trailing dots — spawn at staggered delays during the arc.
          Each is a 3x3 magenta pixel that pops at a fixed arc sample point,
          held for a short window, then fades. This "stamps" a trail rather
          than interpolating. */}
      {[0.2, 0.4, 0.6, 0.8].map((t, i) => (
        <div
          key={`bomb-trail-${i}`}
          style={{
            position: 'absolute',
            left: xAt(t),
            top: yAt(t),
            width: 3,
            height: 3,
            backgroundColor: 'var(--color-bypass-magenta)',
            transform: 'translate(-50%, -50%)',
            opacity: 0,
            animation: `bomb-trail-stamp 380ms steps(3, end) both`,
            animationDelay: `${ARC_START_MS + t * PHASE_ARC_MS - 40}ms`,
            ...pixelStyle,
          }}
        />
      ))}

      {/* Core 8x8 sprite — violet-magenta, stepped arc. */}
      <div
        style={{
          position: 'absolute',
          width: 8,
          height: 8,
          backgroundColor: 'var(--color-bypass-magenta)',
          border: '1px solid var(--color-midline-violet)',
          transform: 'translate(-50%, -50%)',
          animation: `
            bomb-arc-x ${PHASE_ARC_MS}ms steps(8, end) both,
            bomb-arc-y ${PHASE_ARC_MS}ms steps(8, end) both,
            bomb-arc-fade ${PHASE_ARC_MS}ms steps(6, end) both,
            bomb-arc-spin ${PHASE_ARC_MS}ms steps(4, end) both
          `,
          animationDelay: `${ARC_START_MS}ms, ${ARC_START_MS}ms, ${ARC_START_MS}ms, ${ARC_START_MS}ms`,
          opacity: 0,
          ...pixelStyle,
        }}
      />

      {/* ============================================================
          PHASE 3 — Impact: screen flash, ring pulse, -2 popup.
          ============================================================ */}
      {/* Screen-wide magenta flash overlay (subtle alpha — pixel-art hit-stop). */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'var(--color-bypass-magenta)',
          mixBlendMode: 'multiply',
          opacity: 0,
          animation: `bomb-screen-flash ${PHASE_IMPACT_MS}ms steps(3, end) both`,
          animationDelay: `${IMPACT_START_MS}ms`,
        }}
      />

      {/* 2px shake "feel": a full-screen div that jitters slightly to sell impact. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          animation: `bomb-shake 160ms steps(4, end) both`,
          animationDelay: `${IMPACT_START_MS}ms`,
        }}
      >
        {/* Ring pulse at the impact point — concentric rings in violet/magenta. */}
        <div
          style={{
            position: 'absolute',
            left: endX,
            top: endY,
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: 'var(--color-bypass-magenta)',
            transform: 'translate(-50%, -50%) scale(0.3)',
            opacity: 0,
            animation: `bomb-impact-core ${PHASE_IMPACT_MS}ms steps(4, end) both`,
            animationDelay: `${IMPACT_START_MS}ms`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: endX,
            top: endY,
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: '2px solid var(--color-midline-violet)',
            transform: 'translate(-50%, -50%) scale(0.4)',
            opacity: 0,
            animation: `bomb-impact-ring ${PHASE_IMPACT_MS + 80}ms steps(5, end) both`,
            animationDelay: `${IMPACT_START_MS}ms`,
          }}
        />

        {/* Damage label "-2" that pops up from the impact. */}
        <div
          style={{
            position: 'absolute',
            left: endX,
            top: endY,
            transform: 'translate(-50%, -100%)',
            color: 'var(--color-bypass-magenta)',
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: 800,
            lineHeight: 1,
            textShadow:
              '1px 0 0 var(--color-ink), -1px 0 0 var(--color-ink), 0 1px 0 var(--color-ink), 0 -1px 0 var(--color-ink)',
            opacity: 0,
            animation: `bomb-damage-pop ${PHASE_IMPACT_MS + 120}ms steps(5, end) both`,
            animationDelay: `${IMPACT_START_MS}ms`,
            ...pixelStyle,
          }}
        >
          -2
        </div>
      </div>

      <style>{`
        @keyframes bomb-spawn-pulse {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
          30%  { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          60%  { opacity: 1; transform: translate(-50%, -50%) scale(0.95); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(1.3); }
        }

        @keyframes bomb-arc-x {
          ${xFrames}
        }
        @keyframes bomb-arc-y {
          ${yFrames}
        }
        @keyframes bomb-arc-fade {
          0%   { opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes bomb-arc-spin {
          0%   { transform: translate(-50%, -50%) rotate(0deg); }
          25%  { transform: translate(-50%, -50%) rotate(90deg); }
          50%  { transform: translate(-50%, -50%) rotate(180deg); }
          75%  { transform: translate(-50%, -50%) rotate(270deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes bomb-trail-stamp {
          0%   { opacity: 0; }
          20%  { opacity: 0.9; }
          55%  { opacity: 0.6; }
          100% { opacity: 0; }
        }

        @keyframes bomb-screen-flash {
          0%   { opacity: 0; }
          25%  { opacity: 0.35; }
          55%  { opacity: 0.18; }
          100% { opacity: 0; }
        }
        @keyframes bomb-shake {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(2px, -1px); }
          50%  { transform: translate(-2px, 1px); }
          75%  { transform: translate(1px, 2px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes bomb-impact-core {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.3); }
          25%  { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
          60%  { opacity: 0.7; transform: translate(-50%, -50%) scale(1.6); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2.2); }
        }
        @keyframes bomb-impact-ring {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.4); }
          20%  { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          60%  { opacity: 0.6; transform: translate(-50%, -50%) scale(1.7); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2.4); }
        }
        @keyframes bomb-damage-pop {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
          20%  { opacity: 1; transform: translate(-50%, -110%) scale(1.2); }
          60%  { opacity: 1; transform: translate(-50%, -160%) scale(1.0); }
          100% { opacity: 0; transform: translate(-50%, -200%) scale(1.0); }
        }
      `}</style>
    </div>
  )
}
