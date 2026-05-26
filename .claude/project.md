# Project Context

## App Name

Worklog Timeline

## Main Goal

Build a clean, local-first worklog app for developers.

The user should be able to:
- Create tasks.
- Edit tasks.
- Delete tasks.
- Log hours for tasks by day.
- View worklogs in a weekly timeline grid.
- Generate daily reports.
- Configure AI provider.
- Generate Jira-style tasks from messy notes.
- Backup and restore data using JSON files.

## Version 1 Direction

Version 1 should be simple and stable.

No login.
No database.
No Google Sheets sync.
No cloud sync.
No complicated permissions.

## Storage Direction

Use browser localStorage first.

Main localStorage key:

```text
worklog_timeline_data_v1
```

The app should support:
- Autosave to localStorage.
- Export current data to JSON.
- Import JSON and replace current data after confirmation.
- Reset data after confirmation.

## Deployment Direction

The app should be deployable to Vercel.

Vercel deployment should work for:
- React frontend.
- Vercel serverless API route for AI task generation.

## AI Direction

AI is optional.

AI provider settings should support:
- Disabled
- Gemini
- OpenAI-compatible
- Ollama
- LM Studio

Important:
- Gemini and OpenAI-compatible cloud providers should work on Vercel.
- Ollama and LM Studio localhost providers mainly work when the app is running locally.
