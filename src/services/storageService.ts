import { defaultAppData } from '../data/defaultAppData';
import type {
  AIProvider,
  AppData,
  AppLanguage,
  AppTheme,
  Settings,
  TaskStatus,
  TaskType,
  WeekStart,
} from '../types/worklog';

export const STORAGE_KEY = 'worklog_timeline_data_v1';

export type ImportAppDataResult =
  | {
      ok: true;
      data: AppData;
    }
  | {
      ok: false;
      error: string;
    };

const taskTypes: TaskType[] = ['feature', 'bug', 'chore', 'research', 'meeting'];
const taskStatuses: TaskStatus[] = ['todo', 'in-progress', 'done'];
const weekStarts: WeekStart[] = ['monday', 'sunday'];
const appLanguages: AppLanguage[] = ['en', 'vi'];
const appThemes: AppTheme[] = ['light', 'dark'];
const aiProviders: AIProvider[] = [
  'disabled',
  'gemini',
  'openai-compatible',
  'ollama',
  'lm-studio',
];

function cloneDefaultData(): AppData {
  return structuredClone(defaultAppData);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isTask(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.code) &&
    isString(value.title) &&
    isString(value.description) &&
    taskTypes.includes(value.type as TaskType) &&
    taskStatuses.includes(value.status as TaskStatus) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
}

function isWorklogEntry(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.taskId) &&
    isString(value.date) &&
    isNumber(value.hours) &&
    isString(value.note) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
}

function isDailyReport(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.date) &&
    isString(value.content) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
}

function isSettings(value: unknown): boolean {
  if (!isRecord(value) || !isRecord(value.ai)) {
    return false;
  }

  return (
    isNumber(value.defaultWorkHoursPerDay) &&
    weekStarts.includes(value.weekStart as WeekStart) &&
    appLanguages.includes(value.language as AppLanguage) &&
    appThemes.includes(value.theme as AppTheme) &&
    typeof value.ai.enabled === 'boolean' &&
    aiProviders.includes(value.ai.provider as AIProvider) &&
    isString(value.ai.apiKey) &&
    isString(value.ai.baseUrl) &&
    isString(value.ai.model) &&
    isNumber(value.ai.temperature)
  );
}

function normalizeSettings(settings: Settings): Settings {
  return {
    ...defaultAppData.settings,
    ...settings,
    ai: {
      ...defaultAppData.settings.ai,
      ...settings.ai,
    },
  };
}

function normalizeAppData(appData: AppData): AppData {
  return {
    ...appData,
    settings: normalizeSettings(appData.settings),
  };
}

function isLegacySettings(value: unknown): value is Settings {
  if (!isRecord(value) || !isRecord(value.ai)) {
    return false;
  }

  return (
    isNumber(value.defaultWorkHoursPerDay) &&
    weekStarts.includes(value.weekStart as WeekStart) &&
    typeof value.ai.enabled === 'boolean' &&
    aiProviders.includes(value.ai.provider as AIProvider) &&
    isString(value.ai.apiKey) &&
    isString(value.ai.baseUrl) &&
    isString(value.ai.model) &&
    isNumber(value.ai.temperature)
  );
}

function isAppData(value: unknown): value is AppData {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.version === 1 &&
    isSettings(value.settings) &&
    Array.isArray(value.tasks) &&
    value.tasks.every(isTask) &&
    Array.isArray(value.worklogs) &&
    value.worklogs.every(isWorklogEntry) &&
    Array.isArray(value.dailyReports) &&
    value.dailyReports.every(isDailyReport)
  );
}

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadAppData(): AppData {
  if (!canUseLocalStorage()) {
    return cloneDefaultData();
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return cloneDefaultData();
  }

  try {
    const parsedData: unknown = JSON.parse(storedValue);

    if (isAppData(parsedData)) {
      return normalizeAppData(parsedData);
    }

    if (
      isRecord(parsedData) &&
      parsedData.version === 1 &&
      isLegacySettings(parsedData.settings) &&
      Array.isArray(parsedData.tasks) &&
      parsedData.tasks.every(isTask) &&
      Array.isArray(parsedData.worklogs) &&
      parsedData.worklogs.every(isWorklogEntry) &&
      Array.isArray(parsedData.dailyReports) &&
      parsedData.dailyReports.every(isDailyReport)
    ) {
      return normalizeAppData(parsedData as AppData);
    }
  } catch {
    return cloneDefaultData();
  }

  return cloneDefaultData();
}

export function saveAppData(appData: AppData): void {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

export function createDefaultAppData(): AppData {
  return cloneDefaultData();
}

export function exportAppDataToJson(appData: AppData): string {
  return JSON.stringify(appData, null, 2);
}

export function importAppDataFromJson(json: string): ImportAppDataResult {
  try {
    const parsedData: unknown = JSON.parse(json);

    if (!isAppData(parsedData)) {
      if (
        isRecord(parsedData) &&
        parsedData.version === 1 &&
        isLegacySettings(parsedData.settings) &&
        Array.isArray(parsedData.tasks) &&
        parsedData.tasks.every(isTask) &&
        Array.isArray(parsedData.worklogs) &&
        parsedData.worklogs.every(isWorklogEntry) &&
        Array.isArray(parsedData.dailyReports) &&
        parsedData.dailyReports.every(isDailyReport)
      ) {
        return {
          ok: true,
          data: normalizeAppData(parsedData as AppData),
        };
      }

      return {
        ok: false,
        error: 'Imported JSON does not match the Worklog Timeline backup format.',
      };
    }

    return {
      ok: true,
      data: parsedData,
    };
  } catch {
    return {
      ok: false,
      error: 'Imported file is not valid JSON.',
    };
  }
}
