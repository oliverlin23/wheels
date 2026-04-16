import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/game'
import { Header } from './Header'
import { Footer } from './Footer'
import ZonePlate from './ZonePlate'
import { MidlineRules } from './MidlineRules'
import { WheelsCanvas } from '../wheels/WheelsCanvas'
import { useSpinAnimation } from '../wheels/useSpinAnimation'
import { useResolvePlayback } from '../../resolve/useResolvePlayback'
import { AttackLayer } from '../attacks/AttackLayer'
import type { PanelRef } from '../../game/types'
import type { ClientMessage } from '../../network/protocol'

/**
 * Assembles all board components into the 520x360 canvas.
 *
 * Vertical budget (360px):
 *   0-17:    Header (18px)
 *  20-61:    Opponent wheel strip (42px) — 3D drums + result chips
 *  68-155:   Opponent zone plate (88px)
 * 160-167:   Midline (8px) — single violet rule + phase label
 * 172-259:   Player zone plate (88px)
 * 268-309:   Player wheel strip (42px) — 3D drums + result chips
 * 318-345:   Footer (28px)
 */
type BoardChassisProps = {
  stageScale?: number | undefined
  send?: ((msg: ClientMessage) => void) | undefined
  myPlayer?: 0 | 1 | 'spectator' | null | undefined
  onHelp?: (() => void) | undefined
}

export function BoardChassis({ stageScale = 1, send, myPlayer, onHelp }: BoardChassisProps) {
  const game = useGameStore((s) => s.game)
  const localSpin = useGameStore((s) => s.spin)
  const localLockWheel = useGameStore((s) => s.lockWheel)
  const localConfirmSpins = useGameStore((s) => s.confirmSpins)
  const spinCount = useGameStore((s) => s.spinCount)

  // Perspective flipping: each player sees their own heroes at the bottom
  const meIndex: 0 | 1 = (myPlayer === 0 || myPlayer === 1) ? myPlayer : 0
  const themIndex: 0 | 1 = meIndex === 0 ? 1 : 0

  // My wheel state and opponent's wheel state
  const myWheels = game.wheels[meIndex]
  const oppWheels = game.wheels[themIndex]

  // During spinning phase, opponent wheels are hidden
  const isSpinning = game.roundPhase === 'spinning'
  const canSpinNow = isSpinning && myWheels.spinsRemaining > 0

  // Can confirm: during spinning phase, has spun at least once (has results), hasn't confirmed yet
  const hasSpun = myWheels.results !== null
  const myConfirmed = game.confirmed[meIndex]
  const canConfirm = isSpinning && hasSpun && !myConfirmed
  const oppConfirmed = game.confirmed[themIndex]

  // Opponent wheels visible only after reveal
  const oppWheelsVisible = game.roundPhase !== 'spinning'
  const oppResults = oppWheelsVisible ? oppWheels.results : null
  const oppLocked = oppWheelsVisible ? oppWheels.locked : [false, false, false, false, false] as [boolean, boolean, boolean, boolean, boolean]

  const { drums, triggerSpin } = useSpinAnimation()
  const prevSpinCount = useRef(spinCount)

  // Trigger spin animation when spinCount changes (for player's own wheels)
  useEffect(() => {
    if (spinCount > prevSpinCount.current && myWheels.resultIndices) {
      const indices = myWheels.resultIndices.map((idx, i) =>
        myWheels.locked[i] ? -1 : idx
      )
      triggerSpin(indices)
    }
    prevSpinCount.current = spinCount
  }, [spinCount, myWheels.resultIndices, myWheels.locked, triggerSpin])

  const handleSpin = () => {
    if (send) {
      send({ type: 'SPIN' })
    } else {
      localSpin(meIndex)
    }
  }

  const handleLockWheel = (index: number) => {
    if (send) {
      send({ type: 'LOCK_WHEEL', index })
    } else {
      localLockWheel(meIndex, index)
    }
  }

  const handleConfirm = () => {
    if (send) {
      send({ type: 'CONFIRM' })
    } else {
      localConfirmSpins(meIndex)
    }
  }

  const settledFlags = drums.map((d) => d.phase === 'settled')

  // Drive resolution playback — this hook ticks the timeline and derives
  // the intermediate displayed game state (crown HP / bulwark step by step).
  const { currentStep, displayedGame } = useResolvePlayback()

  // Use displayed game's players during playback for HP/bulwark values.
  const displayedPlayer = displayedGame.players[meIndex]
  const displayedOpponent = displayedGame.players[themIndex]

  // Per-player highlighted wheel indices for the current playback step
  const panelRefs: PanelRef[] = currentStep?.highlightedPanels ?? []
  const myHighlighted: boolean[] = [false, false, false, false, false]
  const oppHighlighted: boolean[] = [false, false, false, false, false]
  for (const ref of panelRefs) {
    const highlights = ref.player === meIndex ? myHighlighted : oppHighlighted
    highlights[ref.wheelIdx] = true
  }

  // Opponent status label
  const oppStatusLabel = isSpinning
    ? (oppConfirmed ? 'OPPONENT: READY' : 'OPPONENT: SPINNING...')
    : undefined

  return (
    <div
      style={{
        position: 'relative',
        width: 520,
        height: 360,
        overflow: 'hidden',
        fontFamily: '"IBM Plex Mono", monospace',
        fontFeatureSettings: '"tnum"',
      }}
    >
      {/* Header: y=0, h=16 */}
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <Header turn={game.round} onHelp={onHelp} />
      </div>

      {/* Opponent wheel strip: y=20, h=40 — drums + result chips */}
      <div style={{ position: 'absolute', top: 20, left: 0, width: 520, height: 42, zIndex: 4 }}>
        {oppWheelsVisible ? (
          <WheelsCanvas
            drums={drums}
            locked={oppLocked}
            stageScale={stageScale}
            results={oppResults}
            settled={settledFlags}
            statusLabel={undefined}
            highlighted={oppHighlighted}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 8,
            color: 'var(--color-ink-mid)',
            textTransform: 'uppercase',
            fontFamily: '"IBM Plex Mono", monospace',
            backgroundColor: 'var(--color-paper-dim)',
            borderTop: '1px solid rgba(15, 23, 42, 0.08)',
            borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
          }}>
            {/* Pixelated status light */}
            <div style={{
              width: 6,
              height: 6,
              backgroundColor: oppConfirmed ? 'var(--color-sun-gold)' : 'var(--color-ink-mid)',
              opacity: oppConfirmed ? 1 : 0.3,
              imageRendering: 'pixelated',
            }} />
            {oppStatusLabel ?? '[ HIDDEN ]'}
          </div>
        )}
      </div>

      {/* Opponent zone plate: y=68, h=88 */}
      <div style={{ position: 'absolute', top: 68, left: 20 }}>
        <ZonePlate side="opponent" playerState={displayedOpponent} />
      </div>

      {/* Midline: y=160, h=8 */}
      <div style={{ position: 'absolute', top: 160, left: 0 }}>
        <MidlineRules roundPhase={game.roundPhase} />
      </div>

      {/* Player zone plate: y=172, h=88 */}
      <div style={{ position: 'absolute', top: 172, left: 20 }}>
        <ZonePlate side="player" playerState={displayedPlayer} />
      </div>

      {/* Player wheel strip: y=268, h=42 — drums + result chips */}
      <div style={{ position: 'absolute', top: 268, left: 0, width: 520, height: 42, zIndex: 4 }}>
        <WheelsCanvas
          drums={drums}
          locked={myWheels.locked}
          stageScale={stageScale}
          results={myWheels.results}
          settled={settledFlags}
          onLockWheel={handleLockWheel}
          confirmed={myConfirmed}
          oppConfirmed={oppConfirmed}
          highlighted={myHighlighted}
        />
      </div>

      {/* Attack animation overlay — renders on top of everything during resolution */}
      <AttackLayer meIndex={meIndex} />

      {/* Footer: y=318 */}
      <div style={{ position: 'absolute', top: 318, left: 0, width: 520, height: 28 }}>
        <Footer
          spinsRemaining={myWheels.spinsRemaining}
          onSpin={handleSpin}
          onConfirm={handleConfirm}
          canSpin={canSpinNow}
          canConfirm={canConfirm}
          confirmed={myConfirmed}
        />
      </div>
    </div>
  )
}
