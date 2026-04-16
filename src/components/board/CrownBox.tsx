import { useEffect, useRef, useState } from 'react'
import type { PlayerState } from '../../game/types'
import { Sprite } from '../Sprite'

type CrownBoxProps = {
  playerState: PlayerState
  side: 'player' | 'opponent'
}

const MAX_BULWARK = 5

export default function CrownBox({ playerState, side }: CrownBoxProps) {
  const { crownHp, bulwark } = playerState
  const isLow = crownHp < 4
  const accentColor = side === 'player' ? 'var(--color-blue-ink)' : 'var(--color-red-ink)'

  // Damage/heal flash when crownHp changes
  const prevHp = useRef(crownHp)
  const prevBulwark = useRef(bulwark)
  const [flash, setFlash] = useState<'damage' | 'heal' | null>(null)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (crownHp < prevHp.current) {
      setFlash('damage')
      setShake(true)
      const t1 = setTimeout(() => setFlash(null), 320)
      const t2 = setTimeout(() => setShake(false), 200)
      prevHp.current = crownHp
      return () => { clearTimeout(t1); clearTimeout(t2) }
    } else if (crownHp > prevHp.current) {
      setFlash('heal')
      const t1 = setTimeout(() => setFlash(null), 400)
      prevHp.current = crownHp
      return () => clearTimeout(t1)
    }
    prevHp.current = crownHp
    return undefined
  }, [crownHp])

  useEffect(() => {
    if (bulwark < prevBulwark.current) {
      setShake(true)
      const t = setTimeout(() => setShake(false), 180)
      prevBulwark.current = bulwark
      return () => clearTimeout(t)
    }
    prevBulwark.current = bulwark
    return undefined
  }, [bulwark])

  const hpColor = flash === 'damage'
    ? 'var(--color-bypass-magenta)'
    : flash === 'heal'
      ? 'var(--color-sun-gold)'
      : isLow ? 'var(--color-red-ink)' : 'var(--color-ink)'

  const boxAnim = shake
    ? 'crownbox-shake 200ms steps(4, end) both'
    : flash === 'heal'
      ? 'crownbox-heal-pulse 400ms steps(3, end) both'
      : undefined

  const bulwarkSegments = []
  for (let i = 0; i < MAX_BULWARK; i++) {
    const filled = i < bulwark
    bulwarkSegments.push(
      <div
        key={i}
        style={{
          width: 7,
          height: 4,
          backgroundColor: filled ? 'var(--color-shield-steel)' : 'var(--color-ink)',
          opacity: filled ? 1 : 0.1,
        }}
      />,
    )
  }

  return (
    <div
      style={{
        width: 76,
        height: 68,
        border: `1px solid ${flash === 'damage' ? 'var(--color-bypass-magenta)' : accentColor}`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: flash === 'damage'
          ? 'color-mix(in srgb, var(--color-bypass-magenta) 8%, var(--color-paper))'
          : flash === 'heal'
            ? 'color-mix(in srgb, var(--color-sun-gold) 10%, var(--color-paper))'
            : 'var(--color-paper)',
        transition: 'border-color 80ms, background-color 80ms',
        animation: boxAnim,
      }}
    >
      <style>{`
        @keyframes crownbox-shake {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(-2px, 1px); }
          50%  { transform: translate(2px, -1px); }
          75%  { transform: translate(-1px, 2px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes crownbox-heal-pulse {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.06); }
          100% { transform: scale(1); }
        }
      `}</style>
      {/* Inner border (double-rule effect) */}
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: 2,
          right: 2,
          bottom: 2,
          border: '1px solid var(--color-ink)',
          opacity: 0.3,
        }}
      />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Crown sprite */}
        <Sprite
          src="/sprites/crown.png"
          frame={{ x: 0, y: 0, w: 24, h: 24 }}
          style={{ width: 14, height: 14, backgroundSize: '14px 14px' }}
        />

        {/* HP number — big, bold, the hero numeral */}
        <div
          key={`hp-${crownHp}`}
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 20,
            fontWeight: 700,
            fontFeatureSettings: '"tnum"',
            color: hpColor,
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
            animation: flash ? 'crownbox-hp-pop 260ms steps(3, end) both' : undefined,
            transition: 'color 80ms',
          }}
        >
          {String(crownHp).padStart(2, '0')}
        </div>
        <style>{`
          @keyframes crownbox-hp-pop {
            0%   { transform: scale(1); }
            30%  { transform: scale(1.25); }
            100% { transform: scale(1); }
          }
        `}</style>

        {/* Bulwark bar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <div style={{ display: 'flex', gap: 1 }}>{bulwarkSegments}</div>
          <div
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 7,
              fontFeatureSettings: '"tnum"',
              color: 'var(--color-ink-mid)',
            }}
          >
            {String(bulwark).padStart(2, '0')}/{String(MAX_BULWARK).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  )
}
