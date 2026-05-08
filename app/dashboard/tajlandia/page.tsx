export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getPrzychody } from '@/lib/sheets'

const MILESTONES = [
  { numer: 1, nazwa: 'Pierwsza modelka aktywna', celPrzychodu: 1000, opis: 'OFM — pierwsza modelka generuje przychód' },
  { numer: 2, nazwa: 'Stabilny przychód OFM', celPrzychodu: 5000, opis: 'Minimum 5000 PLN/mies z OFM' },
  { numer: 3, nazwa: 'Kontrakt AI podpisany', opis: 'Agencja — umowa na papierze' },
  { numer: 4, nazwa: 'Fundusz wyjazdowy', opis: 'Do ustalenia — zgromadzone oszczędności' },
  { numer: 5, nazwa: 'TAJLANDIA 🌴', opis: 'Cel końcowy' },
]

async function TajlandiaContent() {
  const now = new Date()
  const miesiac = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  let miesiacPrzychod = 0
  try {
    const przychody = await getPrzychody(miesiac)
    miesiacPrzychod = przychody
      .filter(p => p.biznes === 'OFM' || p.biznes === 'AI')
      .reduce((s, p) => s + p.kwota, 0)
  } catch {
    // silently fail
  }

  // Ustal aktualny milestone na podstawie przychodów
  let currentMilestone = 1
  if (miesiacPrzychod >= 1000) currentMilestone = 2
  if (miesiacPrzychod >= 5000) currentMilestone = 3

  const overallProgress = Math.min(100, Math.round(((currentMilestone - 1) / 5) * 100))

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Cel końcowy</div>
        <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>Tajlandia 🌴</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Kilka modelek + automatyczni chatters + AI Consulting
        </div>
      </div>

      {/* Overall Progress */}
      <div className="card" style={{ marginBottom: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', fontWeight: 900, color: 'var(--accent-red)', marginBottom: '8px' }}>
          {overallProgress}%
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          do Tajlandii
        </div>
        <div className="progress-bar" style={{ height: '10px', maxWidth: '400px', margin: '0 auto' }}>
          <div
            className="progress-fill"
            style={{
              width: `${overallProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-red), var(--accent-orange), var(--accent-yellow))',
            }}
          />
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '10px' }}>
          Milestone {currentMilestone}/5
        </div>
      </div>

      {/* Przychód miesięczny */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Przychód biznesowy — {now.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
        </div>
        <div style={{ fontSize: '32px', fontWeight: 800, color: miesiacPrzychod > 0 ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
          {miesiacPrzychod.toLocaleString('pl-PL')} PLN
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          OFM + AI Consulting łącznie
        </div>
      </div>

      {/* Milestones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {MILESTONES.map(m => {
          const status = m.numer < currentMilestone ? 'osiagniety' :
            m.numer === currentMilestone ? 'w_toku' : 'nie_zaczety'

          const color = status === 'osiagniety' ? 'var(--accent-green)' :
            status === 'w_toku' ? 'var(--accent-yellow)' : 'var(--border)'

          const bg = status === 'osiagniety' ? 'rgba(6,214,160,0.08)' :
            status === 'w_toku' ? 'rgba(255,209,102,0.08)' : 'transparent'

          return (
            <div key={m.numer} style={{
              display: 'flex',
              gap: '16px',
              padding: '14px',
              background: bg,
              borderRadius: '10px',
              border: `1px solid ${status === 'w_toku' ? 'rgba(255,209,102,0.3)' : 'var(--border)'}`,
              borderLeft: `4px solid ${color}`,
            }}>
              {/* Numer */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: `2px solid ${color}`,
                background: status === 'osiagniety' ? 'var(--accent-green)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                color: status === 'osiagniety' ? 'white' : color,
                flexShrink: 0,
              }}>
                {status === 'osiagniety' ? '✓' : m.numer}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700 }}>{m.nazwa}</div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: `${color}20`,
                    color,
                    textTransform: 'uppercase',
                    flexShrink: 0,
                    marginLeft: '8px',
                  }}>
                    {status === 'osiagniety' ? 'OSIĄGNIĘTY' : status === 'w_toku' ? 'W TOKU' : 'CZEKA'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {m.opis}
                </div>
                {m.celPrzychodu && status === 'w_toku' && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Cel: {m.celPrzychodu.toLocaleString('pl-PL')} PLN/mies
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--accent-yellow)', fontWeight: 600 }}>
                        {Math.round((miesiacPrzychod / m.celPrzychodu) * 100)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(100, Math.round((miesiacPrzychod / m.celPrzychodu) * 100))}%`,
                          background: 'var(--accent-yellow)',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{
        marginTop: '20px',
        padding: '12px 16px',
        background: 'var(--bg-elevated)',
        borderRadius: '8px',
        fontSize: '13px',
        color: 'var(--text-secondary)',
        textAlign: 'center',
        fontStyle: 'italic',
      }}>
        "Każdy dzień to krok bliżej Tajlandii."
      </div>
    </div>
  )
}

export default function TajlandiaPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Ładowanie...</div>}>
      <TajlandiaContent />
    </Suspense>
  )
}
