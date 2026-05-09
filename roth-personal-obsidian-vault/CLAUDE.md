# ROTH Personal Wiki: LLM Second Brain

Mode: D (Personal Second Brain) + C (Business Ventures)
Purpose: Compounding knowledge base for Roth's life, goals, and business ventures.
Owner: Roth
Created: 2026-05-08

## Structure

```
vault/
├── .raw/           # immutable sources — never modify
├── wiki/
│   ├── index.md        # master catalog
│   ├── log.md          # append-only operation log
│   ├── hot.md          # ~500-word recent context cache
│   ├── overview.md     # executive summary
│   ├── goals/          # personal + business goals with progress
│   ├── learning/       # skills being mastered
│   ├── areas/          # life areas: finances, health, mindset, travel
│   ├── resources/      # books, tools, courses, references
│   ├── ventures/       # OFM business, AI consulting
│   ├── concepts/       # frameworks, mental models, ideas
│   ├── entities/       # people, platforms, tools
│   ├── questions/      # filed answers to queries
│   └── meta/           # dashboards, lint reports
└── _templates/         # Obsidian note templates
```

## Conventions

- All notes use YAML frontmatter: type, status, created, updated, tags
- Wikilinks use [[Note Name]] format
- .raw/ contains source documents — never modify them
- wiki/index.md is the master catalog — update on every ingest
- wiki/log.md is append-only — new entries go at the TOP
- wiki/hot.md is overwritten each session

## Operations

- Ingest: drop source in .raw/, say "ingest [filename]"
- Query: ask any question — Claude reads index first
- Lint: say "lint the wiki" to run a health check
- Save: say "save this" to file a conversation insight
