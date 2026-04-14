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

/**
 * Assembles all board components into the 480x270 canvas.
 *
 * Vertical budget (270px):
 *   0-16:    Header (16px)
 *  16-40:    Opponent wheels (24px -- 3D canvas + rail overlay)
 *  42-114:   Opponent zone plate (72px)
 * 116-128:   Midline band (12px)
 * 130-202:   Player zone plate (72px)
 * 204-228:   Player wheels (24px)
 * 248-270:   Footer (22px)
 */
export function BoardChassis({ stageScale = 1 }: { stageScale?: number }) {
  const game = useGameStore((s) => s.game)
  const spin = useGameStore((s) => s.spin)
  const lockWheel = useGameStore((s) => s.lockWheel)
  const startTurn = useGameStore((s) => s.startTurn)
  const spinCount = useGameStore((s) => s.spinCount)

  const player = game.players[0]
  const opponent = game.players[1]
  const canSpinNow = game.phase === 'spinning' && game.wheels.spinsRemaining > 0

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
    if (game.wheels.spinsRemaining === 3) {
      startTurn()
    }
    spin()
  }

  const settledFlags = drums.map((d) => d.phase === 'settled')

  return (
    <div
      style={{
        position: 'relative',
        width: 480,
        height: 270,
        overflow: 'hidden',
        fontFamily: '"IBM Plex Mono", monospace',
        fontFeatureSettings: '"tnum"',
      }}
    >
      {/* Header: y=0, h=16 */}
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <Header turn={game.turn} />
      </div>

      {/* Opponent result labels: y=16 */}
      <div style={{ position: 'absolute', top: 16, left: 0, width: 480, height: 10, zIndex: 5 }}>
        <WheelRail
          results={game.wheels.results}
          locked={game.wheels.locked}
          settled={settledFlags}
          onLockWheel={lockWheel}
        />
      </div>

      {/* Opponent 3D wheels: y=26, h=32 */}
      <div style={{ position: 'absolute', top: 26, left: 0, width: 480, height: 32, zIndex: 4 }}>
        <WheelsCanvas drums={drums} locked={game.wheels.locked} stageScale={stageScale} />
      </div>

      {/* Opponent zone plate: y=58, h=56 */}
      <div style={{ position: 'absolute', top: 58, left: 20 }}>
        <ZonePlate side="opponent" playerState={opponent} />
      </div>

      {/* Midline rules: y=116, h=12 */}
      <div style={{ position: 'absolute', top: 116, left: 0 }}>
        <MidlineRules currentPlayer={game.currentPlayer} turn={game.turn} />
      </div>

      {/* Bridge: centered in midline band */}
      <div style={{ position: 'absolute', top: 116, left: 216 }}>
        <Bridge />
      </div>

      {/* Player zone plate: y=130, h=56 */}
      <div style={{ position: 'absolute', top: 130, left: 20 }}>
        <ZonePlate side="player" playerState={player} />
      </div>

      {/* Player 3D wheels: y=186, h=32 */}
      <div style={{ position: 'absolute', top: 186, left: 0, width: 480, height: 32, zIndex: 4 }}>
        <WheelsCanvas drums={drums} locked={game.wheels.locked} stageScale={stageScale} />
      </div>

      {/* Player result labels: y=218 */}
      <div style={{ position: 'absolute', top: 218, left: 0, width: 480, height: 10, zIndex: 5 }}>
        <WheelRail
          results={game.wheels.results}
          locked={game.wheels.locked}
          settled={settledFlags}
          onLockWheel={lockWheel}
        />
      </div>

      {/* Footer: y=248 */}
      <div style={{ position: 'absolute', top: 248, left: 0, width: 480, height: 22 }}>
        <Footer
          spinsRemaining={game.wheels.spinsRemaining}
          onSpin={handleSpin}
          canSpin={canSpinNow}
        />
      </div>
    </div>
  )
}
