import { useState, useEffect } from 'react'

type MainMenuProps = {
  onNewMatch: () => void
  onSettings: () => void
}

const WORDMARK = 'WHEELS'

export function MainMenu({ onNewMatch, onSettings }: MainMenuProps) {
  const [visibleChars, setVisibleChars] = useState(0)

  useEffect(() => {
    if (visibleChars >= WORDMARK.length) return
    const delay = 400 / WORDMARK.length
    const timer = setTimeout(() => setVisibleChars((c) => c + 1), delay)
    return () => clearTimeout(timer)
  }, [visibleChars])

  const baseButton: React.CSSProperties = {
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    border: '1px solid var(--color-ink)',
    background: 'var(--color-paper)',
    color: 'var(--color-ink)',
    padding: '10px 32px',
    cursor: 'pointer',
    borderRadius: '0px',
  }

  const importantButton: React.CSSProperties = {
    ...baseButton,
    border: '1px solid var(--color-ink)',
    outline: '1px solid var(--color-ink)',
    outlineOffset: '2px',
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: 'var(--color-paper)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontSize: '32px',
            fontWeight: 700,
            color: 'var(--color-ink)',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}
        >
          {WORDMARK.slice(0, visibleChars)}
          <span style={{ opacity: visibleChars < WORDMARK.length ? 1 : 0 }}>_</span>
        </h1>

        <p
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '8px',
            color: 'var(--color-ink-mid)',
            marginBottom: '40px',
          }}
        >
          a turn-based game of spinning reels
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
          <button style={importantButton} onClick={onNewMatch}>
            [ ONLINE MATCH ]
          </button>
          <button style={baseButton} onClick={onSettings}>
            [ SETTINGS ]
          </button>
        </div>
      </div>

      <p
        style={{
          position: 'absolute',
          bottom: '16px',
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '7px',
          color: 'var(--color-ink-mid)',
        }}
      >
        v0.1
      </p>
    </div>
  )
}
