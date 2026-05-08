'use client'

import type { EnergyZone, TaskColor } from '@/lib/types'

interface EnergyBadgeProps {
  zone: EnergyZone
  level: string
  compact?: boolean
}

const ZONE_COLORS: Record<EnergyZone, string> = {
  ROZRUCH: '#06d6a0',
  WZROST: '#ffd166',
  SZCZYT: '#ff3366',
  WIECZOR: '#ff8c42',
  ZWALNIANIE: '#4cc9f0',
}

const ZONE_LABELS: Record<EnergyZone, string> = {
  ROZRUCH: 'Rozruch',
  WZROST: 'Wzrost',
  SZCZYT: 'Szczyt',
  WIECZOR: 'Wieczór',
  ZWALNIANIE: 'Zwalnianie',
}

export function EnergyBadge({ zone, level, compact = false }: EnergyBadgeProps) {
  const color = ZONE_COLORS[zone]

  if (compact) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 600,
        background: `${color}20`,
        color,
        border: `1px solid ${color}40`,
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }} />
        {ZONE_LABELS[zone]}
      </span>
    )
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 14px',
      borderRadius: '10px',
      background: `${color}15`,
      border: `1px solid ${color}30`,
    }}>
      <div style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 8px ${color}80`,
        animation: zone === 'SZCZYT' ? 'pulseSoft 2s ease-in-out infinite' : undefined,
      }} />
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color }}>
          Strefa {ZONE_LABELS[zone]}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          Energia: {level}
        </div>
      </div>
    </div>
  )
}

// ─── Task Color Chip ──────────────────────────────────────────────────────
interface TaskColorChipProps {
  color: TaskColor
  label?: string
}

const TASK_COLOR_MAP: Record<TaskColor, { bg: string; text: string; border: string; label: string }> = {
  RED: {
    bg: 'rgba(255, 51, 102, 0.15)',
    text: '#ff3366',
    border: 'rgba(255, 51, 102, 0.3)',
    label: 'CZERWONE',
  },
  YELLOW: {
    bg: 'rgba(255, 209, 102, 0.15)',
    text: '#ffd166',
    border: 'rgba(255, 209, 102, 0.3)',
    label: 'ŻÓŁTE',
  },
  GREEN: {
    bg: 'rgba(6, 214, 160, 0.15)',
    text: '#06d6a0',
    border: 'rgba(6, 214, 160, 0.3)',
    label: 'ZIELONE',
  },
}

export function TaskColorChip({ color, label }: TaskColorChipProps) {
  const c = TASK_COLOR_MAP[color]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      borderRadius: '999px',
      fontSize: '11px',
      fontWeight: 700,
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    }}>
      {label ?? c.label}
    </span>
  )
}
