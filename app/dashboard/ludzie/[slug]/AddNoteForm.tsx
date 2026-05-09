'use client'

import { useState } from 'react'
import { Plus, Send, CheckCircle2, AlertCircle, X } from 'lucide-react'

interface AddNoteFormProps {
  personName: string
  notePath: string
}

export function AddNoteForm({ personName, notePath }: AddNoteFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [text, setText] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit() {
    if (!text.trim() || status === 'loading') return
    setStatus('loading')

    const date = new Date().toLocaleDateString('pl-PL', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
    const noteContent = `\n\n## Notatka — ${date}\n${text.trim()}`

    try {
      const res = await fetch('/api/obsidian', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: notePath, content: noteContent }),
      })

      if (res.ok) {
        setStatus('success')
        setText('')
        setTimeout(() => {
          setStatus('idle')
          setIsOpen(false)
        }, 2200)
      } else {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 3000)
      }
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '9px 14px',
          background: 'rgba(139,92,246,0.08)',
          border: '1px solid rgba(139,92,246,0.22)',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          color: '#8B5CF6',
          fontFamily: 'inherit',
          transition: 'all 0.15s',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <Plus size={15} />
        Dodaj notatkę do Obsidian
      </button>
    )
  }

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1.5px solid rgba(139,92,246,0.3)',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#8B5CF6', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', background: 'rgba(139,92,246,0.1)', padding: '2px 7px', borderRadius: '5px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Obsidian
          </span>
          {personName}
        </div>
        <button
          onClick={() => { setIsOpen(false); setText(''); setStatus('idle') }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6E6E73', padding: '2px' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={`Notatka o ${personName}...`}
        rows={4}
        style={{
          width: '100%',
          padding: '10px 12px',
          background: '#F5F5F7',
          border: '1px solid #D2D2D7',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#1D1D1F',
          resize: 'vertical' as const,
          fontFamily: 'inherit',
          lineHeight: 1.6,
          outline: 'none',
          boxSizing: 'border-box' as const,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = '#8B5CF6' }}
        onBlur={e => { e.currentTarget.style.borderColor = '#D2D2D7' }}
        disabled={status === 'loading' || status === 'success'}
        autoFocus
      />

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
        <div style={{ fontSize: '11px', color: '#AEAEB2' }}>
          {notePath}
        </div>

        {status === 'success' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#34C759', fontSize: '12px', fontWeight: 600 }}>
            <CheckCircle2 size={15} />
            Zapisano
          </div>
        ) : status === 'error' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#FF3B30', fontSize: '12px', fontWeight: 600 }}>
            <AlertCircle size={15} />
            Błąd — Obsidian offline?
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || status === 'loading'}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px',
              background: text.trim() ? '#8B5CF6' : '#D2D2D7',
              border: 'none', borderRadius: '8px',
              cursor: text.trim() ? 'pointer' : 'not-allowed',
              fontSize: '12px', fontWeight: 700, color: '#fff',
              fontFamily: 'inherit', transition: 'all 0.15s',
              opacity: status === 'loading' ? 0.7 : 1,
            }}
          >
            <Send size={13} />
            {status === 'loading' ? 'Zapisuję...' : 'Zapisz'}
          </button>
        )}
      </div>
    </div>
  )
}
