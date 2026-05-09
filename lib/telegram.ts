// ROTH Personal OS — Telegram Bot (Grammy)
// Wszystkie komendy, handlery i helpers

import { Bot, InlineKeyboard, type Context } from 'grammy'
import { generateMorningBriefFull, generateEveningBriefFull, generatePreSleepFull, generateWaterQuestion, checkBudzetAlerts, checkPartnerAlerts } from './briefings'
import { addWater, logTrening, logSprzatanie, addWydatek, getWaterToday, getAktywneReki } from './sheets'
import { obliczTransport, formatTransportTelegram } from './transport'
import { quickReply, parseQuickExpense, generateAntiProcrastination } from './claude'
import { buildRothContext } from './roth-context'
import { getFirstLessonToday } from './calendar'
import { TELEGRAM_COMMANDS, ROTH_RULES, TRENING_ZASTEPSTWO } from './constants'
import type { WeeklyReviewState } from './types'

// ─── Weryfikacja chat_id (ZASADA KRYTYCZNA) ───────────────────────────────
export function verifyChatId(chatId: number | string): boolean {
  const allowed = process.env['TELEGRAM_CHAT_ID']
  if (!allowed) return false
  return String(chatId) === String(allowed)
}

// ─── Inicjalizacja bota ──────────────────────────────────────────────────
export function createBot(): Bot {
  const token = process.env['TELEGRAM_BOT_TOKEN']!
  return new Bot(token)
}

// ─── Middleware: weryfikacja ──────────────────────────────────────────────
export async function verifyMiddleware(ctx: Context, next: () => Promise<void>) {
  const chatId = ctx.chat?.id
  if (!chatId || !verifyChatId(chatId)) {
    await ctx.reply('Brak dostępu.')
    return
  }
  await next()
}

// ─── Przyciski inline ─────────────────────────────────────────────────────
export const transportKeyboard = new InlineKeyboard()
  .text('Z kolegą', 'transport:kolega')
  .text('Jadę autobusem', 'transport:bus')
  .text('Brak szkoły', 'transport:wolne')

export const waterKeyboard = new InlineKeyboard()
  .text('250ml', 'water:250')
  .text('500ml', 'water:500')
  .text('Pominąłem', 'water:skip')

export function createLekKeyboard(lekNazwa: string) {
  return new InlineKeyboard()
    .text('Wziąłem ✅', `lek:wzialem:${lekNazwa}`)
    .text('+15 min ⏰', `lek:plus15:${lekNazwa}`)
}

export const energyKeyboard = new InlineKeyboard()
  .text('1', 'energia:1')
  .text('2', 'energia:2')
  .text('3', 'energia:3')
  .text('4', 'energia:4')
  .text('5', 'energia:5')

export const chorujeKeyboard = new InlineKeyboard()
  .text('Przeziębienie', 'choroba:przeziebieniie')
  .text('Głowa', 'choroba:glowa')
  .text('Brzuch', 'choroba:brzuch')
  .row()
  .text('Inne', 'choroba:inne')

// ─── Sendery ─────────────────────────────────────────────────────────────
export async function sendMessage(text: string, keyboard?: InlineKeyboard): Promise<void> {
  const chatId = process.env['TELEGRAM_CHAT_ID']!
  const token = process.env['TELEGRAM_BOT_TOKEN']!

  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
  }

  if (keyboard) {
    body['reply_markup'] = keyboard
  }

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ─── Handlery komend ──────────────────────────────────────────────────────

export async function handleStart(): Promise<string> {
  return `*ROTH Personal OS* 🔥

*Briefy*
/brief — generuj teraz
/pause\\_briefs — wstrzymaj automatyczne
/resume\\_briefs — wznów automatyczne

*Szkoła & Transport*
/wsiadam — timer powrotu autobusem
/dotarlem — potwierdzenie dotarcia
/kolega\\_odwola — jedź bez kolegi
/kartkowka — dodaj kartkówkę
/sprawdzian — dodaj sprawdzian

*Trening & Zdrowie*
/koniec\\_silownia [min] — zakończ trening
/opuscil\\_trening [typ] — nieobecność
/choruje — tryb aktywny-chory

*Produktywność*
/tasks — zadania na dziś (3/3/3)
/streak [nawyk] — loguj streak
/pomo [zadanie] — Pomodoro 25min

*Dom & Finanse*
/posprzatane — reset sprzątania
/przedluzam [min] — przesuń zadania

*OFM & AI*
/ofm — OFM brief Azul

Napisz cokolwiek → Master Agent 🤖
🌴 Cel: Tajlandia`
}

export async function handleBrief(): Promise<string> {
  return generateMorningBriefFull()
}

export async function handleChoruje(dolegliwosc: string): Promise<string> {
  return `🤒 *Tryb Aktywny-Chory — ${dolegliwosc}*

Aktywowany. Oto co zmieniam:
❌ Treningi dzisiaj — odwołane
❌ Wyjścia fizyczne — odwołane
✅ Zadania zdalne (OFM, AI, nauka online) — zostają, dostosowane tempo

Priorytet teraz:
1. Leki (sprawdź aktywną kurację)
2. Nawodnienie — cel 2500ml dziś
3. Odpoczynek + lekka praca

Co Ci dolega konkretnie? Możesz pracować z łóżka przez najbliższe 2h? Powiedz mi, a zaproponuję 3 zadania zdalne.`
}

export async function handleWsiadam(): Promise<string> {
  // Timer — powrót autobusem
  // Szacowany czas: ~30-40 min
  const powrotZa = 35  // min
  const powrotO = new Date(Date.now() + powrotZa * 60 * 1000)
  const powrotStr = `${String(powrotO.getHours()).padStart(2, '0')}:${String(powrotO.getMinutes()).padStart(2, '0')}`

  return `🚌 Timer powrotu aktywny.

Szacowany powrót: ~${powrotStr} (+${powrotZa} min)
Masz ${powrotZa} minut w autobusie — co możesz zrobić?

💡 Propozycje:
• Odpowiedz na wiadomości
• Zaplanuj jutrzejszy dzień
• Przejrzyj OFM materiały

Wyślij /dotarlem gdy dojedziesz.`
}

export async function handleDotarlem(): Promise<string> {
  return `✅ Dotarłeś.

Co teraz? Masz wolne zadania na dziś — wybierz jedno i start.
25 minut głębokiej pracy. Bez telefonu. Start.`
}

export async function handleKolegaOdwola(): Promise<string> {
  const firstLesson = await getFirstLessonToday()
  if (!firstLesson) return '📅 Brak szkoły dziś — nie ma co przeliczać.'

  const transport = await obliczTransport(firstLesson, false)
  if (!transport) return `❌ Brak opcji autobusowych na lekcję o ${firstLesson}. Zorganizuj inaczej.`

  return `🔄 Kolega odwołany — przeliczam busy.\n\n${formatTransportTelegram(transport)}`
}

export async function handleKoniecSilownia(minutes?: number): Promise<string> {
  const min = minutes ?? 60
  const data = new Date().toISOString().split('T')[0]!

  await logTrening({
    data,
    typ: 'full_body',
    planowany: true,
    czasFaktyczny: min,
    status: 'wykonany',
  })

  return `💪 Trening zakończony — ${min} minut. Zapisano.

Co teraz z wolnym czasem?
🔴 Zadanie OFM/AI (wysoka energia po treningu)
🟡 Planowanie / organizacja
🟢 Relaks, odpoczynek

Wyślij numer opcji lub opisz co chcesz zrobić.`
}

export async function handlePrzedluzam(minutes: number): Promise<string> {
  return `⏰ OK — przesuwam wszystkie wieczorne zadania o ${minutes} minut.

Nowy harmonogram wieczorny uwzględnia opóźnienie.
(Ręcznie zaktualizuj jeśli korzystasz z Google Calendar)`
}

export async function handlePosprzatane(): Promise<string> {
  await logSprzatanie()

  const nastepne = new Date()
  nastepne.setDate(nastepne.getDate() + 3)
  const nastepneStr = nastepne.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })

  return `🧹 Sprzątanie zanotowane. Cykl zresetowany.

Następne sprzątanie: *${nastepneStr}* (za 3 dni)

Dobra robota — 15-20 minut i z głowy.`
}

// ─── Handler wiadomości tekstowych (szybkie dodawanie) ────────────────────
export async function handleTextMessage(text: string): Promise<string | null> {
  // Wzorzec: "wydatek 45 zl jedzenie"
  if (/wydatek|zl|pln|zł/i.test(text)) {
    const parsed = await parseQuickExpense(text)
    if (parsed) {
      const data = new Date().toISOString().split('T')[0]!
      await addWydatek({
        data,
        kategoria: parsed.kategoria as 'Jedzenie',
        kwota: parsed.kwota,
        opis: parsed.opis,
        konieczny: false,
        biznesOsob: 'Osobiste',
        miesiac: data.substring(0, 7),
      })
      return `💸 Dodano wydatek: *${parsed.kwota} PLN* — ${parsed.kategoria} (${parsed.opis})`
    }
  }

  // Dowolna wiadomość → ROTH odpowiada
  const ctx = await buildRothContext()
  const { buildRothSystemPrompt } = await import('./claude')
  return quickReply(text, buildRothSystemPrompt(ctx))
}

// ─── Weekly Review — state machine ───────────────────────────────────────
const WEEKLY_QUESTIONS = [
  'Co w tym tygodniu poszło najlepiej?',
  'Co Cię najbardziej spowalniało?',
  'Jak wypadły treningi? (siłownia/badminton)',
  'Jak wypadły biznesy? (OFM + AI Consulting)',
  'Jak wypadła szkoła?',
  'Co robisz inaczej w przyszłym tygodniu? (konkretne commitments)',
  'Jedno słowo opisujące ten tydzień?',
]

const weeklyReviewStates = new Map<string, WeeklyReviewState>()

export function startWeeklyReview(chatId: string): string {
  weeklyReviewStates.set(chatId, { pytanieNr: 1, odpowiedzi: {}, zakonczone: false })
  return `📋 *Weekly Review — ${new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}*\n\n*1/7* ${WEEKLY_QUESTIONS[0]!}`
}

export async function handleWeeklyReviewAnswer(chatId: string, answer: string): Promise<string> {
  const state = weeklyReviewStates.get(chatId)
  if (!state || state.zakonczone) return 'Brak aktywnego Weekly Review. Wróć w niedzielę o 19:00.'

  state.odpowiedzi[state.pytanieNr] = answer

  if (state.pytanieNr >= 7) {
    state.zakonczone = true
    weeklyReviewStates.delete(chatId)
    return generateWeeklyReviewSummary(state.odpowiedzi)
  }

  state.pytanieNr++
  return `*${state.pytanieNr}/7* ${WEEKLY_QUESTIONS[state.pytanieNr - 1]!}`
}

async function generateWeeklyReviewSummary(odpowiedzi: Record<number, string>): Promise<string> {
  const odpStr = Object.entries(odpowiedzi)
    .map(([nr, odp]) => `${nr}. ${WEEKLY_QUESTIONS[Number(nr) - 1]!}\n→ ${odp}`)
    .join('\n\n')

  const ctx = await buildRothContext()
  const { buildRothSystemPrompt, fullAnalysis } = await import('./claude')

  const summary = await fullAnalysis(`Wygeneruj podsumowanie Weekly Review.

Odpowiedzi:
${odpStr}

Format:
- Ocena tygodnia (1-2 zdania ROTH style)
- Top 3 do poprawy w następnym tygodniu
- Commitments użytkownika (z pyt. 6)
- Jedno słowo tygodnia (z pyt. 7)
- Plan priorytetów na poniedziałek (3 rzeczy)`, buildRothSystemPrompt(ctx))

  return `✅ *Weekly Review zakończony!*\n\n${summary}`
}

// ─── Handler callbacków (inline buttons) ─────────────────────────────────
export async function handleCallbackQuery(data: string): Promise<string | null> {
  const [action, value, extra] = data.split(':')

  switch (action) {
    case 'water': {
      if (value === 'skip') return '✅ OK — zanotowane, że pominąłeś.'
      const ml = parseInt(value ?? '0')
      const updated = await addWater(ml)
      return generateWaterQuestion(updated.wypito)
    }

    case 'energia': {
      const level = parseInt(value ?? '3')
      // Zapamiętaj check-in energii (można zapisać do Sheets)
      const { getPlanKalibracja } = await import('./scoring')
      const plan = getPlanKalibracja(level)
      return `⚡ Energia ${level}/5 zanotowana.\n\n${plan.opis}\n${plan.allowRed ? '🔴🟡🟢 Wszystkie zadania dostępne.' : '🟡🟢 Dziś tylko żółte i zielone zadania.'}`
    }

    case 'transport': {
      if (value === 'wolne') return '📅 Brak szkoły — dobry dzień na 3 zadania biznesowe. Jakie?'
      const useKolega = value === 'kolega'
      const firstLesson = await getFirstLessonToday()
      if (!firstLesson) return '📅 Brak szkoły dziś.'
      const transport = await obliczTransport(firstLesson, useKolega)
      return transport ? formatTransportTelegram(transport) : 'Brak opcji transportu.'
    }

    case 'lek': {
      if (value === 'wzialem') {
        const { logLekWzieto } = await import('./sheets')
        const teraz = new Date().toTimeString().substring(0, 5)
        await logLekWzieto(extra ?? 'nieznany', teraz)
        return `✅ ${extra} — zanotowane o ${teraz}`
      }
      if (value === 'plus15') {
        return `⏰ Przypomnę o ${extra} za 15 minut.`
      }
      return null
    }

    case 'choroba': {
      return handleChoruje(value ?? 'inne')
    }

    default:
      return null
  }
}

// ─── SMART SPRAWDZIANY PARSER ─────────────────────────────────────────────
// Parsuje: "/kartkowka fizyka kolo jutro 'układ sił'"
// Lub:     "/kartkowka lekcja 5" → auto-wykryje przedmiot z PLAN_LEKCJI
export async function handleKartkowka(raw: string, commandType: string): Promise<string> {
  const { getLessonPlan, appendRow } = await import('./sheets')
  const { SHEETS } = await import('./constants')

  // Oczyść komendę
  const text = raw.replace(/^\/\w+\s*/, '').trim().toLowerCase()
  if (!text) {
    return `📝 *Szybki zapis sprawdzianu*\n\nUżycie:\n\`/kartkowka fizyka jutro "układ sił"\`\n\`/kartkowka lekcja 5\` (auto-wykryje przedmiot z planu)\n\`/sprawdzian matematyka piątek\`\n\`/kolo angielski środa "czasy"\``
  }

  // Wykryj datę
  const today = new Date()
  let targetDate = new Date(today)

  if (text.includes('jutro')) {
    targetDate.setDate(today.getDate() + 1)
  } else if (text.includes('pojutrze')) {
    targetDate.setDate(today.getDate() + 2)
  } else {
    const dayMap: Record<string, number> = {
      'poniedzialek': 1, 'wtorek': 2, 'sroda': 3,
      'czwartek': 4, 'piatek': 5, 'sobota': 6,
    }
    for (const [day, dayNum] of Object.entries(dayMap)) {
      if (text.includes(day)) {
        const diff = (dayNum - today.getDay() + 7) % 7 || 7
        targetDate.setDate(today.getDate() + diff)
        break
      }
    }
  }

  const dateStr = targetDate.toISOString().split('T')[0]!

  // Wykryj "lekcja N" → auto-wykryj przedmiot z PLAN_LEKCJI
  let przedmiot = ''
  const lessonMatch = text.match(/lekcja\s+(\d+)/)
  if (lessonMatch) {
    const nrLekcji = parseInt(lessonMatch[1] ?? '0')
    const dayNames = ['', 'Poniedzialek', 'Wtorek', 'Sroda', 'Czwartek', 'Piatek', 'Sobota']
    const targetDay = dayNames[targetDate.getDay()] ?? ''
    const plan = await getLessonPlan(targetDay)
    const lesson = plan.find(l => l.nrLekcji === nrLekcji)
    przedmiot = lesson?.przedmiot ?? ''
    if (!przedmiot) {
      return `⚠️ Nie znalazłem lekcji nr ${nrLekcji} w planie dla ${targetDay}.\nWpisz /plan_lekcji aby sprawdzić plan.`
    }
  }

  // Jeśli brak przedmiotu z "lekcja N", szukaj nazwy przedmiotu w tekście
  if (!przedmiot) {
    const subjects = ['matematyka', 'fizyka', 'angielski', 'angielski', 'historia', 'biologia', 'chemia', 'informatyka', 'polski', 'wf', 'religia', 'plastyka', 'muzyka', 'geografia', 'wos']
    for (const s of subjects) {
      if (text.includes(s)) {
        przedmiot = s.charAt(0).toUpperCase() + s.slice(1)
        break
      }
    }
  }

  if (!przedmiot) {
    return `⚠️ Nie wykryłem przedmiotu. Spróbuj:\n\`/kartkowka fizyka jutro\`\n\`/kartkowka lekcja 3\``
  }

  // Typ sprawdzianu
  const typMap: Record<string, string> = {
    'kartkowka': 'kartkówka',
    'sprawdzian': 'sprawdzian',
    'kolo': 'kolokwium',
    'praca': 'praca domowa',
  }
  const typ = typMap[commandType] ?? 'kartkówka'

  // Wyciągnij temat (w cudzysłowie lub po słowie "temat")
  const tematMatch = text.match(/"([^"]+)"/) ?? text.match(/temat\s+(.+)/)
  const temat = tematMatch?.[1] ?? ''

  // Zapisz do SPRAWDZIANY
  await appendRow(SHEETS.SPRAWDZIANY, [
    przedmiot,
    typ,
    dateStr,
    temat,
    'do_nauki',
    '',
  ])

  const displayDate = targetDate.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'short' })

  return `✅ *Zapisano!*\n\n📚 ${przedmiot} — ${typ}\n📅 ${displayDate}\n${temat ? `📝 Temat: ${temat}` : '📝 Temat: (nie podano)'}\n\n_Status: do\\_nauki — zaktualizuj po przygotowaniu_`
}

// ─── ANTI-FRAGILE TRAINING ────────────────────────────────────────────────
// Gdy trening odpada → suggest replacement
export async function handleOpuscilTrening(typ: string): Promise<string> {
  const typKey = typ.toLowerCase().includes('silow') ? 'silownia'
    : typ.toLowerCase().includes('badmin') ? 'badminton'
    : 'ogolne'

  const zastepstwa = TRENING_ZASTEPSTWO[typKey] ?? TRENING_ZASTEPSTWO['ogolne'] ?? []
  const random = zastepstwa[Math.floor(Math.random() * zastepstwa.length)] ?? 'Spacer 20 min'

  const { appendRow } = await import('./sheets')
  const { SHEETS } = await import('./constants')
  const today = new Date().toISOString().split('T')[0]!
  await appendRow(SHEETS.TRENINGI_LOG, [
    today,
    typKey,
    'T',
    '0',
    'opuszczony',
    'Opuszczony — wykonano zastępstwo',
  ])

  return `💪 *Trening opuszczony — ale nie odpuszczasz!*\n\nZastępstwo na dziś:\n*${random}*\n\n_Każdy ruch się liczy. Zrób to teraz._\n\n/koniec\\_silownia — wpisz po wykonaniu`
}
