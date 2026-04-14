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
 *  20-30:    Wheel rail labels (10px)
 *  32-60:    3D wheel drums (28px)
 *  64-140:   Opponent zone plate (76px)
 * 144-156:   Midline band (12px)
 * 160-236:   Player zone plate (76px)
 * 240-268:   3D wheel drums (28px)
 * 270-280:   Wheel rail labels (10px)
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
  const localStartTurn = useGameStore((s) => s.startTurn)
  const spinCount = useGameStore((s) => s.spinCount)

  // Perspective flipping: each player sees their own heroes at the bottom
  const meIndex = (myPlayer === 0 || myPlayer === 1) ? myPlayer : 0
  const themIndex: 0 | 1 = meIndex === 0 ? 1 : 0
  const player = game.players[meIndex]
  const opponent = game.players[themIndex]

  // In multiplayer: only the current player can act, and only on their turn
  const isMyTurn = myPlayer === undefined || myPlayer === null || myPlayer === game.currentPlayer
  const canSpinNow = game.phase === 'spinning' && game.wheels.spinsRemaining > 0 && isMyTurn

  const { drums, triggerSpin } = useSpinAnimation()
  const prevSpinCount = useRef(spinCount)

  // Trigger spin animation when spinCount changes
  useEffect(() => {
    if (spinCount > prevSpinCount.current && game.wheels.resultIndices) {
      const indices = game.wheels.resultIndices.map((idx, i) =>
        game.wheels.locked[i] ? -1 : idx
      )
      triggerSpin(indices)
    }
    prevSpinCount.current = spinCount
  }, [spinCount, game.wheels.resultIndices, game.wheels.locked, triggerSpin])

  const handleSpin = () => {
    if (send) {
      send({ type: 'SPIN' })
    } else {
      // Local mode (Debug panel)
      if (game.wheels.spinsRemaining === 3) {
        localStartTurn()
      }
      localSpin()
    }
  }

  const handleLockWheel = (index: number) => {
    if (send) {
      send({ type: 'LOCK_WHEEL', index })
    } else {
      localLockWheel(index)
    }
  }

  const settledFlags = drums.map((d) => d.phase === 'settled')

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
        <Header turn={game.turn} />
      </div>

      {/* Wheel rail labels: y=20, h=10 */}
      <div style={{ position: 'absolute', top: 20, left: 0, width: 480, height: 10, zIndex: 5 }}>
        <WheelRail
          results={game.wheels.results}
          locked={game.wheels.locked}
          settled={settledFlags}
          onLockWheel={handleLockWheel}
        />
      </div>

      {/* 3D wheel drums (top): y=32, h=28 */}
      <div style={{ position: 'absolute', top: 32, left: 0, width: 480, height: 28, zIndex: 4 }}>
        <WheelsCanvas drums={drums} locked={game.wheels.locked} stageScale={stageScale} />
      </div>

      {/* Opponent zone plate: y=64, h=76 */}
      <div style={{ position: 'absolute', top: 64, left: 20 }}>
        <ZonePlate side="opponent" playerState={opponent} />
      </div>

      {/* Midline rules: y=144, h=12 */}
      <div style={{ position: 'absolute', top: 144, left: 0 }}>
        <MidlineRules currentPlayer={game.currentPlayer} turn={game.turn} />
      </div>

      {/* Bridge: centered in midline band */}
      <div style={{ position: 'absolute', top: 144, left: 216 }}>
        <Bridge />
      </div>

      {/* Player zone plate: y=160, h=76 */}
      <div style={{ position: 'absolute', top: 160, left: 20 }}>
        <ZonePlate side="player" playerState={player} />
      </div>

      {/* 3D wheel drums (bottom): y=240, h=28 */}
      <div style={{ position: 'absolute', top: 240, left: 0, width: 480, height: 28, zIndex: 4 }}>
        <WheelsCanvas drums={drums} locked={game.wheels.locked} stageScale={stageScale} />
      </div>

      {/* Wheel rail labels (bottom): y=270, h=10 */}
      <div style={{ position: 'absolute', top: 270, left: 0, width: 480, height: 10, zIndex: 5 }}>
        <WheelRail
          results={game.wheels.results}
          locked={game.wheels.locked}
          settled={settledFlags}
          onLockWheel={handleLockWheel}
        />
      </div>

      {/* Footer: y=294 */}
      <div style={{ position: 'absolute', top: 294, left: 0, width: 480, height: 24 }}>
        <Footer
          spinsRemaining={game.wheels.spinsRemaining}
          onSpin={handleSpin}
          canSpin={canSpinNow}
        />
      </div>
    </div>
  )
}
