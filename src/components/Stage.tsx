import { useEffect, useRef, useState } from 'react'
import { BoardChassis } from './board/BoardChassis'
import type { ClientMessage } from '../network/protocol'

const BASE_W = 480
const BASE_H = 320

function useStageScale(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    function update() {
      const el = containerRef.current
      if (!el) return
      const sx = el.clientWidth / BASE_W
      const sy = el.clientHeight / BASE_H
      setScale(Math.max(1, Math.floor(Math.min(sx, sy))))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [containerRef])

  return scale
}

type StageProps = {
  send?: (msg: ClientMessage) => void
  myPlayer?: 0 | 1 | 'spectator' | null
}

export function Stage({ send, myPlayer }: StageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scale = useStageScale(containerRef)

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center bg-paper-dim"
      style={{ overflow: 'hidden', width: '100%', height: '100%' }}
    >
      <div
        style={{
          width: BASE_W,
          height: BASE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          imageRendering: 'pixelated',
          position: 'relative',
          background: '#F5F1E8',
        }}
      >
        {/* Board */}
        <BoardChassis stageScale={scale} send={send} myPlayer={myPlayer} />

        {/* 8px grid overlay */}
        <svg
          width={BASE_W}
          height={BASE_H}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
        >
          <defs>
            <pattern
              id="grid8"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 8 0 L 0 0 0 8"
                fill="none"
                stroke="#0F172A"
                strokeOpacity="0.03"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid8)" />
        </svg>
      </div>
    </div>
  )
}
