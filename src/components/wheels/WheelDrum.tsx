import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { WHEELS } from '../../game/rules/panels'
import type { PanelSymbol } from '../../game/types'

type WheelDrumProps = {
  wheelIndex: number
  rotation: number
  locked: boolean
}

const PANEL_COUNT = 8
const ANGLE_STEP = (Math.PI * 2) / PANEL_COUNT
const RADIUS = 0.5
const PLANE_WIDTH = 0.38
const PLANE_HEIGHT = 0.38

const SYMBOL_COLORS: Record<PanelSymbol, number> = {
  square: 0xd97706,   // square-gold
  diamond: 0x0f766e,  // diamond-teal
  hammer: 0x475569,   // hammer-steel
}

const XP_TINT = 0xffffff // brighter for XP panels

export function WheelDrum({ wheelIndex, rotation, locked }: WheelDrumProps) {
  const groupRef = useRef<THREE.Group>(null)
  const wheel = WHEELS[wheelIndex]

  const capMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: 0xede7d6 }),
    [],
  )

  // One colored material per face based on panel symbol
  const faceMaterials = useMemo(
    () =>
      wheel.map((panel) => {
        const baseColor = SYMBOL_COLORS[panel.symbol]
        const mat = new THREE.MeshBasicMaterial({ color: baseColor })
        if (panel.xp) {
          // Slightly brighter for XP panels
          mat.color.lerp(new THREE.Color(XP_TINT), 0.3)
        }
        return mat
      }),
    [wheel],
  )

  return (
    <group ref={groupRef} rotation={[rotation, 0, 0]}>
      {/* 8 plane faces arranged in an octagonal ring */}
      {Array.from({ length: PANEL_COUNT }, (_, i) => {
        const angle = i * ANGLE_STEP
        const y = Math.cos(angle) * RADIUS
        const z = Math.sin(angle) * RADIUS
        const faceRotation = -angle + Math.PI / 2

        return (
          <mesh
            key={i}
            position={[0, y, z]}
            rotation={[faceRotation, 0, 0]}
            material={faceMaterials[i]}
          >
            <planeGeometry args={[PLANE_WIDTH, PLANE_HEIGHT]} />
          </mesh>
        )
      })}

      {/* Left cap */}
      <mesh position={[PLANE_WIDTH / 2 + 0.01, 0, 0]} rotation={[0, 0, -Math.PI / 2]} material={capMaterial}>
        <circleGeometry args={[RADIUS, PANEL_COUNT]} />
      </mesh>

      {/* Right cap */}
      <mesh position={[-(PLANE_WIDTH / 2 + 0.01), 0, 0]} rotation={[0, 0, Math.PI / 2]} material={capMaterial}>
        <circleGeometry args={[RADIUS, PANEL_COUNT]} />
      </mesh>

      {/* Lock ring */}
      {locked && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[RADIUS + 0.05, 0.02, 4, PANEL_COUNT]} />
          <meshBasicMaterial color={0x6d28d9} />
        </mesh>
      )}
    </group>
  )
}
