'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Droplets, CheckCircle2 } from 'lucide-react'

interface WaterButtonProps {
  currentMl: number
  targetMl: number
}

export function WaterButton({ currentMl, targetMl }: WaterButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<250 | 500 | null>(null)
  const [justAdded, setJustAdded] = useState<250 | 500 | null>(null)

  async function add(ml: 250 | 500) {
    if (loading) return
    setLoading(ml)
    try {
      await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ml }),
      })
      setJustAdded(ml)
      router.refresh()
      setTimeout(() => setJustAdded(null), 2000)
    } finally {
      setLoading(null)
    }
  }

  const pct = Math.min(100, Math.round((currentMl / targetMl) * 100))
  const done = pct >= 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ flex: 1, height: '5px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`, height: '100%', borderRadius: '3px',
            background: done ? 'var(--accent-green)' : 'var(--accent-blue)',
            transition: 'width 0.4s ease',
          }} />
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          {pct}%
        </span>
      </div>

      {/* Buttons */}
      {done ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)', fontSize: '12px', fontWeight: 600 }}>
          <CheckCircle2 size={14} />
          Cel osiągnięty!
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '6px' }}>
          {([250, 500] as const).map(ml => (
            <button
              key={ml}
              onClick={() => add(ml)}
              disabled={loading !== null}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '7px 12px', borderRadius: '8px',
                background: justAdded === ml ? 'rgba(52,199,89,0.12)' : 'rgba(0,122,255,0.08)',
                border: `1px solid ${justAdded === ml ? 'rgba(52,199,89,0.3)' : 'rgba(0,122,255,0.2)'}`,
                cursor: loading !== null ? 'not-allowed' : 'pointer',
                fontSize: '12px', fontWeight: 600,
                color: justAdded === ml ? 'var(--accent-green)' : 'var(--accent-blue)',
                fontFamily: 'inherit', transition: 'all 0.15s',
                opacity: loading !== null && loading !== ml ? 0.5 : 1,
              }}
            >
              <Droplets size={12} />
              {loading === ml ? '...' : justAdded === ml ? 'Dodano!' : `+${ml}ml`}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
