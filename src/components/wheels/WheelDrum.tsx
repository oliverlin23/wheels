import { useMemo } from 'react'
import * as THREE from 'three'
import { WHEELS } from '../../game/rules/panels'
import type { PanelSymbol } from '../../game/types'

type WheelDrumProps = {
  wheelIndex: number
  rotation: number
  locked: boolean
  onClick?: (() => void) | undefined
}

const PANEL_COUNT = 8
const RADIUS = 0.45
const HALF_WIDTH = 0.42
const ANGLE_STEP = (Math.PI * 2) / PANEL_COUNT

// --- Module-level texture preloading (no Suspense) ---

function texturePath(symbol: PanelSymbol, count: number, xp: boolean): string {
  const countSuffix = count > 1 ? `-${count}` : ''
  return `/sprites/panel-${symbol}${countSuffix}${xp ? '-xp' : ''}.png`
}

const SYMBOLS: PanelSymbol[] = ['sun', 'moon', 'shield']
const COUNTS = [1, 2]
const ALL_TEXTURE_PATHS: string[] = []
for (const s of SYMBOLS) {
  for (const c of COUNTS) {
    ALL_TEXTURE_PATHS.push(texturePath(s, c, false))
    ALL_TEXTURE_PATHS.push(texturePath(s, c, true))
  }
}

const TEXTURE_CACHE: Record<string, THREE.Texture> = {}
const CROPPED_XP_CACHE: Record<string, THREE.Texture> = {}
const texLoader = new THREE.TextureLoader()

for (const path of ALL_TEXTURE_PATHS) {
  const tex = texLoader.load(path)
  tex.magFilter = THREE.NearestFilter
  tex.minFilter = THREE.NearestFilter
  tex.colorSpace = THREE.SRGBColorSpace
  TEXTURE_CACHE[path] = tex
}

// Cropped XP textures: remove 1px border that looks like a selection highlight
for (const path of ALL_TEXTURE_PATHS) {
  if (path.includes('-xp')) {
    const tex = TEXTURE_CACHE[path].clone()
    tex.offset.set(1 / 16, 1 / 16)
    tex.repeat.set(14 / 16, 14 / 16)
    tex.needsUpdate = true
    CROPPED_XP_CACHE[path] = tex
  }
}

// --- Custom octagonal prism geometry ---

function createOctDrumGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry()
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  let vertIndex = 0

  // --- 8 side quads ---
  // Negative angles so increasing rotation cycles faces 0→1→2→...
  for (let i = 0; i < PANEL_COUNT; i++) {
    const a0 = -(i * ANGLE_STEP)
    const a1 = -((i + 1) * ANGLE_STEP)

    const y0 = Math.cos(a0) * RADIUS
    const z0 = Math.sin(a0) * RADIUS
    const y1 = Math.cos(a1) * RADIUS
    const z1 = Math.sin(a1) * RADIUS

    // Face normal (outward, perpendicular to the face)
    const midAngle = (a0 + a1) / 2
    const ny = Math.cos(midAngle)
    const nz = Math.sin(midAngle)

    positions.push(
      -HALF_WIDTH, y0, z0,
       HALF_WIDTH, y0, z0,
       HALF_WIDTH, y1, z1,
      -HALF_WIDTH, y1, z1,
    )
    normals.push(
      0, ny, nz,
      0, ny, nz,
      0, ny, nz,
      0, ny, nz,
    )
    uvs.push(
      0, 1,
      1, 1,
      1, 0,
      0, 0,
    )

    const vi = vertIndex
    indices.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3)
    vertIndex += 4
  }

  // --- Right cap (+x) ---
  const rightCenterIdx = vertIndex
  positions.push(HALF_WIDTH, 0, 0)
  normals.push(1, 0, 0)
  uvs.push(0.5, 0.5)
  vertIndex++

  const rightRingStart = vertIndex
  for (let i = 0; i < PANEL_COUNT; i++) {
    const a = i * ANGLE_STEP
    positions.push(HALF_WIDTH, Math.cos(a) * RADIUS, Math.sin(a) * RADIUS)
    normals.push(1, 0, 0)
    uvs.push(0.5 + 0.5 * Math.cos(a), 0.5 + 0.5 * Math.sin(a))
    vertIndex++
  }

  const rightCapStart = indices.length
  for (let i = 0; i < PANEL_COUNT; i++) {
    indices.push(rightCenterIdx, rightRingStart + i, rightRingStart + ((i + 1) % PANEL_COUNT))
  }
  const rightCapCount = PANEL_COUNT * 3

  // --- Left cap (-x), wound opposite direction ---
  const leftCenterIdx = vertIndex
  positions.push(-HALF_WIDTH, 0, 0)
  normals.push(-1, 0, 0)
  uvs.push(0.5, 0.5)
  vertIndex++

  const leftRingStart = vertIndex
  for (let i = 0; i < PANEL_COUNT; i++) {
    const a = i * ANGLE_STEP
    positions.push(-HALF_WIDTH, Math.cos(a) * RADIUS, Math.sin(a) * RADIUS)
    normals.push(-1, 0, 0)
    uvs.push(0.5 + 0.5 * Math.cos(a), 0.5 + 0.5 * Math.sin(a))
    vertIndex++
  }

  const leftCapStart = indices.length
  for (let i = 0; i < PANEL_COUNT; i++) {
    indices.push(leftCenterIdx, leftRingStart + ((i + 1) % PANEL_COUNT), leftRingStart + i)
  }
  const leftCapCount = PANEL_COUNT * 3

  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)

  for (let i = 0; i < PANEL_COUNT; i++) {
    geo.addGroup(i * 6, 6, i)
  }
  geo.addGroup(rightCapStart, rightCapCount, 8)
  geo.addGroup(leftCapStart, leftCapCount, 9)

  return geo
}

// Shared geometry
const drumGeometry = createOctDrumGeometry()

// Outline hull: inverted-normal copy of drum, rendered slightly larger behind the real mesh.
// Only the back faces are visible (front faces culled), creating a solid outline effect.
const outlineHullMaterial = new THREE.MeshBasicMaterial({
  color: 0x1e293b,
  side: THREE.BackSide,
})
const lockedOutlineHullMaterial = new THREE.MeshBasicMaterial({
  color: 0x6d28d9,
  side: THREE.BackSide,
})
const OUTLINE_SCALE_YZ = 1.07
const OUTLINE_SCALE_X = 1.10

const capMaterial = new THREE.MeshBasicMaterial({ color: 0xe2dccb })

export function WheelDrum({ wheelIndex, rotation, locked, onClick }: WheelDrumProps) {
  const wheel = WHEELS[wheelIndex]

  // 10-element material array: [face0..face7, rightCap, leftCap]
  const materials = useMemo(() => {
    const faceMats = wheel.map((panel) => {
      const path = texturePath(panel.symbol, panel.count, panel.xp)
      const tex = panel.xp ? (CROPPED_XP_CACHE[path] ?? TEXTURE_CACHE[path]) : TEXTURE_CACHE[path]
      return new THREE.MeshBasicMaterial({ map: tex })
    })
    return [...faceMats, capMaterial, capMaterial]
  }, [wheel])

  return (
    <group rotation={[0, 0.1, 0]}>
      <group rotation={[rotation, 0, 0]}>
        {/* Outline hull — slightly larger back-face-only mesh behind the real drum */}
        <mesh
          geometry={drumGeometry}
          material={locked ? lockedOutlineHullMaterial : outlineHullMaterial}
          scale={[OUTLINE_SCALE_X, OUTLINE_SCALE_YZ, OUTLINE_SCALE_YZ]}
        />

        {/* Solid octagonal prism — clickable to lock/unlock */}
        <mesh
          geometry={drumGeometry}
          material={materials}
          {...(onClick ? { onClick: (e: { stopPropagation: () => void }) => { e.stopPropagation(); onClick() } } : {})}
        />
      </group>
    </group>
  )
}
