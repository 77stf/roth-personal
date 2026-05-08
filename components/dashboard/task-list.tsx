'use client'

import { useState } from 'react'
import { TaskColorChip } from './energy-badge'
import type { Task, TaskColor } from '@/lib/types'

interface TaskListProps {
  tasks: Task[]
  onToggle?: (id: string, done: boolean) => void
  showColor?: boolean
  compact?: boolean
}

export function TaskList({ tasks, onToggle, showColor = true, compact = false }: TaskListProps) {
  const [localTasks, setLocalTasks] = useState(tasks)

  const handleToggle = (id: string) => {
    setLocalTasks(prev =>
      prev.map(t => t.id === id ? { ...t, done: !t.done } : t)
    )
    const task = localTasks.find(t => t.id === id)
    if (task) onToggle?.(id, !task.done)
  }

  if (localTasks.length === 0) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '13px',
      }}>
        Brak zadań
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '4px' : '8px' }}>
      {localTasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={handleToggle}
          showColor={showColor}
          compact={compact}
        />
      ))}
    </div>
  )
}

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  showColor: boolean
  compact: boolean
}

const TASK_LEFT_BORDER: Record<TaskColor, string> = {
  RED: '#ff3366',
  YELLOW: '#ffd166',
  GREEN: '#06d6a0',
}

function TaskItem({ task, onToggle, showColor, compact }: TaskItemProps) {
  const borderColor = TASK_LEFT_BORDER[task.color]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: compact ? '8px 10px' : '12px',
        borderRadius: '8px',
        background: task.done ? 'transparent' : 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${task.done ? 'var(--border)' : borderColor}`,
        opacity: task.done ? 0.5 : 1,
        transition: 'all 0.15s',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
      onClick={() => onToggle(task.id)}
    >
      {/* Checkbox */}
      <div style={{
        width: '18px',
        height: '18px',
        borderRadius: '5px',
        border: `2px solid ${task.done ? 'var(--accent-green)' : 'var(--border)'}`,
        background: task.done ? 'var(--accent-green)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: '1px',
        transition: 'all 0.15s',
      }}>
        {task.done && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: compact ? '13px' : '14px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          textDecoration: task.done ? 'line-through' : 'none',
          marginBottom: showColor ? '4px' : 0,
          lineHeight: 1.4,
        }}>
          {task.title}
        </div>

        {showColor && !compact && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <TaskColorChip color={task.color} />
            {task.dueTime && (
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {task.dueTime}
              </span>
            )}
            {task.category && (
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {task.category}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
