export const dynamic = 'force-dynamic'

// ─── Pełny plan lekcji z live statusem ────────────────────────────────────

import { getLessonPlan, getSprawdziany } from '@/lib/sheets'
import { LESSON_TIMES, PRZEDMIOT_NAZWY, PRZEDMIOT_KOLORY, SZKOLA } from '@/lib/constants'
import SchoolLiveView from './SchoolLiveView'

const DAY_MAP: Record<number, string> = {
  0: '', 1: 'Poniedzialek', 2: 'Wtorek', 3: 'Sroda', 4: 'Czwartek', 5: 'Piatek', 6: '',
}
const DAY_DISPLAY: Record<string, string> = {
  'Poniedzialek': 'Poniedziałek', 'Wtorek': 'Wtorek', 'Sroda': 'Środa',
  'Czwartek': 'Czwartek', 'Piatek': 'Piątek',
}

export interface LessonWithTime {
  nr: number
  od: string
  do: string
  przedmiot: string
  przedmiotPelna: string
  sala: string
  grupa: string
  kolor: string
}

export default async function SzkolaPage() {
  const now = new Date()
  const todayIdx = now.getDay()
  const todayKey = DAY_MAP[todayIdx] ?? ''
  const isWeekend = todayIdx === 0 || todayIdx === 6
  const tomorrowIdx = (todayIdx + 1) % 7
  const tomorrowKey = DAY_MAP[tomorrowIdx] ?? ''

  const [todayLessons, tomorrowLessons, sprawdziany] = await Promise.all([
    todayKey ? getLessonPlan(todayKey) : Promise.resolve([]),
    tomorrowKey ? getLessonPlan(tomorrowKey) : Promise.resolve([]),
    getSprawdziany(),
  ])

  function mapLessons(lessons: typeof todayLessons): LessonWithTime[] {
    return lessons.map(l => {
      const times = LESSON_TIMES[l.nrLekcji]
      const kolor = PRZEDMIOT_KOLORY[l.przedmiot] ?? PRZEDMIOT_KOLORY['default'] ?? '#94a3b8'
      return {
        nr: l.nrLekcji,
        od: times?.od ?? '--:--',
        do: times?.do ?? '--:--',
        przedmiot: l.przedmiot,
        przedmiotPelna: PRZEDMIOT_NAZWY[l.przedmiot] ?? l.przedmiot,
        sala: l.sala,
        grupa: l.grupa,
        kolor,
      }
    }).sort((a, b) => a.nr - b.nr)
  }

  function timeToMins(t: string) {
    const [h, m] = t.split(':').map(Number)
    return (h ?? 0) * 60 + (m ?? 0)
  }

  const todayMapped = mapLessons(todayLessons)
  const tomorrowMapped = mapLessons(tomorrowLessons)
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const nowMins = timeToMins(currentTimeStr)

  const currentLesson = isWeekend ? null : todayMapped.find(l =>
    timeToMins(l.od) <= nowMins && nowMins <= timeToMins(l.do)
  ) ?? null
  const nextLesson = isWeekend ? null : todayMapped.find(l =>
    timeToMins(l.od) > nowMins
  ) ?? null

  // Sprawdziany z dziś/jutro
  const todayStr = now.toISOString().split('T')[0]!
  const tomorrowDate = new Date(now); tomorrowDate.setDate(now.getDate() + 1)
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0]!
  const upcomingTests = sprawdziany.filter(s =>
    s.data === todayStr || s.data === tomorrowStr
  )

  return (
    <SchoolLiveView
      todayLessons={todayMapped}
      tomorrowLessons={tomorrowMapped}
      currentLesson={currentLesson}
      nextLesson={nextLesson}
      todayName={DAY_DISPLAY[todayKey] ?? 'Weekend'}
      tomorrowName={DAY_DISPLAY[tomorrowKey] ?? ''}
      isWeekend={isWeekend}
      currentTime={currentTimeStr}
      upcomingTests={upcomingTests.map(s => ({ przedmiot: s.przedmiot, typ: s.typ, data: s.data, temat: s.temat }))}
    />
  )
}
