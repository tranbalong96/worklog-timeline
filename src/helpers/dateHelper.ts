import type { WeekStart } from '../types/worklog';

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function parseLocalDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

export function getWeekStartDate(date: Date, weekStart: WeekStart): Date {
  const nextDate = new Date(date);
  const startDay = weekStart === 'monday' ? 1 : 0;
  const dayOffset = (nextDate.getDay() - startDay + 7) % 7;

  nextDate.setDate(nextDate.getDate() - dayOffset);
  nextDate.setHours(0, 0, 0, 0);

  return nextDate;
}

export function getWeekDays(date: Date, weekStart: WeekStart): Date[] {
  const weekStartDate = getWeekStartDate(date, weekStart);

  return Array.from({ length: 7 }, (_, index) => addDays(weekStartDate, index));
}

export function formatDayLabel(date: Date): string {
  return dayLabels[date.getDay()];
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function formatWeekRange(weekDays: Date[]): string {
  const firstDay = weekDays[0];
  const lastDay = weekDays[weekDays.length - 1];

  return `${formatShortDate(firstDay)} - ${formatShortDate(lastDay)}`;
}
