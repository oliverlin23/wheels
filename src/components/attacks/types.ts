/**
 * Common props for all attack animation components.
 *
 * Coordinate system: the Stage is 520x360.
 * - Opponent zone plate occupies y ≈ 68-155 (crown at ~y=110 center)
 * - Player zone plate occupies y ≈ 172-259 (crown at ~y=215 center)
 * - Crown box is centered horizontally (x ≈ 260)
 * - Left platform center ≈ x=130, right platform center ≈ x=390
 */
export type AttackProps = {
  /** Where the attacker is rendered on screen. */
  attackerSide: 'bottom' | 'top'
  /** Where the defender is rendered on screen. */
  defenderSide: 'bottom' | 'top'
  /** True if attack was blocked by bulwark (ends at bulwark instead of crown). */
  hitsBulwark: boolean
  /** Total duration this attack has to play. */
  durationMs: number
}

// Screen anchor points for attack start/end
export const CROWN_X = 260
export const CROWN_Y_TOP = 110   // opponent crown center
export const CROWN_Y_BOTTOM = 215 // player crown center
export const BULWARK_Y_TOP = 134   // just below opponent crown
export const BULWARK_Y_BOTTOM = 200 // just above player crown
export const PLATFORM_Y_TOP = 100
export const PLATFORM_Y_BOTTOM = 220
export const LEFT_PLATFORM_X = 130
export const RIGHT_PLATFORM_X = 390

/** Resolve crown center y for a side. */
export function crownY(side: 'top' | 'bottom'): number {
  return side === 'top' ? CROWN_Y_TOP : CROWN_Y_BOTTOM
}

/** Resolve bulwark y (top edge of bulwark column) for a side. */
export function bulwarkY(side: 'top' | 'bottom'): number {
  return side === 'top' ? BULWARK_Y_TOP : BULWARK_Y_BOTTOM
}

/** Platform y (center of platform where hero stands) for a side. */
export function platformY(side: 'top' | 'bottom'): number {
  return side === 'top' ? PLATFORM_Y_TOP : PLATFORM_Y_BOTTOM
}
