// ROTH Personal OS — buildRothContext()
// Budowany raz per request — agreguje dane z wszystkich źródeł

import { getTodayEvents, formatEventsForContext } from './calendar'
import { getWaterToday, getAktywneReki, getProjektyOFM, getProjektyAI, getOsobyProfile, readSheet } from './sheets'
import { SHEETS, ALERT_PARTNER_DNI } from './constants'
import { obliczScoring, getCurrentEnergyZone, getScoringLabel } from './scoring'
import type { RothContextData } from './claude'

const WEEKDAYS_PL = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota']

export async function buildRothContext(options?: {
  energiaCheckIn?: number
}): Promise<RothContextData> {
  const now = new Date()
  const dataToday = now.toISOString().split('T')[0]!
  const dayOfWeek = WEEKDAYS_PL[now.getDay()] ?? 'Niedziela'

  // Równoległe pobieranie danych
  const [events, water, leki, projektyOFM, projektyAI, osoby, zadania] = await Promise.allSettled([
    getTodayEvents(),
    getWaterToday(),
    getAktywneReki(),
    getProjektyOFM(),
    getProjektyAI(),
    getOsobyProfile(),
    readSheet(SHEETS.ZADANIA_DNIA),
  ])

  const calendarEvents = events.status === 'fulfilled' ? events.value : []
  const waterData = water.status === 'fulfilled' ? water.value : null
  const lekiData = leki.status === 'fulfilled' ? leki.value : []
  const ofmData = projektyOFM.status === 'fulfilled' ? projektyOFM.value : []
  const aiData = projektyAI.status === 'fulfilled' ? projektyAI.value : []
  const osobyData = osoby.status === 'fulfilled' ? osoby.value : []
  const zadaniaRows = zadania.status === 'fulfilled' ? zadania.value : []

  // Scoring dnia
  const scoring = obliczScoring({
    isDzienSzkolny: calendarEvents.some(e => e.isSchool),
    hasSprawdzian: calendarEvents.some(e => /sprawdzian|kartkówka/i.test(e.title)),
    hasMeetingBiznesowy: calendarEvents.some(e => e.isMeeting),
    hasTrening: calendarEvents.some(e => e.isTraining),
    hasDeadlineProjektu: false,
    senGodzin: 7,  // default
    isChoroba: false,
    isWyjazd: calendarEvents.some(e => e.isTrip),
    energiaCheckIn: options?.energiaCheckIn ?? 3,
  })

  const energiaZona = getCurrentEnergyZone()

  // Otwarte sprawy z partnerami (brak kontaktu > 3 dni)
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - ALERT_PARTNER_DNI)
  const cutoffStr = cutoffDate.toISOString().split('T')[0]!

  const openPeopleIssues = osobyData
    .filter(o => o.ostatniKontakt < cutoffStr && o.otwarteSrawy.length > 0)
    .map(o => `${o.imie}: ${o.otwarteSrawy.join(', ')} (ostatni kontakt: ${o.ostatniKontakt})`)
    .join('\n') || 'Brak otwartych spraw'

  // OFM status
  const ofmStatus = ofmData.length > 0
    ? ofmData.map(p => `${p.modelka} [${p.status}] — ${p.nastepnyKrok}`).join('; ')
    : 'Brak aktywnych projektów OFM'

  // AI status
  const aiStatus = aiData.length > 0
    ? aiData.map(p => `${p.firma} [${p.etap}]`).join('; ')
    : 'Negocjacje z agencją — brak podpisanego kontraktu'

  // Aktywna kuracja
  const aktivnaKuracja = lekiData.length > 0
    ? lekiData.map(l => `${l.nazwa} ${l.dawka} (${l.godziny.join(', ')})`).join(', ')
    : undefined

  return {
    dataToday,
    dayOfWeek,
    scoring: `${scoring.total}/20 (${getScoringLabel(scoring.total)})`,
    energiaZona: `${energiaZona.name} — ${energiaZona.level}`,
    energiaCheckIn: options?.energiaCheckIn,
    calendarToday: formatEventsForContext(calendarEvents),
    openTasks: (() => {
      const todayStr = dataToday
      const todayTasks = zadaniaRows.slice(1).filter(r => r[0] === todayStr && r[5]?.toLowerCase() !== 'tak')
      if (todayTasks.length === 0) return 'Brak otwartych zadań'
      return todayTasks.map(r => `[${r[2] ?? 'zielone'}] ${r[1] ?? ''}`).join(', ')
    })(),
    openPeopleIssues,
    ofmStatus,
    aiStatus,
    waterDzis: waterData?.wypito,
    aktivnaKuracja,
  }
}
