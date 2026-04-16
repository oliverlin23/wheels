import type { AttackProps } from './types'
import { crownY, platformY, LEFT_PLATFORM_X, RIGHT_PLATFORM_X, CROWN_X } from './types'

/**
 * Priest: heal own crown + charge partner hero.
 *
 * This is NOT an attack — defender-side props are ignored. Everything happens
 * on the attacker's own side.
 *
 * Timing (total ~500ms, concurrent beats):
 *  - Raise staff  0-200ms  — tiny gold sparkle at priest platform
 *  - Heal stream  0-300ms  — 8 gold 2x2 dots spawn in sequence between priest
 *                            and OWN crown (cascading animation-delay)
 *  - Energy spark 0-300ms (concurrent) — single 4x4 gold sparkle arcs from
 *                            priest to partner platform (right slot, same side)
 *  - Absorb flash 300-360ms — 1-frame flash on partner platform
 */
export function PriestAttack(props: AttackProps) {
  const { attackerSide } = props

  // Priest sits at the left platform on attacker side (by spec).
  const priestX = LEFT_PLATFORM_X
  const priestY = platformY(attackerSide)

  // Own crown — priest heals own side, not the opponent.
  const crownCenterX = CROWN_X
  const crownCenterY = crownY(attackerSide)

  // Partner (other hero on same side) sits at right platform.
  const partnerX = RIGHT_PLATFORM_X
  const partnerY = platformY(attackerSide)

  // Heal dot stream: 8 gold dots stepping from priest to own crown.
  const DOT_COUNT = 8
  const healDots = Array.from({ length: DOT_COUNT }, (_, i) => {
    const t = i / (DOT_COUNT - 1)
    const x = priestX + (crownCenterX - priestX) * t
    const y = priestY + (crownCenterY - priestY) * t
    return { x: Math.round(x / 2) * 2, y: Math.round(y / 2) * 2 }
  })

  // Each dot lights ~40ms after the previous (8 dots * 40ms = 280ms total spawn).
  const DOT_STAGGER = 40
  const DOT_VISIBLE = 180

  // Energy spark: single 4x4 piece that arcs across the attacker side.
  // Arc peak bends AWAY from the midline (toward the outer edge of the row).
  const sparkPeakY = attackerSide === 'bottom' ? priestY + 24 : priestY - 24

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {/* Staff-raise sparkle: tiny cross of pixels at priest, flashing in. */}
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
        <g
          style={{
            animation: 'priest-staff 200ms steps(3, end) both',
            opacity: 0,
          }}
        >
          <rect x={priestX - 1} y={priestY - 5} width={2} height={2} fill="var(--color-sun-gold)" />
          <rect x={priestX - 1} y={priestY + 3} width={2} height={2} fill="var(--color-sun-gold)" />
          <rect x={priestX - 5} y={priestY - 1} width={2} height={2} fill="var(--color-sun-gold)" />
          <rect x={priestX + 3} y={priestY - 1} width={2} height={2} fill="var(--color-sun-gold)" />
          <rect x={priestX - 1} y={priestY - 1} width={2} height={2} fill="var(--color-paper)" />
        </g>

        {/* Absorb flash on partner platform — 1-frame cross burst */}
        <g
          style={{
            animation: 'priest-absorb 120ms steps(2, end) both',
            animationDelay: '300ms',
            opacity: 0,
          }}
        >
          <rect
            x={partnerX - 5}
            y={partnerY - 1}
            width={10}
            height={2}
            fill="var(--color-sun-gold)"
          />
          <rect
            x={partnerX - 1}
            y={partnerY - 5}
            width={2}
            height={10}
            fill="var(--color-sun-gold)"
          />
          <rect
            x={partnerX - 1}
            y={partnerY - 1}
            width={2}
            height={2}
            fill="var(--color-paper)"
          />
        </g>
      </svg>

      {/* Heal stream: 8 2x2 gold dots, cascading animation-delay */}
      {healDots.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: d.x - 1,
            top: d.y - 1,
            width: 2,
            height: 2,
            background: 'var(--color-sun-gold)',
            imageRendering: 'pixelated',
            animation: `priest-heal-dot ${DOT_VISIBLE}ms steps(3, end) both`,
            animationDelay: `${i * DOT_STAGGER}ms`,
            opacity: 0,
          }}
        />
      ))}

      {/* Energy spark: 4x4 gold pixel arcing priest -> partner */}
      <div
        style={{
          position: 'absolute',
          left: priestX - 2,
          top: priestY - 2,
          width: 4,
          height: 4,
          background: 'var(--color-sun-gold)',
          imageRendering: 'pixelated',
          boxShadow: '0 0 0 1px var(--color-paper)',
          animation: 'priest-spark 300ms steps(8, end) both',
          opacity: 0,
        }}
      />

      <style>{`
        @keyframes priest-staff {
          0%   { opacity: 0; }
          40%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes priest-heal-dot {
          0%   { opacity: 0; }
          20%  { opacity: 1; }
          70%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes priest-spark {
          0%   { opacity: 0; transform: translate(0, 0); }
          10%  { opacity: 1; transform: translate(0, 0); }
          50%  { opacity: 1; transform: translate(${(partnerX - priestX) / 2}px, ${sparkPeakY - priestY}px); }
          95%  { opacity: 1; transform: translate(${partnerX - priestX}px, ${partnerY - priestY}px); }
          100% { opacity: 0; transform: translate(${partnerX - priestX}px, ${partnerY - priestY}px); }
        }
        @keyframes priest-absorb {
          0%   { opacity: 0; }
          40%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
