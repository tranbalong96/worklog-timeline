# Phase 6 Prompt - AI Task Generator

Read CLAUDE.md and .claude/*.

Implement Phase 6 from .claude/phase-plan.md.

Scope:
- Implement AI Task Generator.
- Create Vercel serverless function api/generate-task.ts.
- Create src/services/aiClient.ts.
- Support providers:
  - Gemini
  - OpenAI-compatible
  - LM Studio
  - Ollama
  - Disabled
- Show editable generated preview.
- Add generated task to Timeline only when user clicks Add to Timeline.
- Do not auto-log hours.
- Handle loading, error, and invalid JSON states.
- Do not log API keys.

Important:
- Gemini and OpenAI-compatible cloud providers should work on Vercel.
- Ollama and LM Studio localhost providers mainly work when the app runs locally.
- Show a warning for localhost providers when deployed.

After implementation:
- Run npm run build.
- Fix errors.
- Summarize changed files.
