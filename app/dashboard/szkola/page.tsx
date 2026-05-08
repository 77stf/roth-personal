export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getLessonPlan, getSprawdziany } from '@/lib/sheets'
import { SZKOLA } from '@/lib/constants'

const DAYS = ['poniedzialek', 'wtorek', 'sroda', 'czwartek', 'piatek']
const DAY_LABELS: Record<string, string> = {
  poniedzialek: 'Poniedziałek',
  wtorek: 'Wtorek',
  sroda: 'Środa',
  czwartek: 'Czwartek',
  piatek: 'Piątek',
}

async function SzkolaContent() {
  const today = new Date()
  const dayIndex = today.getDay()  // 0=niedziela, 1=pon, ...
  const todayKey = dayIndex >= 1 && dayIndex <= 5 ? DAYS[dayIndex - 1] : 'poniedzialek'

  const [todayLessons, sprawdziany] = await Promise.all([
    getLessonPlan(todayKey),
    getSprawdziany(true),
  ])

  // Dzień tygodnia
  const todayLabel = DAY_LABELS[todayKey!] ?? 'Dzisiaj'

  // Link zastępstw na dziś
  const zastepstwaLink = SZKOLA.zastepstwaLinki[todayKey as keyof typeof SZKOLA.zastepstwaLinki]

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>ZSE Śrem | 3PB gr.2/2</div>
        <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>Szkoła</div>
      </div>

      {/* Zastępstwa */}
      <div className="card" style={{ marginBottom: '16px', borderLeft: '3px solid var(--accent-orange)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Zastępstwa — {todayLabel}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Filtrowane dla 3PB gr.2/2</div>
          </div>
          <a
            href={zastepstwaLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '12px',
              color: 'var(--accent-blue)',
              textDecoration: 'none',
              padding: '6px 12px',
              background: 'rgba(76,201,240,0.1)',
              borderRadius: '6px',
              border: '1px solid rgba(76,201,240,0.3)',
            }}
          >
            Sprawdź →
          </a>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Kliknij "Sprawdź" aby zobaczyć aktualne zastępstwa na stronie ZSE Śrem.
        </div>
      </div>

      {/* Plan lekcji dziś */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Plan lekcji — {todayLabel}
        </div>

        {todayLessons.length === 0 ? (
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', padding: '8px 0' }}>
            Brak lekcji / dane z arkusza PLAN_LEKCJI
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {todayLessons.map((lesson, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                background: 'var(--bg-elevated)',
                borderRadius: '8px',
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  flexShrink: 0,
                }}>
                  {lesson.nrLekcji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{lesson.przedmiot}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {lesson.nauczyciel} • Sala {lesson.sala}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sprawdziany */}
      <div className="card">
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Nadchodzące sprawdziany
        </div>

        {sprawdziany.length === 0 ? (
          <div style={{ fontSize: '14px', color: 'var(--accent-green)' }}>Brak nadchodzących sprawdzianów 🎉</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sprawdziany.map(s => {
              const daysUntil = Math.ceil(
                (new Date(s.data).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )
              const urgentColor = daysUntil <= 1 ? 'var(--accent-red)' : daysUntil <= 3 ? 'var(--accent-yellow)' : 'var(--accent-green)'

              return (
                <div key={s.id} style={{
                  padding: '12px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${urgentColor}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{s.przedmiot}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{s.temat}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: urgentColor }}>
                        {daysUntil === 0 ? 'DZIŚ' : daysUntil === 1 ? 'JUTRO' : `za ${daysUntil} dni`}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {new Date(s.data).toLocaleDateString('pl-PL')}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'var(--bg-card)',
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                    }}>
                      {s.typ}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: s.statusNauki === 'gotowy' ? 'rgba(6,214,160,0.1)' : 'rgba(255,209,102,0.1)',
                      color: s.statusNauki === 'gotowy' ? 'var(--accent-green)' : 'var(--accent-yellow)',
                      textTransform: 'uppercase',
                    }}>
                      {s.statusNauki.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SzkolaPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Ładowanie...</div>}>
      <SzkolaContent />
    </Suspense>
  )
}
