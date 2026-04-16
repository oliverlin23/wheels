import type { AttackProps } from './types'
import { crownY, bulwarkY, platformY, LEFT_PLATFORM_X, CROWN_X } from './types'

/**
 * Assassin: dash strike.
 *
 * Timing (total ~630ms):
 *  - Dash     0-200ms  — ink streak crosses the midline to defender crown.
 *                        BYPASSES bulwark regardless of hitsBulwark.
 *  - Strike   200-280ms — crown flashes magenta, small pulse ring
 *  - Strip    200-500ms (concurrent) — tiny brick icon at the defender's
 *                        bulwark position shatters into 4 falling pixel shards
 *  - Delay    200-350ms (concurrent) — "-1 ENERGY" red text rises near
 *                        opponent platform
 *  - Return   ~480-630ms — streak reverses briefly back toward attacker
 */
export function AssassinAttack(props: AttackProps) {
  const { attackerSide, defenderSide } = props

  // Always hit the crown — assassin bypasses bulwark.
  const startX = LEFT_PLATFORM_X
  const startY = platformY(attackerSide)
  const endX = CROWN_X
  const endY = crownY(defenderSide)

  const bulwarkPosY = bulwarkY(defenderSide)

  // Bulwark shards: 4 small 2x2 pixels that fly from the bulwark icon outward
  // and then fall (+y) over ~300ms.
  const shards = [
    { dx: -5, dy: 4 },
    { dx: -2, dy: 5 },
    { dx: 2, dy: 5 },
    { dx: 5, dy: 4 },
  ]

  // "-1 ENERGY" label near opponent platform (left side — where the dash ends).
  const labelX = endX + 16
  const labelY = platformY(defenderSide) - 10

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
        {/* Dash streak — a 6px-wide ink line draws in with stroke-dasharray */}
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="var(--color-ink)"
          strokeWidth={6}
          strokeLinecap="square"
          style={{
            animation: 'assassin-dash 200ms steps(4, end) both',
            opacity: 0,
          }}
        />

        {/* Return streak — thinner, plays back near the end */}
        <line
          x1={endX}
          y1={endY}
          x2={startX}
          y2={startY}
          stroke="var(--color-ink)"
          strokeWidth={3}
          strokeLinecap="square"
          style={{
            animation: 'assassin-return 150ms steps(3, end) both',
            animationDelay: '480ms',
            opacity: 0,
          }}
        />

        {/* Strike flash — crown glows magenta */}
        <circle
          cx={endX}
          cy={endY}
          r={6}
          fill="var(--color-bypass-magenta)"
          style={{
            animation: 'assassin-strike 140ms steps(2, end) both',
            animationDelay: '200ms',
            opacity: 0,
          }}
        />

        {/* Pulse ring expanding outward from the crown */}
        <circle
          cx={endX}
          cy={endY}
          r={4}
          fill="none"
          stroke="var(--color-bypass-magenta)"
          strokeWidth={2}
          style={{
            animation: 'assassin-pulse 220ms steps(4, end) both',
            animationDelay: '200ms',
            opacity: 0,
            transformOrigin: `${endX}px ${endY}px`,
          }}
        />

        {/* Bulwark brick icon that shatters */}
        <rect
          x={endX - 4}
          y={bulwarkPosY - 2}
          width={8}
          height={4}
          fill="var(--color-shield-steel)"
          stroke="var(--color-ink)"
          strokeWidth={1}
          style={{
            animation: 'assassin-brick 200ms steps(2, end) both',
            animationDelay: '200ms',
            opacity: 0,
          }}
        />

        {/* 4 shard fragments */}
        {shards.map((_s, i) => (
          <rect
            key={i}
            x={endX - 1}
            y={bulwarkPosY - 1}
            width={2}
            height={2}
            fill="var(--color-shield-steel)"
            style={{
              animation: `assassin-shard-${i} 300ms steps(4, end) both`,
              animationDelay: '240ms',
              opacity: 0,
            }}
          />
        ))}
      </svg>

      {/* "-1 ENERGY" floating text */}
      <div
        style={{
          position: 'absolute',
          left: labelX,
          top: labelY,
          color: 'var(--color-red-ink)',
          fontFamily: 'monospace',
          fontSize: 9,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          textShadow: '1px 1px 0 var(--color-paper)',
          animation: 'assassin-energy-label 450ms steps(6, end) both',
          animationDelay: '200ms',
          opacity: 0,
        }}
      >
        -1 ENERGY
      </div>

      <style>{`
        @keyframes assassin-dash {
          0%   { opacity: 0; }
          25%  { opacity: 1; }
          75%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes assassin-return {
          0%   { opacity: 0; }
          30%  { opacity: 0.7; }
          100% { opacity: 0; }
        }
        @keyframes assassin-strike {
          0%   { opacity: 0; }
          40%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes assassin-pulse {
          0%   { opacity: 0.9; transform: scale(0.5); }
          50%  { opacity: 0.5; transform: scale(1.4); }
          100% { opacity: 0;   transform: scale(2.2); }
        }
        @keyframes assassin-brick {
          0%   { opacity: 1; }
          60%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes assassin-shard-0 {
          0%   { opacity: 0; transform: translate(0, 0); }
          15%  { opacity: 1; transform: translate(${shards[0].dx / 2}px, ${shards[0].dy / 4}px); }
          70%  { opacity: 1; transform: translate(${shards[0].dx}px, ${shards[0].dy}px); }
          100% { opacity: 0; transform: translate(${shards[0].dx}px, ${shards[0].dy + 2}px); }
        }
        @keyframes assassin-shard-1 {
          0%   { opacity: 0; transform: translate(0, 0); }
          15%  { opacity: 1; transform: translate(${shards[1].dx / 2}px, ${shards[1].dy / 4}px); }
          70%  { opacity: 1; transform: translate(${shards[1].dx}px, ${shards[1].dy}px); }
          100% { opacity: 0; transform: translate(${shards[1].dx}px, ${shards[1].dy + 2}px); }
        }
        @keyframes assassin-shard-2 {
          0%   { opacity: 0; transform: translate(0, 0); }
          15%  { opacity: 1; transform: translate(${shards[2].dx / 2}px, ${shards[2].dy / 4}px); }
          70%  { opacity: 1; transform: translate(${shards[2].dx}px, ${shards[2].dy}px); }
          100% { opacity: 0; transform: translate(${shards[2].dx}px, ${shards[2].dy + 2}px); }
        }
        @keyframes assassin-shard-3 {
          0%   { opacity: 0; transform: translate(0, 0); }
          15%  { opacity: 1; transform: translate(${shards[3].dx / 2}px, ${shards[3].dy / 4}px); }
          70%  { opacity: 1; transform: translate(${shards[3].dx}px, ${shards[3].dy}px); }
          100% { opacity: 0; transform: translate(${shards[3].dx}px, ${shards[3].dy + 2}px); }
        }
        @keyframes assassin-energy-label {
          0%   { opacity: 0; transform: translateY(2px); }
          25%  { opacity: 1; transform: translateY(0); }
          70%  { opacity: 1; transform: translateY(-6px); }
          100% { opacity: 0; transform: translateY(-12px); }
        }
      `}</style>
    </div>
  )
}
