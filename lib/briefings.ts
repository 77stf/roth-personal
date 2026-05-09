// ROTH Personal OS — Generatory briefingów (deterministyczny format)

import { buildRothContext } from './roth-context'
import { obliczTransport } from './transport'
import { getPogoda } from './weather'
import { getCytat, getAktywneReki, getBudzet, getPranieLog, getSprzatanieLog, getWaterToday, getOsobyProfile, readSheet } from './sheets'
import { getTomorrowEvents, getFirstLessonToday } from './calendar'
import { obliczScoring, getCurrentEnergyZone, minutesUntilSleep, getOptimalSleepTime } from './scoring'
import { getSprawdziany } from './sheets'
import { SHEETS, LESSON_TIMES } from './constants'
import type { TransportRecommendation } from './types'

// ─── HELPERS ─────────────────────────────────────────────────────────────

const PRIORITY_EMOJI: Record<string, string> = { red: '🔴', yellow: '🟡', green: '🟢' }

function scoringBar(total: number): string {
  const filled = Math.round(total / 2)
  return '▓'.repeat(filled) + '░'.repeat(10 - filled)
}

function scoringNum(scoringStr: string): number {
  return parseInt(scoringStr.match(/(\d+)\/20/)?.[1] ?? '0', 10)
}

function scoringLabel(scoringStr: string): string {
  return scoringStr.match(/\((.+)\)/)?.[1] ?? ''
}

function formatTasks(openTasks: string): string {
  if (!openTasks || openTasks === 'Brak otwartych zadań') return '🟢 Brak zadań — zaplanuj dzień'
  return openTasks.split(', ').map(t => {
    const m = t.match(/\[(red|yellow|green)\] (.+)/)
    if (!m) return `🟢 ${t}`
    return `${PRIORITY_EMOJI[m[1]!] ?? '🟢'} ${m[2]}`
  }).join('\n')
}

function formatDateShort(date: Date): string {
  return `${date.getDate()}.${String(date.getMonth() + 1).padStart(2, '0')}`
}

function transportCompact(rec: TransportRecommendation, szkolaGodzina: string): string {
  const via = rec.safe.type === 'transfer' ? `PKS (przez ${rec.safe.transferAt ?? '?'})` : 'PKS bezpośredni'
  return `Wyjście *${rec.leaveHomeAt}* → ZSE ~${rec.safe.arrival} _(${via})_\nSzkoła od *${szkolaGodzina}*`
}

function pogodaLine(temperatura: number, odczucie: number, opis: string, opad?: string): string {
  const opadStr = opad ? ` · ${opad}` : ''
  return `🌡️ *${temperatura}°C* (czuć ${odczucie}°C) · ${opis}${opadStr}`
}

function wakeUpForHour(lessonTime: string): string {
  const [h, m] = lessonTime.split(':').map(Number)
  const wakeMinutes = (h ?? 8) * 60 + (m ?? 0) - 40
  return `${String(Math.floor(wakeMinutes / 60)).padStart(2, '0')}:${String(wakeMinutes % 60).padStart(2, '0')}`
}

// ─── PORANNY BRIEF ───────────────────────────────────────────────────────
export async function generateMorningBriefFull(options?: {
  energiaCheckIn?: number
  useKolega?: boolean
}): Promise<string> {
  const [ctx, pogoda, cytat, leki, firstLesson, sprawdziany] = await Promise.all([
    buildRothContext({ energiaCheckIn: options?.energiaCheckIn }),
    getPogoda(),
    getCytat(),
    getAktywneReki(),
    getFirstLessonToday(),
    getSprawdziany(true).catch(() => []),
  ])

  const now = new Date()
  const dateStr = formatDateShort(now)
  const num = scoringNum(ctx.scoring)
  const label = scoringLabel(ctx.scoring)

  // Linia 1 — nagłówek
  let msg = `☀️ *PORANNY BRIEF — ${ctx.dayOfWeek} ${dateStr}*\n`
  msg += `\`${scoringBar(num)}\` *${num}/20* · ${label}\n\n`

  // Pogoda
  msg += `${pogodaLine(pogoda.temperatura, pogoda.odczucie, pogoda.opis, pogoda.opad)}\n`
  msg += `👕 ${pogoda.rekomendacjaUbrania}\n\n`

  // Transport / szkoła
  if (firstLesson) {
    const transport = await obliczTransport(firstLesson, options?.useKolega ?? false).catch(() => null)
    if (transport) {
      msg += `🚗 ${transportCompact(transport, firstLesson)}\n\n`
    } else {
      msg += `🏫 Szkoła od *${firstLesson}* — sprawdź transport\n\n`
    }
  } else {
    msg += `🏖 Brak szkoły dziś\n\n`
  }

  // Priorytety
  msg += `*PRIORYTETY DNIA*\n`
  msg += `${formatTasks(ctx.openTasks)}\n`

  // Sprawdziany w najbliższych 3 dniach
  const nadchodzace = sprawdziany.filter(s => {
    const diff = (new Date(s.data).getTime() - now.getTime()) / 86400000
    return diff >= 0 && diff <= 3
  })
  if (nadchodzace.length > 0) {
    msg += `\n⚠️ *SPRAWDZIANY*\n`
    nadchodzace.forEach(s => {
      const diff = Math.ceil((new Date(s.data).getTime() - now.getTime()) / 86400000)
      const kiedy = diff === 0 ? 'dziś' : diff === 1 ? 'jutro' : `za ${diff} dni`
      msg += `📝 ${s.przedmiot} (${s.typ}) — *${kiedy}*\n`
    })
  }

  // Alerty partnerów
  if (ctx.openPeopleIssues !== 'Brak otwartych spraw') {
    const firstIssue = ctx.openPeopleIssues.split('\n')[0]
    msg += `\n👤 ${firstIssue}\n`
  }

  // Leki poranne (przed 12:00)
  const lekiPorane = leki.filter(l => l.godziny.some(g => parseInt(g.split(':')[0] ?? '0') < 12))
  if (lekiPorane.length > 0) {
    msg += `\n💊 ${lekiPorane.map(l => `${l.nazwa} ${l.dawka} → ${l.godziny.filter(g => parseInt(g.split(':')[0] ?? '0') < 12).join(', ')}`).join(' · ')}\n`
  }

  msg += `💧 Cel: *2000ml* — zacznij butelkę\n`

  if (cytat) msg += `\n_"${cytat}"_`

  return msg
}

// ─── WIECZORNY BRIEF ─────────────────────────────────────────────────────
export async function generateEveningBriefFull(options?: {
  frictionLog?: string
  doneTasksText?: string
  notDoneTasksText?: string
}): Promise<string> {
  const now = new Date()
  const today = now.toISOString().split('T')[0]!
  const dateStr = formatDateShort(now)

  const [ctx, jutroEventy, pranieLog, sprzatanieLog, leki, waterToday, zadaniaRows] = await Promise.all([
    buildRothContext(),
    getTomorrowEvents(),
    getPranieLog(),
    getSprzatanieLog(),
    getAktywneReki(),
    getWaterToday(),
    readSheet(SHEETS.ZADANIA_DNIA).catch(() => [] as string[][]),
  ])

  // Zadania dziś — done vs not done
  const todayTasks = (zadaniaRows as string[][]).slice(1).filter(r => r[0] === today)
  const done = options?.doneTasksText
    ? options.doneTasksText.split('\n').filter(Boolean)
    : todayTasks.filter(r => r[5]?.toLowerCase() === 'tak').map(r => r[1] ?? '').filter(Boolean)
  const notDone = options?.notDoneTasksText
    ? options.notDoneTasksText.split('\n').filter(Boolean)
    : todayTasks.filter(r => r[5]?.toLowerCase() !== 'tak').map(r => r[1] ?? '').filter(Boolean)

  // Transport jutro
  const jSzkola = jutroEventy.find(e => e.isSchool)
  let transportJutroStr = 'Brak szkoły jutro'
  let jutroSzkolaGodzina: string | null = null
  if (jSzkola) {
    const d = new Date(jSzkola.start)
    jutroSzkolaGodzina = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    const transport = await obliczTransport(jutroSzkolaGodzina, false).catch(() => null)
    if (transport) {
      transportJutroStr = `Wyjście *${transport.leaveHomeAt}* → ZSE ~${transport.safe.arrival}`
    } else {
      transportJutroStr = `Oblicz transport na ${jutroSzkolaGodzina}`
    }
  }

  // Jutro heading
  const jutro = new Date(now); jutro.setDate(jutro.getDate() + 1)
  const jutroDateStr = formatDateShort(jutro)
  const WEEKDAYS = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota']
  const jutroDayName = WEEKDAYS[jutro.getDay()] ?? ''

  // Alerty domowe
  const alertyDomowe: string[] = []
  for (const p of pranieLog) {
    const daysSince = Math.floor((Date.now() - new Date(p.dataOstatniego).getTime()) / 86400000)
    if (daysSince >= p.limitDni) alertyDomowe.push(`🧺 Pranie ${p.kategoria}: ${daysSince}d (limit ${p.limitDni}d)`)
  }
  if (sprzatanieLog.nastepne) {
    const nextDate = new Date(sprzatanieLog.nastepne)
    if (nextDate <= now) alertyDomowe.push('🧹 Sprzątanie — zaplanowane, niezrobione!')
  }

  // Leki wieczorne (18:00+)
  const lekiWieczorne = leki.filter(l => l.godziny.some(g => parseInt(g.split(':')[0] ?? '0') >= 18))

  // Nagłówek
  let msg = `🌙 *WIECZORNY BRIEF — ${ctx.dayOfWeek} ${dateStr}*\n\n`

  // Podsumowanie dnia
  if (done.length > 0 || notDone.length > 0) {
    msg += `*DZIŚ*\n`
    if (done.length > 0) msg += `✅ ${done.join(' · ')}\n`
    if (notDone.length > 0) msg += `❌ ${notDone.join(' · ')}\n`
    if (options?.frictionLog) msg += `⚙️ ${options.frictionLog}\n`
    msg += '\n'
  }

  // Jutro
  msg += `*JUTRO — ${jutroDayName} ${jutroDateStr}*\n`
  if (jutroSzkolaGodzina) {
    msg += `🏫 Szkoła od *${jutroSzkolaGodzina}* → wstań *${wakeUpForHour(jutroSzkolaGodzina)}*\n`
    msg += `🚗 ${transportJutroStr}\n`
  } else {
    msg += `🏖 Wolny dzień\n`
  }
  msg += '\n'

  // Dom
  msg += `*DOM*\n`
  const waterPct = Math.round(waterToday.procent)
  const waterEmoji = waterPct >= 80 ? '✅' : waterPct >= 50 ? '🟡' : '🔴'
  msg += `💧 ${waterEmoji} *${waterToday.wypito}* / ${waterToday.celMl}ml _(${waterPct}%)_\n`
  if (alertyDomowe.length > 0) {
    alertyDomowe.forEach(a => { msg += `${a}\n` })
  } else {
    msg += `🏠 Dom OK\n`
  }

  // Leki wieczorne
  if (lekiWieczorne.length > 0) {
    msg += `\n💊 ${lekiWieczorne.map(l => `${l.nazwa} ${l.dawka} → ${l.godziny.filter(g => parseInt(g.split(':')[0] ?? '0') >= 18).join(', ')}`).join(' · ')}\n`
  }
  msg += `🖐 Lanolina (usta, przed snem)`

  return msg
}

// ─── PRE-SLEEP PROTOCOL ───────────────────────────────────────────────────
export async function generatePreSleepFull(): Promise<string> {
  const [ctx, jutroEventy] = await Promise.all([
    buildRothContext(),
    getTomorrowEvents(),
  ])

  const jutroEvent = jutroEventy.find(e => e.isSchool || e.isMeeting || e.isTraining)
  let jutroGodzina: string | undefined
  if (jutroEvent?.start) {
    const d = new Date(jutroEvent.start)
    jutroGodzina = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const minutesDo2330 = minutesUntilSleep('23:30')
  const senGodzina = jutroGodzina ? getOptimalSleepTime(parseInt(jutroGodzina.split(':')[0] ?? '9') + 1) : '23:30'
  const wakeUp = jutroGodzina ? wakeUpForHour(jutroGodzina) : '09:00'

  // Zrobione zadania dziś
  const today = new Date().toISOString().split('T')[0]!
  const zadania = await readSheet(SHEETS.ZADANIA_DNIA).catch(() => [] as string[][])
  const doneTodayCount = (zadania as string[][]).slice(1)
    .filter(r => r[0] === today && r[5]?.toLowerCase() === 'tak').length

  let msg = `🌑 *PRE-SLEEP PROTOCOL*\n\n`

  msg += minutesDo2330 > 0
    ? `*${minutesDo2330} min* do optymalnego snu\n`
    : `Czas na sen — *${Math.abs(minutesDo2330)} min* po ${23}:30\n`

  msg += `Dziś: *${doneTodayCount} rzeczy* ukończone ✅\n\n`

  if (jutroEvent && jutroGodzina) {
    msg += `Jutro: *${jutroEvent.title}* o *${jutroGodzina}*\n`
    msg += `→ Wstań *${wakeUp}* · Połóż się *${senGodzina}*\n`
    msg += `💤 Sen: ${senGodzina}–${wakeUp} _(7h)_`
  } else {
    msg += `Jutro: luz — zaplanuj *3 zadania biznesowe*\n`
    msg += `💤 Połóż się *23:30* (7h snu)`
  }

  return msg
}

// ─── WATER TRACKER pytanie ────────────────────────────────────────────────
export function generateWaterQuestion(currentMl: number, targetMl = 2000): string {
  const remaining = targetMl - currentMl
  const percent = Math.round((currentMl / targetMl) * 100)

  let intro = ''
  if (percent < 25) intro = '💧 Tylko zaczynasz — '
  else if (percent < 50) intro = '💧 W połowie drogi — '
  else if (percent < 75) intro = '💪 Dobra robota — '
  else if (percent < 100) intro = '🔥 Prawie cel — '
  else return `✅ Cel wodny osiągnięty! ${currentMl}ml / ${targetMl}ml. Dobra robota.`

  return `${intro}*${currentMl}ml* / ${targetMl}ml (${remaining}ml do celu)\nIle teraz wypiłeś?\n[250ml] [500ml] [Pominąłem]`
}

// ─── ALERT BUDŻETU ────────────────────────────────────────────────────────
export async function checkBudzetAlerts(): Promise<string[]> {
  const budzet = await getBudzet()
  return budzet
    .filter(b => b.alert)
    .map(b => `⚠️ Budżet ${b.kategoria}: ${b.procent}% (${b.wydano}/${b.limit} PLN)`)
}

// ─── ALERT PARTNERÓW ─────────────────────────────────────────────────────
export async function checkPartnerAlerts(): Promise<string[]> {
  const osoby = await getOsobyProfile()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 3)
  const cutoffStr = cutoff.toISOString().split('T')[0]!

  return osoby
    .filter(o => o.otwarteSrawy.length > 0 && o.ostatniKontakt < cutoffStr)
    .map(o => `👤 ${o.imie}: brak kontaktu ${calcDaysSince(o.ostatniKontakt)} dni. Sprawy: ${o.otwarteSrawy.join(', ')}`)
}

function calcDaysSince(dateStr: string): number {
  const d = new Date(dateStr)
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
}
