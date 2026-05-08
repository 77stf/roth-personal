'use client'

import type { TransportRecommendation, BusRoute } from '@/lib/types'

interface TransportCardProps {
  rec: TransportRecommendation
}

export function TransportCard({ rec }: TransportCardProps) {
  const { safe, fast, leaveHomeAt, firstLessonAt } = rec

  return (
    <div className="card" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <span style={{ fontSize: '18px' }}>🚌</span>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>Transport</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Szkoła o {firstLessonAt}
          </div>
        </div>
        <div style={{
          marginLeft: 'auto',
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--accent-green)',
        }}>
          {leaveHomeAt}
        </div>
      </div>

      <RouteRow route={safe} label="Bezpieczna" highlight />

      {fast && (
        <>
          <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '10px 0' }} />
          <RouteRow route={fast} label="Szybsza" warning />
        </>
      )}
    </div>
  )
}

interface RouteRowProps {
  route: BusRoute
  label: string
  highlight?: boolean
  warning?: boolean
}

function RouteRow({ route, label, highlight, warning }: RouteRowProps) {
  const color = highlight ? 'var(--accent-green)' : warning ? 'var(--accent-yellow)' : 'var(--text-secondary)'

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: color,
        marginTop: '5px',
        flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color }}>
            {label}
          </span>
          {route.risky && (
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--accent-yellow)',
              background: 'rgba(255,209,102,0.1)',
              padding: '1px 6px',
              borderRadius: '4px',
              border: '1px solid rgba(255,209,102,0.3)',
            }}>
              RYZYKOWNA
            </span>
          )}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Odjazd: <strong style={{ color: 'var(--text-primary)' }}>{route.departure}</strong>
          {route.type === 'transfer' && route.transferAt && (
            <> → przesiadka <strong style={{ color: 'var(--text-primary)' }}>{route.transferAt}</strong>
              {route.transferTime !== undefined && (
                <span style={{ color: route.risky ? 'var(--accent-yellow)' : 'var(--text-secondary)' }}>
                  {' '}({route.transferTime} min)
                </span>
              )}
            </>
          )}
          {' '}→ <strong style={{ color: 'var(--text-primary)' }}>~{route.arrival}</strong>
        </div>
      </div>
    </div>
  )
}
