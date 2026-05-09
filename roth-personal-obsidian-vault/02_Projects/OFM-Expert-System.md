# OFM Expert Multi-Agent System — Plan

> Status: PLANOWANIE | Priorytet: WYSOKI
> Powiązane: [[ROTH Life OS]], [[AI Consulting Pipeline]]

---

## Cel

Osobny multi-agent system OFM połączony z ROTH Life OS — korzysta z wiedzy Dr. Hadiego podzielonej na kanały. Jeden master orchestrator, sub-agenty eksperci od każdego kanału. Ultra-expert guidance dla Azul + możliwość skalowania na klientów Autorise.

---

## Architektura

```
Obsidian Vault (Hadi Knowledge Base)
├── wiki/ofm/reddit/          ← KOMPLETNY
├── wiki/ofm/instagram/       ← KOMPLETNY  
├── wiki/ofm/model-recruitment/
├── wiki/ofm/twitter/
├── wiki/ofm/chatting/
├── wiki/ofm/general-official/
├── wiki/ofm/ai/
├── wiki/ofm/oftv/
├── wiki/ofm/youtube/
├── wiki/ofm/tiktok/
├── wiki/ofm/threads/
├── wiki/ofm/fetlife/
├── wiki/ofm/ggs/

OFM Orchestrator (Master Agent)
├── Przyjmuje pytanie
├── Analizuje jakiego kanału dotyczy
├── Wywołuje 1-3 sub-agentów ekspertów równolegle (tool_use)
├── Syntetyzuje odpowiedź
└── Loguje tokeny do SHEETS (AGENT_USAGE)

Sub-Agenci Eksperci (jeden per kanał):
├── Reddit Expert Agent
├── Instagram Expert Agent
├── Recruitment Expert Agent
├── Twitter Expert Agent
├── Chatting Expert Agent
├── General OFM Expert Agent
├── AI Tools Expert Agent
├── OFTV Expert Agent
├── YouTube Expert Agent
├── TikTok Expert Agent
├── Threads Expert Agent
├── Fetlife Expert Agent
└── GG's Expert Agent

ROTH Life OS Integration:
└── /ofm komenda w Telegram → OFM Orchestrator
```

---

## Status Kanałów Wiedzy

| Kanał | Status | Wiedza w Obsidianie | Priorytet |
|-------|--------|---------------------|-----------|
| Reddit | ✅ Kompletny | Tak | - |
| Instagram | ✅ Kompletny | Tak | - |
| Model Recruitment | ⏳ W trakcie | Nie | 🔴 WYSOKI |
| Twitter | ⏳ W trakcie | Nie | 🔴 WYSOKI |
| Chatting | ⏳ W trakcie | Nie | 🔴 WYSOKI |
| General Official | ⏳ W trakcie | Nie | 🔴 WYSOKI |
| AI | ⏳ W trakcie | Nie | 🟡 ŚREDNI |
| OFTV | ⏳ W trakcie | Nie | 🟡 ŚREDNI |
| YouTube | ⏳ W trakcie | Nie | 🟡 ŚREDNI |
| TikTok | ⏳ W trakcie | Nie | 🟡 ŚREDNI |
| Threads | ⏳ W trakcie | Nie | 🟢 NISKI |
| Fetlife | ⏳ W trakcie | Nie | 🟢 NISKI |
| GG's | ⏳ W trakcie | Nie | 🟢 NISKI |

---

## Plan Budowy (kolejność)

### FAZA 0 — Uzupełnij wiedzę (TERAZ, ty robisz)
Kiedy skończysz kanał u Hadiego → wyślij mi: **"Kanał [nazwa] skończony, oto notatki: [...]"**
Ja automatycznie:
- Przetworzę na wiki/ofm/[kanał]/
- Zaktualizuję sub-agenta
- Oznaczę jako kompletny

### FAZA 1 — Core System (po uzupełnieniu 3+ kanałów)
- [ ] `lib/ofm-knowledge.ts` — reader dla Obsidian wiki/ofm/
- [ ] `lib/ofm-agents.ts` — refactor: jeden agent per kanał jako osobna klasa
- [ ] `lib/ofm-orchestrator.ts` — master orchestrator z tool_use
- [ ] `app/api/agents/ofm/route.ts` — upgrade z token logging
- [ ] Google Sheets: arkusz `AGENT_USAGE` (timestamp, agent, tokens_in, tokens_out, cost_usd)

### FAZA 2 — Token Dashboard
- [ ] Arkusz `AGENT_USAGE` w Sheets
- [ ] API `/api/analytics/agents` — agregacja kosztów
- [ ] Dashboard page `/analytics` — wykresy per agent, per dzień, total cost
- [ ] Alert przez Telegram gdy przekroczy X USD/dzień

### FAZA 3 — Klient-Ready (Autorise)
- [ ] Multi-tenant: każdy klient ma osobne `AGENT_USAGE`, osobny model (jak Azul)
- [ ] Billing tracking: koszt per klient
- [ ] WAŻNE: Przed startem tej fazy → wyślij mi pełny blueprint Autorise + twój profil w firmie
- [ ] White-label prompty agentów pod branding klienta

### FAZA 4 — Autorise Automation Agent
- [ ] Agent analizuje workflow OFM
- [ ] Identyfikuje co można zautomatyzować
- [ ] Tworzy Make.com scenariusze automatycznie
- [ ] Raport: "Te 3 procesy zajmują ci X godz/tydzień → możemy to zautomatyzować"

---

## Token Tracking — Architektura

```typescript
// Każde wywołanie agenta loguje:
interface AgentUsage {
  timestamp: string
  agent: 'reddit' | 'instagram' | 'chatting' | ... | 'orchestrator'
  client: string           // 'roth' | 'azul' | klient_id
  tokensIn: number
  tokensOut: number
  costUsd: number          // tokensIn * 0.000003 + tokensOut * 0.000015 (Sonnet)
  query: string            // pierwsze 100 znaków zapytania
}

// Arkusz AGENT_USAGE w Google Sheets
// Dashboard na /analytics pokazuje:
// - Top 3 najdroższe agenty
// - Koszt tygodniowy/miesięczny
// - Gdzie warto zoptymalizować (np. cache)
```

---

## Make.com Sleep Brief — DO DODANIA

Trzecia scena której nie udało się dodać:
- URL: `https://roth-personal.vercel.app/api/briefings/sleep`
- Method: POST
- Header: `Authorization: Bearer roth-cron-2026-secure`
- Schedule: 23:00 codziennie

Blueprint gotowy: `make-blueprints/sleep-brief.json`

---

## Pytania do rozstrzygnięcia przed budową

1. Czy OFM system ma być osobnym repo, czy częścią ROTH Personal?
   → Rekomendacja: **osobna aplikacja** (czysty kontekst, osobne deployment, łatwiej skalować na klientów)

2. Czy sub-agenci mają mieć dostęp do real-time danych (Reddit scraping, IG stats) czy tylko statyczną wiedzę Hadiego?
   → Na start: statyczna wiedza Hadiego + Azul stats z Sheets

3. Model dla sub-agentów: Haiku (tani, szybki) czy Sonnet (dokładny)?
   → Rekomendacja: Haiku dla kanałowych sub-agentów, Sonnet dla orchestratora

---

## Notatka — Zasada Pracy

Zawsze po wiadomości zobaczysz sekcję "Agenci do użycia teraz" — konkretne subagenty Claude Code które pomogą w aktualnym zadaniu. Używaj ich przez terminal jako:
```bash
claude /agent-name "zapytanie"
# lub w Claude Code przez UI
```
