// ROTH Personal OS — Anthropic Claude API wrapper

import Anthropic from '@anthropic-ai/sdk'
import type { OcenaIdeaLab, PersonaIdeaLab, WerdyktIdeaLab } from './types'
import { IDEA_LAB_PERSONY, OFM_AUTORYTETY } from './constants'

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] })

// ─── Modele ───────────────────────────────────────────────────────────────
const MODELS = {
  fast: 'claude-haiku-4-5-20251001',    // szybkie odpowiedzi, Telegram
  smart: 'claude-sonnet-4-6',           // złożone: briefy, Idea Lab, analiza
} as const

// ─── System prompt ROTH ──────────────────────────────────────────────────
const ROTH_SYSTEM = `Jesteś ROTH — personalny asystent AI.
Styl: Andrew Tate bez cringu + David Goggins. Polski, bezpośrednio, jak człowiek.
Gdy prokrastynacja: konfrontacja + konkretna akcja TERAZ.
Wielki Cel użytkownika: kilka modelek + AI Consulting + Tajlandia.
Aktywuj Cel w trudnych momentach.

ZASADY:
- NIGDY "jak się czujesz?" bez następnego kroku
- ZAWSZE kalendarze sprawdź przed anty-prokrastynacja interwencją
- Metody OFM — sprawdź status przed sugestią (ZATWIERDZONA/NIEZWERYFIKOWANA/ODRZUCONA)
- Finanse: realny% i fake% NIGDY w jednej odpowiedzi
- Zdrowie: Tryb Aktywny-Chory — NIE wyłącza produktywności
`

// ─── Budowanie kontekstu ROTH ─────────────────────────────────────────────
export interface RothContextData {
  dataToday: string
  dayOfWeek: string
  scoring: string
  energiaZona: string
  energiaCheckIn?: number
  calendarToday: string
  openTasks: string
  openPeopleIssues: string
  ofmStatus: string
  aiStatus: string
  waterDzis?: number
  aktivnaKuracja?: string
}

export function buildRothSystemPrompt(ctx: RothContextData): string {
  return `${ROTH_SYSTEM}

UŻYTKOWNIK ROTH:
  Wiek: 16-18 lat | Chronotyp: nocna sowa | Energia szczytowa: 14:00-01:00
  Biznesy: OFM Management (etap: zakup 1. modelki) + AI Consulting (negocjacje)
  Szkoła: ZSE Śrem 3PB gr.2/2

DZIŚ: ${ctx.dataToday} (${ctx.dayOfWeek})
SCORING DNIA: ${ctx.scoring}
STREFA ENERGETYCZNA: ${ctx.energiaZona}${ctx.energiaCheckIn ? `\nENERGIA CHECK-IN: ${ctx.energiaCheckIn}/5` : ''}

KALENDARZ DZIŚ:
${ctx.calendarToday}

ZADANIA (nieukończone):
${ctx.openTasks}

OTWARTE SPRAWY Z PARTNERAMI:
${ctx.openPeopleIssues}

AKTYWNE PROJEKTY:
  OFM: ${ctx.ofmStatus}
  AI: ${ctx.aiStatus}
${ctx.waterDzis !== undefined ? `\nWODA DZIŚ: ${ctx.waterDzis}ml` : ''}
${ctx.aktivnaKuracja ? `\nAKTYWNA KURACJA: ${ctx.aktivnaKuracja}` : ''}`
}

// ─── Szybka odpowiedź (Haiku) ────────────────────────────────────────────
export async function quickReply(
  userMessage: string,
  systemPrompt?: string,
): Promise<string> {
  const msg = await client.messages.create({
    model: MODELS.fast,
    max_tokens: 512,
    system: systemPrompt ?? ROTH_SYSTEM,
    messages: [{ role: 'user', content: userMessage }],
  })

  const block = msg.content[0]
  return block?.type === 'text' ? block.text : ''
}

// ─── Pełna analiza (Sonnet) ───────────────────────────────────────────────
export async function fullAnalysis(
  userMessage: string,
  systemPrompt?: string,
  maxTokens = 2048,
): Promise<string> {
  const msg = await client.messages.create({
    model: MODELS.smart,
    max_tokens: maxTokens,
    system: systemPrompt ?? ROTH_SYSTEM,
    messages: [{ role: 'user', content: userMessage }],
  })

  const block = msg.content[0]
  return block?.type === 'text' ? block.text : ''
}

// ─── Generuj Poranny Brief ────────────────────────────────────────────────
export async function generateMorningBrief(ctx: RothContextData, extraData: {
  pogoda: string
  transport: string
  priorytety: string
  leki: string
  cytat: string
}): Promise<string> {
  const system = buildRothSystemPrompt(ctx)
  const prompt = `Wygeneruj poranny brief na dziś.

Dane:
- Pogoda: ${extraData.pogoda}
- Transport: ${extraData.transport}
- 3 priorytety dnia: ${extraData.priorytety}
- Leki: ${extraData.leki || 'Brak aktywnej kuracji'}
- Cytat dnia: ${extraData.cytat}

Format:
1. Scoring dnia i co to oznacza (1 zdanie)
2. Pogoda + rekomendacja ubrania (1 zdanie)
3. Transport — godzina wyjścia
4. 3 priorytety z kolorami (🔴/🟡/🟢)
5. Alerty (sprawdziany, deadliny, otwarte sprawy)
6. Leki jeśli aktywne
7. Cel wodny na dziś
8. Cytat

Bądź konkretny. Bez owijania w bawełnę.`

  return fullAnalysis(prompt, system)
}

// ─── Generuj Wieczorny Brief ──────────────────────────────────────────────
export async function generateEveningBrief(ctx: RothContextData, extraData: {
  done: string
  notDone: string
  frictionLog?: string
  zastepstwaJutro: string
  transportJutro: string
  alertyDomowe: string
  wodaPodsumowanie: string
}): Promise<string> {
  const system = buildRothSystemPrompt(ctx)
  const prompt = `Wygeneruj wieczorny brief.

Zrobione dziś:
${extraData.done || 'Nic'}

Niezrobione:
${extraData.notDone || 'Wszystko zrobione!'}

${extraData.frictionLog ? `Co spowalniało: ${extraData.frictionLog}` : ''}

Zastępstwa jutro (ZSE Śrem 3PB gr.2/2):
${extraData.zastepstwaJutro || 'Brak zastępstw'}

Transport jutro:
${extraData.transportJutro}

Alerty domowe:
${extraData.alertyDomowe || 'Brak'}

Woda dziś:
${extraData.wodaPodsumowanie}

Format:
1. Ocena dnia X/10 + 1-zdaniowy komentarz ROTH (bez owijania)
2. Lista zrobione ✅ / niezrobione ❌
3. Plan jutrzejszego dnia z godzinami
4. Transport jutro
5. Zastępstwa jutro (jeśli są)
6. Alerty domowe
7. Leki wieczorne + lanolina
8. Woda — ile vs cel`

  return fullAnalysis(prompt, system)
}

// ─── Generuj Pre-Sleep Protocol ───────────────────────────────────────────
export async function generatePreSleep(ctx: RothContextData, data: {
  rzeczyZrobione: number
  jutroEvent?: string
  jutroGodzina?: string
  minutesDo0030: number
}): Promise<string> {
  return quickReply(`Wygeneruj Pre-Sleep Protocol.

Dziś zrobiono: ${data.rzeczyZrobione} rzeczy
${data.jutroEvent ? `Jutro: ${data.jutroEvent} o ${data.jutroGodzina}` : 'Jutro: brak konkretnych eventów'}
Pozostało minut do 23:30: ${data.minutesDo0030}

Format (max 5 zdań):
- "Czas zacząć zwalniać."
- Dziś X rzeczy zrobione.
- Jutro masz [event] o [godzina] (lub "Jutro luz — zaplanuj 3 zadania biznesowe")
- Optymalna godzina snu dla 7h.
- Zostało X minut. Co kończysz? [Kończę X] [Idę spać] [Jeszcze 1h]`, ROTH_SYSTEM)
}

// ─── Anti-prokrastynacja ──────────────────────────────────────────────────
export async function generateAntiProcrastination(ctx: RothContextData, trigger: string): Promise<string> {
  return quickReply(`TRIGGER: ${trigger}

Dane: ${ctx.openTasks}

Wygeneruj krótką interwencję anty-prokrastynacja (max 3 zdania + 1 konkretna akcja).
Styl: direct, bez cukru.`, buildRothSystemPrompt(ctx))
}

// ─── Idea Lab — ocena 5 persona ──────────────────────────────────────────
export async function evaluateIdea(
  pomysl: string,
  kontekst: string,
): Promise<OcenaIdeaLab> {
  const prompt = `Ocen poniższy pomysł z perspektywy 5 ekspertów.

POMYSŁ: ${pomysl}
KONTEKST: ${kontekst}

Dla każdej persony daj:
- Ocena ogólna (1-2 zdania)
- Plusy (max 3 punkty)
- Minusy (max 3 punkty)
- Rekomendacja (1 zdanie)

PERSONY:
1. Inwestor: ROI, ryzyko finansowe, opportunity cost
2. Operator_OFM: wykonalność operacyjna, zasoby, timing
3. Mentor: zgodność z etapem rozwoju użytkownika (16-18 lat, pre-revenue OFM)
4. Adwokat_Diabła: dziury w logice, co może pójść źle
5. Strateg_AI: jeśli dotyczy AI Consultingu

Na końcu:
WERDYKT: [REALIZUJ / POCZEKAJ / ODRZUC]
UZASADNIENIE: (2-3 zdania)
NASTĘPNE KROKI: (3 konkretne kroki jeśli REALIZUJ, warunki jeśli POCZEKAJ)

Odpowiedz w formacie JSON.`

  const response = await fullAnalysis(prompt, ROTH_SYSTEM, 3000)

  // Parsuj odpowiedź
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as OcenaIdeaLab
    }
  } catch {
    // Fallback jeśli JSON nieprawidłowy
  }

  // Fallback
  return {
    pomysl,
    persony: IDEA_LAB_PERSONY.map(p => ({
      persona: p as PersonaIdeaLab,
      ocena: 'Analiza zakończona',
      plusy: [],
      minusy: [],
      rekomendacja: response.substring(0, 100),
    })),
    werdykt: 'POCZEKAJ' as WerdyktIdeaLab,
    uzasadnienie: response.substring(0, 200),
    nastepneKroki: [],
    zapisanoDoObsidian: false,
  }
}

// ─── Zastępstwa — filtrowanie dla 3PB gr.2/2 ─────────────────────────────
export async function filterZastepstwa(rawHtml: string): Promise<string> {
  return quickReply(`Przefiltruj te zastępstwa dla klasy 3PB, grupy 2/2.
Interesuje nas: "3PB 2/2" (bezpośrednio) lub "3PB" bez grupy (cała klasa).
Ignoruj: "3PB 1/2" i wszystkie inne klasy.

HTML/tekst ze strony ZSE:
${rawHtml.substring(0, 4000)}

Odpowiedz prostą listą zastępstw (lekcja, przedmiot, sala) lub "Brak zastępstw dla 3PB gr.2/2"`)
}

// ─── Szybkie dodawanie wydatku z Telegrama ────────────────────────────────
export async function parseQuickExpense(text: string): Promise<{
  kwota: number
  kategoria: string
  opis: string
} | null> {
  // Pattern: "wydatek 45 zl jedzenie" lub "45 jedzenie"
  const patterns = [
    /wydatek\s+(\d+(?:[.,]\d{1,2})?)\s*(?:zl|pln|zł)?\s+(.+)/i,
    /(\d+(?:[.,]\d{1,2})?)\s*(?:zl|pln|zł)\s+(.+)/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const kwota = parseFloat(String(match[1]).replace(',', '.'))
      const opis = String(match[2]).trim()

      // Mapuj opis na kategorię
      const kategoria = mapKategoria(opis)

      return { kwota, kategoria, opis }
    }
  }

  return null
}

function mapKategoria(opis: string): string {
  const lower = opis.toLowerCase()
  if (lower.includes('jedzen') || lower.includes('jedzenie') || lower.includes('lunch') || lower.includes('obiad')) return 'Jedzenie'
  if (lower.includes('transport') || lower.includes('bus') || lower.includes('bilet')) return 'Transport'
  if (lower.includes('silown') || lower.includes('trening')) return 'Silownia'
  if (lower.includes('ubran') || lower.includes('koszulk')) return 'Ubrania'
  if (lower.includes('subskr') || lower.includes('spotify') || lower.includes('netflix')) return 'Subskrypcje'
  if (lower.includes('biznes') || lower.includes('ofm') || lower.includes('reklam')) return 'Biznes'
  return 'Inne'
}
