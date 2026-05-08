export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getProjektyAI } from '@/lib/sheets'
import Link from 'next/link'

async function AIConsultingContent() {
  const projekty = await getProjektyAI()

  const etapColors: Record<string, string> = {
    negocjacje: '#ffd166',
    podpisany: '#06d6a0',
    realizacja: '#4cc9f0',
    zakonczony: '#888',
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>AI Consulting</div>
        <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>AI Consulting</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Negocjacje z agencją marketingową — Robert i Kacper
        </div>
      </div>

      {/* Projekty */}
      {projekty.length === 0 ? (
        <div className="card">
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Brak projektów. Dodaj w arkuszu PROJEKTY_AI.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {projekty.map((p, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{p.firma}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Kontakt: {p.kontakt}
                  </div>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: `${etapColors[p.etap] ?? '#888'}20`,
                  color: etapColors[p.etap] ?? '#888',
                  border: `1px solid ${etapColors[p.etap] ?? '#888'}40`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {p.etap}
                </span>
              </div>
              {p.deadline && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Deadline: {new Date(p.deadline).toLocaleDateString('pl-PL')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uwaga o prywatnych danych */}
      <div className="card" style={{ background: 'rgba(255,51,102,0.05)', border: '1px solid rgba(255,51,102,0.2)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>🔒</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-red)' }}>Dane prywatne</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Wartość kontraktu (realna vs prezentowana) dostępna tylko w widoku Udziałów — nigdy w jednym ekranie.
            </div>
          </div>
        </div>
      </div>

      {/* Udziały */}
      <div className="card" style={{ borderLeft: '3px solid var(--accent-red)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Udziały AI Consulting</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Realny / Fake — osobne widoki
            </div>
          </div>
          <Link
            href="/dashboard/finanse/udzialy?typ=AI"
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

      {/* Partnerzy */}
      <div className="card">
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Partnerzy
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { imie: 'Robert', rola: 'Współzałożyciel — ogólna strategia', emoji: '👤' },
            { imie: 'Kacper', rola: 'Współzałożyciel — strona techniczna', emoji: '👤' },
          ].map(partner => (
            <Link
              key={partner.imie}
              href={`/dashboard/ludzie/${partner.imie.toLowerCase()}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                background: 'var(--bg-elevated)',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <span style={{ fontSize: '20px' }}>{partner.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{partner.imie}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{partner.rola}</div>
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AIConsultingPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Ładowanie...</div>}>
      <AIConsultingContent />
    </Suspense>
  )
}
