# Safe Refactor Prompt

Refactor only the files related to the current phase.

Rules:
- Keep behavior unchanged.
- Do not change the data model unless required.
- Do not add dependencies.
- Run npm run build after changes.
- Summarize changed files and any behavior that was intentionally preserved.
