# Commit Rules

## Commit Style

Use Conventional Commits.

Recommended prefixes:
- `feat:` for new features.
- `fix:` for bug fixes.
- `chore:` for setup, tooling, cleanup.
- `refactor:` for code restructuring without behavior change.
- `docs:` for documentation only.
- `style:` for UI styling changes only.
- `test:` for test-related changes.

## Examples

```bash
git commit -m "chore: setup worklog timeline project rules"
git commit -m "feat: setup base worklog timeline app"
git commit -m "feat: add local data model and storage"
git commit -m "feat: implement weekly timeline view"
git commit -m "feat: add task and worklog editing"
git commit -m "feat: add daily report builder"
git commit -m "feat: add AI provider settings"
git commit -m "feat: implement AI task generator"
git commit -m "feat: add JSON backup and restore"
git commit -m "refactor: polish worklog app before release"
```

## Commit Safety Checklist

Before commit:
- Run `npm run build`.
- Check no unrelated files were changed.
- Check no API key or secret is committed.
- Check localStorage key remains stable.
- Check data model changes are intentional.

## Branch Naming

Recommended branch names:
- `feat/worklog-timeline-setup`
- `feat/local-storage`
- `feat/timeline-view`
- `feat/daily-report`
- `feat/ai-task-generator`
- `fix/build-errors`
