# AI Development Workflow

## Working Mode

Work phase by phase.

Do not implement future phases early unless it is necessary for the current phase.

## Standard Flow For Each Task

1. Read project rules.
2. Identify the current phase.
3. Inspect existing files.
4. Make a small plan.
5. Implement only the requested scope.
6. Run build.
7. Fix errors.
8. Summarize changes.

## Do Not

- Do not rewrite unrelated files.
- Do not refactor large parts unless needed.
- Do not change data model without checking related helpers and services.
- Do not remove existing features unless explicitly asked.
- Do not add dependencies without explaining why.
- Do not skip build validation.

## Response Format After Work

When finishing a phase, respond with:

```text
Implemented:
- ...

Changed files:
- ...

Build:
- Passed / Failed

Notes:
- ...
```

## Token Saving Rules

To reduce token usage:
- Do not print full files unless asked.
- Summarize changed files instead of pasting entire code.
- Only explain important decisions.
- Avoid long commentary.
- Keep implementation focused.
