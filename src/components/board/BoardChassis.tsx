import { useEffect, useRef } from 'react'
import { useGameStore } from '../../store/game'
import { Header } from './Header'
import { Footer } from './Footer'
import ZonePlate from './ZonePlate'
import { MidlineRules } from './MidlineRules'
import { Bridge } from './Bridge'
import { WheelsCanvas } from '../wheels/WheelsCanvas'
import { WheelRail } from '../wheels/WheelRail'
import { useSpinAnimation } from '../wheels/useSpinAnimation'
import type { ClientMessage } from '../../network/protocol'

/**
 * Assembles all board components into the 480x320 canvas.
 *
 * Vertical budget (320px):
 *   0-16:    Header (16px)
 *  20-30:    Wheel rail labels (10px)  -- opponent wheels (hidden during spin)
 *  32-60:    3D wheel drums (28px)     -- opponent wheels
 *  64-140:   Opponent zone plate (76px)
 * 144-156:   Midline band (12px)
 * 160-236:   Player zone plate (76px)
 * 240-268:   3D wheel drums (28px)     -- player wheels
 * 270-280:   Wheel rail labels (10px)  -- player wheels
 * 294-318:   Footer (24px)
 */
type BoardChassisProps = {
  stageScale?: number | undefined
  send?: ((msg: ClientMessage) => void) | undefined
  myPlayer?: 0 | 1 | 'spectator' | null | undefined
}

export function BoardChassis({ stageScale = 1, send, myPlayer }: BoardChassisProps) {
  const game = useGameStore((s) => s.game)
  const localSpin = useGameStore((s) => s.spin)
  const localLockWheel = useGameStore((s) => s.lockWheel)
  const localConfirmSpins = useGameStore((s) => s.confirmSpins)
  const spinCount = useGameStore((s) => s.spinCount)

  // Perspective flipping: each player sees their own heroes at the bottom
  const meIndex: 0 | 1 = (myPlayer === 0 || myPlayer === 1) ? myPlayer : 0
  const themIndex: 0 | 1 = meIndex === 0 ? 1 : 0
  const player = game.players[meIndex]
  const opponent = game.players[themIndex]

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
      // Local mode (Debug panel)
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

  // Opponent status label
  const oppStatusLabel = isSpinning
    ? (oppConfirmed ? 'OPPONENT: READY' : 'OPPONENT: SPINNING...')
    : undefined

  return (
    <div
      style={{
        position: 'relative',
        width: 480,
        height: 320,
        overflow: 'hidden',
        fontFamily: '"IBM Plex Mono", monospace',
        fontFeatureSettings: '"tnum"',
      }}
    >
      {/* Header: y=0, h=16 */}
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <Header turn={game.round} />
      </div>

      {/* Opponent wheel rail labels: y=20, h=10 */}
      <div style={{ position: 'absolute', top: 20, left: 0, width: 480, height: 10, zIndex: 5 }}>
        <WheelRail
          results={oppResults}
          locked={oppLocked}
          settled={oppWheelsVisible ? settledFlags : [false, false, false, false, false]}
          onLockWheel={() => { /* opponent wheels not lockable */ }}
        />
      </div>

      {/* Opponent status indicator */}
      {oppStatusLabel && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 8,
          fontSize: 7,
          fontWeight: 400,
          textTransform: 'uppercase',
          color: oppConfirmed ? 'var(--color-ink)' : 'var(--color-ink-mid)',
          zIndex: 6,
        }}>
          {oppStatusLabel}
        </div>
      )}

      {/* 3D wheel drums (top / opponent): y=32, h=28 */}
      <div style={{ position: 'absolute', top: 32, left: 0, width: 480, height: 28, zIndex: 4 }}>
        {oppWheelsVisible ? (
          <WheelsCanvas drums={drums} locked={oppLocked} stageScale={stageScale} />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            color: 'var(--color-ink-mid)',
            textTransform: 'uppercase',
          }}>
            [ HIDDEN ]
          </div>
        )}
      </div>

      {/* Opponent zone plate: y=64, h=76 */}
      <div style={{ position: 'absolute', top: 64, left: 20 }}>
        <ZonePlate side="opponent" playerState={opponent} />
      </div>

      {/* Midline rules: y=144, h=12 */}
      <div style={{ position: 'absolute', top: 144, left: 0 }}>
        <MidlineRules round={game.round} roundPhase={game.roundPhase} />
      </div>

      {/* Bridge: centered in midline band */}
      <div style={{ position: 'absolute', top: 144, left: 216 }}>
        <Bridge />
      </div>

      {/* Player zone plate: y=160, h=76 */}
      <div style={{ position: 'absolute', top: 160, left: 20 }}>
        <ZonePlate side="player" playerState={player} />
      </div>

      {/* 3D wheel drums (bottom / player): y=240, h=28 */}
      <div style={{ position: 'absolute', top: 240, left: 0, width: 480, height: 28, zIndex: 4 }}>
        <WheelsCanvas drums={drums} locked={myWheels.locked} stageScale={stageScale} />
      </div>

      {/* Player wheel rail labels (bottom): y=270, h=10 */}
      <div style={{ position: 'absolute', top: 270, left: 0, width: 480, height: 10, zIndex: 5 }}>
        <WheelRail
          results={myWheels.results}
          locked={myWheels.locked}
          settled={settledFlags}
          onLockWheel={handleLockWheel}
        />
      </div>

      {/* Footer: y=294 */}
      <div style={{ position: 'absolute', top: 294, left: 0, width: 480, height: 24 }}>
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
