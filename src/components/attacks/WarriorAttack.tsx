import type { AttackProps } from './types'
import { crownY, bulwarkY, platformY, LEFT_PLATFORM_X, CROWN_X } from './types'

/**
 * Warrior: melee arc.
 * Timing (total ~300ms):
 *  - Anticipation 120ms  — subtle ink "wind-up" line fades in at attacker
 *  - Travel       ~1f    — instant 2px ink streak to target
 *  - Impact       100ms  — 3-4 short ink slash lines fan out, flashing
 *  - Recovery      80ms  — everything fades
 *
 * The streak is a single stroked SVG line; the impact is rendered with
 * short radial slash lines (stepped, not smooth) so the hit feels crunchy.
 */
export function WarriorAttack(props: AttackProps) {
  const { attackerSide, defenderSide, hitsBulwark } = props
  const startX = LEFT_PLATFORM_X
  const startY = platformY(attackerSide)
  const endX = CROWN_X
  const endY = hitsBulwark ? bulwarkY(defenderSide) : crownY(defenderSide)

  // Slash fan: 4 short lines radiating from impact at stepped angles.
  const slashLen = 10
  const slashAngles = [-55, -20, 20, 55] // degrees from horizontal
  const slashes = slashAngles.map((deg) => {
    const r = (deg * Math.PI) / 180
    return {
      x1: endX - Math.cos(r) * 2,
      y1: endY - Math.sin(r) * 2,
      x2: endX + Math.cos(r) * slashLen,
      y2: endY + Math.sin(r) * slashLen,
    }
  })

  // Wind-up tick: a tiny 6px vertical ink mark at the attacker platform that
  // fades in during anticipation, then vanishes when the streak fires.
  const windupX = startX
  const windupY = startY

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      <svg
        width={520}
        height={360}
        viewBox="0 0 520 360"
        style={{
          position: 'absolute',
          inset: 0,
          shapeRendering: 'crispEdges',
        }}
      >
        {/* Anticipation wind-up tick at attacker */}
        <line
          x1={windupX - 3}
          y1={windupY}
          x2={windupX + 3}
          y2={windupY}
          stroke="var(--color-ink)"
          strokeWidth={2}
          strokeLinecap="square"
          style={{
            animation: 'warrior-windup 300ms steps(3, end) both',
            opacity: 0,
          }}
        />

        {/* Travel streak — draws in fast, then lingers 1 frame, then fades */}
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="var(--color-ink)"
          strokeWidth={2}
          strokeLinecap="square"
          style={{
            animation: 'warrior-streak 300ms steps(4, end) both',
            animationDelay: '120ms',
            opacity: 0,
          }}
        />

        {/* Impact flash — white/magenta burst behind the slash */}
        <circle
          cx={endX}
          cy={endY}
          r={4}
          fill="var(--color-bypass-magenta)"
          style={{
            animation: 'warrior-flash 180ms steps(3, end) both',
            animationDelay: '140ms',
            opacity: 0,
          }}
        />

        {/* Slash fan — 4 radiating short ink lines */}
        <g
          style={{
            animation: 'warrior-slash 180ms steps(3, end) both',
            animationDelay: '150ms',
            opacity: 0,
          }}
        >
          {slashes.map((s, i) => (
            <line
              key={i}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke="var(--color-ink)"
              strokeWidth={2}
              strokeLinecap="square"
            />
          ))}
        </g>

        {/* A single thicker core slash — horizontal bar across impact */}
        <line
          x1={endX - 8}
          y1={endY}
          x2={endX + 8}
          y2={endY}
          stroke="var(--color-red-ink)"
          strokeWidth={2}
          strokeLinecap="square"
          style={{
            animation: 'warrior-coreslash 200ms steps(3, end) both',
            animationDelay: '150ms',
            opacity: 0,
          }}
        />
      </svg>

      <style>{`
        @keyframes warrior-windup {
          0%   { opacity: 0; }
          40%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes warrior-streak {
          0%   { opacity: 0; }
          20%  { opacity: 1; }
          75%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes warrior-flash {
          0%   { opacity: 0; }
          30%  { opacity: 0.85; }
          100% { opacity: 0; }
        }
        @keyframes warrior-slash {
          0%   { opacity: 0; }
          25%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes warrior-coreslash {
          0%   { opacity: 0; }
          25%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
