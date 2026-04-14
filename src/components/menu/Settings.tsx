import { useSettingsStore } from '../../store/settings'

type SettingsProps = {
  onBack: () => void
}

const TOGGLE_ROWS: { key: 'reducedMotion' | 'focusMode' | 'nightPrint'; label: string }[] = [
  { key: 'reducedMotion', label: 'REDUCED MOTION' },
  { key: 'focusMode', label: 'FOCUS MODE' },
  { key: 'nightPrint', label: 'NIGHT PRINT' },
]

export function Settings({ onBack }: SettingsProps) {
  const { reducedMotion, focusMode, nightPrint, toggle } = useSettingsStore()

  const values: Record<string, boolean> = { reducedMotion, focusMode, nightPrint }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'var(--color-paper)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
      }}
    >
      <h1
        style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '14px',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: 'var(--color-ink)',
          letterSpacing: '0.1em',
        }}
      >
        SETTINGS
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '280px' }}>
        {TOGGLE_ROWS.map(({ key, label }) => (
          <div
            key={key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '9px',
              color: 'var(--color-ink)',
            }}
          >
            <span>{label}</span>
            <button
              onClick={() => toggle(key)}
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '9px',
                border: '1px solid var(--color-ink)',
                background: 'var(--color-paper)',
                color: 'var(--color-ink)',
                padding: '4px 10px',
                cursor: 'pointer',
                borderRadius: '0px',
                minWidth: '50px',
              }}
            >
              [ {values[key] ? 'ON' : 'OFF'} ]
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onBack}
        style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '10px',
          textTransform: 'uppercase',
          border: '1px solid var(--color-ink)',
          background: 'var(--color-paper)',
          color: 'var(--color-ink)',
          padding: '10px 24px',
          cursor: 'pointer',
          borderRadius: '0px',
          marginTop: '8px',
        }}
      >
        [ BACK ]
      </button>
    </div>
  )
}
