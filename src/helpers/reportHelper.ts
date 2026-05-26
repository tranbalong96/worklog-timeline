import { addDays, formatDateKey, parseLocalDate } from './dateHelper';
import { formatHours } from './worklogCalculator';
import type { Task, WorklogEntry } from '../types/worklog';

export type ReportWorklogItem = {
  id: string;
  date: string;
  taskCode: string;
  taskTitle: string;
  hours: number;
  note: string;
};

export function getLoggedItemsForDate(
  tasks: Task[],
  worklogs: WorklogEntry[],
  date: string,
): ReportWorklogItem[] {
  const taskById = new Map(tasks.map((task) => [task.id, task]));

  return worklogs
    .filter((worklog) => worklog.date === date)
    .map((worklog) => {
      const task = taskById.get(worklog.taskId);

      return {
        id: worklog.id,
        date: worklog.date,
        taskCode: task?.code ?? 'Unknown',
        taskTitle: task?.title ?? 'Deleted task',
        hours: worklog.hours,
        note: worklog.note,
      };
    })
    .sort((firstItem, secondItem) => firstItem.taskCode.localeCompare(secondItem.taskCode));
}

export function findPreviousLoggedDate(
  worklogs: WorklogEntry[],
  reportDate: string,
  maxDaysBack = 7,
): string | undefined {
  const startDate = parseLocalDate(reportDate);

  for (let dayOffset = 1; dayOffset <= maxDaysBack; dayOffset += 1) {
    const dateKey = formatDateKey(addDays(startDate, -dayOffset));
    const hasLogs = worklogs.some((worklog) => worklog.date === dateKey);

    if (hasLogs) {
      return dateKey;
    }
  }

  return undefined;
}

function formatWorklogLine(item: ReportWorklogItem): string {
  const noteText = item.note ? ` - ${item.note}` : '';

  return `- ${item.taskCode}: ${item.taskTitle} (${formatHours(item.hours)})${noteText}`;
}

function formatCustomLine(task: string): string {
  return `- ${task}`;
}

export function generateDailyReportText(options: {
  reportDate: string;
  previousDate?: string;
  previousItems: ReportWorklogItem[];
  todayItems: ReportWorklogItem[];
  customTasks: string[];
}): string {
  const previousTitle = options.previousDate
    ? `Previous workday (${options.previousDate})`
    : 'Previous workday';
  const previousLines =
    options.previousItems.length > 0
      ? options.previousItems.map(formatWorklogLine)
      : ['- No logged work found in the last 7 days.'];
  const todayLines =
    options.todayItems.length > 0
      ? options.todayItems.map(formatWorklogLine)
      : ['- No logged work for selected date.'];
  const customLines =
    options.customTasks.length > 0 ? options.customTasks.map(formatCustomLine) : ['- None'];

  return [
    `Daily Report - ${options.reportDate}`,
    '',
    previousTitle,
    ...previousLines,
    '',
    `Today (${options.reportDate})`,
    ...todayLines,
    '',
    'Custom tasks',
    ...customLines,
  ].join('\n');
}
