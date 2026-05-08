export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getTreningiLog } from '@/lib/sheets'
import { TRAINING_SCHEDULE, BADMINTON, MIN_REST_DAY_GAP } from '@/lib/constants'

async function SportContent() {
  const treningi = await getTreningiLog(true)

  const today = new Date()
  const dayOfWeek = ['niedziela', 'poniedzialek', 'wtorek', 'sroda', 'czwartek', 'piatek', 'sobota'][today.getDay()] ?? 'poniedzialek'

  // Sprawdź rest day
  const lastTraining = treningi
    .filter(t => t.status === 'wykonany')
    .sort((a, b) => b.data.localeCompare(a.data))[0]

  const daysSinceLastTraining = lastTraining
    ? Math.floor((today.getTime() - new Date(lastTraining.data).getTime()) / (1000 * 60 * 60 * 24))
    : 999

  const restDayOK = daysSinceLastTraining >= MIN_REST_DAY_GAP

  // Planowany trening dziś
  const todayTraining = TRAINING_SCHEDULE[dayOfWeek as keyof typeof TRAINING_SCHEDULE]
  const todayBadminton = dayOfWeek === BADMINTON.dzien

  // Statystyki tygodnia
  const thisWeekTrainings = treningi.filter(t => t.status === 'wykonany').length

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sport</div>
        <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>Sport</div>
      </div>

      {/* Dziś */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Dziś
        </div>

        {todayTraining ? (
          <div style={{
            padding: '12px',
            background: restDayOK ? 'rgba(6,214,160,0.1)' : 'rgba(255,209,102,0.1)',
            borderRadius: '10px',
            borderLeft: `3px solid ${restDayOK ? 'var(--accent-green)' : 'var(--accent-yellow)'}`,
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
              💪 {todayTraining}
            </div>
            {!restDayOK && (
              <div style={{ fontSize: '12px', color: 'var(--accent-yellow)' }}>
                ⚠️ Ostatni trening był {daysSinceLastTraining === 0 ? 'dziś' : `${daysSinceLastTraining} dni temu`} — sprawdź rest day
              </div>
            )}
            {restDayOK && lastTraining && (
              <div style={{ fontSize: '12px', color: 'var(--accent-green)' }}>
                ✅ Rest day OK ({daysSinceLastTraining} {daysSinceLastTraining === 1 ? 'dzień' : 'dni'} od ostatniego)
              </div>
            )}
          </div>
        ) : todayBadminton ? (
          <div style={{
            padding: '12px',
            background: 'rgba(76,201,240,0.1)',
            borderRadius: '10px',
            borderLeft: '3px solid var(--accent-blue)',
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>🏸 Badminton</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {BADMINTON.godzina}–{BADMINTON.koniec} | Wyjazd: {BADMINTON.wyjazd} z ojcem
            </div>
          </div>
        ) : (
          <div style={{
            padding: '12px',
            background: 'var(--bg-elevated)',
            borderRadius: '10px',
          }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Rest Day — odpoczynek lub trening domowy
            </div>
          </div>
        )}
      </div>

      {/* Tygodniowy plan */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Plan tygodnia
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { dzien: 'Poniedziałek', key: 'poniedzialek', typ: TRAINING_SCHEDULE.poniedzialek },
            { dzien: 'Środa', key: 'sroda', typ: TRAINING_SCHEDULE.sroda },
            { dzien: 'Czwartek', key: 'czwartek', typ: 'Badminton 19:30' },
            { dzien: 'Piątek', key: 'piatek', typ: TRAINING_SCHEDULE.piatek },
          ].map(item => {
            const isToday = item.key === dayOfWeek
            return (
              <div key={item.dzien} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                background: isToday ? 'rgba(255,51,102,0.1)' : 'var(--bg-elevated)',
                borderRadius: '8px',
                border: isToday ? '1px solid rgba(255,51,102,0.3)' : '1px solid transparent',
              }}>
                <div style={{
                  width: '90px',
                  fontSize: '13px',
                  color: isToday ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isToday ? 600 : 400,
                }}>
                  {item.dzien}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                  {item.key === 'czwartek' ? '🏸' : '💪'} {item.typ}
                </div>
                {isToday && <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--accent-red)', fontWeight: 700 }}>DZIŚ</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Historia (ostatnie 7 dni) */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Ostatnie 7 dni
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-green)' }}>
            {thisWeekTrainings} trenin{thisWeekTrainings === 1 ? 'g' : 'gi'}
          </div>
        </div>

        {treningi.length === 0 ? (
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Brak danych z arkusza TRENINGI_LOG</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {treningi.slice(0, 7).map(t => (
              <div key={t.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 10px',
                background: 'var(--bg-elevated)',
                borderRadius: '8px',
              }}>
                <span style={{ fontSize: '14px' }}>
                  {t.status === 'wykonany' ? '✅' : t.status === 'odwolany' ? '❌' : '⏳'}
                </span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '13px' }}>
                    {new Date(t.data).toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                    {t.typ.replace(/_/g, ' ')}
                    {t.czasFaktyczny ? ` — ${t.czasFaktyczny} min` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SportPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Ładowanie...</div>}>
      <SportContent />
    </Suspense>
  )
}
