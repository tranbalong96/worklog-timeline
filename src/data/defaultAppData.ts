import type { AppData } from '../types/worklog';

const createdAt = '2026-05-26T00:00:00.000Z';

export const defaultAppData: AppData = {
  version: 1,
  settings: {
    defaultWorkHoursPerDay: 8,
    weekStart: 'monday',
    language: 'en',
    theme: 'light',
    ai: {
      enabled: false,
      provider: 'disabled',
      apiKey: '',
      baseUrl: '',
      model: '',
      temperature: 0.2,
    },
  },
  tasks: [
    {
      id: 'task-setup-worklog-app',
      code: 'WORKLOG-1',
      title: 'Set up Worklog Timeline app shell',
      description: 'Create the first React, TypeScript, Vite, and Tailwind app structure.',
      type: 'chore',
      status: 'done',
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'task-design-data-model',
      code: 'WORKLOG-2',
      title: 'Define local-first worklog data model',
      description: 'Prepare strongly typed tasks, worklogs, reports, and settings.',
      type: 'feature',
      status: 'in-progress',
      createdAt,
      updatedAt: createdAt,
    },
  ],
  worklogs: [
    {
      id: 'worklog-setup-2026-05-26',
      taskId: 'task-setup-worklog-app',
      date: '2026-05-26',
      hours: 2,
      note: 'Initial project setup.',
      status: 'draft',
      createdAt,
      updatedAt: createdAt,
    },
  ],
  dailyReports: [],
};
