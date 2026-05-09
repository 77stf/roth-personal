export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, Target, ExternalLink } from 'lucide-react'
import { getPrzychody, getWydatki, getBudzet, getCeleFinansowe } from '@/lib/sheets'
import { StatCard } from '@/components/ui/StatCard'
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
  const totalWydatki   = wydatki.reduce((s, w) => s + w.kwota, 0)
  const saldo          = totalPrzychody - totalWydatki
  const alertyBudzet   = budzet.filter(b => b.alert)

  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          {now.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>Finanse</h1>
      </div>

      {/* KPI row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <StatCard
          label="Przychody"
          value={`+${totalPrzychody.toLocaleString('pl-PL')}`}
          unit=" zl"
          icon={<TrendingUp size={16} />}
          variant="success"
        />
        <StatCard
          label="Wydatki"
          value={totalWydatki.toLocaleString('pl-PL')}
          unit=" zl"
          icon={<TrendingDown size={16} />}
          variant="danger"
        />
        <StatCard
          label="Saldo"
          value={(saldo >= 0 ? '+' : '') + saldo.toLocaleString('pl-PL')}
          unit=" zl"
          icon={<Wallet size={16} />}
          variant={saldo >= 0 ? 'success' : 'danger'}
        />
      </div>

      {/* Alerty budzetu */}
      {alertyBudzet.length > 0 && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(255, 59, 48, 0.06)',
          border: '1px solid rgba(255, 59, 48, 0.2)',
          borderRadius: '10px',
          marginBottom: '16px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', fontWeight: 700, color: 'var(--accent-red)', marginBottom: '8px',
          }}>
            <AlertTriangle size={14} />
            Alerty budzetu ({alertyBudzet.length})
          </div>
          {alertyBudzet.map(b => (
            <div key={b.kategoria} style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>
              {b.kategoria}: {b.procent}% — {b.wydano}/{b.limit} PLN
            </div>
          ))}
        </div>
      )}

      {/* Budzet kategorii */}
      {budzet.length > 0 && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '14px',
          }}>
            Budzet kategorii
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {budzet.map(b => {
              const overBudget = b.procent >= 100
              const nearLimit  = !overBudget && b.procent >= 80
              const barColor   = overBudget ? 'var(--accent-red)' : nearLimit ? 'var(--accent-orange)' : 'var(--accent-green)'

              return (
                <div key={b.kategoria}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {b.kategoria}
                    </span>
                    <span style={{ fontSize: '12px', color: overBudget ? 'var(--accent-red)' : 'var(--text-secondary)', fontWeight: overBudget ? 700 : 400 }}>
                      {b.wydano}/{b.limit} PLN
                      <span style={{ marginLeft: '6px', color: barColor, fontWeight: 600 }}>
                        {b.procent}%
                      </span>
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(100, b.procent)}%`,
                        background: barColor,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Cele finansowe */}
      {cele.length > 0 && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '14px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <Target size={13} />
            Cele finansowe
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {cele.map(c => (
              <div key={c.cel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.cel}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {c.zebrano.toLocaleString('pl-PL')} / {c.kwotaDocelowa.toLocaleString('pl-PL')} PLN
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, c.procent)}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--accent-red)', fontWeight: 600 }}>{c.procent}%</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{c.prognoza}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Udzialy */}
      <div className="card" style={{ borderLeft: '3px solid var(--accent-red)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Udzialy (Realny / Fake)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--accent-red)', marginTop: '4px' }}>
              Dostepne tylko w osobnych widokach — nigdy razem
            </div>
          </div>
          <Link
            href="/dashboard/finanse/udzialy"
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '12px', color: 'var(--accent-red)', textDecoration: 'none',
              padding: '6px 12px', background: 'rgba(255, 59, 48, 0.08)',
              borderRadius: '6px', border: '1px solid rgba(255, 59, 48, 0.2)',
              fontWeight: 600,
            }}
          >
            Otworz
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function FinansePage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: 'var(--text-secondary)', fontSize: '14px' }}>Ladowanie...</div>}>
      <FinanseContent />
    </Suspense>
  )
}
