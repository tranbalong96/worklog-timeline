# Worklog Timeline App - AI Working Rules

## Product Summary

We are building a personal Worklog Timeline app for developers.

The app helps a developer:
- Track tasks by week.
- Log working hours per task per day.
- Generate daily reports quickly.
- Use AI to convert messy developer notes into clean Jira-style tasks.
- Store all data locally in the browser.
- Export and import JSON backup files.
- Deploy easily to Vercel.

## Core Product Decisions

- Do not use Google Sheets sync.
- Do not require login.
- Do not require a database.
- Data must be local-first.
- Use localStorage as the main storage for the web version.
- Support JSON import/export for backup and restore.
- AI provider must be configurable.
- The app must remain deployable to Vercel.
- Local LLM providers such as Ollama and LM Studio are supported mainly for local development.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- lucide-react
- Vercel Serverless Function for AI generation

## Required Folder Structure

Use this structure as much as possible:

```text
src/
  components/
  pages/
  types/
  services/
  helpers/
  data/
api/
.claude/
```

## Important Rules

1. Do not over-engineer.
2. Do not add unnecessary libraries.
3. Do not rewrite the entire app unless explicitly asked.
4. Keep `App.tsx` simple.
5. Put business logic in helpers or services.
6. Keep UI components readable and focused.
7. Make all data structures strongly typed.
8. Do not break localStorage persistence.
9. Do not let Daily Report selection mutate Timeline data.
10. Do not automatically add AI generated tasks to Timeline without user confirmation.
11. Always make sure `npm run build` passes after each phase.
12. If a requirement is unclear, make the safest minimal implementation and explain the assumption.

## Before Editing Code

Before making changes:
- Read this file.
- Read `.claude/project.md`.
- Read `.claude/rules.md`.
- Read `.claude/workflow.md`.
- Read `.claude/architecture.md`.
- Check the current phase in `.claude/phase-plan.md`.

## After Editing Code

After making changes:
- Run `npm run build`.
- Fix TypeScript and build errors.
- Summarize changed files.
- Summarize what was implemented.
- Mention any known limitation.
