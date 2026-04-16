import { useState } from 'react'
import type { CSSProperties } from 'react'

type Page = 'overview' | 'wheels' | 'heroes' | 'resolution' | 'defense' | 'energy'

const PAGES: { key: Page; label: string }[] = [
  { key: 'overview', label: 'HOW TO PLAY' },
  { key: 'wheels', label: 'WHEELS' },
  { key: 'heroes', label: 'HEROES' },
  { key: 'resolution', label: 'RESOLUTION' },
  { key: 'defense', label: 'DEFENSE' },
  { key: 'energy', label: 'ENERGY & XP' },
]

const mono: CSSProperties = {
  fontFamily: '"IBM Plex Mono", monospace',
  fontFeatureSettings: '"tnum"',
}

const heading: CSSProperties = {
  ...mono,
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-ink)',
  marginBottom: 6,
}

const body: CSSProperties = {
  ...mono,
  fontSize: 8,
  color: 'var(--color-ink)',
  lineHeight: 1.6,
}

const sub: CSSProperties = {
  ...mono,
  fontSize: 8,
  fontWeight: 700,
  color: 'var(--color-ink)',
  marginTop: 10,
  marginBottom: 4,
  textTransform: 'uppercase',
}

const dim: CSSProperties = {
  ...mono,
  fontSize: 7,
  color: 'var(--color-ink-mid)',
  lineHeight: 1.5,
}

function Td({ children, bold }: { children: React.ReactNode; bold?: boolean }) {
  return (
    <td style={{ ...mono, fontSize: 7, padding: '2px 6px', borderBottom: '1px solid rgba(15,23,42,0.08)', fontWeight: bold ? 700 : 400, color: 'var(--color-ink)' }}>
      {children}
    </td>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ ...mono, fontSize: 7, padding: '2px 6px', textAlign: 'left', borderBottom: '1px solid var(--color-ink)', fontWeight: 700, color: 'var(--color-ink-mid)', textTransform: 'uppercase' }}>
      {children}
    </th>
  )
}

function OverviewPage() {
  return (
    <div>
      <div style={heading}>HOW TO PLAY</div>
      <p style={body}>
        WHEELS is a simultaneous turn-based game. Both players spin 5 wheel drums each round to generate symbols,
        then the results are revealed and resolved at the same time.
      </p>
      <div style={sub}>GOAL</div>
      <p style={body}>
        Reduce your opponent's Crown HP to 0. Each player starts with 10 HP and 2 chosen heroes.
      </p>
      <div style={sub}>EACH ROUND</div>
      <ol style={{ ...body, paddingLeft: 16 }}>
        <li>SPIN your 5 wheels (up to 3 spins per round)</li>
        <li>LOCK wheels you want to keep between spins</li>
        <li>CONFIRM when satisfied with your results</li>
        <li>Both players' wheels are REVEALED simultaneously</li>
        <li>Results are RESOLVED in a fixed order</li>
      </ol>
      <div style={sub}>HERO SLOTS</div>
      <p style={body}>
        Your first hero is in the SUN slot, your second in the MOON slot.
        Sun symbols power your SUN hero, moon symbols power your MOON hero.
      </p>
    </div>
  )
}

function WheelsPage() {
  return (
    <div>
      <div style={heading}>WHEELS</div>
      <p style={body}>
        Each drum has 8 panels. On each spin, unlocked drums rotate to a random panel.
      </p>
      <div style={sub}>SYMBOLS</div>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 8 }}>
        <thead><tr><Th>SYMBOL</Th><Th>EFFECT</Th></tr></thead>
        <tbody>
          <tr><Td bold>SUN</Td><Td>Gives energy to your SUN-slot hero</Td></tr>
          <tr><Td bold>MOON</Td><Td>Gives energy to your MOON-slot hero</Td></tr>
          <tr><Td bold>SHIELD</Td><Td>3+ shields build bulwark defense</Td></tr>
        </tbody>
      </table>
      <div style={sub}>COUNTS</div>
      <p style={body}>
        Some panels show 2 symbols (e.g. SUN2). These count as 2 of that symbol.
      </p>
      <div style={sub}>XP PANELS</div>
      <p style={body}>
        Panels with a golden background (marked with +) grant XP to the matching hero.
        SUN+ gives XP to your SUN hero, MON+ to your MOON hero.
      </p>
      <div style={sub}>LOCKING</div>
      <p style={body}>
        Click a drum or its result chip to lock/unlock it. Locked drums keep their result
        on the next spin. You have 3 spins per round to find the best combination.
      </p>
    </div>
  )
}

function HeroesPage() {
  return (
    <div>
      <div style={heading}>HEROES</div>
      <p style={body}>
        Each player picks 2 heroes before the match. Heroes gain energy from wheel symbols
        and activate when they have enough energy.
      </p>

      <div style={sub}>WARRIOR — GROUND FIGHTER</div>
      <p style={dim}>Hits bulwark if it exists, otherwise crown. Simple and powerful.</p>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 6 }}>
        <thead><tr><Th>RANK</Th><Th>COST</Th><Th>CROWN</Th><Th>BULWARK</Th></tr></thead>
        <tbody>
          <tr><Td>BRONZE</Td><Td>3</Td><Td>3</Td><Td>3</Td></tr>
          <tr><Td>SILVER</Td><Td>3</Td><Td>5</Td><Td>5</Td></tr>
          <tr><Td>GOLD</Td><Td>3</Td><Td>7</Td><Td>5</Td></tr>
        </tbody>
      </table>

      <div style={sub}>MAGE — TWO FIREBALLS</div>
      <p style={dim}>Ground fireball blocked by bulwark. High fireball always hits crown.</p>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 6 }}>
        <thead><tr><Th>RANK</Th><Th>COST</Th><Th>GND CR</Th><Th>GND BW</Th><Th>HIGH CR</Th></tr></thead>
        <tbody>
          <tr><Td>BRONZE</Td><Td>5</Td><Td>2</Td><Td>2</Td><Td>1</Td></tr>
          <tr><Td>SILVER</Td><Td>4</Td><Td>4</Td><Td>3</Td><Td>2</Td></tr>
          <tr><Td>GOLD</Td><Td>4</Td><Td>6</Td><Td>4</Td><Td>3</Td></tr>
        </tbody>
      </table>

      <div style={sub}>ARCHER — CONDITIONAL RANGE</div>
      <p style={dim}>Hits crown when bulwark {'<'} 3, hits bulwark when bulwark {'≥'} 3.</p>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 6 }}>
        <thead><tr><Th>RANK</Th><Th>COST</Th><Th>CROWN</Th><Th>BULWARK</Th></tr></thead>
        <tbody>
          <tr><Td>BRONZE</Td><Td>4</Td><Td>3</Td><Td>1</Td></tr>
          <tr><Td>SILVER</Td><Td>3</Td><Td>4</Td><Td>2</Td></tr>
          <tr><Td>GOLD</Td><Td>3</Td><Td>6</Td><Td>3</Td></tr>
        </tbody>
      </table>

      <div style={sub}>ENGINEER — ATTACK + DEFEND</div>
      <p style={dim}>Attacks opponent (blocked by bulwark), then builds own bulwark +2.</p>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 6 }}>
        <thead><tr><Th>RANK</Th><Th>COST</Th><Th>CROWN</Th><Th>BULWARK</Th><Th>+BW</Th></tr></thead>
        <tbody>
          <tr><Td>BRONZE</Td><Td>4</Td><Td>1</Td><Td>3</Td><Td>+2</Td></tr>
          <tr><Td>SILVER</Td><Td>4</Td><Td>2</Td><Td>5</Td><Td>+2</Td></tr>
          <tr><Td>GOLD</Td><Td>3</Td><Td>4</Td><Td>5</Td><Td>+2</Td></tr>
        </tbody>
      </table>

      <div style={sub}>ASSASSIN — BYPASS + DISRUPT</div>
      <p style={dim}>Always hits crown. Delays opponent's strongest hero. Strips 1 bulwark.</p>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 6 }}>
        <thead><tr><Th>RANK</Th><Th>COST</Th><Th>CROWN</Th><Th>DELAY</Th><Th>STRIP</Th></tr></thead>
        <tbody>
          <tr><Td>BRONZE</Td><Td>3</Td><Td>1</Td><Td>1</Td><Td>1</Td></tr>
          <tr><Td>SILVER</Td><Td>3</Td><Td>2</Td><Td>1</Td><Td>1</Td></tr>
          <tr><Td>GOLD</Td><Td>3</Td><Td>2</Td><Td>2</Td><Td>1</Td></tr>
        </tbody>
      </table>

      <div style={sub}>PRIEST — HEALER + SUPPORT</div>
      <p style={dim}>Heals own crown (max 12). Grants energy to partner hero.</p>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 6 }}>
        <thead><tr><Th>RANK</Th><Th>COST</Th><Th>HEAL</Th><Th>GRANT</Th></tr></thead>
        <tbody>
          <tr><Td>BRONZE</Td><Td>4</Td><Td>1</Td><Td>1</Td></tr>
          <tr><Td>SILVER</Td><Td>3</Td><Td>1</Td><Td>1</Td></tr>
          <tr><Td>GOLD</Td><Td>3</Td><Td>2</Td><Td>2</Td></tr>
        </tbody>
      </table>
    </div>
  )
}

function ResolutionPage() {
  return (
    <div>
      <div style={heading}>RESOLUTION ORDER</div>
      <p style={body}>
        After both players confirm, wheels are revealed and resolved.
        Each player's wheels are processed in this order:
      </p>
      <ol style={{ ...body, paddingLeft: 16 }}>
        <li style={{ marginBottom: 4 }}><b>PANEL XP</b> — Heroes gain XP from matching starry panels</li>
        <li style={{ marginBottom: 4 }}><b>SHIELDS</b> — 3+ shield symbols build bulwark (gained = count - 2)</li>
        <li style={{ marginBottom: 4 }}><b>ENERGY</b> — Sun/moon symbols give energy to matching heroes</li>
        <li style={{ marginBottom: 4 }}><b>ASSASSIN</b> — Activates first (priority)</li>
        <li style={{ marginBottom: 4 }}><b>PRIEST</b> — Activates second (priority)</li>
        <li style={{ marginBottom: 4 }}><b>ENGINEER</b> — Activates third (priority)</li>
        <li style={{ marginBottom: 4 }}><b>BOMBS (4-6)</b> — Rank-up bombs from steps 4-6 resolve</li>
        <li style={{ marginBottom: 4 }}><b>WARRIOR / MAGE / ARCHER</b> — Remaining heroes activate</li>
        <li style={{ marginBottom: 4 }}><b>BOMBS (8)</b> — Rank-up bombs from step 8 resolve</li>
        <li style={{ marginBottom: 4 }}><b>HP CHECK</b> — Both crowns checked simultaneously. 0 HP = loss. Both 0 = tie.</li>
      </ol>
      <div style={sub}>PROCESSING ORDER</div>
      <p style={body}>
        Player 1's wheels resolve first (attacking Player 2), then Player 2's wheels resolve
        (attacking Player 1). The HP check happens after both are done.
      </p>
    </div>
  )
}

function DefensePage() {
  return (
    <div>
      <div style={heading}>DEFENSE — BULWARK</div>
      <p style={body}>
        Bulwark is a shield wall (0-5) that absorbs damage before your crown.
      </p>
      <div style={sub}>BUILDING BULWARK</div>
      <p style={body}>
        Roll 3+ shield symbols on your wheels. Bulwark gained = shield count - 2.
        Example: 4 shields = +2 bulwark. Max 5.
      </p>
      <div style={sub}>DECAY</div>
      <p style={body}>
        At the start of each round, every player's bulwark decreases by 1 (min 0).
        You must keep building it to maintain defense.
      </p>
      <div style={sub}>ATTACK INTERACTIONS</div>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead><tr><Th>HERO</Th><Th>VS BULWARK</Th></tr></thead>
        <tbody>
          <tr><Td bold>WARRIOR</Td><Td>Blocked — hits bulwark instead of crown</Td></tr>
          <tr><Td bold>MAGE (GND)</Td><Td>Blocked — hits bulwark instead of crown</Td></tr>
          <tr><Td bold>MAGE (HIGH)</Td><Td>BYPASSES — always hits crown</Td></tr>
          <tr><Td bold>ARCHER</Td><Td>{'Bulwark < 3: hits crown. Bulwark ≥ 3: hits bulwark'}</Td></tr>
          <tr><Td bold>ENGINEER</Td><Td>Blocked — hits bulwark. Also builds own bulwark +2</Td></tr>
          <tr><Td bold>ASSASSIN</Td><Td>BYPASSES — always hits crown. Also strips 1 bulwark</Td></tr>
        </tbody>
      </table>
    </div>
  )
}

function EnergyXpPage() {
  return (
    <div>
      <div style={heading}>ENERGY & XP</div>

      <div style={sub}>ENERGY</div>
      <p style={body}>
        Heroes need energy to activate. Energy comes from matching wheel symbols.
      </p>
      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 8 }}>
        <thead><tr><Th>SYMBOLS</Th><Th>ENERGY</Th></tr></thead>
        <tbody>
          <tr><Td>0-2</Td><Td>0</Td></tr>
          <tr><Td>3</Td><Td>1</Td></tr>
          <tr><Td>4</Td><Td>2</Td></tr>
          <tr><Td>5</Td><Td>3</Td></tr>
          <tr><Td>6+</Td><Td>count - 2</Td></tr>
        </tbody>
      </table>
      <p style={body}>
        Energy accumulates across rounds. When a hero activates, their energy resets to 0.
      </p>

      <div style={sub}>XP & RANK-UPS</div>
      <p style={body}>
        Heroes gain XP from starry panels (+) matching their slot and from activating (2 XP per activation).
      </p>
      <p style={body}>
        At 10 XP, a hero ranks up: Bronze {'→'} Silver {'→'} Gold. XP rolls over.
        Higher ranks have better stats and sometimes lower energy costs.
      </p>

      <div style={sub}>BOMBS</div>
      <p style={body}>
        If a Gold hero reaches 10 XP again, instead of ranking up, a BOMB triggers:
        2 damage directly to the opponent's crown (bypasses bulwark). Extremely powerful.
      </p>
    </div>
  )
}

const PAGE_CONTENT: Record<Page, () => React.ReactElement> = {
  overview: OverviewPage,
  wheels: WheelsPage,
  heroes: HeroesPage,
  resolution: ResolutionPage,
  defense: DefensePage,
  energy: EnergyXpPage,
}

export function HelpModal({ onClose }: { onClose: () => void }) {
  const [page, setPage] = useState<Page>('overview')
  const Content = PAGE_CONTENT[page]

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(237, 231, 214, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 480,
          height: 320,
          border: '1px solid var(--color-ink)',
          background: 'var(--color-paper)',
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* Sidebar */}
        <div style={{
          width: 100,
          borderRight: '1px solid var(--color-ink)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}>
          {PAGES.map(({ key, label }) => (
            <div
              key={key}
              onClick={() => setPage(key)}
              style={{
                ...mono,
                fontSize: 7,
                padding: '8px 8px',
                cursor: 'pointer',
                userSelect: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                backgroundColor: page === key ? 'var(--color-ink)' : 'transparent',
                color: page === key ? 'var(--color-paper)' : 'var(--color-ink)',
                borderBottom: '1px solid rgba(15,23,42,0.1)',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: 14,
          overflow: 'auto',
        }}>
          <Content />
        </div>

        {/* Close button */}
        <div
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 4,
            right: 6,
            ...mono,
            fontSize: 9,
            color: 'var(--color-ink-mid)',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          [X]
        </div>
      </div>
    </div>
  )
}
