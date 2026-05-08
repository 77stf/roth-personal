// ROTH Personal OS — Idea Lab API
// POST /api/idea-lab — ocen pomysł przez 5 person

import { NextRequest, NextResponse } from 'next/server'
import { evaluateIdea } from '@/lib/claude'
import { saveIdeaLabResult } from '@/lib/obsidian'
import { z } from 'zod'

const RequestSchema = z.object({
  pomysl: z.string().min(10).max(2000),
  kontekst: z.string().max(2000).optional().default(''),
  saveToObsidian: z.boolean().optional().default(true),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pomysl, kontekst, saveToObsidian } = RequestSchema.parse(body)

    const ocena = await evaluateIdea(pomysl, kontekst)

    // Zapisz do Obsidian jeśli możliwe
    if (saveToObsidian) {
      const content = formatIdeaForObsidian(pomysl, ocena)
      ocena.zapisanoDoObsidian = await saveIdeaLabResult(pomysl, content)
    }

    return NextResponse.json({ success: true, data: ocena })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    const msg = error instanceof Error ? error.message : 'Błąd'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

function formatIdeaForObsidian(pomysl: string, ocena: Awaited<ReturnType<typeof evaluateIdea>>): string {
  const date = new Date().toISOString().split('T')[0]!
  return `---
created: ${date}
werdykt: ${ocena.werdykt}
tags: [idea-lab]
---

# ${pomysl}

## Werdykt: ${ocena.werdykt}

${ocena.uzasadnienie}

## Oceny Per Persona

${ocena.persony.map(p => `### ${p.persona}
${p.ocena}

**Plusy:**
${p.plusy.map(x => `- ${x}`).join('\n')}

**Minusy:**
${p.minusy.map(x => `- ${x}`).join('\n')}

**Rekomendacja:** ${p.rekomendacja}`).join('\n\n')}

## Następne Kroki

${ocena.nastepneKroki.map(k => `- [ ] ${k}`).join('\n')}
`
}
