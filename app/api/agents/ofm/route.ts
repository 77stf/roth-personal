import { NextResponse } from 'next/server'
import { runOFMOrchestrator } from '@/lib/ofm-agents'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST() {
  try {
    const report = await runOFMOrchestrator()
    return NextResponse.json(report)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'OFM Agent System online. POST to run.' })
}
