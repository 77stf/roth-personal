'use client'

import { useState } from 'react'
import {
  Brain, CalendarDays, Table2, BookOpen, Send, Triangle,
  Github, Workflow, Zap, X, ChevronRight,
} from 'lucide-react'

type NodeStatus = 'ok' | 'warn' | 'error' | 'offline'

interface NodeDef {
  id: string
  x: number
  y: number
  label: string
  sublabel: string
  color: string
  icon: React.ReactNode
  details: {
    description: string
    flow: string[]
    tech: string
    commands?: string[]
  }
}

const NODES: NodeDef[] = [
  {
    id: 'roth', x: 50, y: 50,
    label: 'ROTH OS', sublabel: 'Next.js 15 · Vercel',
    color: '#FF3B30',
    icon: <Zap size={18} />,
    details: {
      description: 'Centrum systemu — AI-powered personal OS łączący wszystkie usługi w jeden hub zarządzania życiem.',
      flow: ['11 stron dashboard', '15+ API routes', 'Middleware auth (passcode)', 'Briefy morning/evening/sleep'],
      tech: 'Next.js 15 App Router, TypeScript strict, Tailwind CSS v4',
    },
  },
  {
    id: 'claude', x: 17, y: 20,
    label: 'Claude AI', sublabel: 'claude-sonnet-4-6',
    color: '#AF52DE',
    icon: <Brain size={14} />,
    details: {
      description: 'AI reasoning engine — generuje briefy, analizuje kontekst i odpowiada na komendy Telegram.',
      flow: ['Morning / evening / sleep briefy', '/ask command w Telegram', 'OFM analytics & insights', 'Idea Lab multi-persona analysis'],
      tech: 'Anthropic SDK, claude-sonnet-4-6',
      commands: ['/brief', '/ask', '/ofm', '/reddit_analyze'],
    },
  },
  {
    id: 'calendar', x: 50, y: 10,
    label: 'Google Calendar', sublabel: 'OAuth · read-only',
    color: '#007AFF',
    icon: <CalendarDays size={14} />,
    details: {
      description: 'Kalendarz — źródło lekcji, treningów i eventów dla scoringu dnia oraz obliczeń transportu.',
      flow: ['Events → scoring dnia (0-20 pkt)', 'Transport Konarskie→Śrem', 'Sprawdziany sync', 'Brief context generation'],
      tech: 'Google Calendar API v3, OAuth 2.0, refresh token',
    },
  },
  {
    id: 'sheets', x: 83, y: 20,
    label: 'Google Sheets', sublabel: '26 arkuszy · primary DB',
    color: '#34C759',
    icon: <Table2 size={14} />,
    details: {
      description: 'Główna baza danych — wszystkie strukturalne dane systemu od sprawdzianów po finanse.',
      flow: ['STREAKI, SPRAWDZIANY, LEKI, WODA', 'OSOBY_PROFILE, OFM_PROJECTS, PROJEKTY_AI', 'FINANSE_PRZYCHODY/WYDATKI/BUDZET/CELE', 'USTAWIENIA systemowe, SYSTEM_LOG'],
      tech: 'Google Sheets API v4, service account auth, appendRow',
    },
  },
  {
    id: 'obsidian', x: 10, y: 55,
    label: 'Obsidian', sublabel: 'REST API · port 27124',
    color: '#8B5CF6',
    icon: <BookOpen size={14} />,
    details: {
      description: 'Knowledge base — notatki, profile kontaktów, decyzje, wiki OFM. Działa lokalnie przez REST API.',
      flow: ['01_People — profile + historia kontaktów', '02_Projects — planowanie sesji', '03_Knowledge/OFM — wiki metodyczna', '05_Ideas / 06_Decisions / 07_Daily_Notes'],
      tech: 'Obsidian Local REST API plugin (port 27124), Bearer auth',
      commands: ['/context [imię]', '/add_reddit [temat]', '/decision'],
    },
  },
  {
    id: 'telegram', x: 90, y: 55,
    label: 'Telegram Bot', sublabel: '17 komend · Grammy',
    color: '#FF9500',
    icon: <Send size={14} />,
    details: {
      description: 'Mobilny interfejs — 17 komend, automatyczne briefy, szybkie akcje z każdego miejsca.',
      flow: ['/brief /water /ask /plan', '/kartkowka /sprawdzian /kolo', '/ofm /context /add_reddit', 'Automatyczne briefy i alerty systemowe'],
      tech: 'Grammy framework, webhook mode, HMAC secret verification',
      commands: ['/brief', '/water', '/kartkowka', '/ofm', '/ask'],
    },
  },
  {
    id: 'vercel', x: 50, y: 90,
    label: 'Vercel', sublabel: 'hosting · edge runtime',
    color: '#1D1D1F',
    icon: <Triangle size={14} />,
    details: {
      description: 'Hosting i deployment — auto-deploy z GitHub, env secrets, serverless API routes.',
      flow: ['Auto-deploy on git push', 'Serverless API routes', 'Edge middleware auth', 'Environment secrets management'],
      tech: 'Vercel Pro, Next.js serverless runtime',
    },
  },
  {
    id: 'github', x: 17, y: 82,
    label: 'GitHub Actions', sublabel: 'sleep brief · 23:00',
    color: '#6E6E73',
    icon: <Github size={14} />,
    details: {
      description: 'CI/CD + zaplanowane akcje — sleep brief codziennie przed snem o 23:00.',
      flow: ['23:00 → POST /api/briefings/sleep', 'Deploy pipeline on push', 'CRON_SECRET management', 'Repo backup & versioning'],
      tech: 'GitHub Actions, cron schedule, encrypted secrets',
    },
  },
  {
    id: 'make', x: 83, y: 82,
    label: 'Make.com', sublabel: 'morning / evening CRON',
    color: '#FF6B35',
    icon: <Workflow size={14} />,
    details: {
      description: 'Automatyzacje — morning brief 07:00 i evening brief 20:00 przez HTTP webhook.',
      flow: ['07:00 → POST /api/briefings/morning', '20:00 → POST /api/briefings/evening', 'Custom webhook triggers', 'CRON_SECRET auth header'],
      tech: 'Make.com (formerly Integromat), HTTP module',
    },
  },
]

const CONNECTIONS = [
  'claude', 'calendar', 'sheets', 'obsidian',
  'telegram', 'vercel', 'github', 'make',
].map(id => ({ from: id, to: 'roth' }))

const HEALTH_MAP: Record<string, string> = {
  'Google Sheets': 'sheets',
  'Claude API': 'claude',
  'Obsidian': 'obsidian',
  'Telegram': 'telegram',
}

interface HealthCheck {
  name: string
  status: 'ok' | 'warn' | 'error'
  ms?: number
  error?: string
}

export function SystemMap({ healthChecks }: { healthChecks: HealthCheck[] }) {
  const [selected, setSelected] = useState<string | null>(null)

  const statuses: Record<string, NodeStatus> = {}
  for (const check of healthChecks) {
    const nodeId = HEALTH_MAP[check.name]
    if (nodeId) statuses[nodeId] = check.status as NodeStatus
  }

  const getStatus = (id: string): NodeStatus => statuses[id] ?? 'ok'
  const selectedNode = NODES.find(n => n.id === selected)

  const isConnectedToSelected = (nodeId: string) =>
    selected !== null && (
      nodeId === selected ||
      nodeId === 'roth' ||
      CONNECTIONS.some(c => c.from === nodeId && (c.to === selected || selected === 'roth')) ||
      CONNECTIONS.some(c => c.from === selected && c.to === nodeId)
    )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 284px', gap: '14px', alignItems: 'start' }}>

      {/* ── MAP ──────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        height: '460px',
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        overflow: 'hidden',
      }}>
        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          backgroundPosition: '14px 14px',
          pointerEvents: 'none',
        }} />

        {/* SVG lines */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            {NODES.filter(n => n.id !== 'roth').map(node => (
              <linearGradient
                key={node.id}
                id={`grad-${node.id}`}
                x1={`${node.x}%`} y1={`${node.y}%`}
                x2="50%" y2="50%"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={node.color} stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FF3B30" stopOpacity="0.4" />
              </linearGradient>
            ))}
          </defs>

          {CONNECTIONS.map(conn => {
            const fromNode = NODES.find(n => n.id === conn.from)!
            const isHighlighted = selected === conn.from || selected === 'roth'
            return (
              <g key={conn.from}>
                {isHighlighted && (
                  <line
                    x1={fromNode.x} y1={fromNode.y} x2={50} y2={50}
                    stroke={fromNode.color} strokeWidth="2.5" strokeOpacity="0.1"
                  />
                )}
                <line
                  x1={fromNode.x} y1={fromNode.y} x2={50} y2={50}
                  stroke={isHighlighted ? `url(#grad-${conn.from})` : '#D2D2D7'}
                  strokeWidth={isHighlighted ? '0.7' : '0.35'}
                  strokeOpacity={isHighlighted ? '1' : '0.7'}
                  strokeDasharray={isHighlighted ? undefined : '1.5 1.5'}
                />
              </g>
            )
          })}
        </svg>

        {/* Nodes */}
        {NODES.map(node => {
          const status = getStatus(node.id)
          const isSelected = selected === node.id
          const connected = isConnectedToSelected(node.id)
          const isDimmed = selected !== null && !connected
          const isCore = node.id === 'roth'

          return (
            <button
              key={node.id}
              onClick={() => setSelected(isSelected ? null : node.id)}
              style={{
                position: 'absolute',
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
                background: isSelected ? `${node.color}12` : 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1.5px solid ${isSelected ? node.color : 'rgba(0,0,0,0.09)'}`,
                borderRadius: isCore ? '16px' : '11px',
                padding: isCore ? '14px 18px' : '9px 11px',
                cursor: 'pointer',
                boxShadow: isSelected
                  ? `0 0 0 3px ${node.color}20, 0 6px 20px rgba(0,0,0,0.13)`
                  : connected && selected
                    ? `0 2px 10px rgba(0,0,0,0.09)`
                    : '0 2px 8px rgba(0,0,0,0.07)',
                transition: 'all 0.15s ease',
                textAlign: 'center' as const,
                zIndex: isSelected ? 10 : connected ? 5 : 2,
                opacity: isDimmed ? 0.22 : 1,
                minWidth: isCore ? '112px' : '84px',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            >
              {/* Status dot */}
              <div style={{
                position: 'absolute', top: '5px', right: '5px',
                width: '7px', height: '7px', borderRadius: '50%',
                background: status === 'ok' ? '#34C759' : status === 'warn' ? '#FF9500' : '#FF3B30',
                boxShadow: status === 'ok' ? '0 0 5px rgba(52,199,89,0.6)' : undefined,
              }} />

              {/* Icon */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '5px', color: node.color }}>
                {node.icon}
              </div>

              {/* Label */}
              <div style={{ fontSize: isCore ? '12px' : '11px', fontWeight: 700, color: '#1D1D1F', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                {node.label}
              </div>
              <div style={{ fontSize: '9px', color: '#6E6E73', marginTop: '2px', whiteSpace: 'nowrap' }}>
                {node.sublabel}
              </div>
            </button>
          )
        })}

        {/* Click hint */}
        {!selected && (
          <div style={{
            position: 'absolute', bottom: '14px', left: 0, right: 0,
            textAlign: 'center', fontSize: '11px', color: '#AEAEB2',
            pointerEvents: 'none', userSelect: 'none',
          }}>
            Kliknij węzeł aby zobaczyć szczegóły
          </div>
        )}
      </div>

      {/* ── DETAIL PANEL ─────────────────────────────────────────── */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        padding: '20px',
        minHeight: '460px',
      }}>
        {!selectedNode
          ? <Overview statuses={statuses} onSelect={setSelected} />
          : <NodeDetail node={selectedNode} status={getStatus(selectedNode.id)} onClose={() => setSelected(null)} />
        }
      </div>

    </div>
  )
}

// ── Overview (no selection) ──────────────────────────────────────────────────

function Overview({
  statuses,
  onSelect,
}: {
  statuses: Record<string, NodeStatus>
  onSelect: (id: string) => void
}) {
  const checks = NODES.filter(n => n.id !== 'roth').map(n => ({
    ...n,
    status: statuses[n.id] ?? ('ok' as NodeStatus),
  }))
  const okCount = checks.filter(n => n.status === 'ok').length
  const warnCount = checks.filter(n => n.status === 'warn').length
  const errCount = checks.filter(n => n.status === 'error').length
  const allOk = okCount === checks.length

  return (
    <div>
      <div style={{
        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const,
        letterSpacing: '0.07em', color: '#6E6E73', marginBottom: '14px',
      }}>
        Przegląd systemu
      </div>

      {/* Health badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 12px', borderRadius: '10px', marginBottom: '18px',
        background: allOk ? 'rgba(52,199,89,0.08)' : errCount > 0 ? 'rgba(255,59,48,0.08)' : 'rgba(255,149,0,0.08)',
        border: `1px solid ${allOk ? 'rgba(52,199,89,0.25)' : errCount > 0 ? 'rgba(255,59,48,0.25)' : 'rgba(255,149,0,0.25)'}`,
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
          background: allOk ? '#34C759' : errCount > 0 ? '#FF3B30' : '#FF9500',
        }} />
        <span style={{
          fontSize: '12px', fontWeight: 700,
          color: allOk ? '#1A7D38' : errCount > 0 ? '#CC0000' : '#8B5300',
        }}>
          {allOk
            ? `Wszystko OK · ${okCount}/${checks.length}`
            : errCount > 0
              ? `${errCount} błędów · ${warnCount} ostrzeżeń`
              : `${warnCount} ostrzeżeń`
          }
        </span>
      </div>

      {/* Node list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {checks.map(node => (
          <button
            key={node.id}
            onClick={() => onSelect(node.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 10px', borderRadius: '8px',
              background: 'transparent', border: '1px solid transparent',
              cursor: 'pointer', transition: 'all 0.1s',
              fontFamily: 'inherit', width: '100%', textAlign: 'left' as const,
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLButtonElement).style.background = '#F5F5F7'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#D2D2D7'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent'
            }}
          >
            <div style={{
              width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
              background: node.status === 'ok' ? '#34C759' : node.status === 'warn' ? '#FF9500' : '#FF3B30',
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#1D1D1F' }}>{node.label}</div>
              <div style={{ fontSize: '10px', color: '#6E6E73', marginTop: '1px' }}>{node.sublabel}</div>
            </div>
            <div style={{ color: '#AEAEB2', flexShrink: 0 }}>
              <ChevronRight size={13} />
            </div>
          </button>
        ))}
      </div>

      {/* ROTH OS separately */}
      <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #E8E8ED' }}>
        <button
          onClick={() => onSelect('roth')}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px', width: '100%',
            background: 'rgba(255,59,48,0.05)', border: '1px solid rgba(255,59,48,0.15)',
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' as const,
          }}
        >
          <Zap size={14} color="#FF3B30" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1D1D1F' }}>ROTH OS Core</div>
            <div style={{ fontSize: '10px', color: '#6E6E73', marginTop: '1px' }}>Hub centralny</div>
          </div>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34C759' }} />
        </button>
      </div>
    </div>
  )
}

// ── Node Detail (selection) ─────────────────────────────────────────────────

function NodeDetail({
  node,
  status,
  onClose,
}: {
  node: NodeDef
  status: NodeStatus
  onClose: () => void
}) {
  const statusColor = status === 'ok' ? '#34C759' : status === 'warn' ? '#FF9500' : status === 'error' ? '#FF3B30' : '#6E6E73'
  const statusLabel = status === 'ok' ? 'Online' : status === 'warn' ? 'Ostrzeżenie' : status === 'error' ? 'Błąd' : 'Offline'

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
            <div style={{ color: node.color }}>{node.icon}</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1D1D1F' }}>{node.label}</div>
          </div>
          <div style={{ fontSize: '11px', color: '#6E6E73' }}>{node.sublabel}</div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: '#F5F5F7', border: '1px solid #D2D2D7',
            borderRadius: '7px', padding: '5px', cursor: 'pointer',
            color: '#6E6E73', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Status */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '4px 10px', borderRadius: '20px', marginBottom: '14px',
        background: `${statusColor}12`, border: `1px solid ${statusColor}30`,
        alignSelf: 'flex-start',
      }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }} />
        <span style={{ fontSize: '11px', fontWeight: 700, color: statusColor }}>{statusLabel}</span>
      </div>

      {/* Description */}
      <div style={{ fontSize: '13px', color: '#1D1D1F', lineHeight: 1.65, marginBottom: '16px' }}>
        {node.details.description}
      </div>

      {/* Data flow */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#AEAEB2', marginBottom: '7px' }}>
          Przepływ danych
        </div>
        {node.details.flow.map((item, i) => (
          <div key={i} style={{ fontSize: '12px', color: '#6E6E73', padding: '2px 0', display: 'flex', gap: '7px', alignItems: 'flex-start' }}>
            <span style={{ color: node.color, fontWeight: 700, flexShrink: 0, lineHeight: '18px' }}>›</span>
            {item}
          </div>
        ))}
      </div>

      {/* Tech */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#AEAEB2', marginBottom: '7px' }}>
          Stack
        </div>
        <div style={{
          fontSize: '11px', color: '#1D1D1F', background: '#F5F5F7',
          padding: '8px 10px', borderRadius: '8px', fontFamily: 'monospace', lineHeight: 1.55,
        }}>
          {node.details.tech}
        </div>
      </div>

      {/* Commands */}
      {node.details.commands && (
        <div>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: '#AEAEB2', marginBottom: '7px' }}>
            Komendy Telegram
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '5px' }}>
            {node.details.commands.map(cmd => (
              <span key={cmd} style={{
                fontSize: '11px', fontFamily: 'monospace',
                background: `${node.color}10`, color: node.color,
                border: `1px solid ${node.color}25`,
                padding: '2px 8px', borderRadius: '5px', fontWeight: 600,
              }}>
                {cmd}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
