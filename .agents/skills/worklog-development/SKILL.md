# Worklog Development Skill

Use this skill when implementing or modifying the Worklog Timeline app.

## Purpose

Keep implementation consistent, local-first, typed, and safe for Vercel deployment.

## Always Read

Before coding, read:
- `AGENTS.md`
- `.Codex/project.md`
- `.Codex/rules.md`
- `.Codex/workflow.md`
- `.Codex/architecture.md`
- `.Codex/phase-plan.md`

## Core Constraints

- React + TypeScript + Vite.
- Tailwind CSS for UI.
- localStorage is the main storage.
- JSON import/export is the backup mechanism.
- No Google Sheets sync.
- No login.
- No database.
- AI provider is configurable.
- Do not auto-add AI generated tasks without user confirmation.
- Do not let Daily Report mutate Timeline data.

## Implementation Pattern

Use this separation:
- Types in `src/types`.
- Pages in `src/pages`.
- Reusable UI in `src/components`.
- Pure business logic in `src/helpers`.
- Side effects and persistence in `src/services`.
- Vercel serverless API in `api/`.

## Validation

After changes:
- Run `npm run build`.
- Fix errors.
- Summarize implementation and changed files.
