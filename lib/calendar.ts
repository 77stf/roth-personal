// ROTH Personal OS — Google Calendar API v3

import { google } from 'googleapis'

function getCalendarAuth() {
  const auth = new google.auth.OAuth2(
    process.env['GOOGLE_CLIENT_ID'],
    process.env['GOOGLE_CLIENT_SECRET'],
  )
  auth.setCredentials({ refresh_token: process.env['GOOGLE_REFRESH_TOKEN'] })
  return auth
}

export interface CalendarEvent {
  id: string
  title: string
  start: string      // ISO datetime
  end: string
  isAllDay: boolean
  location?: string
  description?: string
  isSchool: boolean
  isTraining: boolean
  isTrip: boolean    // zawiera [WYJAZD]
  isMeeting: boolean
}

// ─── Pobierz eventy dziś ──────────────────────────────────────────────────
export async function getTodayEvents(): Promise<CalendarEvent[]> {
  const auth = getCalendarAuth()
  const calendar = google.calendar({ version: 'v3', auth })

  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  })

  return (res.data.items ?? []).map(event => ({
    id: event.id ?? '',
    title: event.summary ?? '',
    start: event.start?.dateTime ?? event.start?.date ?? '',
    end: event.end?.dateTime ?? event.end?.date ?? '',
    isAllDay: !event.start?.dateTime,
    location: event.location ?? undefined,
    description: event.description ?? undefined,
    isSchool: /szkoła|lekcja|ZSE/i.test(event.summary ?? ''),
    isTraining: /trening|siłownia|badminton|gym/i.test(event.summary ?? ''),
    isTrip: /\[WYJAZD\]/i.test(event.summary ?? ''),
    isMeeting: /meeting|spotkanie|call/i.test(event.summary ?? ''),
  }))
}

// ─── Pobierz eventy jutro ────────────────────────────────────────────────
export async function getTomorrowEvents(): Promise<CalendarEvent[]> {
  const auth = getCalendarAuth()
  const calendar = google.calendar({ version: 'v3', auth })

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const startOfDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())
  const endOfDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1)

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  })

  return (res.data.items ?? []).map(event => ({
    id: event.id ?? '',
    title: event.summary ?? '',
    start: event.start?.dateTime ?? event.start?.date ?? '',
    end: event.end?.dateTime ?? event.end?.date ?? '',
    isAllDay: !event.start?.dateTime,
    location: event.location ?? undefined,
    description: event.description ?? undefined,
    isSchool: /szkoła|lekcja|ZSE/i.test(event.summary ?? ''),
    isTraining: /trening|siłownia|badminton|gym/i.test(event.summary ?? ''),
    isTrip: /\[WYJAZD\]/i.test(event.summary ?? ''),
    isMeeting: /meeting|spotkanie|call/i.test(event.summary ?? ''),
  }))
}

// ─── Sprawdź czy teraz jest event (dla anti-prokrastynacja) ──────────────
export async function isCurrentlyBusy(): Promise<{ busy: boolean; event?: CalendarEvent }> {
  const events = await getTodayEvents()
  const now = new Date()

  const currentEvent = events.find(e => {
    if (!e.start || !e.end) return false
    const start = new Date(e.start)
    const end = new Date(e.end)
    return now >= start && now <= end
  })

  return { busy: !!currentEvent, event: currentEvent }
}

// ─── Pobierz pierwszą lekcję dziś ────────────────────────────────────────
export async function getFirstLessonToday(): Promise<string | null> {
  const events = await getTodayEvents()
  const school = events.find(e => e.isSchool && e.start)
  if (!school) return null

  // Zwróć godzinę w formacie HH:mm
  const d = new Date(school.start)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// ─── Format do kontekstu ROTH ────────────────────────────────────────────
export function formatEventsForContext(events: CalendarEvent[]): string {
  if (events.length === 0) return 'Brak eventów'

  return events.map(e => {
    const timeStr = e.isAllDay ? '(cały dzień)' : formatTimeRange(e.start, e.end)
    const tags = [
      e.isSchool && '[SZKOŁA]',
      e.isTraining && '[TRENING]',
      e.isTrip && '[WYJAZD]',
      e.isMeeting && '[MEETING]',
    ].filter(Boolean).join(' ')

    return `${timeStr} ${e.title} ${tags}`
  }).join('\n')
}

function formatTimeRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const fmt = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${fmt(s)}-${fmt(e)}`
}
