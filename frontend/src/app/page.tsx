'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/auth'

const WORD = 'FAILINK'
const LETTER_DELAY = 120
const HOLD_DURATION = 800
const FADE_DURATION = 600

export default function SplashPage() {
  const router = useRouter()
  const [visibleCount, setVisibleCount] = useState(0)
  const [fading, setFading] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)

  // Type letters one by one
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    WORD.split('').forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleCount(i + 1), i * LETTER_DELAY))
    })

    const totalTyping = WORD.length * LETTER_DELAY

    // Stop cursor and start fade
    timers.push(setTimeout(() => {
      setCursorVisible(false)
      setFading(true)
    }, totalTyping + HOLD_DURATION))

    // Redirect after fade
    timers.push(setTimeout(() => {
      const token = getToken()
      router.push(token ? '/feed' : '/auth/login')
    }, totalTyping + HOLD_DURATION + FADE_DURATION))

    return () => timers.forEach(clearTimeout)
  }, [])

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0D0D0D',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_DURATION}ms ease`,
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          backgroundImage: `
            linear-gradient(rgba(245,240,232,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,240,232,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Word */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 10vw, 6rem)',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: '#F5F0E8',
            margin: 0,
          }}
        >
          {WORD.split('').map((letter, i) => (
            <span
              key={i}
              style={{
                opacity: i < visibleCount ? 1 : 0,
                transition: 'opacity 0.15s ease',
                display: 'inline-block',
              }}
            >
              {letter}
            </span>
          ))}
        </h1>

        {/* Cursor */}
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 10vw, 6rem)',
            fontWeight: 700,
            color: '#C8502A',
            opacity: cursorVisible ? 1 : 0,
            transition: 'opacity 0.1s ease',
            marginLeft: '2px',
          }}
        >
          |
        </span>
      </div>

      {/* Tagline */}
      <p
        style={{
          position: 'relative',
          zIndex: 10,
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(0.6rem, 2vw, 0.75rem)',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: '#5C5854',
          marginTop: '16px',
          opacity: visibleCount === WORD.length ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}
      >
        Share your thoughts
      </p>
    </div>
  )
}