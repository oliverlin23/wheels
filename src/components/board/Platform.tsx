import type { HeroState } from '../../game/types'
import { getStats } from '../../game/rules/figurines'

const XP_THRESHOLD = 10

type PlatformProps = {
  hero: HeroState
}

const RANK_COLORS: Record<string, string> = {
  bronze: 'var(--color-rank-bronze)',
  silver: 'var(--color-rank-silver)',
  gold: 'var(--color-rank-gold)',
}

const SLOT_COLORS: Record<string, string> = {
  squares: 'var(--color-square-gold)',
  diamonds: 'var(--color-diamond-teal)',
}

function BarSegments({
  filled,
  total,
  label,
}: {
  filled: number
  total: number
  label: string
}) {
  const segments = []
  for (let i = 0; i < total; i++) {
    segments.push(
      <div
        key={i}
        style={{
          width: 4,
          height: 4,
          backgroundColor: i < filled ? 'var(--color-ink)' : 'var(--color-ink)',
          opacity: i < filled ? 1 : 0.15,
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
        color: 'var(--color-ink)',
      }}
    >
      <span
        style={{
          width: 24,
          textAlign: 'right',
          fontSize: 7,
          color: 'var(--color-ink-mid)',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', gap: 1, marginLeft: 2 }}>{segments}</div>
      <span style={{ marginLeft: 2 }}>
        {String(filled).padStart(2, '0')}/{String(total).padStart(2, '0')}
      </span>
    </div>
  )
}

export default function Platform({ hero }: PlatformProps) {
  const stats = getStats(hero.name, hero.rank)
  const rankColor = RANK_COLORS[hero.rank]
  const slotColor = SLOT_COLORS[hero.slot]

  return (
    <div
      style={{
        width: 80,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Placeholder figurine rectangle */}
      <div
        style={{
          width: 16,
          height: 16,
          backgroundColor: slotColor,
          opacity: 0.3,
          border: '1px dashed var(--color-ink)',
          position: 'relative',
          zIndex: 2,
          marginBottom: -2,
        }}
      />

      {/* Oval pedestal */}
      <div
        style={{
          width: 40,
          height: 10,
          borderRadius: '50%',
          backgroundColor: 'var(--color-paper-dim)',
          border: `1px solid ${rankColor}`,
          position: 'relative',
          zIndex: 1,
        }}
      />

      {/* Figurine name */}
      <div
        style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 8,
          fontFeatureSettings: '"tnum"',
          color: 'var(--color-ink)',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginTop: 4,
        }}
      >
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
        />
        <BarSegments filled={hero.xp} total={XP_THRESHOLD} label="XP" />
      </div>
    </div>
  )
}
