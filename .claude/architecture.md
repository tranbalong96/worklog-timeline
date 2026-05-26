# Architecture

## Main Data Model

The app uses one main AppData object.

```ts
type AppData = {
  version: number;
  settings: Settings;
  tasks: Task[];
  worklogs: WorklogEntry[];
  dailyReports: DailyReport[];
};
```

## Main Entities

### Task

A task represents a work item.

Fields:
- id
- code
- title
- description
- type
- status
- createdAt
- updatedAt

### WorklogEntry

A worklog entry represents hours logged for one task on one date.

Fields:
- id
- taskId
- date
- hours
- note
- createdAt
- updatedAt

Rule:
- Version 1 allows only one worklog entry per task per date.

### Settings

Settings contain:
- defaultWorkHoursPerDay
- weekStart
- ai

### AISettings

AI settings contain:
- enabled
- provider
- apiKey
- baseUrl
- model
- temperature

## Source Of Truth

Timeline data comes from:
- tasks
- worklogs

Daily report does not own worklog data.

## Suggested Files

```text
src/types/worklog.ts
src/services/storageService.ts
src/services/aiClient.ts
src/helpers/dateHelper.ts
src/helpers/worklogCalculator.ts
src/helpers/reportHelper.ts
src/components/Modal.tsx
src/pages/TimelinePage.tsx
src/pages/AITaskGeneratorPage.tsx
src/pages/SettingsPage.tsx
api/generate-task.ts
```

## Helper Responsibilities

### dateHelper.ts

Handles:
- Date formatting.
- Week calculation.
- Add days.
- Date comparison.

### worklogCalculator.ts

Handles:
- Hours per task per day.
- Task weekly total.
- Day total.
- Week total.

### reportHelper.ts

Handles:
- Previous workday scan.
- Tasks logged on a date.
- Report text generation.

### storageService.ts

Handles:
- Default data.
- Load data.
- Save data.
- Export data.
- Import data.
- Reset data.

### aiClient.ts

Frontend service for calling `/api/generate-task`.

### api/generate-task.ts

Vercel serverless function for provider-specific AI calls.
