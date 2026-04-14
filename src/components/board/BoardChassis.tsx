import { useGameStore } from '../../store/game'
import { Header } from './Header'
import { Footer } from './Footer'
import ZonePlate from './ZonePlate'
import { MidlineRules } from './MidlineRules'
import { Bridge } from './Bridge'
import { WheelStrip } from './WheelStrip'

/**
 * Assembles all board components into the 480x270 canvas.
 *
 * Vertical budget (270px):
 *   0-16:    Header (16px)
 *  16-32:    Opponent wheel strip (16px)
 *  34-106:   Opponent zone plate (72px)
 * 108-120:   Midline band (12px)
 * 122-194:   Player zone plate (72px)
 * 196-212:   Player wheel strip (16px)
 * 248-270:   Footer (22px)
 */
export function BoardChassis() {
  const game = useGameStore((s) => s.game)
  const spin = useGameStore((s) => s.spin)
  const lockWheel = useGameStore((s) => s.lockWheel)
  const startTurn = useGameStore((s) => s.startTurn)

  const player = game.players[0]
  const opponent = game.players[1]
  const canSpinNow = game.phase === 'spinning' && game.wheels.spinsRemaining > 0

  const handleSpin = () => {
    if (game.wheels.spinsRemaining === 3) {
      startTurn()
    }
    spin()
  }

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

      {/* Opponent wheel strip: y=16 */}
      <div style={{ position: 'absolute', top: 16, left: 96 }}>
        <WheelStrip
          results={game.wheels.results}
          locked={game.wheels.locked}
          onLockWheel={lockWheel}
        />
      </div>

      {/* Opponent zone plate: y=34, h=72 */}
      <div style={{ position: 'absolute', top: 34, left: 20 }}>
        <ZonePlate side="opponent" playerState={opponent} />
      </div>

      {/* Midline rules: y=108, h=12 */}
      <div style={{ position: 'absolute', top: 108, left: 0 }}>
        <MidlineRules currentPlayer={game.currentPlayer} turn={game.turn} />
      </div>

      {/* Bridge: centered in midline band */}
      <div style={{ position: 'absolute', top: 108, left: 216 }}>
        <Bridge />
      </div>

      {/* Player zone plate: y=122, h=72 */}
      <div style={{ position: 'absolute', top: 122, left: 20 }}>
        <ZonePlate side="player" playerState={player} />
      </div>

      {/* Player wheel strip: y=196 */}
      <div style={{ position: 'absolute', top: 196, left: 96 }}>
        <WheelStrip
          results={game.wheels.results}
          locked={game.wheels.locked}
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
