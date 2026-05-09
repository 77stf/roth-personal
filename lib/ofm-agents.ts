// ROTH Personal OS — OFM Multi-Agent System
// 4 specialized agents for managing Azul (model bought for $860 from Shaft MarketPlace)

import Anthropic from '@anthropic-ai/sdk'
import { getProjektyOFM } from './sheets'

const anthropic = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] })

// ─── TYPY ─────────────────────────────────────────────────────────────────
export interface OFMAgentResult {
  agentId: string
  agentName: string
  status: 'ok' | 'error'
  output: string
  durationMs: number
}

export interface OFMReport {
  runId: string
  timestamp: string
  model: string
  agents: OFMAgentResult[]
  dailyPlan: DailyOFMPlan
}

export interface DailyOFMPlan {
  contentIdeas: ContentIdea[]
  redditPosts: RedditPost[]
  dmScripts: string[]
  revenueProjection: RevenueProjection
  topPriority: string
}

export interface ContentIdea {
  type: 'photo' | 'video' | 'reel' | 'story' | 'ppv'
  concept: string
  caption: string
  bestTime: string
  estimatedRevenue: string
}

export interface RedditPost {
  subreddit: string
  title: string
  bodyHint: string
  expectedTraffic: 'low' | 'medium' | 'high'
}

export interface RevenueProjection {
  invested: number          // USD - Azul cost
  currentMRR: number        // USD monthly recurring revenue
  breakEvenMonths: number
  monthsToThailand: number
  nextMilestone: string
}

// ─── AGENT 1: CONTENT STRATEGIST ─────────────────────────────────────────
export async function runOFMContentStrategist(modelData: string): Promise<OFMAgentResult> {
  const start = Date.now()
  try {
    const today = new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })
    const hour = new Date().getHours()
    const zone = hour < 12 ? 'rano' : hour < 18 ? 'popołudnie' : 'wieczór'

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: `Jesteś ekspertem content strategy dla OnlyFans. Zarządzasz modelką Azul — nową twórczynią w fazie growth.
Kontekst: operator to Roth, 17 lat, polskie 77STF Agency. Azul zakupiona za $860 od Shaft MarketPlace.
Cel teraz: zbudować bazę subskrybentów i osiągnąć ROI z inwestycji w ciągu 3 miesięcy.
Zasady: odpowiedź po polsku, konkretne rady operacyjne, żadnych ogólników.
Format odpowiedzi: JSON z polami:
- contentIdeas: [{type, concept, caption, bestTime, estimatedRevenue}] — 3 pomysły na dzisiaj
- topPriority: string — co absolutnie zrobić dzisiaj
- weeklyFocus: string — strategiczny focus tego tygodnia`,
      messages: [{
        role: 'user',
        content: `Dane modelki: ${modelData}\nDzisiaj: ${today}, pora dnia: ${zone}\nStwórz plan content na dziś.`,
      }],
    })

    const output = response.content[0]?.type === 'text' ? response.content[0].text : '{}'
    return { agentId: 'ofm-content-strategist', agentName: 'Content Strategist', status: 'ok', output, durationMs: Date.now() - start }
  } catch (e) {
    return { agentId: 'ofm-content-strategist', agentName: 'Content Strategist', status: 'error', output: String(e), durationMs: Date.now() - start }
  }
}

// ─── AGENT 2: REDDIT SCOUT ────────────────────────────────────────────────
export async function runOFMRedditScout(modelData: string): Promise<OFMAgentResult> {
  const start = Date.now()
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      system: `Jesteś ekspertem od darmowego trafficu dla OnlyFans przez Reddit.
Zarządzasz Azul — nową modelką w fazie growth. Znasz strategię: organic Reddit → fansite → OF.
Mentorzy to: Dr. Hadi (główny coach), Mikołaj i Sorin (Reddit admins).
Format odpowiedzi: JSON z polami:
- redditPosts: [{subreddit, title, bodyHint, expectedTraffic}] — 3 posty na dziś
- subredditsToGrow: [string] — subreddity do budowania obecności
- avoidMistakes: [string] — błędy których nie robić dziś
- trafficTip: string — jeden konkretny tip na wzrost ruchu`,
      messages: [{
        role: 'user',
        content: `Dane modelki: ${modelData}\nJakie posty Reddit zaplanować na dziś dla maksymalnego organic traffic?`,
      }],
    })

    const output = response.content[0]?.type === 'text' ? response.content[0].text : '{}'
    return { agentId: 'ofm-reddit-scout', agentName: 'Reddit Scout', status: 'ok', output, durationMs: Date.now() - start }
  } catch (e) {
    return { agentId: 'ofm-reddit-scout', agentName: 'Reddit Scout', status: 'error', output: String(e), durationMs: Date.now() - start }
  }
}

// ─── AGENT 3: FAN ENGAGEMENT ──────────────────────────────────────────────
export async function runOFMFanEngagement(subscriberCount: number): Promise<OFMAgentResult> {
  const start = Date.now()
  try {
    const stage = subscriberCount < 50 ? 'launch' : subscriberCount < 200 ? 'growth' : 'scale'

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: `Jesteś ekspertem fan engagement dla OnlyFans. Etap: ${stage}.
Format odpowiedzi: JSON z polami:
- dmScripts: [string] — 3 gotowe skrypty DM do wysłania dziś (po angielsku — for fans)
- ppvIdea: {price, concept} — jeden pomysł na PPV na dziś
- freebieTip: string — co dać za darmo żeby konwertować
- upsellSequence: [string] — sekwencja upsell dla nowych subów`,
      messages: [{
        role: 'user',
        content: `Liczba subskrybentów: ${subscriberCount}. Etap: ${stage}.\nJakie konkretne DM i upsell zaplanować na dziś?`,
      }],
    })

    const output = response.content[0]?.type === 'text' ? response.content[0].text : '{}'
    return { agentId: 'ofm-fan-engagement', agentName: 'Fan Engagement', status: 'ok', output, durationMs: Date.now() - start }
  } catch (e) {
    return { agentId: 'ofm-fan-engagement', agentName: 'Fan Engagement', status: 'error', output: String(e), durationMs: Date.now() - start }
  }
}

// ─── AGENT 4: REVENUE ANALYST ─────────────────────────────────────────────
export async function runOFMRevenueAnalyst(currentMRR: number): Promise<OFMAgentResult> {
  const start = Date.now()
  try {
    const invested = 860  // USD — Azul purchase price
    const exchangeRate = 4.05  // USD→PLN approximate
    const thailandTarget = 15000  // PLN — Thailand savings goal

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: `Jesteś analitykiem finansowym OFM. Twoje zadanie: precyzyjne projekcje przychodów i ROI.
Dane wejściowe są podane przez użytkownika. Odpowiedz w JSON:
- breakEvenMonths: number — ile miesięcy do zwrotu $860 inwestycji
- monthsToThailand: number — ile miesięcy do odłożenia 15000 PLN na Tajlandię (przy obecnym MRR)
- growthNeeded: string — ile % wzrostu MRR potrzeba żeby osiągnąć cel w 6 mies.
- nextMilestone: string — następny finansowy milestone do osiągnięcia
- scenarioBest: string — optymistyczny scenariusz (3 zdania)
- scenarioRealistic: string — realistyczny scenariusz (3 zdania)`,
      messages: [{
        role: 'user',
        content: `Inwestycja: $${invested} (${(invested * exchangeRate).toFixed(0)} PLN)\nObecny MRR: $${currentMRR} (${(currentMRR * exchangeRate).toFixed(0)} PLN)\nCel Tajlandia: ${thailandTarget} PLN\nKurs: 1 USD = ${exchangeRate} PLN\nOblicz projekcje.`,
      }],
    })

    const output = response.content[0]?.type === 'text' ? response.content[0].text : '{}'
    return { agentId: 'ofm-revenue-analyst', agentName: 'Revenue Analyst', status: 'ok', output, durationMs: Date.now() - start }
  } catch (e) {
    return { agentId: 'ofm-revenue-analyst', agentName: 'Revenue Analyst', status: 'error', output: String(e), durationMs: Date.now() - start }
  }
}

// ─── ORCHESTRATOR ─────────────────────────────────────────────────────────
export async function runOFMOrchestrator(): Promise<OFMReport> {
  const runId = `ofm-${Date.now()}`
  const timestamp = new Date().toISOString()

  // Pobierz dane modelki z Sheets
  let modelData = 'Azul — nowa modelka, faza onboarding, $860 inwestycji'
  let currentMRR = 0
  let subscriberCount = 0

  try {
    const projekty = await getProjektyOFM()
    const azul = projekty.find(p => p.modelka?.toLowerCase().includes('azul'))
    if (azul) {
      currentMRR = azul.przychod ?? 0
      modelData = `Azul | Status: ${azul.status} | MRR: $${currentMRR} | Następny krok: ${azul.nastepnyKrok ?? 'brak'}`
    }
  } catch {
    // Użyj domyślnych danych jeśli Sheets niedostępny
  }

  // Uruchom 3 agenty równolegle, analyst osobno (potrzebuje MRR)
  const [contentResult, redditResult, engagementResult] = await Promise.all([
    runOFMContentStrategist(modelData),
    runOFMRedditScout(modelData),
    runOFMFanEngagement(subscriberCount),
  ])

  const analystResult = await runOFMRevenueAnalyst(currentMRR)

  // Parsuj wyniki JSON
  let contentIdeas: ContentIdea[] = []
  let redditPosts: RedditPost[] = []
  let dmScripts: string[] = []
  let topPriority = ''

  try {
    const cData = JSON.parse(contentResult.output.replace(/```json\n?|```\n?/g, '').trim())
    contentIdeas = cData.contentIdeas ?? []
    topPriority = cData.topPriority ?? ''
  } catch { /* non-JSON output */ }

  try {
    const rData = JSON.parse(redditResult.output.replace(/```json\n?|```\n?/g, '').trim())
    redditPosts = rData.redditPosts ?? []
  } catch { /* non-JSON output */ }

  try {
    const eData = JSON.parse(engagementResult.output.replace(/```json\n?|```\n?/g, '').trim())
    dmScripts = eData.dmScripts ?? []
  } catch { /* non-JSON output */ }

  let revenueProjection: RevenueProjection = {
    invested: 860,
    currentMRR,
    breakEvenMonths: currentMRR > 0 ? Math.ceil(860 / (currentMRR * 4.05)) : 99,
    monthsToThailand: currentMRR > 0 ? Math.ceil(15000 / (currentMRR * 4.05)) : 99,
    nextMilestone: '$100 MRR — pierwszy zwrot z inwestycji',
  }

  try {
    const aData = JSON.parse(analystResult.output.replace(/```json\n?|```\n?/g, '').trim())
    revenueProjection = {
      invested: 860,
      currentMRR,
      breakEvenMonths: aData.breakEvenMonths ?? revenueProjection.breakEvenMonths,
      monthsToThailand: aData.monthsToThailand ?? revenueProjection.monthsToThailand,
      nextMilestone: aData.nextMilestone ?? revenueProjection.nextMilestone,
    }
  } catch { /* use defaults */ }

  return {
    runId,
    timestamp,
    model: 'Azul',
    agents: [contentResult, redditResult, engagementResult, analystResult],
    dailyPlan: {
      contentIdeas,
      redditPosts,
      dmScripts,
      revenueProjection,
      topPriority,
    },
  }
}
