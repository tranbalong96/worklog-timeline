# Worklog Timeline AI Rules Pack

This zip contains a reusable AI workflow pack for building the Worklog Timeline app with Claude Code, Codex, or another coding agent.

## What is included

```text
CLAUDE.md
.claude/
  project.md
  rules.md
  workflow.md
  architecture.md
  phase-plan.md
  commit-rules.md
  codex.md
  prompts/
  skills/
```

## How to use

1. Create your React project.
2. Copy `CLAUDE.md` and `.claude/` into the project root.
3. Open the project in Claude Code or Codex.
4. Start with this prompt:

```text
Please read CLAUDE.md and all files inside .claude first.
Then implement Phase 0 from .claude/phase-plan.md.
Run npm run build after changes and summarize changed files.
```

## Recommended project creation

```bash
npm create vite@latest worklog-timeline -- --template react-ts
cd worklog-timeline
npm install
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Recommended phase workflow

1. Run one phase.
2. Build.
3. Fix build errors.
4. Commit.
5. Move to next phase.

## Commit example

```bash
git add .
git commit -m "chore: setup worklog timeline project rules"
```
