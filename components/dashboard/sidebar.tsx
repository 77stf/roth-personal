'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Bot,
  Dumbbell,
  Home,
  CreditCard,
  Users,
  Lightbulb,
  Plane,
  Settings,
  Terminal,
  Rocket,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',              label: 'Dzisiaj',     icon: LayoutDashboard },
  { href: '/dashboard/szkola',       label: 'Szkoła',      icon: BookOpen },
  { href: '/dashboard/ofm',         label: 'OFM',         icon: TrendingUp, badge: 'Azul' },
  { href: '/dashboard/ai-consulting',label: 'AI Consulting', icon: Bot },
  { href: '/dashboard/sport',        label: 'Sport',       icon: Dumbbell },
  { href: '/dashboard/dom',          label: 'Dom',         icon: Home },
  { href: '/dashboard/finanse',      label: 'Finanse',     icon: CreditCard },
  { href: '/dashboard/ludzie',       label: 'Ludzie',      icon: Users },
  { href: '/dashboard/idea-lab',     label: 'Idea Lab',    icon: Lightbulb },
  { href: '/dashboard/tajlandia',    label: 'Tajlandia',   icon: Plane },
  { href: '/dashboard/ustawienia',   label: 'Ustawienia',  icon: Settings },
  { href: '/dashboard/system',       label: 'System',      icon: Terminal },
  { href: '/dashboard/deploy',       label: 'Deploy',      icon: Rocket },
]

const DIVIDER_BEFORE = new Set(['/dashboard/ustawienia'])

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside style={{
      width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
      transition: 'width 0.2s ease',
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      position: 'sticky',
      top: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      flexShrink: 0,
    }}>
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
            <div style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--accent-red)',
              letterSpacing: '-0.5px',
            }}>
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
            padding: '6px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {collapsed
            ? <ChevronRight size={16} />
            : <ChevronLeft size={16} />
          }
        </button>
      </div>

      {/* Nav */}
      <nav style={{ padding: '8px', flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <div key={item.href}>
              {DIVIDER_BEFORE.has(item.href) && (
                <div style={{
                  borderTop: '1px solid var(--border)',
                  margin: '4px 0',
                }} />
              )}
              <Link
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: collapsed ? '10px' : '9px 12px',
                  borderRadius: '8px',
                  marginBottom: '2px',
                  textDecoration: 'none',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(255, 59, 48, 0.08)' : 'transparent',
                  transition: 'background 0.15s, color 0.15s',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  size={18}
                  style={{
                    flexShrink: 0,
                    color: isActive ? 'var(--accent-red)' : 'currentColor',
                    strokeWidth: isActive ? 2.5 : 1.75,
                  }}
                />
                {!collapsed && (
                  <>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: isActive ? 600 : 400,
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: 'rgba(255, 59, 48, 0.1)',
                        color: 'var(--accent-red)',
                        letterSpacing: '0.02em',
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            </div>
          )
        })}
      </nav>

      {/* Thailand progress */}
      {!collapsed && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            marginBottom: '6px',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <span>Tajlandia</span>
            <span>20%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '20%' }} />
          </div>
        </div>
      )}
    </aside>
  )
}

// ─── Mobile Bottom Nav ──────────────────────────────────────────────────────
const MOBILE_NAV = NAV_ITEMS.slice(0, 5)

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 50,
    }}>
      {MOBILE_NAV.map(item => {
        const isActive = item.href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname.startsWith(item.href)
        const Icon = item.icon

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
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
            <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 400 }}>
              {item.label.split(' ')[0]}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
