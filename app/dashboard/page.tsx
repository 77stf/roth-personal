export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Zap, BookOpen, Droplets, Pill, CalendarDays, AlertTriangle } from 'lucide-react'
import { getTodayEvents, formatEventsForContext } from '@/lib/calendar'
import { getWaterToday, getAktywneReki, getSprawdziany } from '@/lib/sheets'
import { getCurrentEnergyZone, obliczScoring, getScoringOpis } from '@/lib/scoring'
import { getPogoda } from '@/lib/weather'
import { StatCard } from '@/components/ui/StatCard'

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

  const eventsData      = events.status      === 'fulfilled' ? events.value      : []
  const waterData       = water.status       === 'fulfilled' ? water.value       : null
  const lekiData        = leki.status        === 'fulfilled' ? leki.value        : []
  const sprawdzianyData = sprawdziany.status === 'fulfilled' ? sprawdziany.value : []
  const pogodaData      = pogoda.status      === 'fulfilled' ? pogoda.value      : null

  const scoring = obliczScoring({
    isDzienSzkolny:      eventsData.some(e => e.isSchool),
    hasSprawdzian:       eventsData.some(e => /sprawdzian|kartkówka/i.test(e.title)),
    hasMeetingBiznesowy: eventsData.some(e => e.isMeeting),
    hasTrening:          eventsData.some(e => e.isTraining),
    hasDeadlineProjektu: false,
    senGodzin:           7,
    isChoroba:           false,
    isWyjazd:            eventsData.some(e => e.isTrip),
    energiaCheckIn:      3,
  })

  const energyZone         = getCurrentEnergyZone(hour)
  const upcomingSprawdziany = sprawdzianyData.slice(0, 3)

  const scoringVariant = scoring.total <= 5
    ? 'success'
    : scoring.total <= 10
      ? 'default'
      : scoring.total <= 15
        ? 'warning'
        : 'danger'

  return (
    <div style={{ padding: '24px', maxWidth: '900px' }}>
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          textTransform: 'capitalize',
          marginBottom: '4px',
        }}>
          {dateStr}
        </div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
        }}>
          Dzisiaj
        </h1>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {getScoringOpis(scoring.total)}
        </div>
      </div>

      {/* KPI row — 4 stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <StatCard
          label="Scoring dnia"
          value={scoring.total}
          unit="/20"
          trend={scoring.label}
          icon={<Zap size={16} />}
          variant={scoringVariant}
        />
        <StatCard
          label="Strefa energii"
          value={energyZone.name}
          trend={`Poziom ${energyZone.level}/5`}
          icon={<Zap size={16} />}
          variant="default"
        />
        {waterData && (
          <StatCard
            label="Woda"
            value={waterData.wypito}
            unit={`/${waterData.celMl}ml`}
            trend={waterData.procent >= 100
              ? 'Cel osiagniety'
              : `Zostalo ${waterData.celMl - waterData.wypito}ml`
            }
            icon={<Droplets size={16} />}
            variant={waterData.procent >= 100 ? 'success' : 'default'}
          />
        )}
        {pogodaData && (
          <StatCard
            label="Pogoda — Srem"
            value={pogodaData.temperatura}
            unit="°C"
            trend={pogodaData.opis}
            icon={<Zap size={16} />}
            variant="default"
          />
        )}
      </div>

      {/* 2-col layout: main (2/3) + side (1/3) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        gap: '16px',
        alignItems: 'start',
      }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Kalendarz */}
          <div className="card">
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-secondary)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <CalendarDays size={14} />
              Kalendarz
            </div>
            {eventsData.length === 0 ? (
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Brak eventow dzis</div>
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
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {event.title}
                      </div>
                      {!event.isAllDay && (
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {new Date(event.start).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                          {' — '}
                          {new Date(event.end).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: event.isSchool
                        ? 'rgba(0,122,255,0.1)'
                        : event.isTraining
                          ? 'rgba(52,199,89,0.1)'
                          : 'rgba(0,0,0,0.05)',
                      color: event.isSchool
                        ? 'var(--accent-blue)'
                        : event.isTraining
                          ? 'var(--accent-green)'
                          : 'var(--text-secondary)',
                    }}>
                      {event.isSchool ? 'szkola' : event.isTraining ? 'trening' : event.isMeeting ? 'meeting' : 'event'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scoring components */}
          {scoring.components.filter(c => c.active).length > 0 && (
            <div className="card">
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-secondary)',
                marginBottom: '10px',
              }}>
                Składniki scoringu
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {scoring.components.filter(c => c.active).map(c => (
                  <span key={c.name} style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255, 59, 48, 0.08)',
                    color: 'var(--accent-red)',
                    fontWeight: 500,
                  }}>
                    +{c.points} {c.name.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Sprawdziany */}
          {upcomingSprawdziany.length > 0 && (
            <div className="card">
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-secondary)',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <AlertTriangle size={14} />
                Sprawdziany
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {upcomingSprawdziany.map(s => {
                  const daysUntil = Math.ceil(
                    (new Date(s.data).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  )
                  const urgent = daysUntil <= 2
                  return (
                    <div key={s.id} style={{
                      padding: '8px 10px',
                      background: 'var(--bg-elevated)',
                      borderRadius: '8px',
                      borderLeft: `3px solid ${urgent ? 'var(--accent-red)' : 'var(--accent-orange)'}`,
                    }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {s.przedmiot}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {s.temat}
                      </div>
                      <div style={{ fontSize: '11px', marginTop: '4px' }}>
                        <span style={{
                          color: urgent ? 'var(--accent-red)' : 'var(--accent-orange)',
                          fontWeight: 600,
                        }}>
                          {daysUntil === 0 ? 'DZISIAJ' : daysUntil === 1 ? 'JUTRO' : `za ${daysUntil}d`}
                        </span>
                        {' · '}
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {s.typ}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Pogoda rozszerzona */}
          {pogodaData && (
            <div className="card">
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-secondary)',
                marginBottom: '10px',
              }}>
                Ubranie
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-primary)',
                background: 'var(--bg-elevated)',
                borderRadius: '8px',
                padding: '8px 10px',
              }}>
                {pogodaData.rekomendacjaUbrania}
              </div>
            </div>
          )}

          {/* Leki */}
          {lekiData.length > 0 && (
            <div className="card" style={{ borderLeft: '3px solid var(--accent-blue)' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-secondary)',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <Pill size={14} />
                Leki
              </div>
              {lekiData.map(lek => (
                <div key={lek.nazwa} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 0',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: '13px',
                }}>
                  <div>
                    <span style={{ fontWeight: 500 }}>{lek.nazwa}</span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: '6px', fontSize: '12px' }}>
                      {lek.dawka}
                    </span>
                  </div>
                  <span style={{ color: 'var(--accent-blue)', fontSize: '12px' }}>
                    {lek.godziny.join(', ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '40px', color: 'var(--text-secondary)', fontSize: '14px' }}>
        Ladowanie...
      </div>
    }>
      <TodayDashboard />
    </Suspense>
  )
}
