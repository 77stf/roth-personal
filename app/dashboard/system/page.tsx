export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { runHealthCheck } from '@/lib/logger'
import { SystemMap } from './SystemMap'

async function SystemContent() {
  const health = await runHealthCheck()

  return (
    <div style={{ padding: '24px 20px', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          System · ROTH Personal OS
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.2 }}>
          System Map
        </h1>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Architektura i połączenia między komponentami — kliknij węzeł aby zobaczyć szczegóły
        </div>
      </div>

      {/* Interactive map */}
      <div style={{ marginBottom: '28px' }}>
        <SystemMap healthChecks={health.checks} />
      </div>

      {/* Health detail */}
      <div>
        <div style={{
          fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--text-secondary)', marginBottom: '12px',
        }}>
          Health Checks · {health.durationMs}ms · {new Date(health.timestamp).toLocaleTimeString('pl-PL')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
          {health.checks.map(check => {
            const color = check.status === 'ok' ? '#34C759' : check.status === 'warn' ? '#FF9500' : '#FF3B30'
            return (
              <div key={check.name} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 14px', borderRadius: '10px',
                background: `${color}08`, border: `1px solid ${color}22`,
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{check.name}</div>
                  {check.error
                    ? <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px' }}>{check.error}</div>
                    : check.ms
                      ? <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{check.ms}ms</div>
                      : null
                  }
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, color, flexShrink: 0 }}>
                  {check.status.toUpperCase()}
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

export default function SystemPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '40px', color: 'var(--text-secondary)', fontSize: '14px' }}>
        Sprawdzanie systemu...
      </div>
    }>
      <SystemContent />
    </Suspense>
  )
}
