import type { AttackProps } from './types'
import { crownY, bulwarkY, platformY, LEFT_PLATFORM_X, CROWN_X } from './types'

/**
 * Mage: Dual Fireball — total ~1000ms.
 *  - Ground fireball: low arc, travels 500ms from attacker platform to bulwark
 *    (if blocked) or crown (if not). 4x4 gold pixel with 3-pixel trail.
 *  - High fireball:   launches 200ms after first, arcs well above the midline,
 *    always hits crown. 500ms travel.
 *  - Hit-stop 120ms only on the second impact — two separate beats.
 *
 * Both fireballs are absolutely-positioned divs animated by CSS keyframes.
 * Arc is emulated via stepped keyframe stops on `top` (not smooth), so motion
 * feels retro/grid-aligned. Trails are 3 additional squares stamped behind the
 * core fireball with delays + reduced alpha.
 */
export function MageAttack(props: AttackProps) {
  const { attackerSide, defenderSide, hitsBulwark } = props

  const startX = LEFT_PLATFORM_X
  const startY = platformY(attackerSide)

  // Ground fireball target — low path hits bulwark (if blocked) or crown.
  const groundEndX = CROWN_X
  const groundEndY = hitsBulwark ? bulwarkY(defenderSide) : crownY(defenderSide)

  // High fireball always hits crown (bomb-like, but lower priority — still blocked
  // if path dictates; per spec: "Always hits crown"), so use crown Y directly.
  const highEndX = CROWN_X
  const highEndY = crownY(defenderSide)

  // Arc peak y's: ground peak slightly above midline (~164); high peak way above.
  // Midline = 164. For attacker at bottom, "above" means lower y. For attacker at
  // top, "above" in arc terms means higher y (because arc crosses downward).
  // We model peaks by picking a Y between start and end that is "past" the midline.
  const isAttackerBottom = attackerSide === 'bottom'
  const groundPeakY = isAttackerBottom ? 150 : 178 // just above/below midline
  const highPeakY = isAttackerBottom ? 40 : 280 // well beyond opponent zone plate

  // Horizontal is roughly linear across 500ms.
  // We use CSS keyframes with discrete stops to get a stepped arc.
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {/* ---------------- Ground fireball (launches at 0ms, travels 500ms) ---------------- */}
      <Fireball
        id="mage-ground"
        startX={startX}
        startY={startY}
        endX={groundEndX}
        endY={groundEndY}
        peakY={groundPeakY}
        delayMs={0}
        travelMs={500}
        core="var(--color-sun-gold)"
        trail="var(--color-red-ink)"
        impactFlash={false}
      />

      {/* ---------------- High fireball (launches at 200ms, travels 500ms) --------------- */}
      <Fireball
        id="mage-high"
        startX={startX}
        startY={startY}
        endX={highEndX}
        endY={highEndY}
        peakY={highPeakY}
        delayMs={200}
        travelMs={500}
        core="var(--color-sun-gold)"
        trail="var(--color-bypass-magenta)"
        impactFlash // hit-stop beat on second impact
      />
    </div>
  )
}

type FireballProps = {
  id: string
  startX: number
  startY: number
  endX: number
  endY: number
  peakY: number
  delayMs: number
  travelMs: number
  core: string
  trail: string
  impactFlash: boolean
}

/**
 * A single stepped-arc fireball. Renders:
 *   - 3 trailing squares (delayed) — forms a 3-pixel trail
 *   - the core 4x4 square
 *   - an impact flash (magenta pulse) at the destination, triggered on arrival
 *
 * Uses inline <style> with unique keyframe names per id so the two fireballs
 * don't clobber each other's animations.
 */
function Fireball(props: FireballProps) {
  const {
    id,
    startX,
    startY,
    endX,
    endY,
    peakY,
    delayMs,
    travelMs,
    core,
    trail,
    impactFlash,
  } = props

  // Stepped arc: use 6 keyframe stops (0, 20, 40, 60, 80, 100) to sample a parabola
  // linearly across x and parabolically across y. The @keyframes below are named
  // dynamically so we inline the computed values.
  const xAt = (t: number) => startX + (endX - startX) * t
  // Parabola through (0,startY), (0.5,peakY), (1,endY):
  //   y(t) = a*t^2 + b*t + c, with c=startY, a+b+c=endY, 0.25a+0.5b+c=peakY
  //   => b = 4*(peakY - startY) - (endY - startY)
  //   => a = (endY - startY) - b
  const b = 4 * (peakY - startY) - (endY - startY)
  const a = endY - startY - b
  const yAt = (t: number) => a * t * t + b * t + startY

  const travelKf = `
    @keyframes ${id}-x {
      0%   { left: ${xAt(0).toFixed(2)}px; }
      20%  { left: ${xAt(0.2).toFixed(2)}px; }
      40%  { left: ${xAt(0.4).toFixed(2)}px; }
      60%  { left: ${xAt(0.6).toFixed(2)}px; }
      80%  { left: ${xAt(0.8).toFixed(2)}px; }
      100% { left: ${xAt(1.0).toFixed(2)}px; }
    }
    @keyframes ${id}-y {
      0%   { top: ${yAt(0).toFixed(2)}px; }
      20%  { top: ${yAt(0.2).toFixed(2)}px; }
      40%  { top: ${yAt(0.4).toFixed(2)}px; }
      60%  { top: ${yAt(0.6).toFixed(2)}px; }
      80%  { top: ${yAt(0.8).toFixed(2)}px; }
      100% { top: ${yAt(1.0).toFixed(2)}px; }
    }
    @keyframes ${id}-fade {
      0%   { opacity: 0; }
      5%   { opacity: 1; }
      92%  { opacity: 1; }
      100% { opacity: 0; }
    }
    @keyframes ${id}-impact {
      0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
      30%  { opacity: 0.95; transform: translate(-50%, -50%) scale(1.2); }
      60%  { opacity: 0.7;  transform: translate(-50%, -50%) scale(1.6); }
      100% { opacity: 0;    transform: translate(-50%, -50%) scale(2); }
    }
  `

  // Core + 3 trail squares. The trail squares use the same x/y animations but
  // lagged by a fraction of travelMs so they form a 3-pixel tail.
  const trailLagMs = 55 // per-segment lag

  // Common box style for a 4x4 pixel.
  const pxBox = (color: string, opacity: number): React.CSSProperties => ({
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: color,
    imageRendering: 'pixelated',
    opacity,
    // steps() easing makes the motion feel grid-aligned / chunky.
    animationTimingFunction: `steps(6, end)`,
    animationFillMode: 'both',
  })

  return (
    <>
      {/* Trail segments — rendered BEFORE the core so the core draws on top. */}
      {[3, 2, 1].map((i) => {
        const size = 4 - (i === 3 ? 2 : i === 2 ? 1 : 0) // shrink far-back pixels
        const alpha = 0.35 + (3 - i) * 0.15
        const delay = delayMs - i * trailLagMs
        return (
          <div
            key={`${id}-trail-${i}`}
            style={{
              ...pxBox(trail, alpha),
              width: size,
              height: size,
              animationName: `${id}-x, ${id}-y, ${id}-fade`,
              animationDuration: `${travelMs}ms, ${travelMs}ms, ${travelMs}ms`,
              animationDelay: `${delay}ms, ${delay}ms, ${delay}ms`,
            }}
          />
        )
      })}

      {/* Core fireball — 4x4 gold pixel tracing the arc. */}
      <div
        style={{
          ...pxBox(core, 1),
          animationName: `${id}-x, ${id}-y, ${id}-fade`,
          animationDuration: `${travelMs}ms, ${travelMs}ms, ${travelMs}ms`,
          animationDelay: `${delayMs}ms, ${delayMs}ms, ${delayMs}ms`,
          // Slight box-shadow halo for warmth. Pixel edges stay crisp because
          // the shadow has zero blur.
          boxShadow: `0 0 0 1px ${core}, 0 0 0 2px rgba(217, 119, 6, 0.35)`,
        }}
      />

      {/* Impact flash at destination — magenta pulse. On the second fireball this
          doubles as the hit-stop beat (120ms). */}
      <div
        style={{
          position: 'absolute',
          left: endX,
          top: endY,
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: 'var(--color-bypass-magenta)',
          opacity: 0,
          transform: 'translate(-50%, -50%) scale(0.5)',
          animation: `${id}-impact ${impactFlash ? 160 : 120}ms steps(4, end) both`,
          animationDelay: `${delayMs + travelMs}ms`,
        }}
      />

      {/* Second "ring" for the hit-stop fireball — a flashing outline. */}
      {impactFlash && (
        <div
          style={{
            position: 'absolute',
            left: endX,
            top: endY,
            width: 16,
            height: 16,
            borderRadius: '50%',
            border: '2px solid var(--color-sun-gold)',
            opacity: 0,
            transform: 'translate(-50%, -50%) scale(0.6)',
            animation: `${id}-impact 220ms steps(5, end) both`,
            animationDelay: `${delayMs + travelMs}ms`,
          }}
        />
      )}

      <style>{travelKf}</style>
    </>
  )
}
