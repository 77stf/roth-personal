export const dynamic = 'force-dynamic'

// ROTH Personal OS — System Dashboard
// Portfolio-quality monitoring: agents, health, logs, team

import { runHealthCheck, type HealthReport } from '@/lib/logger'

export default async function SystemPage() {
  const health = await runHealthCheck()

  const agents = [
    {
      id: 'obsidian-structure-auditor',
      name: 'Structure Auditor',
      role: 'Obsidian',
      desc: 'Audytuje strukturę vaultu — brakujące pliki, broken links, niespójności',
      model: 'claude-sonnet-4-6',
      status: 'ready',
      score: 92,
      color: '#6366f1',
    },
    {
      id: 'obsidian-content-developer',
      name: 'Content Developer',
      role: 'Obsidian',
      desc: 'Rozbudowuje brakujące notatki i treści w vault',
      model: 'claude-sonnet-4-6',
      status: 'ready',
      score: 88,
      color: '#8b5cf6',
    },
    {
      id: 'obsidian-planner',
      name: 'Vault Planner',
      role: 'Obsidian',
      desc: 'Planuje dalszy rozwój knowledge base — roadmap i priorytety',
      model: 'claude-sonnet-4-6',
      status: 'ready',
      score: 85,
      color: '#a855f7',
    },
    {
      id: 'team-evaluator',
      name: 'Team Evaluator',
      role: 'Meta',
      desc: 'Ocenia performance wszystkich agentów i rekomenduje zamianę',
      model: 'claude-sonnet-4-6',
      status: 'ready',
      score: 95,
      color: '#f59e0b',
    },
    {
      id: 'briefing-morning',
      name: 'Morning Brief',
      role: 'Briefings',
      desc: 'Generuje poranny brief dnia z kontekstem, transportem, lekcjami',
      model: 'claude-sonnet-4-6',
      status: 'active',
      score: 97,
      color: '#22c55e',
    },
    {
      id: 'transport-calc',
      name: 'Transport Calc',
      role: 'Transport',
      desc: 'Oblicza optymalne trasy Konarskie→Śrem z przesiadką lub bezpośrednio',
      model: 'deterministic',
      status: 'active',
      score: 99,
      color: '#3b82f6',
    },
    {
      id: 'smart-task-parser',
      name: 'Task Parser',
      role: 'School',
      desc: 'Parsuje skrócone wiadomości (/kartkowka lekcja 5) → SPRAWDZIANY',
      model: 'rule-based + claude',
      status: 'active',
      score: 90,
      color: '#ef4444',
    },
    {
      id: 'error-monitor',
      name: 'Error Monitor',
      role: 'System',
      desc: 'Monitoruje błędy API, raportuje na mail + Telegram',
      model: 'deterministic',
      status: 'ready',
      score: 88,
      color: '#f97316',
    },
  ]

  const statusColor = health.overall === 'ok'
    ? '#22c55e'
    : health.overall === 'warn'
      ? '#f59e0b'
      : '#ef4444'

  const activeAgents = agents.filter(a => a.status === 'active').length
  const avgScore = Math.round(agents.reduce((s, a) => s + a.score, 0) / agents.length)

  return (
    <div style={{ padding: '24px 20px', maxWidth: '900px', margin: '0 auto' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
          letterSpacing: '0.1em', marginBottom: '6px',
        }}>
          System · ROTH Personal OS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>
            Agent Team & Monitor
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '6px 14px', borderRadius: '20px',
            background: `${statusColor}15`, border: `1px solid ${statusColor}40`,
            fontSize: '12px', fontWeight: 700, color: statusColor,
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: statusColor,
              animation: health.overall === 'ok' ? 'pulse-dot 2s infinite' : undefined,
              display: 'inline-block',
            }} />
            {health.overall === 'ok' ? 'System OK' : health.overall === 'warn' ? 'Ostrzeżenia' : 'Błędy'}
          </div>
        </div>
      </div>

      {/* ── METRYKI SYSTEMU ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px', marginBottom: '28px',
      }}>
        {[
          { label: 'Agentów', value: agents.length.toString(), color: '#6366f1' },
          { label: 'Aktywnych', value: activeAgents.toString(), color: '#22c55e' },
          { label: 'Avg Score', value: `${avgScore}%`, color: '#f59e0b' },
          { label: 'Subsystems', value: `${health.checks.filter(c => c.status === 'ok').length}/${health.checks.length}`, color: '#3b82f6' },
        ].map(m => (
          <div key={m.label} style={{
            padding: '16px', borderRadius: '12px',
            background: `${m.color}10`, border: `1px solid ${m.color}25`,
          }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: m.color, marginBottom: '4px' }}>
              {m.value}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── HEALTH CHECKS ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '28px' }}>
        <SectionHeader title="System Health" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {health.checks.map(check => {
            const color = check.status === 'ok' ? '#22c55e' : check.status === 'warn' ? '#f59e0b' : '#ef4444'
            return (
              <div key={check.name} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '10px',
                background: `${color}08`, border: `1px solid ${color}25`,
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: color, flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{check.name}</div>
                  {check.error && (
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{check.error}</div>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: color, fontWeight: 600 }}>
                  {check.status.toUpperCase()}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── AGENT TEAM ──────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '28px' }}>
        <SectionHeader title="Agent Team" action={{ label: 'Run Obsidian Agents', endpoint: '/api/agents/obsidian' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {agents.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* ── NOWE ROLE REKOMENDACJE ───────────────────────────────────────────── */}
      <div style={{ marginBottom: '28px' }}>
        <SectionHeader title="Rekomendowane Role do Dodania" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {[
            { role: 'Finance Analyst Agent', desc: 'Analizuje Sheets FINANSE_* → prognoza do Tajlandii, budget alerts', priority: 'HIGH' },
            { role: 'OFM Strategy Agent', desc: 'Analizuje projekty OFM i sugeruje kolejne kroki dla każdej modelki', priority: 'HIGH' },
            { role: 'Wake-Up Agent', desc: 'Make.com cron 06:15 → Telegram alarm z rozkładem busy', priority: 'MEDIUM' },
            { role: 'Sprawdzian Coach', desc: 'Tworzy plan nauki przed sprawdzianem na podstawie tematu', priority: 'MEDIUM' },
            { role: 'Weekly Review Agent', desc: 'Generuje cotygodniowe podsumowanie i wpisuje do Obsidian', priority: 'LOW' },
            { role: 'Trend Monitor', desc: 'Monitoruje GitHub/HN/X dla nowych AI tools → raport tygodniowy', priority: 'LOW' },
          ].map(r => (
            <div key={r.role} style={{
              padding: '14px 16px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{r.role}</div>
                <span style={{
                  padding: '2px 7px', borderRadius: '5px', fontSize: '9px', fontWeight: 700,
                  background: r.priority === 'HIGH' ? 'rgba(239,68,68,0.15)' : r.priority === 'MEDIUM' ? 'rgba(245,158,11,0.15)' : 'rgba(148,163,184,0.15)',
                  color: r.priority === 'HIGH' ? '#ef4444' : r.priority === 'MEDIUM' ? '#f59e0b' : '#94a3b8',
                }}>
                  {r.priority}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}

function SectionHeader({ title, action }: { title: string; action?: { label: string; endpoint: string } }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: '12px',
    }}>
      <div style={{
        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)',
      }}>
        {title}
      </div>
      {action && (
        <a href={action.endpoint} style={{
          padding: '5px 12px', borderRadius: '7px',
          background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
          fontSize: '11px', fontWeight: 600, color: '#818cf8',
          textDecoration: 'none', cursor: 'pointer',
        }}>
          {action.label}
        </a>
      )}
    </div>
  )
}

function AgentCard({ agent }: { agent: { id: string; name: string; role: string; desc: string; model: string; status: string; score: number; color: string } }) {
  const isActive = agent.status === 'active'
  const statusColor = isActive ? '#22c55e' : '#94a3b8'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '14px 16px', borderRadius: '12px',
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'}`,
    }}>
      {/* Color dot */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: `${agent.color}20`, border: `1px solid ${agent.color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: '16px',
      }}>
        {agent.role === 'Obsidian' ? '📚' : agent.role === 'Meta' ? '🎯' : agent.role === 'Briefings' ? '🌅' : agent.role === 'Transport' ? '🚌' : agent.role === 'School' ? '🎓' : '🔧'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{agent.name}</div>
          <span style={{
            padding: '1px 6px', borderRadius: '5px',
            background: 'rgba(255,255,255,0.06)',
            fontSize: '10px', color: 'rgba(255,255,255,0.35)',
          }}>
            {agent.role}
          </span>
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{agent.desc}</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '3px' }}>
          model: {agent.model}
        </div>
      </div>

      {/* Score */}
      <div style={{ textAlign: 'center', flexShrink: 0 }}>
        <div style={{
          fontSize: '18px', fontWeight: 800,
          color: agent.score >= 95 ? '#22c55e' : agent.score >= 80 ? '#f59e0b' : '#ef4444',
        }}>
          {agent.score}
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>score</div>
      </div>

      {/* Status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '4px 10px', borderRadius: '20px',
        background: `${statusColor}15`, border: `1px solid ${statusColor}30`,
        fontSize: '10px', fontWeight: 700, color: statusColor,
        flexShrink: 0,
      }}>
        <span style={{
          width: '5px', height: '5px', borderRadius: '50%', background: statusColor,
          animation: isActive ? 'pulse-dot 2s infinite' : undefined, display: 'inline-block',
        }} />
        {isActive ? 'ACTIVE' : 'READY'}
      </div>
    </div>
  )
}
