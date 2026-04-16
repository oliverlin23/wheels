import type { AttackProps } from './types'
import { crownY, bulwarkY, platformY, LEFT_PLATFORM_X, CROWN_X } from './types'

/**
 * Engineer: wrench throw + self-bulwark build.
 *
 * Timing (total ~500ms, concurrent beats):
 *  - Throw   0-300ms  — 6x6 steel wrench arcs forward, rotating 1x per 100ms
 *  - Impact  300-420ms — wrench hit flash at target
 *  - Build   0-300ms   — 10x6 steel brick slides up 8px on attacker side
 *                        with a "+2" floating label fading in/out
 *
 * If `hitsBulwark` is true the wrench stops at bulwarkY on the defender side;
 * otherwise it travels to the defender's crown.
 */
export function EngineerAttack(props: AttackProps) {
  const { attackerSide, defenderSide, hitsBulwark } = props

  // Wrench trajectory (attacker platform -> target).
  const startX = LEFT_PLATFORM_X
  const startY = platformY(attackerSide)
  const endX = CROWN_X
  const endY = hitsBulwark ? bulwarkY(defenderSide) : crownY(defenderSide)

  // Build effect on attacker's own crown area.
  const buildX = CROWN_X
  const buildBaseY =
    attackerSide === 'bottom'
      ? platformY('bottom') - 18 // rises above platform on bottom
      : platformY('top') + 18 // appears below platform on top

  // Parabola peak for the wrench — arcs up if attacker is bottom, down if top.
  const peakY = attackerSide === 'bottom' ? startY - 70 : startY + 70

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {/* Wrench projectile — outer div handles arc translation, inner div rotates */}
      <div
        style={{
          position: 'absolute',
          left: startX - 3,
          top: startY - 3,
          width: 6,
          height: 6,
          animation: 'engineer-wrench-fly 300ms steps(10, end) both',
          opacity: 0,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            background: 'var(--color-shield-steel)',
            imageRendering: 'pixelated',
            animation: 'engineer-wrench-spin 100ms steps(4, end) 3 both',
          }}
        />
      </div>

      {/* Impact flash at wrench landing point */}
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
            animation: 'engineer-impact 120ms steps(2, end) both',
            animationDelay: '300ms',
            opacity: 0,
          }}
        >
          {/* Cross-shaped impact tick */}
          <rect
            x={endX - 4}
            y={endY - 1}
            width={8}
            height={2}
            fill="var(--color-shield-steel)"
          />
          <rect
            x={endX - 1}
            y={endY - 4}
            width={2}
            height={8}
            fill="var(--color-shield-steel)"
          />
          {/* Corner pixels for a stepped burst */}
          <rect x={endX - 5} y={endY - 5} width={2} height={2} fill="var(--color-ink)" />
          <rect x={endX + 3} y={endY - 5} width={2} height={2} fill="var(--color-ink)" />
          <rect x={endX - 5} y={endY + 3} width={2} height={2} fill="var(--color-ink)" />
          <rect x={endX + 3} y={endY + 3} width={2} height={2} fill="var(--color-ink)" />
        </g>
      </svg>

      {/* Build brick — slides up from base over 150ms, sits for a moment, fades */}
      <div
        style={{
          position: 'absolute',
          left: buildX - 5,
          top: buildBaseY - 3,
          width: 10,
          height: 6,
          background: 'var(--color-shield-steel)',
          border: '1px solid var(--color-ink)',
          imageRendering: 'pixelated',
          animation: 'engineer-brick-rise 300ms steps(6, end) both',
          opacity: 0,
        }}
      />

      {/* "+2" floating label — rises above the brick, fades out */}
      <div
        style={{
          position: 'absolute',
          left: buildX + 6,
          top: buildBaseY - 10,
          color: 'var(--color-shield-steel)',
          fontFamily: 'monospace',
          fontSize: 10,
          fontWeight: 700,
          textShadow: '1px 1px 0 var(--color-paper)',
          letterSpacing: 0,
          animation: 'engineer-plus2 420ms steps(6, end) both',
          animationDelay: '40ms',
          opacity: 0,
        }}
      >
        +2
      </div>

      <style>{`
        @keyframes engineer-wrench-fly {
          0%   { opacity: 0; transform: translate(0, 0); }
          10%  { opacity: 1; transform: translate(0, 0); }
          50%  { opacity: 1; transform: translate(${(endX - startX) / 2}px, ${peakY - startY}px); }
          95%  { opacity: 1; transform: translate(${endX - startX}px, ${endY - startY}px); }
          100% { opacity: 0; transform: translate(${endX - startX}px, ${endY - startY}px); }
        }
        @keyframes engineer-wrench-spin {
          0%   { transform: rotate(0deg); }
          25%  { transform: rotate(90deg); }
          50%  { transform: rotate(180deg); }
          75%  { transform: rotate(270deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes engineer-impact {
          0%   { opacity: 0; }
          30%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes engineer-brick-rise {
          0%   { opacity: 0; transform: translateY(8px); }
          20%  { opacity: 1; transform: translateY(6px); }
          50%  { opacity: 1; transform: translateY(0); }
          85%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(0); }
        }
        @keyframes engineer-plus2 {
          0%   { opacity: 0; transform: translateY(2px); }
          25%  { opacity: 1; transform: translateY(0); }
          70%  { opacity: 1; transform: translateY(-4px); }
          100% { opacity: 0; transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
