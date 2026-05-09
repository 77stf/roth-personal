export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Home, Shirt, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { getPranieLog, getSprzatanieLog } from '@/lib/sheets'
import { PRANIE_LIMITY } from '@/lib/constants'

async function DomContent() {
  const [pranie, sprzatanie] = await Promise.all([
    getPranieLog(),
    getSprzatanieLog(),
  ])

  const today = new Date().toISOString().split('T')[0]!
  const sprzatanieAlert = sprzatanie.nastepne && sprzatanie.nastepne <= today

  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Dom</div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>Dom</h1>
      </div>

      {/* Sprzatanie */}
      <div className="card" style={{
        marginBottom: '16px',
        borderLeft: `3px solid ${sprzatanieAlert ? 'var(--accent-red)' : 'var(--accent-green)'}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Home size={18} style={{ color: sprzatanieAlert ? 'var(--accent-red)' : 'var(--accent-green)' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Sprzatanie</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {sprzatanie.nastepne
                  ? `Nastepne: ${new Date(sprzatanie.nastepne).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}`
                  : 'Brak danych'}
              </div>
            </div>
          </div>
          {sprzatanieAlert ? (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px',
              background: 'rgba(255, 59, 48, 0.1)',
              color: 'var(--accent-red)',
              border: '1px solid rgba(255, 59, 48, 0.2)',
            }}>
              <AlertTriangle size={11} />
              DO ZROBIENIA
            </span>
          ) : (
            <CheckCircle2 size={18} style={{ color: 'var(--accent-green)' }} />
          )}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '10px' }}>
          Czas: ~15-20 min · Wpisz /posprzatane na Telegramie po skonczeniu
        </div>
      </div>

      {/* Pranie */}
      <div className="card">
        <div style={{
          fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: 'var(--text-secondary)',
          marginBottom: '6px',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <Shirt size={13} />
          Pranie — status kategorii
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Jedna pralka — pranie PO JEDNYM kolorze
        </div>

        {pranie.length === 0 ? (
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Brak danych. Wypelnij arkusz PRANIE_LOG.
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
              const warn = !alert && daysSince >= limitDni - 1
              const barColor = alert ? 'var(--accent-red)' : warn ? 'var(--accent-orange)' : 'var(--accent-green)'
              const leftBorder = alert ? 'var(--accent-red)' : warn ? 'var(--accent-orange)' : 'var(--accent-green)'

              return (
                <div key={p.kategoria} style={{
                  padding: '10px 12px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${leftBorder}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                      {p.kategoria.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '12px', color: barColor, fontWeight: 600 }}>
                      {daysSince >= 999 ? 'brak danych' : `${daysSince}/${limitDni} dni`}
                    </div>
                  </div>
                  {daysSince < 999 && (
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${percent}%`, background: barColor }}
                      />
                    </div>
                  )}
                  {alert && (
                    <div style={{
                      fontSize: '11px', color: 'var(--accent-red)',
                      marginTop: '6px', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <AlertTriangle size={11} />
                      Czas na pranie!
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
    <Suspense fallback={<div style={{ padding: '40px', color: 'var(--text-secondary)', fontSize: '14px' }}>Ladowanie...</div>}>
      <DomContent />
    </Suspense>
  )
}
