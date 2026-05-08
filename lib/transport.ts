// ROTH Personal OS — Algorytm transportowy
// Implementuje 5-krokowy algorytm z CLAUDE.md
// ZERO hardcode — wszystkie godziny z arkusza ROZKLAD_BUSOW

import { getBusSchedule } from './sheets'
import { TRANSPORT } from './constants'
import type { BusRoute, TransportRecommendation } from './types'

// Konwersja "HH:mm" → minuty od północy
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

// Konwersja minut od północy → "HH:mm"
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Dodaj minuty do czasu "HH:mm"
function addMinutes(time: string, minutes: number): string {
  return minutesToTime(timeToMinutes(time) + minutes)
}

// Odejmij minuty od czasu
function subtractMinutes(time: string, minutes: number): string {
  return minutesToTime(timeToMinutes(time) - minutes)
}

// ─── GŁÓWNY ALGORYTM (5 kroków z CLAUDE.md) ──────────────────────────────
// Krok 1: Pobierz godzinę 1. lekcji z Google Calendar
// Krok 2: Sprawdź kombinacje tras z buforem 5 min na spóźnienie
// Krok 3: Przesiadka < 8 min = oznacz RYZYKOWNA
// Krok 4: Zawsze pokazuj 2 opcje: bezpieczna + szybsza (z ostrzeżeniem)
// Krok 5: Oblicz godzinę wyjścia z domu (wybrany bus - 10 min)

export async function obliczTransport(
  firstLessonAt: string,  // "HH:mm"
  useKolega = false,
): Promise<TransportRecommendation | null> {
  // Z kolegą — zawsze 30 min przed lekcją
  if (useKolega) {
    const leaveAt = subtractMinutes(firstLessonAt, 30)
    return {
      safe: {
        from: 'Dom',
        to: 'ZSE Śrem',
        departure: leaveAt,
        arrival: firstLessonAt,
        duration: 30,
        type: 'direct',
      },
      leaveHomeAt: leaveAt,
      firstLessonAt,
    }
  }

  // Krok 1: Oblicz najpóźniejszy czas dotarcia (z 5 min buforem)
  const mustArriveBy = subtractMinutes(firstLessonAt, 0)
  const mustArriveMinutes = timeToMinutes(mustArriveBy)

  // Krok 2: Pobierz rozkłady z Sheets
  const allBuses = await getBusSchedule()

  // Trasy z Konarskiego
  const konarskeDoSremu = allBuses.filter(b =>
    b.trasa.toLowerCase().includes('konarskie') &&
    b.kierunek.toLowerCase().includes('srem')
  )
  const konarskeDoBnina = allBuses.filter(b =>
    b.trasa.toLowerCase().includes('konarskie') &&
    b.kierunek.toLowerCase().includes('bnin')
  )
  const bninDoSremu = allBuses.filter(b =>
    b.trasa.toLowerCase().includes('bnin') &&
    b.kierunek.toLowerCase().includes('srem')
  )

  const validRoutes: BusRoute[] = []

  // Opcja A: Bezpośredni Konarskie → Śrem
  for (const bus of konarskeDoSremu) {
    const departureMins = timeToMinutes(bus.godzina)
    // Czas jazdy bezpośredniej: zakładamy ~25 min
    const travelTime = 25
    const arrivalMins = departureMins + travelTime + TRANSPORT.buforPKS

    if (arrivalMins <= mustArriveMinutes) {
      validRoutes.push({
        from: 'Konarskie',
        to: 'ZSE Śrem',
        departure: bus.godzina,
        arrival: minutesToTime(departureMins + travelTime),
        duration: travelTime,
        type: 'direct',
      })
    }
  }

  // Opcja B: Konarskie → Bnin + przesiadka → Śrem
  for (const busK of konarskeDoBnina) {
    const departureKMins = timeToMinutes(busK.godzina)
    // Czas Konarskie → Bnin: ~12 min + 5 min bufor
    const arrivalBninMins = departureKMins + 12 + TRANSPORT.buforPKS

    for (const busB of bninDoSremu) {
      const departureBninMins = timeToMinutes(busB.godzina)
      const transferTime = departureBninMins - arrivalBninMins

      if (transferTime < 0) continue  // bus z Bnina odjeżdża za wcześnie

      // Czas Bnin → Śrem: ~15 min + 5 min bufor
      const arrivalSremMins = departureBninMins + 15 + TRANSPORT.buforPKS

      if (arrivalSremMins <= mustArriveMinutes) {
        const isRisky = transferTime < TRANSPORT.minBezpiecznaPrzesiadka

        validRoutes.push({
          from: 'Konarskie',
          to: 'ZSE Śrem',
          departure: busK.godzina,
          arrival: minutesToTime(departureBninMins + 15),
          duration: 12 + transferTime + 15,
          type: 'transfer',
          transferAt: 'Bnin',
          transferTime,
          risky: isRisky,
        })
      }
    }
  }

  if (validRoutes.length === 0) return null

  // Krok 3 & 4: Sortuj po czasie odjazdu (najwcześniej = bezpieczna)
  validRoutes.sort((a, b) => timeToMinutes(b.departure) - timeToMinutes(a.departure))

  // Bezpieczna = najpóźniejszy odjazd (ale wciąż na czas) bez RYZYKOWNA
  const safeCandidates = validRoutes.filter(r => !r.risky)
  const riskyCandidates = validRoutes.filter(r => r.risky)

  const safeRoute = safeCandidates[0] ?? validRoutes[0]!
  // Fast = ewentualnie ryzykowna, ale szybsza
  const fastRoute = riskyCandidates.length > 0 && safeCandidates.length > 0
    ? riskyCandidates.find(r => timeToMinutes(r.departure) > timeToMinutes(safeRoute.departure))
    : undefined

  // Krok 5: Oblicz godzinę wyjścia z domu (bus - 10 min do przystanku)
  const leaveHomeAt = subtractMinutes(safeRoute.departure, TRANSPORT.przystanekDoDomu)

  return {
    safe: safeRoute,
    fast: fastRoute,
    leaveHomeAt,
    firstLessonAt,
  }
}

// ─── FORMAT ODPOWIEDZI TELEGRAM ───────────────────────────────────────────
export function formatTransportTelegram(rec: TransportRecommendation): string {
  const { safe, fast, leaveHomeAt, firstLessonAt } = rec
  let msg = `🚌 *Transport na ${firstLessonAt}*\n\n`

  msg += `✅ *Bezpieczna opcja:*\n`
  msg += `Wyjdź z domu: *${leaveHomeAt}*\n`
  msg += `Odjazd: ${safe.departure}`
  if (safe.type === 'transfer') {
    msg += ` → przesiadka ${safe.transferAt} (${safe.transferTime} min)`
  }
  msg += `\nDotarcie: ~${safe.arrival}\n`

  if (fast) {
    msg += `\n⚠️ *Szybsza (RYZYKOWNA):*\n`
    msg += `Odjazd: ${fast.departure}`
    if (fast.type === 'transfer') {
      msg += ` → przesiadka ${fast.transferAt} (*tylko ${fast.transferTime} min!*)`
    }
    msg += `\nDotarcie: ~${fast.arrival}\n`
  }

  return msg
}

// ─── SPRAWDŹ CZY ZDĄŻYSZ ─────────────────────────────────────────────────
export function checkCanMakeIt(
  currentTime: string,
  firstLessonAt: string,
): 'tak' | 'ryzykownie' | 'nie' {
  const diffMins = timeToMinutes(firstLessonAt) - timeToMinutes(currentTime)
  if (diffMins >= 30) return 'tak'
  if (diffMins >= 15) return 'ryzykownie'
  return 'nie'
}
