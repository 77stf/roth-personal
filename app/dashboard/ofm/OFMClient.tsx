'use client'

import { useState } from 'react'
import type { OFMReport, ContentIdea, RedditPost } from '@/lib/ofm-agents'

interface OFMProject {
  modelka: string
  status: string
  przychod: number
  nastepnyKrok?: string
  deadline?: string
}

interface Props {
  azul: OFMProject | null
  projekty: OFMProject[]
}

const INVESTED_USD = 860
const PLN_RATE = 4.05

export default function OFMClient({ azul, projekty }: Props) {
  const [report, setReport] = useState<OFMReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'reddit' | 'dms' | 'revenue'>('overview')
  const [error, setError] = useState<string | null>(null)

  async function runAgents() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/agents/ofm', { method: 'POST' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setReport(data)
      setActiveTab('content')
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  const currentMRR = azul?.przychod ?? 0
  const currentMRR_PLN = currentMRR * PLN_RATE
  const investedPLN = INVESTED_USD * PLN_RATE
  const breakEvenMonths = currentMRR > 0 ? Math.ceil(INVESTED_USD / currentMRR) : null
  const roi = currentMRR > 0 ? Math.min(100, Math.round((currentMRR / INVESTED_USD) * 100)) : 0

  const statusColor: Record<string, string> = {
    negocjacje: '#ffd166',
    onboarding: '#4cc9f0',
    aktywna: '#06d6a0',
    pauza: '#94a3b8',
    zakonczona: '#444',
  }

  return (
    <div style={{ padding: '20px', maxWidth: '860px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
          77STF Agency · OFM Management
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>OFM</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
              Zarządzanie modelkami · Azul · Tajlandia pipeline
            </div>
          </div>
          <button
            onClick={runAgents}
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #f97316, #ef4444)',
              border: 'none',
              color: loading ? 'rgba(255,255,255,0.4)' : '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: loading ? 'default' : 'pointer',
              letterSpacing: '0.02em',
            }}
          >
            {loading ? '⏳ Agenci pracują...' : '🤖 Uruchom OFM Agentów'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', fontSize: '13px', marginBottom: '16px' }}>
          Błąd: {error}
        </div>
      )}

      {/* AZUL MODEL CARD */}
      <div style={{
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(239,68,68,0.08))',
        border: '1px solid rgba(249,115,22,0.25)',
        padding: '20px',
        marginBottom: '16px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                💎
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>Azul</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Shaft MarketPlace · $860 zakup</div>
              </div>
            </div>

            {azul?.nastepnyKrok && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Następny krok:</span>
                <span style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>{azul.nastepnyKrok}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Status badge */}
            <div style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: `${statusColor[azul?.status ?? 'onboarding'] ?? '#4cc9f0'}15`,
              border: `1px solid ${statusColor[azul?.status ?? 'onboarding'] ?? '#4cc9f0'}40`,
              color: statusColor[azul?.status ?? 'onboarding'] ?? '#4cc9f0',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              {azul?.status ?? 'onboarding'}
            </div>

            {/* ROI bar */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>ROI Progress</div>
              <div style={{ width: '120px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)' }}>
                <div style={{ width: `${roi}%`, height: '100%', borderRadius: '3px', background: roi > 50 ? '#06d6a0' : roi > 20 ? '#ffd166' : '#f97316' }} />
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>{roi}% zwrotu inwestycji</div>
            </div>
          </div>
        </div>

        {/* Financial metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '16px' }}>
          {[
            { label: 'Inwestycja', value: `$${INVESTED_USD}`, sub: `${investedPLN.toFixed(0)} PLN`, color: '#ef4444' },
            { label: 'Obecny MRR', value: currentMRR > 0 ? `$${currentMRR}` : '—', sub: currentMRR > 0 ? `${currentMRR_PLN.toFixed(0)} PLN/mies` : 'Pre-revenue', color: currentMRR > 0 ? '#06d6a0' : '#94a3b8' },
            { label: 'Break-even', value: breakEvenMonths ? `${breakEvenMonths}m` : '—', sub: breakEvenMonths ? `za ${breakEvenMonths} miesięcy` : 'Potrzeba przychodów', color: '#f97316' },
          ].map(m => (
            <div key={m.label} style={{ padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Coaching team */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {[
          { name: 'Dr. Hadi', role: 'Coach OFM', color: '#6366f1' },
          { name: 'Mikołaj', role: 'Reddit Admin #1', color: '#f97316' },
          { name: 'Sorin', role: 'Reddit Admin #2', color: '#06d6a0' },
        ].map(c => (
          <div key={c.name} style={{ padding: '12px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${c.color}25`, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${c.color}20`, border: `1px solid ${c.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>👤</div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{c.name}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{c.role}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Agent report — tabs */}
      {report && (
        <div style={{ borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          {/* Tab nav */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto' }}>
            {([
              { id: 'content', label: '📸 Content', agentId: 'ofm-content-strategist' },
              { id: 'reddit', label: '🔴 Reddit', agentId: 'ofm-reddit-scout' },
              { id: 'dms', label: '💬 DMs', agentId: 'ofm-fan-engagement' },
              { id: 'revenue', label: '💰 Revenue', agentId: 'ofm-revenue-analyst' },
            ] as const).map(tab => {
              const agent = report.agents.find(a => a.agentId === tab.agentId)
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 20px',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #f97316' : '2px solid transparent',
                    color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.4)',
                    fontSize: '12px',
                    fontWeight: activeTab === tab.id ? 700 : 400,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {tab.label}
                  {agent?.status === 'error' && <span style={{ color: '#ef4444', fontSize: '10px' }}>ERR</span>}
                  <span style={{ fontSize: '10px', color: agent?.status === 'ok' ? '#06d6a0' : '#94a3b8' }}>
                    {agent ? `${(agent.durationMs / 1000).toFixed(1)}s` : ''}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          <div style={{ padding: '20px' }}>
            {activeTab === 'content' && (
              <ContentTab ideas={report.dailyPlan.contentIdeas} topPriority={report.dailyPlan.topPriority} />
            )}
            {activeTab === 'reddit' && (
              <RedditTab posts={report.dailyPlan.redditPosts} />
            )}
            {activeTab === 'dms' && (
              <DMTab scripts={report.dailyPlan.dmScripts} />
            )}
            {activeTab === 'revenue' && (
              <RevenueTab projection={report.dailyPlan.revenueProjection} />
            )}
          </div>
        </div>
      )}

      {/* No report yet */}
      {!report && !loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤖</div>
          <div style={{ fontSize: '14px', marginBottom: '6px', color: 'rgba(255,255,255,0.6)' }}>Uruchom agentów OFM</div>
          <div style={{ fontSize: '12px' }}>4 specjalistyczne AI analizują: content, Reddit, fan engagement i revenue</div>
        </div>
      )}

      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '14px', color: '#f97316', marginBottom: '8px' }}>4 agenty analizują Azul...</div>
          <div style={{ fontSize: '12px' }}>Content Strategist · Reddit Scout · Fan Engagement · Revenue Analyst</div>
        </div>
      )}

      {/* All projects list */}
      {projekty.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
            Wszystkie Projekty ({projekty.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {projekty.map((p, i) => (
              <div key={i} style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{p.modelka}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {p.przychod > 0 && <span style={{ fontSize: '12px', color: '#06d6a0' }}>${p.przychod}/mies</span>}
                  <span style={{
                    fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '5px',
                    background: `${statusColor[p.status] ?? '#888'}15`,
                    color: statusColor[p.status] ?? '#888',
                    border: `1px solid ${statusColor[p.status] ?? '#888'}30`,
                    textTransform: 'uppercase',
                  }}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SUB-VIEWS ─────────────────────────────────────────────────────────────

function ContentTab({ ideas, topPriority }: { ideas: ContentIdea[]; topPriority: string }) {
  if (ideas.length === 0) {
    return <RawFallback message="Content plan gotowy — sprawdź szczegóły poniżej." />
  }

  return (
    <div>
      {topPriority && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', marginBottom: '16px' }}>
          <div style={{ fontSize: '10px', color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>TOP PRIORYTET DZIŚ</div>
          <div style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>{topPriority}</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {ideas.map((idea, i) => (
          <div key={i} style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{
                padding: '2px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 700,
                background: idea.type === 'ppv' ? 'rgba(249,115,22,0.2)' : 'rgba(99,102,241,0.2)',
                color: idea.type === 'ppv' ? '#f97316' : '#818cf8',
                textTransform: 'uppercase',
              }}>
                {idea.type}
              </span>
              {idea.bestTime && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>🕐 {idea.bestTime}</span>}
              {idea.estimatedRevenue && <span style={{ fontSize: '11px', color: '#06d6a0', marginLeft: 'auto' }}>~{idea.estimatedRevenue}</span>}
            </div>
            <div style={{ fontSize: '13px', color: '#fff', fontWeight: 600, marginBottom: '6px' }}>{idea.concept}</div>
            {idea.caption && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>"{idea.caption}"</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function RedditTab({ posts }: { posts: RedditPost[] }) {
  if (posts.length === 0) return <RawFallback message="Strategia Reddit gotowa." />

  const trafficColor = { low: '#94a3b8', medium: '#ffd166', high: '#06d6a0' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {posts.map((post, i) => (
        <div key={i} style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,69,0,0.05)', border: '1px solid rgba(255,69,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#ff4500', fontWeight: 700 }}>r/{post.subreddit}</span>
            <span style={{
              fontSize: '10px', padding: '1px 6px', borderRadius: '4px',
              background: `${trafficColor[post.expectedTraffic]}20`,
              color: trafficColor[post.expectedTraffic],
              border: `1px solid ${trafficColor[post.expectedTraffic]}30`,
            }}>
              {post.expectedTraffic} traffic
            </span>
          </div>
          <div style={{ fontSize: '13px', color: '#fff', fontWeight: 600, marginBottom: '6px' }}>{post.title}</div>
          {post.bodyHint && <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{post.bodyHint}</div>}
        </div>
      ))}
    </div>
  )
}

function DMTab({ scripts }: { scripts: string[] }) {
  if (scripts.length === 0) return <RawFallback message="Skrypty DM gotowe." />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {scripts.map((script, i) => (
        <div key={i} style={{ padding: '14px', borderRadius: '10px', background: 'rgba(6,214,160,0.05)', border: '1px solid rgba(6,214,160,0.15)' }}>
          <div style={{ fontSize: '10px', color: '#06d6a0', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
            SKRYPT DM #{i + 1}
          </div>
          <div style={{ fontSize: '13px', color: '#fff', lineHeight: 1.6 }}>{script}</div>
        </div>
      ))}
    </div>
  )
}

function RevenueTab({ projection }: { projection: { invested: number; currentMRR: number; breakEvenMonths: number; monthsToThailand: number; nextMilestone: string } }) {
  const PLN_RATE = 4.05
  const THAILAND_TARGET = 15000

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Inwestycja', value: `$${projection.invested}`, sub: `${(projection.invested * PLN_RATE).toFixed(0)} PLN`, icon: '💸' },
          { label: 'Obecny MRR', value: projection.currentMRR > 0 ? `$${projection.currentMRR}` : 'Pre-revenue', sub: projection.currentMRR > 0 ? `${(projection.currentMRR * PLN_RATE).toFixed(0)} PLN/mies` : 'Czekamy na subs', icon: '📈' },
          { label: 'Break-even', value: `${projection.breakEvenMonths}m`, sub: `${projection.breakEvenMonths} miesięcy`, icon: '⚖️' },
          { label: 'Do Tajlandii', value: `${projection.monthsToThailand}m`, sub: `cel: ${THAILAND_TARGET.toLocaleString()} PLN`, icon: '🌴' },
        ].map(m => (
          <div key={m.label} style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', marginBottom: '6px' }}>{m.icon}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>{m.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{m.value}</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
        <div style={{ fontSize: '10px', color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>NASTĘPNY MILESTONE</div>
        <div style={{ fontSize: '13px', color: '#fff' }}>{projection.nextMilestone || 'Osiągnij $100 MRR — pierwszy zwrot z inwestycji'}</div>
      </div>
    </div>
  )
}

function RawFallback({ message }: { message: string }) {
  return (
    <div style={{ padding: '16px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', textAlign: 'center' }}>
      {message}
    </div>
  )
}
