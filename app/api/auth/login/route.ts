// ROTH Personal OS — Auth login
// POST /api/auth/login

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json() as { passcode: string }

  const expectedPasscode = process.env['ROTH_PASSCODE']
  const sessionSecret = process.env['ROTH_SESSION_SECRET']

  if (!expectedPasscode || !sessionSecret) {
    return NextResponse.json({ error: 'System nie skonfigurowany' }, { status: 500 })
  }

  if (body.passcode !== expectedPasscode) {
    return NextResponse.json({ error: 'Nieprawidłowy passcode' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })

  // Ustaw cookie sesji (30 dni)
  response.cookies.set('roth-session', sessionSecret, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  })

  return response
}
