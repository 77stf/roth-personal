// ROTH Personal OS — Scoring dnia i strefy energetyczne

import { ENERGY_ZONES, SCORING_COMPONENTS, SCORING_PROGI } from './constants'
import type { DayScoring, EnergyZone, EnergyZoneInfo, TaskColor } from './types'

// ─── SCORING DNIA (0-20) ──────────────────────────────────────────────────
interface ScoringInput {
  isDzienSzkolny: boolean
  hasSprawdzian: boolean
  hasMeetingBiznesowy: boolean
  hasTrening: boolean
  hasDeadlineProjektu: boolean
  senGodzin: number       // godziny snu poprzedniej nocy
  isChoroba: boolean
  isWyjazd: boolean
  energiaCheckIn: number  // 1-5
}

export function obliczScoring(input: ScoringInput): DayScoring {
  const components = [
    { name: 'dzien_szkolny', points: 2, active: input.isDzienSzkolny },
    { name: 'sprawdzian_kartkowka', points: 4, active: input.hasSprawdzian },
    { name: 'meeting_biznesowy', points: 3, active: input.hasMeetingBiznesowy },
    { name: 'trening', points: 2, active: input.hasTrening },
    { name: 'deadline_projektu', points: 5, active: input.hasDeadlineProjektu },
    { name: 'sen_lt_6h', points: 3, active: input.senGodzin < 6 },
    { name: 'choroba', points: 4, active: input.isChoroba },
    { name: 'wyjazd', points: 3, active: input.isWyjazd },
    { name: 'energia_1_2', points: 3, active: input.energiaCheckIn <= 2 },
  ]

  const total = components
    .filter(c => c.active)
    .reduce((sum, c) => sum + c.points, 0)

  const clamped = Math.min(20, total)

  const prog = SCORING_PROGI.find(p => clamped >= p.min && clamped <= p.max)
  const label = prog?.label ?? 'Normalny'

  return { total: clamped, label, components }
}

export function getScoringLabel(total: number): string {
  const prog = SCORING_PROGI.find(p => total >= p.min && total <= p.max)
  return prog?.label ?? 'Normalny'
}

export function getScoringOpis(total: number): string {
  const prog = SCORING_PROGI.find(p => total >= p.min && total <= p.max)
  return prog?.opis ?? 'Standardowy plan'
}

// ─── STREFA ENERGETYCZNA ─────────────────────────────────────────────────
export function getCurrentEnergyZone(hour?: number): EnergyZoneInfo {
  const h = hour ?? new Date().getHours()

  if (h >= 7 && h < 11) return ENERGY_ZONES.find(z => z.name === 'ROZRUCH')!
  if (h >= 11 && h < 14) return ENERGY_ZONES.find(z => z.name === 'WZROST')!
  if (h >= 14 && h < 19) return ENERGY_ZONES.find(z => z.name === 'SZCZYT')!
  if (h >= 19 && h < 23) return ENERGY_ZONES.find(z => z.name === 'WIECZOR')!
  return ENERGY_ZONES.find(z => z.name === 'ZWALNIANIE')!
}

export function getEnergyZoneByName(name: EnergyZone): EnergyZoneInfo {
  return ENERGY_ZONES.find(z => z.name === name)!
}

// ─── KOLOR ZADANIA na podstawie strefy i godziny ─────────────────────────
// Zasada: CZERWONE zadania NIGDY przed 12:00
export function getAllowedTaskColors(hour?: number, energiaLevel?: number): TaskColor[] {
  const h = hour ?? new Date().getHours()

  // Przy energii 1-2 → tylko GREEN i YELLOW cały dzień
  if (energiaLevel !== undefined && energiaLevel <= 2) {
    return ['GREEN', 'YELLOW']
  }

  // Przed 12:00 → bez RED
  if (h < 12) return ['GREEN', 'YELLOW']

  return ['RED', 'YELLOW', 'GREEN']
}

export function isTaskColorAllowed(color: TaskColor, hour?: number, energiaLevel?: number): boolean {
  return getAllowedTaskColors(hour, energiaLevel).includes(color)
}

// ─── KALIBRACJA PLANU na podstawie energii ────────────────────────────────
export interface PlanKalibracja {
  maxTasks: number
  opis: string
  allowRed: boolean
}

export function getPlanKalibracja(energiaLevel: number): PlanKalibracja {
  if (energiaLevel <= 2) {
    return { maxTasks: 3, opis: 'Tylko zielone i żółte zadania', allowRed: false }
  }
  if (energiaLevel === 3) {
    return { maxTasks: 6, opis: 'Standardowy plan', allowRed: true }
  }
  return { maxTasks: 8, opis: 'Pełny plan + jedno wyzwanie extra', allowRed: true }
}

// ─── CZAS SNU ────────────────────────────────────────────────────────────
// Chronotyp: nocna sowa — zasypia 0:30-1:00, wstaje 9:00-10:00
export function getOptimalSleepTime(targetWakeHour = 9): string {
  // Minimum 7h snu, chronotyp nocna sowa
  const sleepHour = targetWakeHour - 7
  const normalized = sleepHour < 0 ? sleepHour + 24 : sleepHour
  return `${String(normalized).padStart(2, '0')}:00`
}

// ─── POZOSTAŁY CZAS DO SNU ────────────────────────────────────────────────
export function minutesUntilSleep(sleepTime = '23:30'): number {
  const now = new Date()
  const [sleepH, sleepM] = sleepTime.split(':').map(Number)

  let sleepDate = new Date(now)
  sleepDate.setHours(sleepH!, sleepM!, 0, 0)

  // Jeśli pora snu już minęła → jutro
  if (sleepDate <= now) {
    sleepDate = new Date(sleepDate.getTime() + 24 * 60 * 60 * 1000)
  }

  return Math.floor((sleepDate.getTime() - now.getTime()) / (1000 * 60))
}
