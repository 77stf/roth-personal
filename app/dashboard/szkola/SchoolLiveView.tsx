'use client'

import type { LessonWithTime } from './page'
import { BookOpen, Clock, AlertTriangle, PartyPopper } from 'lucide-react'

interface UpcomingTest {
  przedmiot: string
  typ: string
  data: string
  temat: string
}

interface Props {
  todayLessons: LessonWithTime[]
  tomorrowLessons: LessonWithTime[]
  currentLesson: LessonWithTime | null
  nextLesson: LessonWithTime | null
  todayName: string
  tomorrowName: string
  isWeekend: boolean
  currentTime: string
  upcomingTests: UpcomingTest[]
}

function LessonBadge({ lesson, status }: { lesson: LessonWithTime; status: 'current' | 'next' | 'done' | 'upcoming' }) {
  const isCurrent = status === 'current'
  const isNext = status === 'next'
  const isDone = status === 'done'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '10px',
      background: isCurrent
        ? `${lesson.kolor}12`
        : 'var(--bg-elevated)',
      border: isCurrent
        ? `1px solid ${lesson.kolor}50`
        : isNext
          ? '1px solid var(--border)'
          : '1px solid transparent',
      opacity: isDone ? 0.5 : 1,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.2s',
    }}>
      {isCurrent && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
          background: lesson.kolor, borderRadius: '0 2px 2px 0',
        }} />
      )}

      {/* Numer lekcji */}
      <div style={{
        width: '28px', height: '28px', borderRadius: '8px',
        background: isCurrent ? lesson.kolor : 'var(--bg-surface)',
        border: isCurrent ? 'none' : '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '12px', fontWeight: 700, flexShrink: 0,
        color: isCurrent ? '#fff' : 'var(--text-secondary)',
      }}>
        {lesson.nr}
      </div>

      {/* Godzina */}
      <div style={{
        fontSize: '11px',
        color: 'var(--text-secondary)',
        fontVariantNumeric: 'tabular-nums',
        flexShrink: 0,
        width: '90px',
        fontFamily: 'monospace',
      }}>
        {lesson.od} – {lesson.do}
      </div>

      {/* Przedmiot */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px',
          fontWeight: isCurrent ? 600 : 500,
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {lesson.przedmiotPelna}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          sala {lesson.sala}
          {lesson.grupa !== 'cala_klasa' && ` · gr. ${lesson.grupa}`}
        </div>
      </div>

      {/* Status badge */}
      {isCurrent && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '3px 8px', borderRadius: '20px',
          background: `${lesson.kolor}18`,
          border: `1px solid ${lesson.kolor}40`,
          fontSize: '10px', fontWeight: 700,
          color: lesson.kolor,
          flexShrink: 0,
        }}>
          <span style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: lesson.kolor,
            animation: 'pulse-dot 1.5s infinite',
            display: 'inline-block',
          }} />
          TERAZ
        </div>
      )}
      {isNext && !isCurrent && (
        <div style={{
          padding: '3px 8px', borderRadius: '20px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          fontSize: '10px', fontWeight: 600,
          color: 'var(--text-secondary)',
          flexShrink: 0,
        }}>
          NASTEPNA
        </div>
      )}
    </div>
  )
}

export default function SchoolLiveView({
  todayLessons, tomorrowLessons, currentLesson, nextLesson,
  todayName, tomorrowName, isWeekend, currentTime, upcomingTests,
}: Props) {
  function timeToMins(t: string) {
    const [h, m] = t.split(':').map(Number)
    return (h ?? 0) * 60 + (m ?? 0)
  }
  const nowMins = timeToMins(currentTime)

  const schoolDone = !isWeekend && todayLessons.length > 0 && !nextLesson && !currentLesson
  const schoolNotStarted = !isWeekend && todayLessons.length > 0 && !currentLesson && nextLesson?.nr === todayLessons[0]?.nr

  return (
    <>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <div style={{ padding: '24px', maxWidth: '760px' }} className="fade-in">
        {/* HEADER */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            Szkola · 3PB · Gr. 2/2
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isWeekend ? 'Weekend' : todayName}
            </h1>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' }}>
              {currentTime}
            </div>
          </div>
        </div>

        {/* WEEKEND */}
        {isWeekend && (
          <div className="card" style={{ textAlign: 'center', marginBottom: '24px', padding: '32px' }}>
            <PartyPopper size={32} style={{ color: 'var(--accent-purple)', margin: '0 auto 12px' }} />
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Weekend!
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Czas na OFM, AI Consulting lub Tajlandi
            </div>
          </div>
        )}

        {/* LIVE STATUS CARDS */}
        {!isWeekend && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {/* Aktualna lekcja */}
            <div className="card" style={{
              borderLeft: currentLesson ? `3px solid ${currentLesson.kolor}` : schoolDone ? '3px solid var(--accent-green)' : '3px solid var(--border)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--text-secondary)',
                marginBottom: '12px',
              }}>
                {currentLesson && (
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: currentLesson.kolor,
                    animation: 'pulse-dot 1.5s infinite',
                    display: 'inline-block',
                  }} />
                )}
                Aktualna lekcja
              </div>

              {currentLesson ? (
                <>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {currentLesson.przedmiotPelna}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {currentLesson.od} – {currentLesson.do} · sala {currentLesson.sala}
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '3px 10px', borderRadius: '20px',
                    background: `${currentLesson.kolor}15`,
                    border: `1px solid ${currentLesson.kolor}30`,
                    fontSize: '11px', fontWeight: 600, color: currentLesson.kolor,
                  }}>
                    Lekcja {currentLesson.nr}
                  </div>
                </>
              ) : schoolDone ? (
                <>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-green)', marginBottom: '4px' }}>
                    Szkola skonczona
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Czas na projekty!</div>
                </>
              ) : schoolNotStarted ? (
                <>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Jeszcze sie nie zaczela
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Pierwsza lekcja: {todayLessons[0]?.od}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Brak lekcji</div>
              )}
            </div>

            {/* Nastepna lekcja */}
            <div className="card">
              <div style={{
                fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--text-secondary)',
                marginBottom: '12px',
              }}>
                Nastepna lekcja
              </div>

              {nextLesson ? (
                <>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {nextLesson.przedmiotPelna}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {nextLesson.od} – {nextLesson.do} · sala {nextLesson.sala}
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 10px', borderRadius: '20px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    fontSize: '11px', color: 'var(--text-secondary)',
                  }}>
                    <Clock size={10} />
                    Za {timeToMins(nextLesson.od) - nowMins} min
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {schoolDone ? 'Koniec na dzis' : 'Brak nastepnej'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SPRAWDZIANY ALERT */}
        {upcomingTests.length > 0 && (
          <div style={{
            padding: '14px 16px',
            borderRadius: '10px',
            marginBottom: '20px',
            background: 'rgba(255, 59, 48, 0.06)',
            border: '1px solid rgba(255, 59, 48, 0.2)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--accent-red)',
              marginBottom: '10px',
            }}>
              <AlertTriangle size={13} />
              Nadchodzace sprawdziany
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {upcomingTests.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '6px',
                    background: 'rgba(255, 59, 48, 0.1)',
                    fontSize: '10px', fontWeight: 700, color: 'var(--accent-red)',
                  }}>
                    {t.typ.toUpperCase()}
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{t.przedmiot}</span>
                  {t.temat && <span style={{ color: 'var(--text-secondary)' }}>— {t.temat}</span>}
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                    {t.data}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PLAN DNIA */}
        {!isWeekend && todayLessons.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{
              fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--text-secondary)',
              marginBottom: '10px',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <BookOpen size={13} />
              Plan dnia — {todayName}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {todayLessons.map(lesson => {
                const isCurrent = currentLesson?.nr === lesson.nr
                const isNextL = nextLesson?.nr === lesson.nr
                const isDone = !isCurrent && timeToMins(lesson.do) < nowMins

                return (
                  <LessonBadge
                    key={lesson.nr}
                    lesson={lesson}
                    status={isCurrent ? 'current' : isNextL ? 'next' : isDone ? 'done' : 'upcoming'}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* PLAN JUTRA */}
        {tomorrowLessons.length > 0 && (
          <div>
            <div style={{
              fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--text-secondary)',
              marginBottom: '10px',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <BookOpen size={13} />
              Jutro — {tomorrowName}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {tomorrowLessons.map(lesson => (
                <LessonBadge key={lesson.nr} lesson={lesson} status="upcoming" />
              ))}
            </div>
          </div>
        )}

        {/* NO SCHOOL */}
        {!isWeekend && todayLessons.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
            <BookOpen size={28} style={{ color: 'var(--text-secondary)', margin: '0 auto 10px' }} />
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Brak lekcji w planie
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Sprawdz zastepstwa na stronie szkoly
            </div>
          </div>
        )}
      </div>
    </>
  )
}
