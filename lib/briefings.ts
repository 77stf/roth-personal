// ROTH Personal OS — Generatory briefingów

import { buildRothContext } from './roth-context'
import { obliczTransport, formatTransportTelegram } from './transport'
import { getPogoda, formatPogodaTelegram } from './weather'
import { getCytat, getAktywneReki, getBudzet, getPranieLog, getSprzatanieLog, getWaterToday, getOsobyProfile } from './sheets'
import {
  generateMorningBrief, generateEveningBrief, generatePreSleep,
} from './claude'
import { getTomorrowEvents, formatEventsForContext, getFirstLessonToday } from './calendar'
import { obliczScoring, getCurrentEnergyZone, minutesUntilSleep } from './scoring'
import { PRANIE_LIMITY } from './constants'
import type { MorningBrief, EveningBrief, PreSleepProtocol } from './types'

// ─── PORANNY BRIEF ───────────────────────────────────────────────────────
export async function generateMorningBriefFull(options?: {
  energiaCheckIn?: number
  useKolega?: boolean
}): Promise<string> {
  const [ctx, pogoda, cytat, leki, firstLesson] = await Promise.all([
    buildRothContext({ energiaCheckIn: options?.energiaCheckIn }),
    getPogoda(),
    getCytat(),
    getAktywneReki(),
    getFirstLessonToday(),
  ])

  // Transport
  let transportStr = 'Brak szkoły dziś'
  if (firstLesson) {
    const transport = await obliczTransport(firstLesson, options?.useKolega ?? false)
    transportStr = transport ? formatTransportTelegram(transport) : `Brak opcji transportu — szkoła o ${firstLesson}`
  }

  const pogodaStr = formatPogodaTelegram(pogoda)
  const lekiStr = leki.map(l => `${l.nazwa} ${l.dawka} o ${l.godziny.join(', ')}`).join('\n') || ''
  const cytatStr = cytat

  return generateMorningBrief(ctx, {
    pogoda: pogodaStr,
    transport: transportStr,
    priorytety: ctx.openTasks,
    leki: lekiStr,
    cytat: cytatStr,
  })
}

// ─── WIECZORNY BRIEF ─────────────────────────────────────────────────────
export async function generateEveningBriefFull(options?: {
  frictionLog?: string
  doneTasksText?: string
  notDoneTasksText?: string
}): Promise<string> {
  const [ctx, jutroEventy, pranieLog, sprzatanieLog, leki, waterToday] = await Promise.all([
    buildRothContext(),
    getTomorrowEvents(),
    getPranieLog(),
    getSprzatanieLog(),
    getAktywneReki(),
    getWaterToday(),
  ])

  // Transport jutro
  const jSzkola = jutroEventy.find(e => e.isSchool)
  let transportJutro = 'Brak szkoły jutro'
  if (jSzkola) {
    const d = new Date(jSzkola.start)
    const firstLesson = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    const transport = await obliczTransport(firstLesson, false)
    transportJutro = transport ? formatTransportTelegram(transport) : `Oblicz transport na ${firstLesson}`
  }

  // Alerty domowe
  const alertyDomowe: string[] = []

  // Pranie
  for (const pranie of pranieLog) {
    const lastDate = new Date(pranie.dataOstatniego)
    const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince >= pranie.limitDni) {
      alertyDomowe.push(`⚠️ Pranie ${pranie.kategoria} — ${daysSince} dni bez prania (limit: ${pranie.limitDni})`)
    }
  }

  // Sprzątanie
  if (sprzatanieLog.nastepne) {
    const nextDate = new Date(sprzatanieLog.nastepne)
    const today = new Date()
    if (nextDate <= today) {
      alertyDomowe.push('🧹 Sprzątanie zaplanowane — nie zrobione!')
    }
  }

  // Leki wieczorne
  const lekiWieczorne = leki.filter(l =>
    l.godziny.some(g => {
      const h = parseInt(g.split(':')[0] ?? '0')
      return h >= 18
    })
  )
  const lekiStr = lekiWieczorne.map(l => `${l.nazwa} ${l.dawka}`).join(', ') || 'Brak'

  // Woda
  const waterStr = `${waterToday.wypito}ml / ${waterToday.celMl}ml (${waterToday.procent}%)`

  const zastepstwaJutro = formatEventsForContext(jutroEventy.filter(e => e.isSchool))

  return generateEveningBrief(ctx, {
    done: options?.doneTasksText ?? '(brak danych)',
    notDone: options?.notDoneTasksText ?? '(brak danych)',
    frictionLog: options?.frictionLog,
    zastepstwaJutro,
    transportJutro,
    alertyDomowe: alertyDomowe.join('\n') || 'Brak alertów',
    wodaPodsumowanie: waterStr,
  })
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

  const minutesDo0030 = minutesUntilSleep('23:30')
  const doneTodayCount = 0  // TODO: z Google Tasks

  return generatePreSleep(ctx, {
    rzeczyZrobione: doneTodayCount,
    jutroEvent: jutroEvent?.title,
    jutroGodzina,
    minutesDo0030,
  })
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

  return `${intro}${currentMl}ml / ${targetMl}ml (${remaining}ml do celu)\n` +
    `Ile teraz wypiłeś?\n[250ml] [500ml] [Pominąłem]`
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
