export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getPrzychody, getWydatki, getBudzet, getCeleFinansowe } from '@/lib/sheets'
import Link from 'next/link'

async function FinanseContent() {
  const now = new Date()
  const miesiac = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const [przychody, wydatki, budzet, cele] = await Promise.all([
    getPrzychody(miesiac),
    getWydatki(miesiac),
    getBudzet(),
    getCeleFinansowe(),
  ])

  const totalPrzychody = przychody.reduce((s, p) => s + p.kwota, 0)
  const totalWydatki = wydatki.reduce((s, w) => s + w.kwota, 0)
  const saldo = totalPrzychody - totalWydatki
  const alertyBudzet = budzet.filter(b => b.alert)

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Finanse</div>
        <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>Finanse</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {new Date().toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* KPI Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '16px',
      }}>
        {[
          { label: 'Przychody', value: totalPrzychody, color: 'var(--accent-green)', prefix: '+' },
          { label: 'Wydatki', value: totalWydatki, color: 'var(--accent-red)', prefix: '-' },
          { label: 'Saldo', value: saldo, color: saldo >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', prefix: saldo >= 0 ? '+' : '' },
        ].map(kpi => (
          <div key={kpi.label} className="card" style={{ textAlign: 'center', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{kpi.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: kpi.color }}>
              {kpi.prefix}{kpi.value.toLocaleString('pl-PL')}
              <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-secondary)' }}> zł</span>
            </div>
          </div>
        ))}
      </div>

      {/* Alerty budżetu */}
      {alertyBudzet.length > 0 && (
        <div style={{
          padding: '12px 14px',
          background: 'rgba(255,51,102,0.1)',
          border: '1px solid rgba(255,51,102,0.3)',
          borderRadius: '10px',
          marginBottom: '16px',
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-red)', marginBottom: '6px' }}>
            ⚠️ Alerty budżetu ({alertyBudzet.length})
          </div>
          {alertyBudzet.map(b => (
            <div key={b.kategoria} style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
              {b.kategoria}: {b.procent}% — {b.wydano}/{b.limit} PLN
            </div>
          ))}
        </div>
      )}

      {/* Budżet per kategoria */}
      {budzet.length > 0 && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Budżet kategorii
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {budzet.map(b => (
              <div key={b.kategoria}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px' }}>{b.kategoria}</span>
                  <span style={{ fontSize: '12px', color: b.alert ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                    {b.wydano}/{b.limit} PLN ({b.procent}%)
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(100, b.procent)}%`,
                      background: b.procent >= 100 ? 'var(--accent-red)' : b.procent >= 80 ? 'var(--accent-orange)' : 'var(--accent-green)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cele finansowe */}
      {cele.length > 0 && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Cele finansowe
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cele.map(c => (
              <div key={c.cel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{c.cel}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {c.zebrano.toLocaleString('pl-PL')} / {c.kwotaDocelowa.toLocaleString('pl-PL')} PLN
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(100, c.procent)}%` }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{c.procent}%</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {c.prognoza}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Udziały — osobny link (ZASADA KRYTYCZNA) */}
      <div className="card" style={{ borderLeft: '3px solid var(--accent-red)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Udziały (Realny / Fake)</div>
            <div style={{ fontSize: '12px', color: 'var(--accent-red)', marginTop: '4px' }}>
              🔒 Dostępne tylko w osobnych widokach — nigdy razem
            </div>
          </div>
          <Link
            href="/dashboard/finanse/udzialy"
            style={{
              fontSize: '12px',
              color: 'var(--accent-red)',
              textDecoration: 'none',
              padding: '6px 12px',
              background: 'rgba(255,51,102,0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(255,51,102,0.3)',
            }}
          >
            Otwórz →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function FinansePage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Ładowanie...</div>}>
      <FinanseContent />
    </Suspense>
  )
}
