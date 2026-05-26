import { formatDateKey } from './dateHelper';
import type { Task, WorklogEntry } from '../types/worklog';

export function getHoursForTaskOnDate(
  worklogs: WorklogEntry[],
  taskId: string,
  date: Date,
): number {
  const dateKey = formatDateKey(date);
  const worklog = worklogs.find((entry) => entry.taskId === taskId && entry.date === dateKey);

  return worklog?.hours ?? 0;
}

export function getTaskWeeklyTotal(
  worklogs: WorklogEntry[],
  taskId: string,
  weekDays: Date[],
): number {
  return weekDays.reduce(
    (total, day) => total + getHoursForTaskOnDate(worklogs, taskId, day),
    0,
  );
}

export function getDayTotal(worklogs: WorklogEntry[], tasks: Task[], date: Date): number {
  const taskIds = new Set(tasks.map((task) => task.id));
  const dateKey = formatDateKey(date);

  return worklogs
    .filter((entry) => taskIds.has(entry.taskId) && entry.date === dateKey)
    .reduce((total, entry) => total + entry.hours, 0);
}

export function getWeekTotal(worklogs: WorklogEntry[], tasks: Task[], weekDays: Date[]): number {
  return weekDays.reduce((total, day) => total + getDayTotal(worklogs, tasks, day), 0);
}

export function formatHours(hours: number): string {
  return hours === 0 ? '-' : `${Number(hours.toFixed(2))}h`;
}
