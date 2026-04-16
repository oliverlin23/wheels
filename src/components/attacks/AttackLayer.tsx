import { useCurrentStep } from '../../resolve/useResolvePlayback'
import { WarriorAttack } from './WarriorAttack'
import { MageAttack } from './MageAttack'
import { ArcherAttack } from './ArcherAttack'
import { EngineerAttack } from './EngineerAttack'
import { AssassinAttack } from './AssassinAttack'
import { PriestAttack } from './PriestAttack'
import { BombProjectile } from './BombProjectile'

type AttackLayerProps = {
  /** Player index of the local viewer (for perspective flipping). */
  meIndex: 0 | 1
}

/**
 * Overlay layer that renders the active attack animation during playback.
 * Reads current step from playback store and dispatches to the appropriate
 * attack component.
 */
export function AttackLayer({ meIndex }: AttackLayerProps) {
  const step = useCurrentStep()
  const attack = step?.attack
  if (!attack) return null

  // Perspective: attacker/defender from local viewer's perspective.
  // If the local player is the attacker, they are at the bottom.
  const attackerSide: 'bottom' | 'top' = attack.attackerIdx === meIndex ? 'bottom' : 'top'
  const defenderSide: 'bottom' | 'top' = attackerSide === 'bottom' ? 'top' : 'bottom'
  const hitsBulwark = attack.hitsBulwark ?? false

  const common = {
    attackerSide,
    defenderSide,
    hitsBulwark,
    durationMs: step.durationMs,
    key: `${attack.kind}-${step.event.detail}`,
  }

  const content = (() => {
    switch (attack.kind) {
      case 'warrior': return <WarriorAttack {...common} />
      case 'mage': return <MageAttack {...common} />
      case 'archer': return <ArcherAttack {...common} />
      case 'engineer': return <EngineerAttack {...common} />
      case 'assassin': return <AssassinAttack {...common} />
      case 'priest': return <PriestAttack {...common} />
      case 'bomb': return <BombProjectile {...common} />
      default: return null
    }
  })()

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 520,
        height: 360,
        pointerEvents: 'none',
        zIndex: 20,
      }}
    >
      {content}
    </div>
  )
}
