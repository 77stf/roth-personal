// ROTH Personal OS — Multi-Agent Orchestration System
// Agenci Claude API dla Obsidian, systemu i auto-upgrade

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] })

// ─── TYPY ─────────────────────────────────────────────────────────────────
export interface AgentResult {
  agentId: string
  agentName: string
  status: 'ok' | 'error'
  output: string
  durationMs: number
  timestamp: string
}

export interface OrchestratorReport {
  runId: string
  timestamp: string
  agents: AgentResult[]
  summary: string
  actions: string[]
}

// ─── OBSIDIAN STRUCTURE AUDITOR ───────────────────────────────────────────
export async function runObsidianStructureAudit(vaultSummary: string): Promise<AgentResult> {
  const start = Date.now()
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: `Jesteś agentem audytu struktury Obsidian. Analizujesz vault ROTH Personal OS.
Twoja rola: znajdź brakujące foldery, puste pliki, broken wikilinks, niespójności w strukturze.
Wynik: konkretna lista problemów z priorytetami (CRITICAL/HIGH/MEDIUM/LOW).
Format odpowiedzi: JSON z polami: issues[], score (0-100), recommendations[]`,
      messages: [{
        role: 'user',
        content: `Przeanalizuj ten stan vaultu Obsidian:\n\n${vaultSummary}\n\nZidentyfikuj wszystkie problemy strukturalne.`,
      }],
    })

    const output = response.content[0]?.type === 'text' ? response.content[0].text : ''
    return { agentId: 'obsidian-structure-auditor', agentName: 'Obsidian Structure Auditor', status: 'ok', output, durationMs: Date.now() - start, timestamp: new Date().toISOString() }
  } catch (e) {
    return { agentId: 'obsidian-structure-auditor', agentName: 'Obsidian Structure Auditor', status: 'error', output: String(e), durationMs: Date.now() - start, timestamp: new Date().toISOString() }
  }
}

// ─── OBSIDIAN CONTENT DEVELOPER ──────────────────────────────────────────
export async function runObsidianContentDeveloper(auditResults: string, vaultContext: string): Promise<AgentResult> {
  const start = Date.now()
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: `Jesteś agentem rozbudowy treści Obsidian dla ROTH Personal OS.
Na podstawie audytu tworzysz konkretne treści Markdown dla brakujących notatek.
Kontekst: użytkownik to Roth, 16-18 lat, AI Consulting + OFM + szkoła + cel: Tajlandia 2027.
Wynik: gotowe pliki Markdown do wgrania do vaultu. Formato odpowiedzi: JSON z polami: files[{path, content}], summary`,
      messages: [{
        role: 'user',
        content: `Wyniki audytu:\n${auditResults}\n\nKontekst vaultu:\n${vaultContext}\n\nStwórz brakujące treści.`,
      }],
    })

    const output = response.content[0]?.type === 'text' ? response.content[0].text : ''
    return { agentId: 'obsidian-content-developer', agentName: 'Obsidian Content Developer', status: 'ok', output, durationMs: Date.now() - start, timestamp: new Date().toISOString() }
  } catch (e) {
    return { agentId: 'obsidian-content-developer', agentName: 'Obsidian Content Developer', status: 'error', output: String(e), durationMs: Date.now() - start, timestamp: new Date().toISOString() }
  }
}

// ─── OBSIDIAN PLANNER ────────────────────────────────────────────────────
export async function runObsidianPlanner(auditResults: string, developerResults: string): Promise<AgentResult> {
  const start = Date.now()
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: `Jesteś agentem planowania dla Obsidian vault ROTH Personal OS.
Na podstawie audytu i wdrożonych zmian tworzysz plan dalszego rozwoju.
Wynik: JSON z polami: weeklyPlan[], nextSprint[], longTermGoals[], estimatedHours`,
      messages: [{
        role: 'user',
        content: `Audyt: ${auditResults}\n\nWdrożone zmiany: ${developerResults}\n\nStwórz plan dalszego rozwoju vaultu.`,
      }],
    })

    const output = response.content[0]?.type === 'text' ? response.content[0].text : ''
    return { agentId: 'obsidian-planner', agentName: 'Obsidian Planner', status: 'ok', output, durationMs: Date.now() - start, timestamp: new Date().toISOString() }
  } catch (e) {
    return { agentId: 'obsidian-planner', agentName: 'Obsidian Planner', status: 'error', output: String(e), durationMs: Date.now() - start, timestamp: new Date().toISOString() }
  }
}

// ─── AGENT TEAM EVALUATOR ────────────────────────────────────────────────
// Ocenia agentów po performance i rekomenduje zmiany
export async function runAgentTeamEvaluation(agentResults: AgentResult[]): Promise<AgentResult> {
  const start = Date.now()
  try {
    const resultsStr = agentResults.map(r =>
      `Agent: ${r.agentName} | Status: ${r.status} | Czas: ${r.durationMs}ms | Output: ${r.output.substring(0, 200)}`
    ).join('\n')

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: `Jesteś team managerem agentów AI. Oceniasz performance każdego agenta.
Kryteria: jakość outputu, czas odpowiedzi, błędy, użyteczność.
Wynik: JSON z polami: ratings[{agentId, score(0-100), strengths[], improvements[], replace: bool}], teamHealth(0-100)`,
      messages: [{
        role: 'user',
        content: `Wyniki agentów z ostatniego runu:\n${resultsStr}\n\nOceń każdego agenta.`,
      }],
    })

    const output = response.content[0]?.type === 'text' ? response.content[0].text : ''
    return { agentId: 'team-evaluator', agentName: 'Agent Team Evaluator', status: 'ok', output, durationMs: Date.now() - start, timestamp: new Date().toISOString() }
  } catch (e) {
    return { agentId: 'team-evaluator', agentName: 'Agent Team Evaluator', status: 'error', output: String(e), durationMs: Date.now() - start, timestamp: new Date().toISOString() }
  }
}

// ─── GŁÓWNY ORCHESTRATOR ─────────────────────────────────────────────────
export async function runObsidianOrchestrator(vaultPath: string): Promise<OrchestratorReport> {
  const runId = `obsidian-${Date.now()}`
  const timestamp = new Date().toISOString()

  // Zbierz stan vaultu
  let vaultSummary = `Vault path: ${vaultPath}\n`
  try {
    const { readdir, stat } = await import('fs/promises')
    const items = await readdir(vaultPath, { recursive: false })
    vaultSummary += `Foldery/pliki w root: ${items.join(', ')}\n`
  } catch {
    vaultSummary += 'Nie można odczytać vaultu lokalnie\n'
  }

  // Kontekst z constants
  const vaultContext = `
Użytkownik: Roth, 16-18 lat
Cele: Tajlandia 2027, OFM Management, AI Consulting
Stack: Next.js 15, Google Sheets, Telegram, Claude API
Vault: 00_INBOX, 01_People (8 osób), 02_Projects (OFM/AI/Szkola),
       03_Knowledge (OFM/AI/Biznes), 04_Weekly_Reviews, 05_Ideas,
       06_Decisions, 07_Daily_Notes, 08_Thailand_Road
`

  // Faza 1: Audyt struktury
  const auditResult = await runObsidianStructureAudit(vaultSummary + vaultContext)

  // Faza 2: Sequential — developer, potem planner z wynikami developera
  const developerResult = await runObsidianContentDeveloper(auditResult.output, vaultContext)
  const plannerResult = await runObsidianPlanner(auditResult.output, developerResult.output)

  // Faza 3: Evaluacja teamu
  const allResults = [auditResult, developerResult, plannerResult]
  const evaluationResult = await runAgentTeamEvaluation(allResults)

  // Orchestrator summary (finalny agent)
  const summaryResponse = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    system: 'Jesteś orchestratorem. Podsumuj wyniki 3 sub-agentów w 5 zdaniach po polsku. Wylistuj 3 konkretne akcje do wykonania.',
    messages: [{
      role: 'user',
      content: `Audyt: ${auditResult.output.substring(0, 500)}\nDeveloper: ${developerResult.output.substring(0, 500)}\nPlaner: ${plannerResult.output.substring(0, 300)}`,
    }],
  })
  const summary = summaryResponse.content[0]?.type === 'text' ? summaryResponse.content[0].text : ''

  return {
    runId,
    timestamp,
    agents: [...allResults, evaluationResult],
    summary,
    actions: [
      'Sprawdź raport w /dashboard/system',
      'Implementuj CRITICAL issues z audytu',
      'Zaplanuj weekly review vaultu',
    ],
  }
}
