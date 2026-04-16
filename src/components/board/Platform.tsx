import type { HeroState } from '../../game/types'
import { getStats } from '../../game/rules/figurines'
import { Sprite } from '../Sprite'
import atlas from '../../sprites/atlas.json'

const XP_THRESHOLD = 10

type PlatformProps = {
  hero: HeroState
}

const SLOT_COLORS: Record<string, string> = {
  suns: 'var(--color-sun-gold)',
  moons: 'var(--color-moon-teal)',
}

const SLOT_GLYPHS: Record<string, string> = {
  suns: '☉',
  moons: '☾',
}

function BarSegments({
  filled,
  total,
  label,
  accentColor,
}: {
  filled: number
  total: number
  label: string
  accentColor?: string
}) {
  const segments = []
  for (let i = 0; i < total; i++) {
    const isFilled = i < filled
    segments.push(
      <div
        key={i}
        style={{
          width: 4,
          height: 4,
          backgroundColor: isFilled ? (accentColor ?? 'var(--color-ink)') : 'var(--color-ink)',
          opacity: isFilled ? 1 : 0.1,
        }}
      />,
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 7,
        fontFeatureSettings: '"tnum"',
        color: 'var(--color-ink-mid)',
      }}
    >
      <span
        style={{
          width: 20,
          textAlign: 'right',
          fontSize: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          opacity: 0.7,
        }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', gap: 1, marginLeft: 2 }}>{segments}</div>
      <span style={{ marginLeft: 2, color: 'var(--color-ink)', fontSize: 7 }}>
        {String(filled).padStart(2, '0')}/{String(total).padStart(2, '0')}
      </span>
    </div>
  )
}

export default function Platform({ hero }: PlatformProps) {
  const stats = getStats(hero.name, hero.rank)
  const slotColor = SLOT_COLORS[hero.slot] ?? 'var(--color-ink-mid)'
  const slotGlyph = SLOT_GLYPHS[hero.slot] ?? ''

  return (
    <div
      style={{
        width: 86,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Figurine sprite */}
      <div style={{ position: 'relative', zIndex: 2, marginBottom: -2 }}>
        <Sprite
          src={`/sprites/${hero.name}.png`}
          frame={(atlas as Record<string, Record<string, { x: number; y: number; w: number; h: number }>>)[hero.name]['idle']}
        />
      </div>

      {/* Oval pedestal — slot-colored (sun=gold, moon=teal) */}
      <div
        style={{
          width: 44,
          height: 10,
          borderRadius: '50%',
          backgroundColor: 'var(--color-paper-dim)',
          border: `1px solid ${slotColor}`,
          position: 'relative',
          zIndex: 1,
        }}
      />

      {/* Hero name with slot glyph */}
      <div
        style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 8,
          fontWeight: 700,
          color: 'var(--color-ink)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginTop: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <span style={{ color: slotColor, fontSize: 9, lineHeight: 1 }}>{slotGlyph}</span>
        {hero.name}
      </div>

      {/* Resource readouts */}
      <div
        style={{
          marginTop: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <BarSegments
          filled={hero.energy}
          total={stats.energyCost}
          label="NRG"
          accentColor={slotColor}
        />
        <BarSegments filled={hero.xp} total={XP_THRESHOLD} label="XP" />
      </div>
    </div>
  )
}
