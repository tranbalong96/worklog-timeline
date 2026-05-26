import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  addDays,
  formatDateKey,
  formatDayLabel,
  formatShortDate,
  formatWeekRange,
  getWeekDays,
} from '../helpers/dateHelper';
import {
  formatHours,
  getDayTotal,
  getHoursForTaskOnDate,
  getTaskWeeklyTotal,
  getWeekTotal,
} from '../helpers/worklogCalculator';
import type { Task, WeekStart, WorklogEntry } from '../types/worklog';

type TimelinePageProps = {
  tasks: Task[];
  weekStart: WeekStart;
  worklogs: WorklogEntry[];
};

export function TimelinePage({ tasks, weekStart, worklogs }: TimelinePageProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const weekDays = useMemo(() => getWeekDays(selectedDate, weekStart), [selectedDate, weekStart]);
  const weeklyTotal = getWeekTotal(worklogs, tasks, weekDays);

  function goToPreviousWeek() {
    setSelectedDate((currentDate) => addDays(currentDate, -7));
  }

  function goToNextWeek() {
    setSelectedDate((currentDate) => addDays(currentDate, 7));
  }

  function goToCurrentWeek() {
    setSelectedDate(new Date());
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Timeline</h2>
          <p className="mt-1 text-sm text-slate-600">
            {formatWeekRange(weekDays)} · {tasks.length} tasks · {formatHours(weeklyTotal)} total
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
            onClick={goToPreviousWeek}
            aria-label="Previous week"
            title="Previous week"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-white px-3 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
            onClick={goToCurrentWeek}
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            This week
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
            onClick={goToNextWeek}
            aria-label="Next week"
            title="Next week"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <div className="min-w-[960px]">
          <div className="grid grid-cols-[minmax(260px,1.6fr)_repeat(7,minmax(88px,1fr))_minmax(96px,0.8fr)] border-b border-slate-200 bg-slate-100 text-sm font-medium text-slate-600">
            <div className="px-4 py-3">Task</div>
            {weekDays.map((day) => (
              <div key={formatDateKey(day)} className="px-3 py-3 text-right">
                <div>{formatDayLabel(day)}</div>
                <div className="mt-0.5 text-xs font-normal text-slate-500">{formatShortDate(day)}</div>
              </div>
            ))}
            <div className="px-4 py-3 text-right">Total</div>
          </div>

          {tasks.length === 0 ? (
            <div className="px-4 py-8 text-sm text-slate-500">No tasks yet.</div>
          ) : (
            tasks.map((task) => {
              const taskTotal = getTaskWeeklyTotal(worklogs, task.id, weekDays);

              return (
                <div
                  key={task.id}
                  className="grid grid-cols-[minmax(260px,1.6fr)_repeat(7,minmax(88px,1fr))_minmax(96px,0.8fr)] border-b border-slate-100 text-sm last:border-b-0"
                >
                  <div className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-950">{task.code}</span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium capitalize text-slate-600">
                        {task.status}
                      </span>
                    </div>
                    <div className="mt-1 font-medium text-slate-700">{task.title}</div>
                    <div className="mt-1 line-clamp-2 text-xs text-slate-500">{task.description}</div>
                  </div>
                  {weekDays.map((day) => {
                    const hours = getHoursForTaskOnDate(worklogs, task.id, day);

                    return (
                      <div
                        key={`${task.id}-${formatDateKey(day)}`}
                        className="flex items-center justify-end px-3 py-4 text-slate-700"
                      >
                        {formatHours(hours)}
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-end px-4 py-4 font-semibold text-slate-950">
                    {formatHours(taskTotal)}
                  </div>
                </div>
              );
            })
          )}

          <div className="grid grid-cols-[minmax(260px,1.6fr)_repeat(7,minmax(88px,1fr))_minmax(96px,0.8fr)] border-t border-slate-200 bg-slate-50 text-sm font-semibold text-slate-950">
            <div className="px-4 py-4">Daily total</div>
            {weekDays.map((day) => (
              <div key={formatDateKey(day)} className="px-3 py-4 text-right">
                {formatHours(getDayTotal(worklogs, tasks, day))}
              </div>
            ))}
            <div className="px-4 py-4 text-right">{formatHours(weeklyTotal)}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
