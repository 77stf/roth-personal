import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  trend?: string
  icon: ReactNode
  variant?: 'default' | 'danger' | 'success' | 'warning'
  unit?: string
}

const variantStyles: Record<NonNullable<StatCardProps['variant']>, { accent: string; bg: string }> = {
  default: { accent: '#007AFF', bg: 'rgba(0, 122, 255, 0.08)' },
  danger:  { accent: '#FF3B30', bg: 'rgba(255, 59, 48, 0.08)' },
  success: { accent: '#34C759', bg: 'rgba(52, 199, 89, 0.08)' },
  warning: { accent: '#FF9500', bg: 'rgba(255, 149, 0, 0.08)' },
}

export function StatCard({ label, value, trend, icon, variant = 'default', unit }: StatCardProps) {
  const { accent, bg } = variantStyles[variant]

  return (
    <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {label}
        </span>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accent,
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{
          fontSize: '28px',
          fontWeight: 700,
          color: variant === 'danger' ? accent : 'var(--text-primary)',
          lineHeight: 1,
        }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 400 }}>
            {unit}
          </span>
        )}
      </div>

      {trend && (
        <span style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
        }}>
          {trend}
        </span>
      )}
    </div>
  )
}
