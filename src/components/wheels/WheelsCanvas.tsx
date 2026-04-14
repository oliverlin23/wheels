import { Canvas } from '@react-three/fiber'
import { WheelDrum } from './WheelDrum'
import type { DrumState } from './useSpinAnimation'

type WheelsCanvasProps = {
  drums: DrumState[]
  locked: [boolean, boolean, boolean, boolean, boolean]
  stageScale?: number
}

const DRUM_SPACING = 1.1
const DRUM_OFFSETS = [-2, -1, 0, 1, 2].map((i) => i * DRUM_SPACING)

export function WheelsCanvas({ drums, locked, stageScale = 1 }: WheelsCanvasProps) {
  // Counter-scale to undo the parent Stage's CSS transform.
  // The Canvas measures its actual pixel size for the WebGL viewport,
  // so we need to render at 1:1 scale and let CSS transform handle upscaling.
  const inverseScale = 1 / stageScale
  const canvasW = 480 * stageScale
  const canvasH = 32 * stageScale

  return (
    <div style={{
      width: 480,
      height: 32,
      overflow: 'hidden',
    }}>
      <div style={{
        width: canvasW,
        height: canvasH,
        transform: `scale(${inverseScale})`,
        transformOrigin: 'top left',
      }}>
        <Canvas
          orthographic
          camera={{ zoom: 28 * stageScale, position: [0, 0, 5], near: 0.1, far: 100 }}
          gl={{ alpha: true, antialias: false }}
          style={{ background: 'transparent' }}
        >
      <ambientLight intensity={0.8} />
      {drums.map((drum, i) => (
        <group key={i} position={[DRUM_OFFSETS[i], 0, 0]}>
          <WheelDrum
            wheelIndex={i}
            rotation={drum.rotation}
            locked={locked[i]}
          />
        </group>
      ))}
        </Canvas>
      </div>
    </div>
  )
}
