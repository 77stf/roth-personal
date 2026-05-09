---
title: "ROTH OS — Team Agentów"
type: meta
created: 2026-05-09
updated: 2026-05-10
tags: ["meta", "agents", "system"]
---

# ROTH OS — Team Agentów (Claude Code Subagents)

Każde zadanie ma swojego "pracownika". Używaj ich zamiast robić wszystko sam.

## Zespół budujący ROTH OS

| Rola | Agent | Kiedy używać |
|------|-------|-------------|
| **Architekt** | `code-architect` | Nowa funkcja — najpierw on projektuje pliki/interfejsy |
| **Backend Dev** | `backend-developer` | API routes, lib/*.ts, integracje zewnętrzne |
| **Frontend Dev** | `frontend-developer` | Dashboard pages, komponenty React |
| **UI Designer** | `ui-designer` | Design systemu, Tailwind, estetyka |
| **AI Engineer** | skill `claude-api` | Prompty, model selection, optymalizacja Claude |
| **Security** | `security-reviewer` | Po każdym endpoincie z auth/danymi |
| **QA TypeScript** | `typescript-reviewer` | Po każdej zmianie w lib/*.ts |
| **Build Fixer** | `build-error-resolver` | Gdy `tsc --noEmit` wyrzuca błędy |
| **Planner** | `planner` | Przed dużą funkcją — plan implementacji |
| **Docs** | `technical-writer` | README, komentarze API |

## Zasada użycia

```
Małe zmiany (< 50 linii) → Claude Code bezpośrednio
Duże funkcje → najpierw planner, potem code-architect, potem backend/frontend
Każdy endpoint → security-reviewer po napisaniu
Każda zmiana TS → typescript-reviewer (lub tsc --noEmit minimum)
AI prompty → claude-api skill
```

## Skille (slash commands)

| Skill | Kiedy |
|-------|-------|
| `/autoresearch [temat]` | Deep research przed implementacją |
| `/wiki` | Zarządzanie Obsidian vault |
| `/save` | Szybki zapis do wiki |
| `/canvas` | Wizualizacja architektury |
| `claude-api` | Optymalizacja integracji Claude |
| `gsd-*` | Duże projekty wielofazowe |

## Workflow implementacji nowej funkcji

1. `planner` → plan
2. `code-architect` → struktura plików
3. `backend-developer` → implementacja API
4. `frontend-developer` → UI
5. `security-reviewer` → audit
6. `typescript-reviewer` → jakość kodu

---

## Dodatkowi agenci (pełna lista)

| Agent | Specjalizacja |
|-------|---------------|
| `agent-organizer` | Multi-agent team design — OFM orchestrator |
| `architect` | System-level design, architectural decisions |
| `microservices-architect` | Distributed systems, service decomposition |
| `workflow-orchestrator` | Multi-step workflows z error handling |
| `performance-optimizer` | Slow routes, bundle size, memory |
| `DevOps Automator` | GitHub Actions, CI/CD, infrastruktura |
| `MCP Builder` | Tworzenie MCP servers dla Claude |
| `AI Engineer` | Anthropic SDK, model pipelines, tool_use |
| `e2e-runner` | Playwright end-to-end testy |
| `tdd-guide` | Test-Driven Development |
| `refactor-cleaner` | Dead code removal, depcheck, knip |
| `doc-updater` | CODEMAPS, README po zmianach |

## Zasada po każdej wiadomości

Claude Code **zawsze** podaje sekcję "Agenci do użycia teraz" z konkretnymi agentami pasującymi do aktualnego kontekstu. Uruchamiasz przez Claude Code UI (wpisz /nazwa-agenta) lub terminal.

## OFM Multi-Agent System (w budowie)

Osobny system od ROTH Life OS, ale połączony.
Patrz: [[02_Projects/OFM-Expert-System]]

Orchestrator → woła sub-agentów per kanał:
- Reddit Expert, Instagram Expert, Chatting Expert (priorytet)
- General Official, Twitter, Model Recruitment
- AI, OFTV, YouTube, TikTok, Threads, Fetlife, GG's

Token logging → AGENT_USAGE sheet → dashboard /analytics

## Video Processing Pipeline

claude-video (github.com/bradautomates/claude-video) → przetwarza wideo Hadiego → Obsidian.
Patrz: [[02_Projects/Video-Processing-Pipeline]]
