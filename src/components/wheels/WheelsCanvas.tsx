import { Canvas } from '@react-three/fiber'
import { WheelDrum } from './WheelDrum'
import type { DrumState } from './useSpinAnimation'
import type { Panel } from '../../game/types'
import { SYMBOL_LABEL, SYMBOL_COLOR } from '../../game/symbols'

type WheelsCanvasProps = {
  drums: DrumState[]
  locked: [boolean, boolean, boolean, boolean, boolean]
  stageScale?: number
  results?: [Panel, Panel, Panel, Panel, Panel] | null | undefined
  settled?: boolean[] | undefined
  onLockWheel?: ((index: number) => void) | undefined
  statusLabel?: string | undefined
  confirmed?: boolean | undefined
  oppConfirmed?: boolean | undefined
  /** Per-drum highlight state (set during resolution playback). */
  highlighted?: boolean[] | undefined
}

const DRUM_SPACING = 1.4
const DRUM_OFFSETS = [-2, -1, 0, 1, 2].map((i) => i * DRUM_SPACING)

const STRIP_HEIGHT = 42
const CHIP_HEIGHT = 12
const DRUM_AREA_HEIGHT = STRIP_HEIGHT - CHIP_HEIGHT

// Arrow indicator: vertically centered on the front face
const ARROW_Y = Math.round(DRUM_AREA_HEIGHT / 2)
const PX = 2  // pixel size for the arrow grid
const ARROW_COLS = 5
const ARROW_ROWS = 7
const ARROW_W = ARROW_COLS * PX
const ARROW_H = ARROW_ROWS * PX

function formatPanel(panel: Panel): string {
  const letter = SYMBOL_LABEL[panel.symbol]
  const base = panel.count > 1 ? letter + panel.count.toString() : letter
  return panel.xp ? base + '+' : base
}

// 0=transparent, 1=outline(black), 2=fill(white or gold)
const ARROW_GRID: number[][] = [
  [0, 0, 0, 1, 0],
  [0, 0, 1, 2, 1],
  [0, 1, 2, 2, 1],
  [1, 2, 2, 2, 2],
  [0, 1, 2, 2, 1],
  [0, 0, 1, 2, 1],
  [0, 0, 0, 1, 0],
]

function PixelArrow({ confirmed, direction }: { confirmed: boolean; direction: 'left' | 'right' }) {
  const fill = confirmed ? 'var(--color-sun-gold)' : '#F5F1E8'
  const outline = 'var(--color-ink)'
  const colors = ['transparent', outline, fill]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${ARROW_COLS}, ${PX}px)`,
      gridTemplateRows: `repeat(${ARROW_ROWS}, ${PX}px)`,
      width: ARROW_W,
      height: ARROW_H,
      imageRendering: 'pixelated',
      transform: direction === 'left' ? 'scaleX(-1)' : undefined,
    }}>
      {ARROW_GRID.flat().map((v, i) => (
        <div
          key={i}
          style={{
            width: PX,
            height: PX,
            backgroundColor: colors[v],
          }}
        />
      ))}
    </div>
  )
}

// Billboard pixel art (reserved for future use)
const _BILLBOARD_GRID: number[][] = [
  [0, 1, 1, 1, 0],
  [1, 2, 2, 2, 1],
  [1, 2, 2, 2, 1],
  [1, 2, 2, 2, 1],
  [0, 1, 1, 1, 0],
]
void _BILLBOARD_GRID

export function WheelsCanvas({
  drums,
  locked,
  stageScale = 1,
  results,
  settled,
  onLockWheel,
  confirmed,
  oppConfirmed: _oppConfirmed,
  highlighted,
}: WheelsCanvasProps) {
  const inverseScale = 1 / stageScale
  const canvasW = 520 * stageScale
  const canvasH = DRUM_AREA_HEIGHT * stageScale
  const zoom = 34 * stageScale

  // Calculate chip x-positions to align with 3D drum centers
  const baseZoom = 34
  const chipPositions = DRUM_OFFSETS.map((off) => 260 + off * baseZoom)

  // Arrow positions: just outside the leftmost/rightmost drums
  const leftArrowX = chipPositions[0] - 22
  const rightArrowX = chipPositions[4] + 14
  const isConfirmed = confirmed === true
  const arrowAnimL = isConfirmed ? 'none' : 'arrow-hop-left 0.8s steps(3) infinite alternate'
  const arrowAnimR = isConfirmed ? 'none' : 'arrow-hop-right 0.8s steps(3) infinite alternate'

  return (
    <div style={{
      position: 'relative',
      width: 520,
      height: STRIP_HEIGHT,
      overflow: 'hidden',
      backgroundColor: 'var(--color-paper-dim)',
      borderTop: '1px solid rgba(15, 23, 42, 0.08)',
      borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
    }}>
      {/* Result chips row (bottom 12px) */}
      <div style={{
        position: 'absolute',
        top: DRUM_AREA_HEIGHT,
        left: 0,
        width: 520,
        height: CHIP_HEIGHT,
        zIndex: 2,
      }}>
        {/* 1px ink rail behind chips */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: chipPositions[0] - 28,
          width: chipPositions[4] - chipPositions[0] + 56,
          height: 1,
          backgroundColor: 'var(--color-ink)',
          opacity: 0.2,
        }} />

        {/* 5 result chips */}
        {Array.from({ length: 5 }, (_, i) => {
          const panel = results ? results[i] : null
          const isLocked = locked[i]
          const isSettled = settled ? (settled[i] ?? false) : false
          const showResult = (isSettled && panel != null) || (isLocked && panel != null)

          const chipW = 48
          const left = chipPositions[i] - chipW / 2

          if (!showResult) {
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left,
                  top: 0,
                  width: chipW,
                  height: CHIP_HEIGHT,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: 8,
                  color: 'var(--color-ink-mid)',
                  border: '1px solid var(--color-ink)',
                  opacity: 0.3,
                  backgroundColor: 'var(--color-paper)',
                  boxSizing: 'border-box',
                }}
              >
                --
              </div>
            )
          }

          const label = formatPanel(panel)
          const color = panel ? SYMBOL_COLOR[panel.symbol] : 'var(--color-ink)'
          const isHighlighted = highlighted?.[i] ?? false
          const symbolColor = panel ? SYMBOL_COLOR[panel.symbol] : 'var(--color-ink)'

          // When highlighted (during resolution), chip inverts — bold symbol-colored
          // fill with paper text — so it's unmistakable which panels contributed.
          const border = isLocked
            ? '2px solid #6D28D9'
            : isHighlighted && panel
              ? `2px solid ${symbolColor}`
              : '1px solid var(--color-ink)'
          const bg = isHighlighted && panel
            ? symbolColor
            : 'var(--color-paper)'
          const textColor = isHighlighted && panel ? 'var(--color-paper)' : color

          return (
            <div
              key={i}
              onClick={onLockWheel ? () => onLockWheel(i) : undefined}
              style={{
                position: 'absolute',
                left,
                top: 0,
                width: chipW,
                height: CHIP_HEIGHT,
                border,
                backgroundColor: bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: 8,
                fontWeight: isHighlighted ? 700 : 400,
                color: textColor,
                cursor: onLockWheel ? 'pointer' : 'default',
                userSelect: 'none',
                boxSizing: 'border-box',
                transition: 'border 80ms, background-color 80ms, color 80ms',
                animation: isHighlighted && panel ? 'chip-highlight-pulse 400ms steps(3, end) 1' : undefined,
              }}
            >
              {label}
            </div>
          )
        })}
      </div>

      {/* 3D wheel drums (top 30px) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 520,
        height: DRUM_AREA_HEIGHT,
      }}>
        <div style={{
          width: canvasW,
          height: canvasH,
          transform: `scale(${inverseScale})`,
          transformOrigin: 'top left',
        }}>
          <Canvas
            orthographic
            camera={{ zoom, position: [0, 0, 5], near: 0.1, far: 100 }}
            gl={{ alpha: true, antialias: false }}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={1.2} />
            <directionalLight position={[0, 1, 2]} intensity={0.8} />
            {/* Axle connecting all drums */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.04, 0.04, DRUM_OFFSETS[4] - DRUM_OFFSETS[0] + 0.8, 8]} />
              <meshBasicMaterial color={0x1e293b} />
            </mesh>
            {drums.map((drum, i) => (
              <group key={i} position={[DRUM_OFFSETS[i], 0, 0]}>
                <WheelDrum
                  wheelIndex={i}
                  rotation={drum.rotation}
                  locked={locked[i]}
                  onClick={onLockWheel ? () => onLockWheel(i) : undefined}
                />
              </group>
            ))}
          </Canvas>
        </div>
      </div>

      {/* Hopping selection arrows — point inward toward the drums */}
      <div
        style={{
          position: 'absolute',
          left: leftArrowX,
          top: ARROW_Y - Math.floor(ARROW_H / 2),
          pointerEvents: 'none',
          zIndex: 1,
          animation: arrowAnimL,
        }}
      >
        <PixelArrow confirmed={isConfirmed} direction="left" />
      </div>
      <div
        style={{
          position: 'absolute',
          left: rightArrowX,
          top: ARROW_Y - Math.floor(ARROW_H / 2),
          pointerEvents: 'none',
          zIndex: 1,
          animation: arrowAnimR,
        }}
      >
        <PixelArrow confirmed={isConfirmed} direction="right" />
      </div>

    </div>
  )
}
