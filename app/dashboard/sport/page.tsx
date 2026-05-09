export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Dumbbell, Calendar, CheckCircle2, XCircle, Clock, Bike } from 'lucide-react'
import { getTreningiLog } from '@/lib/sheets'
import { getStreaks } from '@/lib/streaks'
import { TRAINING_SCHEDULE, BADMINTON, MIN_REST_DAY_GAP } from '@/lib/constants'
import { StatCard } from '@/components/ui/StatCard'
import { StreakCard } from '@/components/ui/StreakCard'

async function SportContent() {
  const [treningi, streaks] = await Promise.allSettled([
    getTreningiLog(true),
    getStreaks(),
  ])

  const treningiData  = treningi.status  === 'fulfilled' ? treningi.value  : []
  const streaksData   = streaks.status   === 'fulfilled' ? streaks.value   : []

  const today = new Date()
  const dayOfWeek = ['niedziela', 'poniedzialek', 'wtorek', 'sroda', 'czwartek', 'piatek', 'sobota'][today.getDay()] ?? 'poniedzialek'

  const lastTraining = treningiData
    .filter(t => t.status === 'wykonany')
    .sort((a, b) => b.data.localeCompare(a.data))[0]

  const daysSinceLast = lastTraining
    ? Math.floor((today.getTime() - new Date(lastTraining.data).getTime()) / (1000 * 60 * 60 * 24))
    : 999

  const restOK = daysSinceLast >= MIN_REST_DAY_GAP
  const todayTraining = TRAINING_SCHEDULE[dayOfWeek as keyof typeof TRAINING_SCHEDULE]
  const isBadminton = dayOfWeek === BADMINTON.dzien
  const thisWeekCount = treningiData.filter(t => t.status === 'wykonany').length
  const activeStreaks = streaksData.filter(s => s.count > 0)

  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          {today.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>Sport</h1>
      </div>

      {/* KPI row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
      }}>
        <StatCard
          label="Treningi (7d)"
          value={thisWeekCount}
          trend={thisWeekCount >= 3 ? 'Swietny tydzien' : 'Cel: 3 treningi'}
          icon={<Dumbbell size={16} />}
          variant={thisWeekCount >= 3 ? 'success' : 'default'}
        />
        <StatCard
          label="Rest day"
          value={daysSinceLast >= 999 ? '—' : `${daysSinceLast}d`}
          trend={restOK ? 'OK — mozna trenowac' : 'Potrzeba odpoczynku'}
          icon={<Clock size={16} />}
          variant={restOK ? 'success' : 'warning'}
        />
        <StatCard
          label="Dzisiaj"
          value={todayTraining ? 'Trening' : isBadminton ? 'Badminton' : 'Rest Day'}
          icon={isBadminton ? <Bike size={16} /> : <Dumbbell size={16} />}
          variant={todayTraining || isBadminton ? 'default' : 'success'}
        />
      </div>

      {/* Dziś */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{
          fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: 'var(--text-secondary)',
          marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <Dumbbell size={13} />
          Dzis
        </div>

        {todayTraining ? (
          <div style={{
            padding: '14px',
            background: restOK ? 'rgba(52,199,89,0.08)' : 'rgba(255,149,0,0.08)',
            borderRadius: '10px',
            borderLeft: `3px solid ${restOK ? 'var(--accent-green)' : 'var(--accent-orange)'}`,
          }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {todayTraining}
            </div>
            <div style={{ fontSize: '12px', color: restOK ? 'var(--accent-green)' : 'var(--accent-orange)', fontWeight: 500 }}>
              {!restOK
                ? `Ostroznie — ostatni trening ${daysSinceLast === 0 ? 'dzis' : `${daysSinceLast} dni temu`}`
                : lastTraining
                  ? `Rest day OK (${daysSinceLast} ${daysSinceLast === 1 ? 'dzien' : 'dni'} od ostatniego)`
                  : 'Brak historii'
              }
            </div>
          </div>
        ) : isBadminton ? (
          <div style={{
            padding: '14px',
            background: 'rgba(0, 122, 255, 0.08)',
            borderRadius: '10px',
            borderLeft: '3px solid var(--accent-blue)',
          }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Badminton
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {BADMINTON.godzina}–{BADMINTON.koniec} | Wyjazd: {BADMINTON.wyjazd} z ojcem
            </div>
          </div>
        ) : (
          <div style={{
            padding: '14px',
            background: 'var(--bg-elevated)',
            borderRadius: '10px',
          }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Rest Day — odpoczynek lub trening domowy
            </div>
          </div>
        )}
      </div>

      {/* Plan tygodnia */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{
          fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: 'var(--text-secondary)',
          marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <Calendar size={13} />
          Plan tygodnia
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { dzien: 'Poniedzialek', key: 'poniedzialek', typ: TRAINING_SCHEDULE.poniedzialek, isSport: true },
            { dzien: 'Sroda', key: 'sroda', typ: TRAINING_SCHEDULE.sroda, isSport: true },
            { dzien: 'Czwartek', key: 'czwartek', typ: 'Badminton 19:30', isSport: false },
            { dzien: 'Piatek', key: 'piatek', typ: TRAINING_SCHEDULE.piatek, isSport: true },
          ].map(item => {
            const isToday = item.key === dayOfWeek
            return (
              <div key={item.dzien} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                background: isToday ? 'rgba(255, 59, 48, 0.06)' : 'var(--bg-elevated)',
                borderRadius: '8px',
                border: isToday ? '1px solid rgba(255, 59, 48, 0.2)' : '1px solid transparent',
              }}>
                {item.isSport
                  ? <Dumbbell size={15} style={{ color: isToday ? 'var(--accent-red)' : 'var(--text-secondary)', flexShrink: 0 }} />
                  : <Bike size={15} style={{ color: isToday ? 'var(--accent-blue)' : 'var(--text-secondary)', flexShrink: 0 }} />
                }
                <div style={{
                  width: '100px', fontSize: '13px',
                  color: isToday ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isToday ? 600 : 400,
                }}>
                  {item.dzien}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', flex: 1 }}>
                  {item.typ}
                </div>
                {isToday && (
                  <span style={{ fontSize: '10px', color: 'var(--accent-red)', fontWeight: 700 }}>DZIS</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Streaki */}
      {activeStreaks.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--text-secondary)',
            marginBottom: '10px',
          }}>
            Streaki
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '10px',
          }}>
            {activeStreaks.slice(0, 4).map(s => (
              <StreakCard key={s.nawyk} streak={s} />
            ))}
          </div>
        </div>
      )}

      {/* Historia */}
      <div className="card">
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '12px',
        }}>
          <div style={{
            fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <Clock size={13} />
            Ostatnie 7 treningow
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-green)' }}>
            {thisWeekCount} trening{thisWeekCount === 1 ? '' : 'i'}
          </div>
        </div>

        {treningiData.length === 0 ? (
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Brak danych z arkusza TRENINGI_LOG</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {treningiData.slice(0, 7).map(t => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 10px',
                background: 'var(--bg-elevated)',
                borderRadius: '8px',
              }}>
                {t.status === 'wykonany'
                  ? <CheckCircle2 size={15} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
                  : t.status === 'odwolany'
                    ? <XCircle size={15} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
                    : <Clock size={15} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                }
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    {new Date(t.data).toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                    {t.typ.replace(/_/g, ' ')}
                    {t.czasFaktyczny ? ` · ${t.czasFaktyczny} min` : ''}
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
    <Suspense fallback={<div style={{ padding: '40px', color: 'var(--text-secondary)', fontSize: '14px' }}>Ladowanie...</div>}>
      <SportContent />
    </Suspense>
  )
}
