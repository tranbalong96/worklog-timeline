# Codex Usage Guide

Use this file when working with Codex or another code generation agent.

## Start Session Prompt

```text
Please read CLAUDE.md and all files inside .claude first.

Then continue the project according to .claude/phase-plan.md.

Important:
- Work only on the current phase I request.
- Do not implement future phases early.
- Do not add unnecessary libraries.
- Keep App.tsx simple.
- Keep business logic in helpers/services.
- Run npm run build after changes.
- Fix all build errors.
- Summarize changed files only, do not paste full files unless I ask.
```

## Build Fix Prompt

```text
Fix the build errors only.
Do not refactor unrelated code.
Do not implement new features.
Run npm run build again after the fix.
Summarize changed files.
```

## Safe Refactor Prompt

```text
Refactor only the files related to the current phase.
Keep behavior unchanged.
Do not change the data model unless required.
Run npm run build after changes.
```
