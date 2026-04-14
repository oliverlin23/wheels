import { useEffect, useRef, useState, type CSSProperties, type FC } from 'react'
import { useLogStore } from '../../store/log'
import type { LogEvent } from '../../game/types'

type ResolutionLogProps = {
  maxHeight?: number
  hidden?: boolean
}

const EVENT_COLORS: Record<string, string> = {
  damage: 'var(--color-red-ink)',
  heal: 'var(--color-blue-ink)',
  bomb: 'var(--color-bypass-magenta)',
  rank_up: 'var(--color-rank-gold)',
  game_over: 'var(--color-midline-violet)',
}

const CHAR_INTERVAL = 20
const BLINK_INTERVAL = 600

function getEventColor(type: LogEvent['type']): string {
  return EVENT_COLORS[type] ?? 'var(--color-ink-mid)'
}

export const ResolutionLog: FC<ResolutionLogProps> = ({
  maxHeight = 200,
  hidden = false,
}) => {
  const events = useLogStore((s) => s.events)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Track how many events have been fully typed and how far into the current one we are
  const [typedCount, setTypedCount] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [cursorVisible, setCursorVisible] = useState(true)

  // Typing effect: advance one character at a time through the queue
  useEffect(() => {
    if (typedCount >= events.length) return

    const currentEvent = events[typedCount]
    if (charIndex >= currentEvent.detail.length) {
      // This event is fully typed, move to the next
      setTypedCount((c) => c + 1)
      setCharIndex(0)
      return
    }

    const timer = setTimeout(() => {
      setCharIndex((i) => i + 1)
    }, CHAR_INTERVAL)

    return () => clearTimeout(timer)
  }, [typedCount, charIndex, events])

  // Blinking cursor
  useEffect(() => {
    const timer = setInterval(() => {
      setCursorVisible((v) => !v)
    }, BLINK_INTERVAL)
    return () => clearInterval(timer)
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [typedCount, charIndex])

  const containerStyle: CSSProperties = {
    height: hidden ? 0 : maxHeight,
    overflow: 'hidden',
    transition: 'height 200ms ease',
    background: 'var(--color-paper-dim)',
    border: '1px solid var(--color-ink)',
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: 8,
    fontWeight: 400,
    fontFeatureSettings: '"tnum"',
    lineHeight: '14px',
  }

  const scrollStyle: CSSProperties = {
    height: '100%',
    overflowY: 'auto',
    padding: '4px 6px',
    scrollbarWidth: 'thin',
    scrollbarColor: 'var(--color-ink-mid) transparent',
  }

  const isTyping = typedCount < events.length

  return (
    <div style={containerStyle}>
      <div ref={scrollRef} style={scrollStyle}>
        {/* Fully typed lines */}
        {events.slice(0, typedCount).map((event, i) => (
          <div key={i} style={{ color: getEventColor(event.type), whiteSpace: 'pre-wrap' }}>
            <span style={{ color: 'var(--color-ink-mid)' }}>{'> '}</span>
            {event.detail}
          </div>
        ))}

        {/* Currently typing line */}
        {isTyping && (
          <div
            style={{
              color: getEventColor(events[typedCount].type),
              whiteSpace: 'pre-wrap',
            }}
          >
            <span style={{ color: 'var(--color-ink-mid)' }}>{'> '}</span>
            {events[typedCount].detail.slice(0, charIndex)}
            <span
              style={{
                opacity: cursorVisible ? 1 : 0,
                color: getEventColor(events[typedCount].type),
              }}
            >
              _
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
