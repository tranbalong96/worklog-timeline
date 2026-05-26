import { CalendarDays, ChevronLeft, ChevronRight, Edit3, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TaskFormModal } from '../components/TaskFormModal';
import { WorklogModal } from '../components/WorklogModal';
import { translate } from '../helpers/i18n';
import {
  addDays,
  addMonths,
  formatDateKey,
  formatDayLabel,
  formatMonthLabel,
  formatShortDate,
  formatWeekRange,
  getMonthDays,
  getRollingSevenDays,
  getWeekDays,
  isSameDate,
  isWeekend,
} from '../helpers/dateHelper';
import {
  formatHours,
  getDayTotal,
  getHoursForTaskOnDate,
  getTaskWeeklyTotal,
  getWeekTotal,
} from '../helpers/worklogCalculator';
import type {
  AppLanguage,
  Task,
  TaskFormData,
  WeekStart,
  WorklogEntry,
  WorklogFormData,
} from '../types/worklog';

type TimelinePageProps = {
  language: AppLanguage;
  tasks: Task[];
  weekStart: WeekStart;
  worklogs: WorklogEntry[];
  onCreateTask: (taskData: TaskFormData) => void;
  onDeleteTask: (taskId: string) => void;
  onSaveWorklog: (worklogData: WorklogFormData) => void;
  onUpdateTask: (taskId: string, taskData: TaskFormData) => void;
};

type WorklogModalState = {
  date: string;
  task: Task;
};

type TimelineViewMode = 'week' | 'rolling7' | 'month';

export function TimelinePage({
  language,
  tasks,
  weekStart,
  worklogs,
  onCreateTask,
  onDeleteTask,
  onSaveWorklog,
  onUpdateTask,
}: TimelinePageProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<TimelineViewMode>('week');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [deletingTask, setDeletingTask] = useState<Task | undefined>();
  const [loggingWorklog, setLoggingWorklog] = useState<WorklogModalState | undefined>();
  const visibleDays = useMemo(() => {
    if (viewMode === 'month') {
      return getMonthDays(selectedDate);
    }

    if (viewMode === 'rolling7') {
      return getRollingSevenDays(selectedDate);
    }

    return getWeekDays(selectedDate, weekStart);
  }, [selectedDate, viewMode, weekStart]);
  const periodTotal = getWeekTotal(worklogs, tasks, visibleDays);
  const gridTemplateColumns = `minmax(260px,1.6fr) repeat(${visibleDays.length}, minmax(88px,1fr)) minmax(96px,0.8fr)`;
  const periodLabel =
    viewMode === 'month' ? formatMonthLabel(selectedDate) : formatWeekRange(visibleDays);
  const currentPeriodLabel = viewMode === 'week' ? t('thisWeek') : t('currentPeriod');
  const today = useMemo(() => new Date(), []);

  function getDayCellClass(day: Date, section: 'header' | 'body' | 'total'): string {
    if (isSameDate(day, today)) {
      return section === 'body'
        ? 'bg-sky-100 text-sky-950 ring-1 ring-inset ring-sky-300'
        : 'bg-sky-200 text-sky-950';
    }

    if (isWeekend(day)) {
      return section === 'body' ? 'bg-amber-50/70 text-amber-900' : 'bg-amber-50 text-amber-900';
    }

    return '';
  }

  function goToPreviousPeriod() {
    setSelectedDate((currentDate) => {
      if (viewMode === 'month') {
        return addMonths(currentDate, -1);
      }

      return addDays(currentDate, -7);
    });
  }

  function goToNextPeriod() {
    setSelectedDate((currentDate) => {
      if (viewMode === 'month') {
        return addMonths(currentDate, 1);
      }

      return addDays(currentDate, 7);
    });
  }

  function goToCurrentPeriod() {
    setSelectedDate(new Date());
  }

  function handleCreateTask(taskData: TaskFormData) {
    onCreateTask(taskData);
    setIsAddingTask(false);
  }

  function handleUpdateTask(taskData: TaskFormData) {
    if (!editingTask) {
      return;
    }

    onUpdateTask(editingTask.id, taskData);
    setEditingTask(undefined);
  }

  function handleDeleteTask() {
    if (!deletingTask) {
      return;
    }

    onDeleteTask(deletingTask.id);
    setDeletingTask(undefined);
  }

  function handleSaveWorklog(worklogData: WorklogFormData) {
    onSaveWorklog(worklogData);
    setLoggingWorklog(undefined);
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{t('timeline')}</h2>
          <p className="mt-1 text-sm text-slate-600">
            {periodLabel} · {tasks.length} tasks · {formatHours(periodTotal)} total
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="timeline-view-mode">
            {t('viewMode')}
          </label>
          <select
            id="timeline-view-mode"
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-500"
            value={viewMode}
            onChange={(event) => setViewMode(event.target.value as TimelineViewMode)}
          >
            <option value="week">{t('weekView')}</option>
            <option value="rolling7">{t('sevenDayView')}</option>
            <option value="month">{t('monthView')}</option>
          </select>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
            onClick={goToPreviousPeriod}
            aria-label={viewMode === 'week' ? t('previousWeek') : t('previousPeriod')}
            title={viewMode === 'week' ? t('previousWeek') : t('previousPeriod')}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-white px-3 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
            onClick={goToCurrentPeriod}
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {currentPeriodLabel}
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
            onClick={goToNextPeriod}
            aria-label={viewMode === 'week' ? t('nextWeek') : t('nextPeriod')}
            title={viewMode === 'week' ? t('nextWeek') : t('nextPeriod')}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800"
            onClick={() => setIsAddingTask(true)}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('addTask')}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <div style={{ minWidth: `${360 + visibleDays.length * 88}px` }}>
          <div
            className="grid border-b border-slate-200 bg-slate-100 text-sm font-medium text-slate-600"
            style={{ gridTemplateColumns }}
          >
            <div className="px-4 py-3">{t('task')}</div>
            {visibleDays.map((day) => (
              <div
                key={formatDateKey(day)}
                className={`px-3 py-3 text-right ${getDayCellClass(day, 'header')}`}
              >
                <div>{formatDayLabel(day)}</div>
                <div className="mt-0.5 text-xs font-normal text-slate-500">{formatShortDate(day)}</div>
              </div>
            ))}
            <div className="px-4 py-3 text-right">{t('total')}</div>
          </div>

          {tasks.length === 0 ? (
            <div className="px-4 py-8 text-sm text-slate-500">{t('noTasksYet')}</div>
          ) : (
            tasks.map((task) => {
              const taskTotal = getTaskWeeklyTotal(worklogs, task.id, visibleDays);

              return (
                <div
                  key={task.id}
                  className="grid border-b border-slate-100 text-sm last:border-b-0"
                  style={{ gridTemplateColumns }}
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
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
                        onClick={() => setEditingTask(task)}
                      >
                        <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                        {t('edit')}
                      </button>
                      <button
                        type="button"
                        className="inline-flex min-h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-50"
                        onClick={() => setDeletingTask(task)}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                  {visibleDays.map((day) => {
                    const hours = getHoursForTaskOnDate(worklogs, task.id, day);
                    const dateKey = formatDateKey(day);

                    return (
                      <button
                        key={`${task.id}-${dateKey}`}
                        type="button"
                        className={`flex items-center justify-end px-3 py-4 text-right text-slate-700 hover:bg-slate-50 ${getDayCellClass(
                          day,
                          'body',
                        )}`}
                        onClick={() => setLoggingWorklog({ task, date: dateKey })}
                        aria-label={`${t('logHours')} ${task.code} ${dateKey}`}
                        title={t('logHours')}
                      >
                        {formatHours(hours)}
                      </button>
                    );
                  })}
                  <div className="flex items-center justify-end px-4 py-4 font-semibold text-slate-950">
                    {formatHours(taskTotal)}
                  </div>
                </div>
              );
            })
          )}

          <div
            className="grid border-t border-slate-200 bg-slate-50 text-sm font-semibold text-slate-950"
            style={{ gridTemplateColumns }}
          >
            <div className="px-4 py-4">{t('dailyTotal')}</div>
            {visibleDays.map((day) => (
              <div
                key={formatDateKey(day)}
                className={`px-3 py-4 text-right ${getDayCellClass(day, 'total')}`}
              >
                {formatHours(getDayTotal(worklogs, tasks, day))}
              </div>
            ))}
            <div className="px-4 py-4 text-right">{formatHours(periodTotal)}</div>
          </div>
        </div>
      </div>
      {isAddingTask ? (
        <TaskFormModal
          language={language}
          onClose={() => setIsAddingTask(false)}
          onSave={handleCreateTask}
        />
      ) : null}
      {editingTask ? (
        <TaskFormModal
          task={editingTask}
          language={language}
          onClose={() => setEditingTask(undefined)}
          onSave={handleUpdateTask}
        />
      ) : null}
      {loggingWorklog ? (
        <WorklogModal
          date={loggingWorklog.date}
          language={language}
          task={loggingWorklog.task}
          worklog={worklogs.find(
            (worklog) =>
              worklog.taskId === loggingWorklog.task.id && worklog.date === loggingWorklog.date,
          )}
          onClose={() => setLoggingWorklog(undefined)}
          onSave={handleSaveWorklog}
        />
      ) : null}
      {deletingTask ? (
        <ConfirmDialog
          cancelLabel={t('cancel')}
          closeLabel={t('closeModal')}
          confirmLabel={t('delete')}
          destructive
          message={`${t('deleteTaskMessage')} (${deletingTask.code})`}
          title={t('deleteTaskTitle')}
          onCancel={() => setDeletingTask(undefined)}
          onConfirm={handleDeleteTask}
        />
      ) : null}
    </section>
  );
}
