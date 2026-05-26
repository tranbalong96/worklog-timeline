# Development Rules

## General Rules

- Keep the implementation minimal and practical.
- Prefer simple React state over complex state libraries.
- Do not use Redux, Zustand, MobX, React Query, or other state libraries unless explicitly requested.
- Do not add routing unless explicitly requested.
- Do not add authentication.
- Do not add database integration.
- Do not add Google Sheets integration.
- Do not add backend storage.
- Do not add paid service integration except configurable AI APIs.

## TypeScript Rules

- Avoid `any`.
- Prefer explicit types from `src/types`.
- Keep data model definitions centralized.
- Do not duplicate type definitions across files.

## React Rules

- Use functional components.
- Keep components small.
- Move reusable UI into `src/components`.
- Move page-level components into `src/pages`.
- Move pure functions into `src/helpers`.
- Move side-effect or persistence logic into `src/services`.

## Styling Rules

- Use Tailwind CSS.
- Keep UI clean and readable.
- Prefer consistent spacing, border radius, shadows, and button styles.
- Do not introduce custom CSS unless needed.
- Make Timeline horizontally scrollable on small screens.

## Data Rules

- `tasks` and `worklogs` are the source of truth.
- Daily Report checkbox selection must be local state only.
- Daily Report custom tasks must not modify Timeline data.
- AI generated tasks must be previewed and editable before adding to Timeline.
- Do not create worklog entries automatically when adding a task.
- Only one worklog entry per task per date in version 1.

## Storage Rules

- Save data to localStorage after changes.
- Never silently reset user data.
- Import JSON must validate basic structure.
- Reset data must require confirmation.
- Delete task must require confirmation.
- Deleting a task must also delete related worklogs.

## AI Rules

- Do not hard-code one provider.
- AI provider must come from Settings.
- API key must not be logged.
- API key is stored locally in the browser only.
- AI task generation should return:
  - taskCode
  - taskTitle
  - taskDescription
  - taskType
- If AI returns invalid JSON, show the raw response and allow manual editing.

## Build Rule

After each phase or significant change:
- Run `npm run build`.
- Fix all build errors before stopping.
