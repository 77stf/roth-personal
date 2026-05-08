// ROTH Personal OS — System Health Check API
// GET /api/system/health

import { NextResponse } from 'next/server'
import { runHealthCheck } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const report = await runHealthCheck()
    const status = report.overall === 'error' ? 503 : 200
    return NextResponse.json(report, { status })
  } catch (e) {
    return NextResponse.json(
      { overall: 'error', error: String(e), timestamp: new Date().toISOString() },
      { status: 500 },
    )
  }
}
