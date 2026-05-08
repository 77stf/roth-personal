export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getProjektyOFM } from '@/lib/sheets'
import Link from 'next/link'

async function OFMContent() {
  const projekty = await getProjektyOFM()

  const statusColors: Record<string, string> = {
    negocjacje: '#ffd166',
    onboarding: '#4cc9f0',
    aktywna: '#06d6a0',
    pauza: '#888',
    zakonczona: '#444',
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>OFM Management</div>
        <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>OFM</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Etap: zakup pierwszej modelki — pre-revenue
        </div>
      </div>

      {/* Projekty */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Projekty ({projekty.length})
        </div>

        {projekty.length === 0 ? (
          <div className="card">
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Brak projektów. Dodaj w arkuszu PROJEKTY_OFM.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {projekty.map((p, i) => (
              <div key={i} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700 }}>{p.modelka}</div>
                    {p.przychod > 0 && (
                      <div style={{ fontSize: '13px', color: 'var(--accent-green)', marginTop: '2px' }}>
                        {p.przychod.toLocaleString('pl-PL')} PLN/mies
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: `${statusColors[p.status] ?? '#888'}20`,
                    color: statusColors[p.status] ?? '#888',
                    border: `1px solid ${statusColors[p.status] ?? '#888'}40`,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {p.status}
                  </span>
                </div>

                {p.nastepnyKrok && (
                  <div style={{
                    padding: '8px 10px',
                    background: 'var(--bg-elevated)',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}>
                    <span style={{ color: 'var(--text-secondary)', marginRight: '6px' }}>Następny krok:</span>
                    {p.nastepnyKrok}
                  </div>
                )}

                {p.deadline && (
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Deadline: {new Date(p.deadline).toLocaleDateString('pl-PL')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Udziały — osobny link */}
      <div className="card" style={{ borderLeft: '3px solid var(--accent-red)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Udziały OFM</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Realny / Fake — dostępne w osobnych widokach
            </div>
          </div>
          <Link
            href="/dashboard/finanse/udzialy?typ=OFM"
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
            Zobacz →
          </Link>
        </div>
      </div>

      {/* Coaching */}
      <div className="card" style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Coaching
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { imie: 'Dr. Hadi', rola: 'Główny coach OFM', emoji: '👨‍🏫' },
            { imie: 'Mikołaj', rola: 'Reddit Admin #1', emoji: '👤' },
            { imie: 'Sorin', rola: 'Reddit Admin #2', emoji: '👤' },
          ].map(coach => (
            <div key={coach.imie} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 10px',
              background: 'var(--bg-elevated)',
              borderRadius: '8px',
            }}>
              <span style={{ fontSize: '20px' }}>{coach.emoji}</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{coach.imie}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{coach.rola}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function OFMPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Ładowanie...</div>}>
      <OFMContent />
    </Suspense>
  )
}
