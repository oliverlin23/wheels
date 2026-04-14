type MatchEndProps = {
  winner: 0 | 1 | 'tie'
  myPlayer: 0 | 1 | 'spectator' | null
  turn: number
  onPlayAgain: () => void
  onMainMenu: () => void
}

export function MatchEnd({ winner, myPlayer, turn, onPlayAgain, onMainMenu }: MatchEndProps) {
  let headline: string
  let headlineColor: string

  if (winner === 'tie') {
    headline = 'TIE GAME'
    headlineColor = 'var(--color-ink)'
  } else if (myPlayer === 'spectator' || myPlayer === null) {
    headline = `PLAYER ${winner + 1} WINS`
    headlineColor = winner === 0 ? 'var(--color-blue-ink)' : 'var(--color-red-ink)'
  } else if (winner === myPlayer) {
    headline = 'YOU WIN'
    headlineColor = myPlayer === 0 ? 'var(--color-blue-ink)' : 'var(--color-red-ink)'
  } else {
    headline = 'YOU LOSE'
    headlineColor = 'var(--color-ink-mid)'
  }

  const baseButton: React.CSSProperties = {
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: '10px',
    textTransform: 'uppercase',
    border: '1px solid var(--color-ink)',
    background: 'var(--color-paper)',
    color: 'var(--color-ink)',
    padding: '10px 24px',
    cursor: 'pointer',
    borderRadius: '0px',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(237, 231, 214, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <h1
        style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '20px',
          fontWeight: 700,
          color: headlineColor,
          letterSpacing: '0.08em',
          marginBottom: '12px',
        }}
      >
        {headline}
      </h1>

      <p
        style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '8px',
          color: 'var(--color-ink-mid)',
          marginBottom: '32px',
        }}
      >
        {turn} TURNS
      </p>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button style={baseButton} onClick={onPlayAgain}>
          [ PLAY AGAIN ]
        </button>
        <button style={baseButton} onClick={onMainMenu}>
          [ MAIN MENU ]
        </button>
      </div>
    </div>
  )
}
