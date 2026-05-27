import { CheckCircle2, Clipboard, Clock3, Save, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  addDays,
  formatDateKey,
  formatDayLabel,
  getWeekDays,
  parseLocalDate,
} from '../helpers/dateHelper';
import { translate } from '../helpers/i18n';
import { formatHours } from '../helpers/worklogCalculator';
import type {
  AppLanguage,
  Task,
  TodayWorklogFormData,
  TodayWorklogUpdateData,
  WeekStart,
  WorklogEntry,
  WorklogStatus,
} from '../types/worklog';

type TimelinePageProps = {
  language: AppLanguage;
  tasks: Task[];
  weekStart: WeekStart;
  worklogs: WorklogEntry[];
  onAddTodayWorklog: (worklogData: TodayWorklogFormData) => void;
  onDeleteWorklog: (worklogId: string) => void;
  onMarkWorklogLogged: (worklogId: string) => void;
  onUpdateTodayWorklog: (worklogData: TodayWorklogUpdateData) => void;
};

type WorklogCardItem = {
  task: Task;
  worklog: WorklogEntry;
};

type MainViewMode = 'list' | 'timeline';
type SelectedTimelineCell = {
  date: string;
  groupKey: string;
};
type TimelineEntry = WorklogCardItem;
type TimelineGroup = {
  entries: TimelineEntry[];
  key: string;
  title: string;
};

const quickTimeOptions = [0.5, 1, 1.5, 2, 3, 4, 6, 8];
const statusOptions: WorklogStatus[] = ['draft', 'ready', 'logged'];

function parseHours(value: string): number {
  if (!value.trim()) {
    return 0;
  }

  return Math.max(0, Number(value) || 0);
}

function formatQuickTime(hours: number): string {
  return `${hours}h`;
}

function getCardTitle(task: Task): string {
  return task.code.trim() ? `${task.code} - ${task.title}` : task.title;
}

function getStatusLabel(status: WorklogStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getTaskGroupKey(task: Task): string {
  const code = task.code.trim();
  const title = task.title.trim();

  return code ? `${code}::${title}` : title;
}

function getTimelineDates(startDate: string, endDate: string): string[] {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  if (start > end) {
    return [startDate];
  }

  const dates: string[] = [];
  let currentDate = start;

  while (currentDate <= end) {
    dates.push(formatDateKey(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return dates;
}

function formatTimelineDate(dateKey: string): string {
  const date = parseLocalDate(dateKey);

  return `${formatDayLabel(date)} ${date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
  })}`;
}

function getCellShade(hours: number): string {
  if (hours >= 6) {
    return 'bg-teal-100/80 text-teal-950';
  }

  if (hours >= 3) {
    return 'bg-teal-50 text-teal-950';
  }

  if (hours > 0) {
    return 'bg-slate-100/80 text-slate-950';
  }

  return 'text-slate-400';
}

export function TimelinePage({
  language,
  tasks,
  weekStart,
  worklogs,
  onAddTodayWorklog,
  onDeleteWorklog,
  onMarkWorklogLogged,
  onUpdateTodayWorklog,
}: TimelinePageProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const today = useMemo(() => formatDateKey(new Date()), []);
  const currentWeek = useMemo(() => getWeekDays(new Date(), weekStart), [weekStart]);
  const [viewMode, setViewMode] = useState<MainViewMode>('timeline');
  const [selectedDate, setSelectedDate] = useState(today);
  const [rangeStartDate, setRangeStartDate] = useState(() => formatDateKey(currentWeek[0]));
  const [rangeEndDate, setRangeEndDate] = useState(() =>
    formatDateKey(currentWeek[currentWeek.length - 1]),
  );
  const [selectedTimelineCell, setSelectedTimelineCell] = useState<SelectedTimelineCell>();
  const [taskCode, setTaskCode] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [worklogDate, setWorklogDate] = useState(today);
  const [hours, setHours] = useState('');
  const [note, setNote] = useState('');

  const taskById = useMemo(
    () => new Map(tasks.map((task) => [task.id, task])),
    [tasks],
  );
  const filteredItems = useMemo<WorklogCardItem[]>(
    () =>
      worklogs
        .filter((worklog) => worklog.date === selectedDate)
        .map((worklog) => {
          const task = taskById.get(worklog.taskId);

          return task ? { task, worklog } : undefined;
        })
        .filter((item): item is WorklogCardItem => Boolean(item))
        .sort((left, right) => right.worklog.updatedAt.localeCompare(left.worklog.updatedAt)),
    [selectedDate, taskById, worklogs],
  );
  const selectedDateTotal = filteredItems.reduce(
    (total, item) => total + item.worklog.hours,
    0,
  );
  const timelineDates = useMemo(
    () => getTimelineDates(rangeStartDate, rangeEndDate),
    [rangeEndDate, rangeStartDate],
  );
  const timelineGroups = useMemo<TimelineGroup[]>(() => {
    const groupedItems = new Map<string, TimelineGroup>();
    const dateSet = new Set(timelineDates);

    worklogs.forEach((worklog) => {
      if (!dateSet.has(worklog.date)) {
        return;
      }

      const task = taskById.get(worklog.taskId);

      if (!task) {
        return;
      }

      const key = getTaskGroupKey(task);
      const existingGroup = groupedItems.get(key);
      const entry = { task, worklog };

      if (existingGroup) {
        existingGroup.entries.push(entry);
        return;
      }

      groupedItems.set(key, {
        entries: [entry],
        key,
        title: getCardTitle(task),
      });
    });

    return [...groupedItems.values()].sort((left, right) => left.title.localeCompare(right.title));
  }, [taskById, timelineDates, worklogs]);
  const selectedTimelineGroup = selectedTimelineCell
    ? timelineGroups.find((group) => group.key === selectedTimelineCell.groupKey)
    : undefined;
  const selectedTimelineEntries =
    selectedTimelineCell && selectedTimelineGroup
      ? selectedTimelineGroup.entries.filter(
          (entry) => entry.worklog.date === selectedTimelineCell.date,
        )
      : [];
  const timelineDailyTotals = timelineDates.map((date) =>
    timelineGroups.reduce((total, group) => total + getTimelineGroupHoursForDate(group, date), 0),
  );
  const timelineGrandTotal = timelineDailyTotals.reduce((total, hours) => total + hours, 0);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!taskTitle.trim()) {
      return;
    }

    onAddTodayWorklog({
      taskCode,
      taskTitle,
      date: worklogDate,
      hours: parseHours(hours),
      note,
      status: 'draft',
    });
    setTaskCode('');
    setTaskTitle('');
    setWorklogDate(selectedDate);
    setHours('');
    setNote('');
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">{t('todayWorklogEyebrow')}</p>
          <h2 className="section-title mt-1">{t('todayWorklog')}</h2>
          <p className="mt-1 text-sm text-slate-600">{t('todayWorklogSubtitle')}</p>
        </div>
        <div className="app-panel flex flex-col gap-3 p-3 sm:flex-row sm:items-end">
          <label className="label">
            <span>{t('dateFilter')}</span>
            <input
              type="date"
              className="field sm:w-44"
              value={selectedDate}
              onChange={(event) => {
                setSelectedDate(event.target.value);
                setWorklogDate(event.target.value);
              }}
            />
          </label>
          <div className="rounded-md bg-slate-950 px-4 py-2 text-white shadow-sm dark:bg-white dark:text-slate-950">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-70">
              {t('totalLogged')}
            </p>
            <p className="text-xl font-semibold">{formatHours(selectedDateTotal)}</p>
          </div>
        </div>
      </div>

      <div className="inline-flex rounded-lg border border-slate-200/70 bg-slate-100/70 p-1 shadow-inner">
        <button
          type="button"
          className={`min-h-10 rounded-md px-4 text-sm font-semibold transition ${
            viewMode === 'list'
              ? 'bg-slate-950 text-white shadow-sm'
              : 'text-slate-600 hover:bg-white/80 hover:text-slate-950'
          }`}
          onClick={() => setViewMode('list')}
        >
          {t('listView')}
        </button>
        <button
          type="button"
          className={`min-h-10 rounded-md px-4 text-sm font-semibold transition ${
            viewMode === 'timeline'
              ? 'bg-slate-950 text-white shadow-sm'
              : 'text-slate-600 hover:bg-white/80 hover:text-slate-950'
          }`}
          onClick={() => setViewMode('timeline')}
        >
          {t('timelineView')}
        </button>
      </div>

      {viewMode === 'list' ? (
        <>
          <form className="app-panel grid gap-3 p-4 lg:grid-cols-[0.45fr_1.4fr_0.48fr_0.42fr] lg:items-end" onSubmit={handleSubmit}>
        <label className="label">
          <span>{t('taskCodeOptional')}</span>
          <input
            className="field"
            value={taskCode}
            onChange={(event) => setTaskCode(event.target.value)}
            placeholder="CXPT-88, VTL-194..."
          />
        </label>
        <label className="label">
          <span>{t('taskTitleRequired')}</span>
          <input
            className="field text-base font-semibold"
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
            placeholder={t('taskTitlePlaceholder')}
            required
          />
        </label>
        <label className="label">
          <span>{t('date')}</span>
          <input
            type="date"
            className="field"
            value={worklogDate}
            onChange={(event) => setWorklogDate(event.target.value)}
          />
        </label>
        <label className="label">
          <span>{t('timeSpent')}</span>
          <input
            className="field"
            min="0"
            step="0.25"
            type="number"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
            placeholder="0"
          />
        </label>
        <label className="label lg:col-span-3">
          <span>{t('worklogNote')}</span>
          <input
            className="field"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t('worklogNotePlaceholder')}
          />
        </label>
        <button type="submit" className="btn-primary">
          <Clock3 className="h-4 w-4" aria-hidden="true" />
          {t('addWorklog')}
        </button>
          </form>

          <div className="space-y-3">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <TodayWorklogCard
                  key={item.worklog.id}
                  item={item}
                  language={language}
                  onDeleteWorklog={onDeleteWorklog}
                  onMarkWorklogLogged={onMarkWorklogLogged}
                  onUpdateTodayWorklog={onUpdateTodayWorklog}
                />
              ))
            ) : (
              <div className="app-panel-muted p-6 text-center text-sm text-slate-500">
                {t('noWorklogsForDate')}
              </div>
            )}
          </div>
        </>
      ) : (
        <TimelineGridView
          language={language}
          rangeEndDate={rangeEndDate}
          rangeStartDate={rangeStartDate}
          selectedTimelineCell={selectedTimelineCell}
          timelineDailyTotals={timelineDailyTotals}
          timelineDates={timelineDates}
          timelineGrandTotal={timelineGrandTotal}
          timelineGroups={timelineGroups}
          onDeleteWorklog={onDeleteWorklog}
          onRangeEndDateChange={setRangeEndDate}
          onRangeStartDateChange={setRangeStartDate}
          onSelectCell={setSelectedTimelineCell}
          onUpdateTodayWorklog={onUpdateTodayWorklog}
        />
      )}
      {selectedTimelineCell && selectedTimelineGroup ? (
        <TimelineCellPanel
          entries={selectedTimelineEntries}
          groupTitle={selectedTimelineGroup.title}
          language={language}
          selectedDate={selectedTimelineCell.date}
          onClose={() => setSelectedTimelineCell(undefined)}
          onDeleteWorklog={onDeleteWorklog}
          onUpdateTodayWorklog={onUpdateTodayWorklog}
        />
      ) : null}
    </section>
  );
}

function getTimelineGroupHoursForDate(group: TimelineGroup, date: string): number {
  return group.entries
    .filter((entry) => entry.worklog.date === date)
    .reduce((total, entry) => total + entry.worklog.hours, 0);
}

type TimelineGridViewProps = {
  language: AppLanguage;
  rangeEndDate: string;
  rangeStartDate: string;
  selectedTimelineCell?: SelectedTimelineCell;
  timelineDailyTotals: number[];
  timelineDates: string[];
  timelineGrandTotal: number;
  timelineGroups: TimelineGroup[];
  onDeleteWorklog: (worklogId: string) => void;
  onRangeEndDateChange: (date: string) => void;
  onRangeStartDateChange: (date: string) => void;
  onSelectCell: (cell: SelectedTimelineCell | undefined) => void;
  onUpdateTodayWorklog: (worklogData: TodayWorklogUpdateData) => void;
};

function TimelineGridView({
  language,
  rangeEndDate,
  rangeStartDate,
  selectedTimelineCell,
  timelineDailyTotals,
  timelineDates,
  timelineGrandTotal,
  timelineGroups,
  onRangeEndDateChange,
  onRangeStartDateChange,
  onSelectCell,
}: TimelineGridViewProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const gridTemplateColumns = `minmax(260px,1.5fr) repeat(${timelineDates.length}, minmax(96px,1fr)) minmax(96px,0.7fr)`;

  return (
    <div className="space-y-4">
      <div className="app-panel flex flex-col gap-3 p-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">{t('timelineView')}</p>
          <p className="mt-1 text-sm text-slate-500">
            {rangeStartDate} - {rangeEndDate}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="label">
            <span>{t('startDate')}</span>
            <input
              type="date"
              className="field sm:w-44"
              value={rangeStartDate}
              onChange={(event) => onRangeStartDateChange(event.target.value)}
            />
          </label>
          <label className="label">
            <span>{t('endDate')}</span>
            <input
              type="date"
              className="field sm:w-44"
              value={rangeEndDate}
              onChange={(event) => onRangeEndDateChange(event.target.value)}
            />
          </label>
          <div className="rounded-md bg-slate-950 px-4 py-2 text-white shadow-sm dark:bg-white dark:text-slate-950">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-70">
              {t('rangeTotal')}
            </p>
            <p className="text-xl font-semibold">{formatHours(timelineGrandTotal)}</p>
          </div>
        </div>
      </div>

      <div className="app-panel overflow-x-auto">
        <div style={{ minWidth: `${360 + timelineDates.length * 96}px` }}>
          <div
            className="grid border-b border-slate-200/80 bg-slate-100/80 text-sm font-semibold text-slate-600"
            style={{ gridTemplateColumns }}
          >
            <div className="sticky left-0 z-10 bg-slate-100/95 px-4 py-3 backdrop-blur">
              {t('task')}
            </div>
            {timelineDates.map((date) => (
              <div key={date} className="px-3 py-3 text-right">
                {formatTimelineDate(date)}
              </div>
            ))}
            <div className="sticky right-0 z-10 bg-slate-100/95 px-4 py-3 text-right backdrop-blur">
              {t('total')}
            </div>
          </div>

          {timelineGroups.length > 0 ? (
            timelineGroups.map((group) => {
              const groupTotal = timelineDates.reduce(
                (total, date) => total + getTimelineGroupHoursForDate(group, date),
                0,
              );

              return (
                <div
                  key={group.key}
                  className="grid border-b border-slate-100/80 text-sm last:border-b-0"
                  style={{ gridTemplateColumns }}
                >
                  <div className="sticky left-0 z-10 bg-white/95 px-4 py-3 font-semibold text-slate-800 backdrop-blur">
                    {group.title}
                  </div>
                  {timelineDates.map((date) => {
                    const hours = getTimelineGroupHoursForDate(group, date);
                    const isSelected =
                      selectedTimelineCell?.groupKey === group.key &&
                      selectedTimelineCell.date === date;

                    return (
                      <button
                        key={`${group.key}-${date}`}
                        type="button"
                        className={`min-h-12 px-3 py-3 text-right text-sm font-semibold transition hover:bg-teal-50 ${getCellShade(
                          hours,
                        )} ${isSelected ? 'ring-2 ring-inset ring-teal-300' : ''}`}
                        onClick={() =>
                          hours > 0
                            ? onSelectCell({ groupKey: group.key, date })
                            : onSelectCell(undefined)
                        }
                      >
                        {formatHours(hours)}
                      </button>
                    );
                  })}
                  <div className="sticky right-0 z-10 bg-white/95 px-4 py-3 text-right font-semibold text-slate-950 backdrop-blur">
                    {formatHours(groupTotal)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-8 text-sm text-slate-500">{t('noWorklogsInRange')}</div>
          )}

          <div
            className="grid border-t border-slate-200/80 bg-slate-50/80 text-sm font-semibold text-slate-950"
            style={{ gridTemplateColumns }}
          >
            <div className="sticky left-0 z-10 bg-slate-50/95 px-4 py-3 backdrop-blur">
              {t('dailyTotal')}
            </div>
            {timelineDailyTotals.map((hours, index) => (
              <div key={timelineDates[index]} className="px-3 py-3 text-right">
                {formatHours(hours)}
              </div>
            ))}
            <div className="sticky right-0 z-10 bg-slate-50/95 px-4 py-3 text-right backdrop-blur">
              {formatHours(timelineGrandTotal)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type TimelineCellPanelProps = {
  entries: TimelineEntry[];
  groupTitle: string;
  language: AppLanguage;
  selectedDate: string;
  onClose: () => void;
  onDeleteWorklog: (worklogId: string) => void;
  onUpdateTodayWorklog: (worklogData: TodayWorklogUpdateData) => void;
};

function TimelineCellPanel({
  entries,
  groupTitle,
  language,
  selectedDate,
  onClose,
  onDeleteWorklog,
  onUpdateTodayWorklog,
}: TimelineCellPanelProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <div className="app-panel max-h-[90vh] w-full max-w-3xl overflow-y-auto">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">{groupTitle}</h3>
            <p className="mt-1 text-sm text-slate-500">{selectedDate}</p>
          </div>
          <button
            type="button"
            className="btn-icon h-9 w-9"
            onClick={onClose}
            aria-label={t('closeModal')}
            title={t('closeModal')}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-3 px-5 py-5">
          {entries.map((entry) => (
            <TimelineEntryEditor
              key={entry.worklog.id}
              entry={entry}
              language={language}
              onDeleteWorklog={onDeleteWorklog}
              onUpdateTodayWorklog={onUpdateTodayWorklog}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

type TimelineEntryEditorProps = {
  entry: TimelineEntry;
  language: AppLanguage;
  onDeleteWorklog: (worklogId: string) => void;
  onUpdateTodayWorklog: (worklogData: TodayWorklogUpdateData) => void;
};

function TimelineEntryEditor({
  entry,
  language,
  onDeleteWorklog,
  onUpdateTodayWorklog,
}: TimelineEntryEditorProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const { task, worklog } = entry;
  const [taskCode, setTaskCode] = useState(task.code);
  const [taskTitle, setTaskTitle] = useState(task.title);
  const [hours, setHours] = useState(worklog.hours ? worklog.hours.toString() : '');
  const [note, setNote] = useState(worklog.note);

  function saveEntry() {
    if (!taskTitle.trim()) {
      return;
    }

    onUpdateTodayWorklog({
      taskId: task.id,
      worklogId: worklog.id,
      taskCode,
      taskTitle,
      date: worklog.date,
      hours: parseHours(hours),
      note,
      status: worklog.status,
    });
  }

  return (
    <div className="rounded-lg border border-slate-200/80 bg-white/75 p-3 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[0.5fr_1.1fr_0.35fr]">
        <label className="label">
          <span>{t('taskCodeOptional')}</span>
          <input
            className="field"
            value={taskCode}
            onChange={(event) => setTaskCode(event.target.value)}
          />
        </label>
        <label className="label">
          <span>{t('taskTitleRequired')}</span>
          <input
            className="field font-semibold"
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
          />
        </label>
        <label className="label">
          <span>{t('timeSpent')}</span>
          <input
            className="field"
            min="0"
            step="0.25"
            type="number"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
          />
        </label>
        <label className="label lg:col-span-3">
          <span>{t('worklogNote')}</span>
          <input
            className="field"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-red-200 bg-white/80 px-3 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
          onClick={() => onDeleteWorklog(worklog.id)}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {t('delete')}
        </button>
        <button type="button" className="btn-primary min-h-9 px-3" onClick={saveEntry}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {t('save')}
        </button>
      </div>
    </div>
  );
}

type TodayWorklogCardProps = {
  item: WorklogCardItem;
  language: AppLanguage;
  onDeleteWorklog: (worklogId: string) => void;
  onMarkWorklogLogged: (worklogId: string) => void;
  onUpdateTodayWorklog: (worklogData: TodayWorklogUpdateData) => void;
};

function TodayWorklogCard({
  item,
  language,
  onDeleteWorklog,
  onMarkWorklogLogged,
  onUpdateTodayWorklog,
}: TodayWorklogCardProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const { task, worklog } = item;
  const [taskCode, setTaskCode] = useState(task.code);
  const [taskTitle, setTaskTitle] = useState(task.title);
  const [date, setDate] = useState(worklog.date);
  const [hours, setHours] = useState(worklog.hours ? worklog.hours.toString() : '');
  const [note, setNote] = useState(worklog.note);
  const [status, setStatus] = useState<WorklogStatus>(worklog.status);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    setTaskCode(task.code);
    setTaskTitle(task.title);
    setDate(worklog.date);
    setHours(worklog.hours ? worklog.hours.toString() : '');
    setNote(worklog.note);
    setStatus(worklog.status);
  }, [task.code, task.title, worklog.date, worklog.hours, worklog.note, worklog.status]);

  function saveCard(nextHours = hours, nextStatus = status) {
    if (!taskTitle.trim()) {
      return;
    }

    onUpdateTodayWorklog({
      taskId: task.id,
      worklogId: worklog.id,
      taskCode,
      taskTitle,
      date,
      hours: parseHours(nextHours),
      note,
      status: nextStatus,
    });
  }

  async function copyJiraWorklog() {
    const taskLine = taskCode.trim() ? `${taskCode.trim()} ${taskTitle.trim()}` : taskTitle.trim();
    const text = [
      `Task: ${taskLine}`,
      `Date: ${date}`,
      `Time spent: ${parseHours(hours)}h`,
      note.trim() ? `Note: ${note.trim()}` : undefined,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(t('copied'));
    } catch {
      setCopyStatus(t('copyFailed'));
    }
  }

  function handleQuickTime(nextHours: number) {
    const nextHoursValue = nextHours.toString();

    setHours(nextHoursValue);
    onUpdateTodayWorklog({
      taskId: task.id,
      worklogId: worklog.id,
      taskCode,
      taskTitle,
      date,
      hours: nextHours,
      note,
      status,
    });
  }

  function handleStatusChange(nextStatus: WorklogStatus) {
    setStatus(nextStatus);
    saveCard(hours, nextStatus);
  }

  return (
    <article className="app-panel p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-slate-950">
              {getCardTitle({ ...task, code: taskCode, title: taskTitle })}
            </h3>
            <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700 ring-1 ring-inset ring-teal-200">
              {getStatusLabel(status)}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {date} · {formatHours(parseHours(hours))}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary min-h-9 px-3" onClick={copyJiraWorklog}>
            <Clipboard className="h-4 w-4" aria-hidden="true" />
            {t('copyJiraWorklog')}
          </button>
          <button
            type="button"
            className="btn-secondary min-h-9 px-3"
            disabled={status === 'logged'}
            onClick={() => {
              setStatus('logged');
              onMarkWorklogLogged(worklog.id);
            }}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {t('markLogged')}
          </button>
          <button
            type="button"
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-red-200 bg-white/80 px-3 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-50"
            onClick={() => onDeleteWorklog(worklog.id)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {t('delete')}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[0.45fr_1.2fr_0.42fr_0.35fr_0.38fr]">
        <label className="label">
          <span>{t('taskCodeOptional')}</span>
          <input
            className="field"
            value={taskCode}
            onChange={(event) => setTaskCode(event.target.value)}
            placeholder="CXPT-88"
          />
        </label>
        <label className="label">
          <span>{t('taskTitleRequired')}</span>
          <input
            className="field font-semibold"
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
            required
          />
        </label>
        <label className="label">
          <span>{t('date')}</span>
          <input
            type="date"
            className="field"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <label className="label">
          <span>{t('timeSpent')}</span>
          <input
            className="field"
            min="0"
            step="0.25"
            type="number"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
          />
        </label>
        <label className="label">
          <span>{t('status')}</span>
          <select
            className="field"
            value={status}
            onChange={(event) => handleStatusChange(event.target.value as WorklogStatus)}
          >
            {statusOptions.map((statusOption) => (
              <option key={statusOption} value={statusOption}>
                {getStatusLabel(statusOption)}
              </option>
            ))}
          </select>
        </label>
        <label className="label lg:col-span-4">
          <span>{t('worklogNote')}</span>
          <input
            className="field"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        <button type="button" className="btn-primary" onClick={() => saveCard()}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {t('save')}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          {t('quickTime')}
        </span>
        {quickTimeOptions.map((quickTime) => (
          <button
            key={quickTime}
            type="button"
            className="btn-secondary min-h-8 px-3 text-xs"
            onClick={() => handleQuickTime(quickTime)}
          >
            {formatQuickTime(quickTime)}
          </button>
        ))}
        {copyStatus ? <span className="text-xs text-slate-500">{copyStatus}</span> : null}
      </div>
    </article>
  );
}
