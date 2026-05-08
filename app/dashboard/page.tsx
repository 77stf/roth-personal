export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getTodayEvents, formatEventsForContext } from '@/lib/calendar'
import { getWaterToday, getAktywneReki, getSprawdziany } from '@/lib/sheets'
import { getCurrentEnergyZone, obliczScoring, getScoringOpis } from '@/lib/scoring'
import { getPogoda } from '@/lib/weather'
import { EnergyBadge } from '@/components/dashboard/energy-badge'

async function TodayDashboard() {
  const now = new Date()
  const hour = now.getHours()
  const dateStr = now.toLocaleDateString('pl-PL', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  const [events, water, leki, sprawdziany, pogoda] = await Promise.allSettled([
    getTodayEvents(),
    getWaterToday(),
    getAktywneReki(),
    getSprawdziany(true),
    getPogoda(),
  ])

  const eventsData = events.status === 'fulfilled' ? events.value : []
  const waterData = water.status === 'fulfilled' ? water.value : null
  const lekiData = leki.status === 'fulfilled' ? leki.value : []
  const sprawdzianyData = sprawdziany.status === 'fulfilled' ? sprawdziany.value : []
  const pogodaData = pogoda.status === 'fulfilled' ? pogoda.value : null

  const scoring = obliczScoring({
    isDzienSzkolny: eventsData.some(e => e.isSchool),
    hasSprawdzian: eventsData.some(e => /sprawdzian|kartkówka/i.test(e.title)),
    hasMeetingBiznesowy: eventsData.some(e => e.isMeeting),
    hasTrening: eventsData.some(e => e.isTraining),
    hasDeadlineProjektu: false,
    senGodzin: 7,
    isChoroba: false,
    isWyjazd: eventsData.some(e => e.isTrip),
    energiaCheckIn: 3,
  })

  const energyZone = getCurrentEnergyZone(hour)
  const upcomingSprawdziany = sprawdzianyData.slice(0, 3)

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
          {dateStr}
        </div>
        <div style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.2, marginTop: '4px' }}>
          Dzisiaj
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {getScoringOpis(scoring.total)}
        </div>
      </div>

      {/* Grid kart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
        marginBottom: '20px',
      }}>
        {/* Scoring + Energia */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Scoring dnia
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: scoring.total <= 5 ? 'var(--accent-green)' : scoring.total <= 10 ? 'var(--accent-yellow)' : scoring.total <= 15 ? 'var(--accent-orange)' : 'var(--accent-red)' }}>
                {scoring.total}<span style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: 400 }}>/20</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>
                {scoring.label}
              </div>
            </div>
            <EnergyBadge zone={energyZone.name} level={energyZone.level} compact />
          </div>

          {/* Składniki scoringu */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {scoring.components.filter(c => c.active).map(c => (
              <span key={c.name} style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
              }}>
                +{c.points} {c.name.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Pogoda */}
        {pogodaData && (
          <div className="card">
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Pogoda — Śrem</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ fontSize: '32px', fontWeight: 700 }}>{pogodaData.temperatura}°</div>
              <div>
                <div style={{ fontSize: '13px' }}>{pogodaData.opis}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Odczucie: {pogodaData.odczucie}°
                </div>
              </div>
            </div>
            <div style={{
              fontSize: '12px',
              padding: '8px 10px',
              background: 'var(--bg-elevated)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
            }}>
              👕 {pogodaData.rekomendacjaUbrania}
            </div>
          </div>
        )}
      </div>

      {/* Eventy dziś */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Kalendarz
        </div>
        {eventsData.length === 0 ? (
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Brak eventów dziś</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {eventsData.map(event => (
              <div key={event.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                background: 'var(--bg-elevated)',
                borderRadius: '8px',
              }}>
                <span style={{ fontSize: '16px' }}>
                  {event.isSchool ? '📚' : event.isTraining ? '💪' : event.isMeeting ? '💼' : event.isTrip ? '✈️' : '📅'}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>{event.title}</div>
                  {!event.isAllDay && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {new Date(event.start).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                      {' — '}
                      {new Date(event.end).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Water Tracker */}
      {waterData && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Woda
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: waterData.procent >= 100 ? 'var(--accent-green)' : 'var(--text-primary)' }}>
              {waterData.wypito}ml / {waterData.celMl}ml
            </div>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(100, waterData.procent)}%`,
                background: waterData.procent >= 100
                  ? 'var(--accent-green)'
                  : 'linear-gradient(90deg, var(--accent-blue), var(--accent-green))',
              }}
            />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            {waterData.procent < 100
              ? `Zostało ${waterData.celMl - waterData.wypito}ml do celu`
              : '✅ Cel osiągnięty!'}
          </div>
        </div>
      )}

      {/* Nadchodzące sprawdziany */}
      {upcomingSprawdziany.length > 0 && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Nadchodzące sprawdziany
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {upcomingSprawdziany.map(s => {
              const daysUntil = Math.ceil(
                (new Date(s.data).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )
              const urgent = daysUntil <= 2
              return (
                <div key={s.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  background: 'var(--bg-elevated)',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${urgent ? 'var(--accent-red)' : 'var(--accent-yellow)'}`,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>
                      {s.przedmiot} — {s.temat}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {new Date(s.data).toLocaleDateString('pl-PL')} ({daysUntil} dni)
                    </div>
                  </div>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: urgent ? 'rgba(255,51,102,0.15)' : 'rgba(255,209,102,0.15)',
                    color: urgent ? 'var(--accent-red)' : 'var(--accent-yellow)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}>
                    {s.typ}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Leki aktywne */}
      {lekiData.length > 0 && (
        <div className="card" style={{ borderLeft: '3px solid var(--accent-blue)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Leki dziś
          </div>
          {lekiData.map(lek => (
            <div key={lek.nazwa} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 0',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{lek.nazwa}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '6px' }}>{lek.dawka}</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--accent-blue)' }}>
                {lek.godziny.join(', ')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '40px', color: 'var(--text-secondary)', fontSize: '14px' }}>
        Ładowanie...
      </div>
    }>
      <TodayDashboard />
    </Suspense>
  )
}
