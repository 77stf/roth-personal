---
title: "ROTH OS — Team Agentów"
type: meta
created: 2026-05-09
updated: 2026-05-09
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
