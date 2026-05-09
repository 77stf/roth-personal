'use client'

import { useState } from 'react'
import { Bot, TrendingUp, Users, ChevronRight } from 'lucide-react'
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

const statusColor: Record<string, string> = {
  negocjacje: '#FFCC00',
  onboarding:  '#007AFF',
  aktywna:     '#34C759',
  pauza:       '#AEAEB2',
  zakonczona:  '#D2D2D7',
}

const statusBg: Record<string, string> = {
  negocjacje: 'rgba(255,204,0,0.12)',
  onboarding:  'rgba(0,122,255,0.1)',
  aktywna:     'rgba(52,199,89,0.1)',
  pauza:       'rgba(174,174,178,0.15)',
  zakonczona:  'rgba(210,210,215,0.15)',
}

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

  return (
    <div style={{ padding: '24px', maxWidth: '860px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
          77STF Agency · OFM Management
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>OFM</h1>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Zarzadzanie modelkami · Azul · Tajlandia pipeline
            </div>
          </div>
          <button
            onClick={runAgents}
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: loading ? 'var(--bg-elevated)' : 'var(--accent-red)',
              border: 'none',
              color: loading ? 'var(--text-secondary)' : '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Bot size={15} />
            {loading ? 'Agenci pracuja...' : 'Uruchom OFM Agentow'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px',
          background: 'rgba(255, 59, 48, 0.08)',
          border: '1px solid rgba(255, 59, 48, 0.2)',
          color: 'var(--accent-red)', fontSize: '13px', marginBottom: '16px',
        }}>
          Blad: {error}
        </div>
      )}

      {/* AZUL MODEL CARD */}
      <div className="card-elevated" style={{
        marginBottom: '16px',
        borderLeft: '3px solid #FF9500',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Orange accent glow */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,149,0,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: 'rgba(255,149,0,0.12)',
                border: '1px solid rgba(255,149,0,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <TrendingUp size={20} style={{ color: '#FF9500' }} />
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Azul</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Shaft MarketPlace · $860 zakup</div>
              </div>
            </div>

            {azul?.nastepnyKrok && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                marginTop: '8px', padding: '8px 12px',
                background: 'var(--bg-elevated)', borderRadius: '8px',
              }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Nastepny krok:</span>
                <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>{azul.nastepnyKrok}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Status badge */}
            <div style={{
              padding: '6px 14px', borderRadius: '8px',
              background: statusBg[azul?.status ?? 'onboarding'] ?? 'rgba(0,122,255,0.1)',
              border: `1px solid ${statusColor[azul?.status ?? 'onboarding'] ?? '#007AFF'}40`,
              color: statusColor[azul?.status ?? 'onboarding'] ?? '#007AFF',
              fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {azul?.status ?? 'onboarding'}
            </div>

            {/* ROI */}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', textAlign: 'right' }}>ROI Progress</div>
              <div style={{ width: '120px', height: '6px', borderRadius: '3px', background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                <div style={{
                  width: `${roi}%`, height: '100%', borderRadius: '3px',
                  background: roi > 50 ? 'var(--accent-green)' : roi > 20 ? 'var(--accent-orange)' : 'var(--accent-red)',
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '3px', textAlign: 'right' }}>
                {roi}% zwrotu inwestycji
              </div>
            </div>
          </div>
        </div>

        {/* Financial metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '16px' }}>
          {[
            { label: 'Inwestycja', value: `$${INVESTED_USD}`, sub: `${investedPLN.toFixed(0)} PLN`, color: 'var(--accent-red)' },
            { label: 'Obecny MRR', value: currentMRR > 0 ? `$${currentMRR}` : '—', sub: currentMRR > 0 ? `${currentMRR_PLN.toFixed(0)} PLN/mies` : 'Pre-revenue', color: currentMRR > 0 ? 'var(--accent-green)' : 'var(--text-secondary)' },
            { label: 'Break-even', value: breakEvenMonths ? `${breakEvenMonths}m` : '—', sub: breakEvenMonths ? `za ${breakEvenMonths} miesiecy` : 'Potrzeba przychodow', color: 'var(--accent-orange)' },
          ].map(m => (
            <div key={m.label} style={{
              padding: '12px', background: 'var(--bg-elevated)', borderRadius: '10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{m.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Coaching team */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {[
          { name: 'Dr. Hadi', role: 'Coach OFM', color: 'var(--accent-purple)' },
          { name: 'Mikolaj', role: 'Reddit Admin #1', color: 'var(--accent-orange)' },
          { name: 'Sorin', role: 'Reddit Admin #2', color: 'var(--accent-green)' },
        ].map(c => (
          <div key={c.name} className="card" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--bg-elevated)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Users size={15} style={{ color: c.color }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{c.role}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Agent report */}
      {report && (
        <div className="card-solid" style={{ overflow: 'hidden', padding: 0 }}>
          {/* Tab nav */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
            {([
              { id: 'content', label: 'Content', agentId: 'ofm-content-strategist' },
              { id: 'reddit', label: 'Reddit', agentId: 'ofm-reddit-scout' },
              { id: 'dms', label: 'DMs', agentId: 'ofm-fan-engagement' },
              { id: 'revenue', label: 'Revenue', agentId: 'ofm-revenue-analyst' },
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
                    borderBottom: activeTab === tab.id ? '2px solid var(--accent-red)' : '2px solid transparent',
                    color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {tab.label}
                  {agent?.status === 'error' && (
                    <span style={{ color: 'var(--accent-red)', fontSize: '10px' }}>ERR</span>
                  )}
                  {agent && (
                    <span style={{ fontSize: '10px', color: agent.status === 'ok' ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                      {(agent.durationMs / 1000).toFixed(1)}s
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div style={{ padding: '20px' }}>
            {activeTab === 'content' && (
              <ContentTab ideas={report.dailyPlan.contentIdeas} topPriority={report.dailyPlan.topPriority} />
            )}
            {activeTab === 'reddit' && <RedditTab posts={report.dailyPlan.redditPosts} />}
            {activeTab === 'dms' && <DMTab scripts={report.dailyPlan.dmScripts} />}
            {activeTab === 'revenue' && <RevenueTab projection={report.dailyPlan.revenueProjection} />}
          </div>
        </div>
      )}

      {/* No report yet */}
      {!report && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Bot size={36} style={{ color: 'var(--text-secondary)', margin: '0 auto 12px' }} />
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Uruchom agentow OFM
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            4 specjalistyczne AI analizuja: content, Reddit, fan engagement i revenue
          </div>
        </div>
      )}

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '14px', color: 'var(--accent-orange)', marginBottom: '8px', fontWeight: 600 }}>
            4 agenty analizuja Azul...
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Content Strategist · Reddit Scout · Fan Engagement · Revenue Analyst
          </div>
        </div>
      )}

      {/* All projects */}
      {projekty.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <div style={{
            fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase',
            letterSpacing: '0.08em', marginBottom: '10px', fontWeight: 600,
          }}>
            Wszystkie Projekty ({projekty.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {projekty.map((p, i) => (
              <div key={i} className="card" style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '12px 16px',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {p.modelka}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {p.przychod > 0 && (
                    <span style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: 600 }}>
                      ${p.przychod}/mies
                    </span>
                  )}
                  <span style={{
                    fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '5px',
                    background: statusBg[p.status] ?? 'var(--bg-elevated)',
                    color: statusColor[p.status] ?? 'var(--text-secondary)',
                    border: `1px solid ${statusColor[p.status] ?? 'var(--border)'}30`,
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

// ─── SUB-VIEWS ──────────────────────────────────────────────────────────────

function ContentTab({ ideas, topPriority }: { ideas: ContentIdea[]; topPriority: string }) {
  if (ideas.length === 0) return <RawFallback message="Content plan gotowy." />

  return (
    <div>
      {topPriority && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
          background: 'rgba(255, 149, 0, 0.08)',
          border: '1px solid rgba(255, 149, 0, 0.2)',
        }}>
          <div style={{ fontSize: '10px', color: 'var(--accent-orange)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
            TOP PRIORYTET DZIS
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>{topPriority}</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {ideas.map((idea, i) => (
          <div key={i} className="card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{
                padding: '2px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 700,
                background: idea.type === 'ppv' ? 'rgba(255,149,0,0.12)' : 'rgba(175,82,222,0.12)',
                color: idea.type === 'ppv' ? 'var(--accent-orange)' : 'var(--accent-purple)',
                textTransform: 'uppercase',
              }}>
                {idea.type}
              </span>
              {idea.bestTime && (
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{idea.bestTime}</span>
              )}
              {idea.estimatedRevenue && (
                <span style={{ fontSize: '11px', color: 'var(--accent-green)', marginLeft: 'auto', fontWeight: 600 }}>
                  ~{idea.estimatedRevenue}
                </span>
              )}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '6px' }}>
              {idea.concept}
            </div>
            {idea.caption && (
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                "{idea.caption}"
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function RedditTab({ posts }: { posts: RedditPost[] }) {
  if (posts.length === 0) return <RawFallback message="Strategia Reddit gotowa." />

  const trafficColor = { low: 'var(--text-secondary)', medium: 'var(--accent-orange)', high: 'var(--accent-green)' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {posts.map((post, i) => (
        <div key={i} className="card" style={{ borderLeft: '3px solid #FF4500', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#FF4500', fontWeight: 700 }}>r/{post.subreddit}</span>
            <span style={{
              fontSize: '10px', padding: '1px 6px', borderRadius: '4px',
              background: 'var(--bg-elevated)',
              color: trafficColor[post.expectedTraffic],
              fontWeight: 600,
            }}>
              {post.expectedTraffic} traffic
            </span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '6px' }}>
            {post.title}
          </div>
          {post.bodyHint && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{post.bodyHint}</div>
          )}
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
        <div key={i} className="card" style={{ borderLeft: '3px solid var(--accent-green)', padding: '14px' }}>
          <div style={{ fontSize: '10px', color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', fontWeight: 700 }}>
            SKRYPT DM #{i + 1}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6 }}>{script}</div>
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
          { label: 'Inwestycja', value: `$${projection.invested}`, sub: `${(projection.invested * PLN_RATE).toFixed(0)} PLN`, accent: 'var(--accent-red)' },
          { label: 'Obecny MRR', value: projection.currentMRR > 0 ? `$${projection.currentMRR}` : 'Pre-revenue', sub: projection.currentMRR > 0 ? `${(projection.currentMRR * PLN_RATE).toFixed(0)} PLN/mies` : 'Czekamy na subs', accent: 'var(--accent-green)' },
          { label: 'Break-even', value: `${projection.breakEvenMonths}m`, sub: `${projection.breakEvenMonths} miesiecy`, accent: 'var(--accent-orange)' },
          { label: 'Do Tajlandii', value: `${projection.monthsToThailand}m`, sub: `cel: ${THAILAND_TARGET.toLocaleString()} PLN`, accent: 'var(--accent-blue)' },
        ].map(m => (
          <div key={m.label} className="card" style={{ textAlign: 'center', padding: '14px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>{m.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: m.accent }}>{m.value}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{
        padding: '12px 16px', borderRadius: '10px',
        background: 'rgba(255, 149, 0, 0.08)',
        border: '1px solid rgba(255, 149, 0, 0.2)',
      }}>
        <div style={{ fontSize: '10px', color: 'var(--accent-orange)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px', fontWeight: 700 }}>
          NASTEPNY MILESTONE
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
          {projection.nextMilestone || 'Osiagnij $100 MRR — pierwszy zwrot z inwestycji'}
        </div>
      </div>
    </div>
  )
}

function RawFallback({ message }: { message: string }) {
  return (
    <div style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center' }}>
      {message}
    </div>
  )
}
