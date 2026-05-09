export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { getProjektyOFM } from '@/lib/sheets'
import OFMClient from './OFMClient'

async function OFMContent() {
  const projekty = await getProjektyOFM()
  const azul = projekty.find(p => p.modelka?.toLowerCase().includes('azul')) ?? null

  return <OFMClient azul={azul} projekty={projekty} />
}

export default function OFMPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '40px 24px', color: 'rgba(255,255,255,0.4)' }}>
        Ładowanie systemu OFM...
      </div>
    }>
      <OFMContent />
    </Suspense>
  )
}
