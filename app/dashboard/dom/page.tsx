export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getPranieLog, getSprzatanieLog } from '@/lib/sheets'
import { PRANIE_LIMITY } from '@/lib/constants'

async function DomContent() {
  const [pranie, sprzatanie] = await Promise.all([
    getPranieLog(),
    getSprzatanieLog(),
  ])

  const today = new Date().toISOString().split('T')[0]!

  // Sprawdzanie sprzątania
  const sprzatanieAlert = sprzatanie.nastepne && sprzatanie.nastepne <= today!

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Dom</div>
        <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>Dom</div>
      </div>

      {/* Sprzątanie */}
      <div className="card" style={{
        marginBottom: '16px',
        borderLeft: `3px solid ${sprzatanieAlert ? 'var(--accent-red)' : 'var(--accent-green)'}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>🧹 Sprzątanie</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {sprzatanie.nastepne
                ? `Następne: ${new Date(sprzatanie.nastepne).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}`
                : 'Brak danych'}
            </div>
          </div>
          {sprzatanieAlert && (
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(255,51,102,0.15)',
              color: 'var(--accent-red)',
              border: '1px solid rgba(255,51,102,0.3)',
            }}>
              DO ZROBIENIA
            </span>
          )}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
          Czas: ~15-20 min • Wpisz /posprzatane na Telegram po skończeniu
        </div>
      </div>

      {/* Pranie */}
      <div className="card">
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Pranie — status kategorii
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Jedna pralka — pranie PO JEDNYM kolorze
        </div>

        {pranie.length === 0 ? (
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Brak danych. Wypełnij arkusz PRANIE_LOG.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pranie.map(p => {
              const daysSince = p.dataOstatniego
                ? Math.floor((Date.now() - new Date(p.dataOstatniego).getTime()) / (1000 * 60 * 60 * 24))
                : 999

              const limitDni = PRANIE_LIMITY[p.kategoria] ?? 5
              const percent = Math.min(100, Math.round((daysSince / limitDni) * 100))
              const alert = daysSince >= limitDni
              const color = alert ? 'var(--accent-red)' : daysSince >= limitDni - 1 ? 'var(--accent-yellow)' : 'var(--accent-green)'

              return (
                <div key={p.kategoria} style={{
                  padding: '10px 12px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${color}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>
                      {p.kategoria.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '12px', color, fontWeight: 600 }}>
                      {daysSince >= 999 ? 'brak danych' : `${daysSince}/${limitDni} dni`}
                    </div>
                  </div>
                  {daysSince < 999 && (
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${percent}%`,
                          background: color,
                        }}
                      />
                    </div>
                  )}
                  {alert && (
                    <div style={{ fontSize: '11px', color: 'var(--accent-red)', marginTop: '4px', fontWeight: 600 }}>
                      ⚠️ Czas na pranie!
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DomPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Ładowanie...</div>}>
      <DomContent />
    </Suspense>
  )
}
