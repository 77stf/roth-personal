'use client'

import type { LessonWithTime } from './page'

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
      borderRadius: '12px',
      background: isCurrent
        ? `${lesson.kolor}18`
        : isDone
          ? 'rgba(255,255,255,0.03)'
          : 'rgba(255,255,255,0.05)',
      border: isCurrent
        ? `1px solid ${lesson.kolor}60`
        : isNext
          ? '1px solid rgba(255,255,255,0.12)'
          : '1px solid rgba(255,255,255,0.05)',
      opacity: isDone ? 0.45 : 1,
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
        background: isCurrent ? lesson.kolor : 'rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '12px', fontWeight: 700, flexShrink: 0,
        color: isCurrent ? '#fff' : 'rgba(255,255,255,0.5)',
      }}>
        {lesson.nr}
      </div>

      {/* Godzina */}
      <div style={{
        fontSize: '11px', color: 'rgba(255,255,255,0.4)',
        fontVariantNumeric: 'tabular-nums', flexShrink: 0, width: '90px',
      }}>
        {lesson.od} – {lesson.do}
      </div>

      {/* Przedmiot */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px', fontWeight: isCurrent ? 600 : 500,
          color: isCurrent ? '#fff' : 'rgba(255,255,255,0.8)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {lesson.przedmiotPelna}
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
          sala {lesson.sala}
          {lesson.grupa !== 'cala_klasa' && ` · gr. ${lesson.grupa}`}
        </div>
      </div>

      {/* Status badge */}
      {isCurrent && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '3px 8px', borderRadius: '20px',
          background: `${lesson.kolor}25`, border: `1px solid ${lesson.kolor}50`,
          fontSize: '10px', fontWeight: 600, color: lesson.kolor,
          flexShrink: 0,
        }}>
          <span style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: lesson.kolor, animation: 'pulse-dot 1.5s infinite',
          }} />
          TERAZ
        </div>
      )}
      {isNext && !isCurrent && (
        <div style={{
          padding: '3px 8px', borderRadius: '20px',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)',
          flexShrink: 0,
        }}>
          NASTĘPNA
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

  const schoolDone = !isWeekend && todayLessons.length > 0 && (
    !nextLesson && !currentLesson
  )
  const schoolNotStarted = !isWeekend && todayLessons.length > 0 && (
    !currentLesson && nextLesson?.nr === todayLessons[0]?.nr
  )

  return (
    <>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        padding: '24px 20px', maxWidth: '760px', margin: '0 auto',
        animation: 'fade-in 0.3s ease',
      }}>
        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
            Szkoła · 3PB · Gr. 2/2
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>
              {isWeekend ? 'Weekend' : todayName}
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' }}>
              {currentTime}
            </div>
          </div>
        </div>

        {/* ── WEEKEND MESSAGE ─────────────────────────────────────────────── */}
        {isWeekend && (
          <div style={{
            padding: '24px', borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
            border: '1px solid rgba(99,102,241,0.2)',
            textAlign: 'center', marginBottom: '24px',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏖️</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Weekend!</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
              Czas na OFM, AI Consulting lub Tajlandię 🇹🇭
            </div>
          </div>
        )}

        {/* ── LIVE STATUS CARDS (tylko dni robocze) ───────────────────────── */}
        {!isWeekend && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            {/* Aktualna lekcja */}
            <div style={{
              padding: '20px',
              borderRadius: '16px',
              background: currentLesson
                ? `linear-gradient(135deg, ${currentLesson.kolor}20, ${currentLesson.kolor}08)`
                : schoolDone
                  ? 'rgba(34,197,94,0.08)'
                  : 'rgba(255,255,255,0.04)',
              border: currentLesson
                ? `1px solid ${currentLesson.kolor}40`
                : schoolDone
                  ? '1px solid rgba(34,197,94,0.2)'
                  : '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)',
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
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                    {currentLesson.przedmiotPelna}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                    {currentLesson.od} – {currentLesson.do} · sala {currentLesson.sala}
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '3px 10px', borderRadius: '20px',
                    background: `${currentLesson.kolor}20`,
                    fontSize: '11px', fontWeight: 600, color: currentLesson.kolor,
                  }}>
                    Lekcja {currentLesson.nr}
                  </div>
                </>
              ) : schoolDone ? (
                <>
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>✅</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(34,197,94,0.9)' }}>
                    Szkoła skończona
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
                    Czas na projekty!
                  </div>
                </>
              ) : schoolNotStarted ? (
                <>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
                    Szkoła jeszcze się nie zaczęła
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
                    Pierwsza lekcja: {todayLessons[0]?.od}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
                  Brak lekcji
                </div>
              )}
            </div>

            {/* Następna lekcja */}
            <div style={{
              padding: '20px', borderRadius: '16px',
              background: nextLesson
                ? `rgba(255,255,255,0.05)`
                : 'rgba(255,255,255,0.03)',
              border: nextLesson
                ? '1px solid rgba(255,255,255,0.1)'
                : '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{
                fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)',
                marginBottom: '12px',
              }}>
                Następna lekcja
              </div>

              {nextLesson ? (
                <>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                    {nextLesson.przedmiotPelna}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                    {nextLesson.od} – {nextLesson.do} · sala {nextLesson.sala}
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    padding: '3px 10px', borderRadius: '20px',
                    background: 'rgba(255,255,255,0.08)',
                    fontSize: '11px', color: 'rgba(255,255,255,0.5)',
                  }}>
                    Za {timeToMins(nextLesson.od) - nowMins} min
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)' }}>
                  {schoolDone ? 'Koniec na dziś 🎉' : 'Brak następnej'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SPRAWDZIANY ALERT ────────────────────────────────────────────── */}
        {upcomingTests.length > 0 && (
          <div style={{
            padding: '16px', borderRadius: '12px', marginBottom: '20px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          }}>
            <div style={{
              fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'rgba(239,68,68,0.8)', marginBottom: '10px',
            }}>
              ⚡ Nadchodzące sprawdziany
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {upcomingTests.map((t, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  fontSize: '13px',
                }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '6px',
                    background: 'rgba(239,68,68,0.15)',
                    fontSize: '10px', fontWeight: 700, color: 'rgba(239,68,68,0.9)',
                  }}>
                    {t.typ.toUpperCase()}
                  </span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{t.przedmiot}</span>
                  {t.temat && <span style={{ color: 'rgba(255,255,255,0.4)' }}>— {t.temat}</span>}
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                    {t.data}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PLAN DNIA (timeline) ─────────────────────────────────────────── */}
        {!isWeekend && todayLessons.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              fontSize: '12px', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)',
              marginBottom: '12px',
            }}>
              Plan dnia — {todayName}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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

        {/* ── PLAN JUTRA ───────────────────────────────────────────────────── */}
        {tomorrowLessons.length > 0 && (
          <div>
            <div style={{
              fontSize: '12px', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'rgba(255,255,255,0.25)',
              marginBottom: '12px',
            }}>
              Jutro — {tomorrowName}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {tomorrowLessons.map(lesson => (
                <LessonBadge key={lesson.nr} lesson={lesson} status="upcoming" />
              ))}
            </div>
          </div>
        )}

        {/* ── NO SCHOOL DAY ───────────────────────────────────────────────── */}
        {!isWeekend && todayLessons.length === 0 && (
          <div style={{
            padding: '24px', borderRadius: '16px', textAlign: 'center',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>
              Brak lekcji w planie
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
              Sprawdź zastępstwa na stronie szkoły
            </div>
          </div>
        )}
      </div>
    </>
  )
}
