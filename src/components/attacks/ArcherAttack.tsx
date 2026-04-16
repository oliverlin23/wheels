import type { AttackProps } from './types'
import { crownY, bulwarkY, platformY, LEFT_PLATFORM_X, CROWN_X } from './types'

/**
 * Archer: stepped-dot parabola arrow.
 * Timing (total ~700ms):
 *  - Draw    200ms — brief ink tick at archer (bow-draw hint), no arrow yet
 *  - Travel  400ms — 12 grid-aligned 2x2 ink dots appear in sequence along
 *                    a parabolic path; each dot fades ~50ms after it appears
 *  - Impact  100ms — 4 small 2x2 "feather" pixels spray from impact, fading
 *
 * The parabola peaks above/below the midline (y=164) depending on attacker
 * side, so the arrow visibly arcs over the center line.
 */
export function ArcherAttack(props: AttackProps) {
  const { attackerSide, defenderSide, hitsBulwark } = props

  const startX = LEFT_PLATFORM_X
  const startY = platformY(attackerSide)
  const endX = CROWN_X
  const endY = hitsBulwark ? bulwarkY(defenderSide) : crownY(defenderSide)

  // Peak y: when attacker is on bottom, arc goes UP (lower y value = higher
  // on screen). When attacker is on top, arc goes DOWN (higher y value).
  const peakY = attackerSide === 'bottom' ? 60 : 260

  const DOT_COUNT = 12
  // Generate 12 points along a quadratic Bezier-like parabola.
  // Parameter t in [0,1]; x is linear, y is quadratic hitting peakY at t=0.5.
  const dots = Array.from({ length: DOT_COUNT }, (_, i) => {
    const t = i / (DOT_COUNT - 1)
    // Linear x
    const x = startX + (endX - startX) * t
    // Quadratic bezier: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
    // Use control point at midX with y chosen so curve passes through peakY at t=0.5.
    // At t=0.5: y = 0.25*startY + 0.5*ctrlY + 0.25*endY = peakY
    // => ctrlY = (peakY - 0.25*startY - 0.25*endY) / 0.5
    const ctrlY = (peakY - 0.25 * startY - 0.25 * endY) / 0.5
    const y =
      (1 - t) * (1 - t) * startY +
      2 * (1 - t) * t * ctrlY +
      t * t * endY
    // Snap to even pixel grid so dots align crisply.
    return { x: Math.round(x / 2) * 2, y: Math.round(y / 2) * 2, t }
  })

  // Feather fragments: 4 short trajectories spraying from impact.
  const feathers = [
    { dx: -6, dy: -4 },
    { dx: 6, dy: -4 },
    { dx: -4, dy: 5 },
    { dx: 5, dy: 5 },
  ]

  // Timing constants (ms)
  const DRAW_MS = 200
  const TRAVEL_MS = 400
  const PER_DOT_VISIBLE = 60 // how long each dot is fully visible before fading
  const PER_DOT_STAGGER = TRAVEL_MS / (DOT_COUNT - 1) // ~36ms between dots
  const IMPACT_DELAY = DRAW_MS + TRAVEL_MS // 600ms

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {/* Draw-tick: brief ink mark at archer, during "draw" phase */}
      <div
        style={{
          position: 'absolute',
          left: startX - 3,
          top: startY - 1,
          width: 6,
          height: 2,
          background: 'var(--color-ink)',
          animation: 'archer-draw 220ms steps(2, end) both',
          opacity: 0,
        }}
      />

      {/* 12 parabola dots */}
      {dots.map((d, i) => {
        const delay = DRAW_MS + i * PER_DOT_STAGGER
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: d.x - 1,
              top: d.y - 1,
              width: 2,
              height: 2,
              background: 'var(--color-ink)',
              animation: `archer-dot ${PER_DOT_VISIBLE + 60}ms steps(2, end) both`,
              animationDelay: `${delay}ms`,
              opacity: 0,
              imageRendering: 'pixelated',
            }}
          />
        )
      })}

      {/* Impact: 4 feather fragments spraying from impact point */}
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
        {/* Impact flash tick — small ink plus */}
        <g
          style={{
            animation: 'archer-impact-flash 160ms steps(2, end) both',
            animationDelay: `${IMPACT_DELAY}ms`,
            opacity: 0,
          }}
        >
          <rect
            x={endX - 3}
            y={endY - 1}
            width={6}
            height={2}
            fill="var(--color-ink)"
          />
          <rect
            x={endX - 1}
            y={endY - 3}
            width={2}
            height={6}
            fill="var(--color-ink)"
          />
        </g>

        {/* Feather fragments */}
        {feathers.map((_f, i) => (
          <rect
            key={i}
            x={endX - 1}
            y={endY - 1}
            width={2}
            height={2}
            fill="var(--color-ink)"
            style={{
              animation: `archer-feather-${i} 220ms steps(3, end) both`,
              animationDelay: `${IMPACT_DELAY + 20}ms`,
              opacity: 0,
            }}
          />
        ))}
      </svg>

      <style>{`
        @keyframes archer-draw {
          0%   { opacity: 0; }
          40%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes archer-dot {
          0%   { opacity: 0; }
          20%  { opacity: 1; }
          60%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes archer-impact-flash {
          0%   { opacity: 0; }
          30%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes archer-feather-0 {
          0%   { opacity: 0; transform: translate(0, 0); }
          30%  { opacity: 1; transform: translate(${feathers[0].dx / 2}px, ${feathers[0].dy / 2}px); }
          100% { opacity: 0; transform: translate(${feathers[0].dx}px, ${feathers[0].dy}px); }
        }
        @keyframes archer-feather-1 {
          0%   { opacity: 0; transform: translate(0, 0); }
          30%  { opacity: 1; transform: translate(${feathers[1].dx / 2}px, ${feathers[1].dy / 2}px); }
          100% { opacity: 0; transform: translate(${feathers[1].dx}px, ${feathers[1].dy}px); }
        }
        @keyframes archer-feather-2 {
          0%   { opacity: 0; transform: translate(0, 0); }
          30%  { opacity: 1; transform: translate(${feathers[2].dx / 2}px, ${feathers[2].dy / 2}px); }
          100% { opacity: 0; transform: translate(${feathers[2].dx}px, ${feathers[2].dy}px); }
        }
        @keyframes archer-feather-3 {
          0%   { opacity: 0; transform: translate(0, 0); }
          30%  { opacity: 1; transform: translate(${feathers[3].dx / 2}px, ${feathers[3].dy / 2}px); }
          100% { opacity: 0; transform: translate(${feathers[3].dx}px, ${feathers[3].dy}px); }
        }
      `}</style>
    </div>
  )
}
