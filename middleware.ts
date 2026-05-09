// ROTH Personal OS — Middleware auth (passcode)
// System dla jednej osoby — prosty passcode w cookie

import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  '/login',
  '/api/auth',              // Auth endpoints — dostępne bez sesji
  '/api/telegram/webhook',  // Telegram webhook — publiczny (weryfikowany przez secret token)
  '/api/briefings',         // Cron briefings — chronione CRON_SECRET
  '/api/system',            // System setup — chronione CRON_SECRET
  '/api/agents',            // Agent endpoints — chronione CRON_SECRET
  '/_next',
  '/icons',
  '/manifest.json',
  '/sw.js',
  '/favicon.ico',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Pomiń publiczne ścieżki
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Sprawdź czy zalogowany
  const sessionCookie = req.cookies.get('roth-session')

  if (!sessionCookie?.value) {
    // Przekieruj do logowania
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Prosta weryfikacja — porównaj hash cookie
  const expectedSession = process.env['ROTH_SESSION_SECRET']
  if (sessionCookie.value !== expectedSession) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
