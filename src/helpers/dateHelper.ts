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

export function getRollingSevenDays(date: Date): Date[] {
  return Array.from({ length: 7 }, (_, index) => addDays(date, index - 6));
}

export function getMonthDays(date: Date): Date[] {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const totalDays = lastDay.getDate();

  return Array.from({ length: totalDays }, (_, index) => addDays(firstDay, index));
}

export function addMonths(date: Date, months: number): Date {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);

  return nextDate;
}

export function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6;
}

export function isSameDate(firstDate: Date, secondDate: Date): boolean {
  return formatDateKey(firstDate) === formatDateKey(secondDate);
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

export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}
