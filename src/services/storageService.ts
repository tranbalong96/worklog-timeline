import { defaultAppData } from '../data/defaultAppData';
import type { AppData } from '../types/worklog';

export const STORAGE_KEY = 'worklog_timeline_data_v1';

function cloneDefaultData(): AppData {
  return structuredClone(defaultAppData);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAppData(value: unknown): value is AppData {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.version === 1 &&
    isRecord(value.settings) &&
    Array.isArray(value.tasks) &&
    Array.isArray(value.worklogs) &&
    Array.isArray(value.dailyReports)
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
      return parsedData;
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
