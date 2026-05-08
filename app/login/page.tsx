'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!passcode || loading) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      })

      if (res.ok) {
        window.location.href = redirect
      } else {
        setError('Nieprawidłowy passcode')
      }
    } catch {
      setError('Błąd połączenia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input
        type="password"
        value={passcode}
        onChange={e => setPasscode(e.target.value)}
        placeholder="Passcode"
        autoFocus
        style={{
          width: '100%',
          padding: '14px 16px',
          background: 'var(--bg-elevated)',
          border: `1px solid ${error ? 'var(--accent-red)' : 'var(--border)'}`,
          borderRadius: '10px',
          color: 'var(--text-primary)',
          fontSize: '16px',
          textAlign: 'center',
          letterSpacing: '6px',
          outline: 'none',
        }}
        maxLength={32}
      />

      {error && (
        <div style={{ fontSize: '13px', color: 'var(--accent-red)', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!passcode || loading}
        className="btn-primary"
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '15px',
          opacity: !passcode || loading ? 0.5 : 1,
          cursor: !passcode || loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '...' : 'Wejdź'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg-base)',
    }}>
      <div style={{ width: '100%', maxWidth: '320px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontSize: '40px',
            fontWeight: 900,
            color: 'var(--accent-red)',
            letterSpacing: '-2px',
            marginBottom: '8px',
          }}>
            ROTH
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Personal Operating System
          </div>
        </div>

        <Suspense fallback={<div style={{ color: 'var(--text-secondary)' }}>Ładowanie...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
