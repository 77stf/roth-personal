// ROTH Personal OS — Obsidian Multi-Agent API
// POST /api/agents/obsidian

import { NextResponse } from 'next/server'
import { runObsidianOrchestrator } from '@/lib/agents'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST() {
  const vaultPath = 'C:/Users/crypt/ROTH Personal/roth-personal-obsidian-vault'

  try {
    await logger.info('AgentOrchestrator', 'Obsidian agent run started')
    const report = await runObsidianOrchestrator(vaultPath)
    await logger.info('AgentOrchestrator', `Run ${report.runId} completed`, {
      agents: report.agents.length,
      status: report.agents.map(a => a.status),
    })
    return NextResponse.json(report)
  } catch (e) {
    await logger.error('AgentOrchestrator', 'Obsidian agent run failed', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    agents: [
      { id: 'obsidian-structure-auditor', name: 'Structure Auditor', role: 'Audytuje strukturę vaultu' },
      { id: 'obsidian-content-developer', name: 'Content Developer', role: 'Rozbudowuje brakujące treści' },
      { id: 'obsidian-planner', name: 'Planner', role: 'Planuje dalszy rozwój' },
      { id: 'team-evaluator', name: 'Team Evaluator', role: 'Ocenia performance agentów' },
    ],
    endpoint: 'POST /api/agents/obsidian',
  })
}
