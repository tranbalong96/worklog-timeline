import { CalendarDays, ChevronLeft, ChevronRight, Edit3, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TaskFormModal } from '../components/TaskFormModal';
import { WorklogModal } from '../components/WorklogModal';
import { translate } from '../helpers/i18n';
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
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [deletingTask, setDeletingTask] = useState<Task | undefined>();
  const [loggingWorklog, setLoggingWorklog] = useState<WorklogModalState | undefined>();
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
            {formatWeekRange(weekDays)} · {tasks.length} tasks · {formatHours(weeklyTotal)} total
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
            onClick={goToPreviousWeek}
            aria-label={t('previousWeek')}
            title={t('previousWeek')}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-white px-3 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
            onClick={goToCurrentWeek}
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {t('thisWeek')}
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
            onClick={goToNextWeek}
            aria-label={t('nextWeek')}
            title={t('nextWeek')}
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
        <div className="min-w-[960px]">
          <div className="grid grid-cols-[minmax(260px,1.6fr)_repeat(7,minmax(88px,1fr))_minmax(96px,0.8fr)] border-b border-slate-200 bg-slate-100 text-sm font-medium text-slate-600">
            <div className="px-4 py-3">{t('task')}</div>
            {weekDays.map((day) => (
              <div key={formatDateKey(day)} className="px-3 py-3 text-right">
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
                  {weekDays.map((day) => {
                    const hours = getHoursForTaskOnDate(worklogs, task.id, day);
                    const dateKey = formatDateKey(day);

                    return (
                      <button
                        key={`${task.id}-${dateKey}`}
                        type="button"
                        className="flex items-center justify-end px-3 py-4 text-right text-slate-700 hover:bg-slate-50"
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

          <div className="grid grid-cols-[minmax(260px,1.6fr)_repeat(7,minmax(88px,1fr))_minmax(96px,0.8fr)] border-t border-slate-200 bg-slate-50 text-sm font-semibold text-slate-950">
            <div className="px-4 py-4">{t('dailyTotal')}</div>
            {weekDays.map((day) => (
              <div key={formatDateKey(day)} className="px-3 py-4 text-right">
                {formatHours(getDayTotal(worklogs, tasks, day))}
              </div>
            ))}
            <div className="px-4 py-4 text-right">{formatHours(weeklyTotal)}</div>
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
