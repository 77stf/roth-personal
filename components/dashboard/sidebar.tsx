'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavItem {
  href: string
  label: string
  icon: string
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dzisiaj', icon: '⚡' },
  { href: '/dashboard/szkola', label: 'Szkoła', icon: '📚' },
  { href: '/dashboard/ofm', label: 'OFM', icon: '💰' },
  { href: '/dashboard/ai-consulting', label: 'AI Consulting', icon: '🤖' },
  { href: '/dashboard/sport', label: 'Sport', icon: '💪' },
  { href: '/dashboard/dom', label: 'Dom', icon: '🏠' },
  { href: '/dashboard/finanse', label: 'Finanse', icon: '💳' },
  { href: '/dashboard/ludzie', label: 'Ludzie', icon: '👥' },
  { href: '/dashboard/idea-lab', label: 'Idea Lab', icon: '💡' },
  { href: '/dashboard/tajlandia', label: 'Tajlandia 🌴', icon: '🎯' },
  { href: '/dashboard/ustawienia', label: 'Ustawienia', icon: '⚙️' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      style={{
        width: collapsed ? '64px' : '240px',
        transition: 'width 0.2s ease',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div style={{
        padding: collapsed ? '16px 12px' : '20px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: '8px',
      }}>
        {!collapsed && (
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-red)', letterSpacing: '-0.5px' }}>
              ROTH
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Personal OS
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            fontSize: '16px',
            lineHeight: 1,
          }}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ padding: '8px', flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: collapsed ? '10px' : '10px 12px',
                borderRadius: '8px',
                marginBottom: '2px',
                textDecoration: 'none',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--bg-elevated)' : 'transparent',
                transition: 'background 0.15s, color 0.15s',
                justifyContent: collapsed ? 'center' : 'flex-start',
                position: 'relative',
              }}
              title={collapsed ? item.label : undefined}
            >
              <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && (
                <span style={{
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: 'nowrap',
                }}>
                  {item.label}
                </span>
              )}
              {isActive && !collapsed && (
                <div style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: 'var(--accent-red)',
                  marginLeft: 'auto',
                  flexShrink: 0,
                }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Tajlandia Progress (tylko expanded) */}
      {!collapsed && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Droga do Tajlandii
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: '20%' }}
            />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Milestone 1/5</span>
            <span>20%</span>
          </div>
        </div>
      )}
    </aside>
  )
}

// ─── Mobile Bottom Nav ───────────────────────────────────────────────────
const MOBILE_NAV = NAV_ITEMS.slice(0, 5)

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 50,
    }}>
      {MOBILE_NAV.map(item => {
        const isActive = item.href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '10px 4px',
              textDecoration: 'none',
              color: isActive ? 'var(--accent-red)' : 'var(--text-secondary)',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '20px', lineHeight: 1 }}>{item.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 400 }}>
              {item.label.split(' ')[0]}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
