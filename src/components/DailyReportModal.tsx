import { Clipboard, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from './Modal';
import {
  findPreviousLoggedDate,
  generateDailyReportText,
  getLoggedItemsForDate,
  type ReportWorklogItem,
} from '../helpers/reportHelper';
import { translate } from '../helpers/i18n';
import type { AppLanguage, Task, WorklogEntry } from '../types/worklog';

type DailyReportModalProps = {
  language: AppLanguage;
  reportDate: string;
  tasks: Task[];
  worklogs: WorklogEntry[];
  onClose: () => void;
};

function getInitialSelection(items: ReportWorklogItem[]): Record<string, boolean> {
  return Object.fromEntries(items.map((item) => [item.id, true]));
}

export function DailyReportModal({
  language,
  reportDate,
  tasks,
  worklogs,
  onClose,
}: DailyReportModalProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const previousDate = useMemo(
    () => findPreviousLoggedDate(worklogs, reportDate),
    [reportDate, worklogs],
  );
  const previousItems = useMemo(
    () => (previousDate ? getLoggedItemsForDate(tasks, worklogs, previousDate) : []),
    [previousDate, tasks, worklogs],
  );
  const todayItems = useMemo(
    () => getLoggedItemsForDate(tasks, worklogs, reportDate),
    [reportDate, tasks, worklogs],
  );
  const allItems = useMemo(() => [...previousItems, ...todayItems], [previousItems, todayItems]);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(() =>
    getInitialSelection(allItems),
  );
  const [customTaskInput, setCustomTaskInput] = useState('');
  const [customTasks, setCustomTasks] = useState<string[]>([]);
  const [previewText, setPreviewText] = useState(() =>
    generateDailyReportText({
      reportDate,
      previousDate,
      previousItems,
      todayItems,
      customTasks: [],
    }),
  );
  const [copyStatus, setCopyStatus] = useState('');

  const selectedPreviousItems = useMemo(
    () => previousItems.filter((item) => selectedItems[item.id]),
    [previousItems, selectedItems],
  );
  const selectedTodayItems = useMemo(
    () => todayItems.filter((item) => selectedItems[item.id]),
    [selectedItems, todayItems],
  );

  useEffect(() => {
    setPreviewText(
      generateDailyReportText({
        reportDate,
        previousDate,
        previousItems: selectedPreviousItems,
        todayItems: selectedTodayItems,
        customTasks,
      }),
    );
  }, [customTasks, previousDate, reportDate, selectedPreviousItems, selectedTodayItems]);

  function toggleItem(itemId: string) {
    setSelectedItems((currentSelection) => ({
      ...currentSelection,
      [itemId]: !currentSelection[itemId],
    }));
  }

  function addCustomTask() {
    const nextTask = customTaskInput.trim();

    if (!nextTask) {
      return;
    }

    setCustomTasks((currentTasks) => [...currentTasks, nextTask]);
    setCustomTaskInput('');
  }

  function removeCustomTask(indexToRemove: number) {
    setCustomTasks((currentTasks) =>
      currentTasks.filter((_, currentIndex) => currentIndex !== indexToRemove),
    );
  }

  async function copyPreview() {
    try {
      await navigator.clipboard.writeText(previewText);
      setCopyStatus(t('copied'));
    } catch {
      setCopyStatus(t('copyFailed'));
    }
  }

  function renderWorklogItem(item: ReportWorklogItem) {
    return (
      <label
        key={item.id}
        className="flex gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
      >
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-slate-300"
          checked={selectedItems[item.id] ?? false}
          onChange={() => toggleItem(item.id)}
        />
        <span>
          <span className="font-medium text-slate-900">
            {item.taskCode}: {item.taskTitle}
          </span>
          <span className="ml-2 text-slate-500">{item.hours}h</span>
          {item.note ? <span className="block text-xs text-slate-500">{item.note}</span> : null}
        </span>
      </label>
    );
  }

  return (
    <Modal
      title={t('dailyReportBuilder')}
      closeLabel={t('closeModal')}
      maxWidthClassName="max-w-4xl"
      onClose={onClose}
    >
      <div className="grid gap-5 px-5 py-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="space-y-5">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-950">
              {t('previousWorkday')}
              {previousDate ? ` (${previousDate})` : ''}
            </h3>
            {previousItems.length > 0 ? (
              <div className="space-y-2">{previousItems.map(renderWorklogItem)}</div>
            ) : (
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                {t('noLoggedWorkLast7Days')}
              </p>
            )}
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-950">
              {t('today')} ({reportDate})
            </h3>
            {todayItems.length > 0 ? (
              <div className="space-y-2">{todayItems.map(renderWorklogItem)}</div>
            ) : (
              <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                {t('noLoggedWorkSelectedDate')}
              </p>
            )}
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-950">{t('customTasks')}</h3>
            <div className="flex gap-2">
              <input
                className="h-10 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
                value={customTaskInput}
                onChange={(event) => setCustomTaskInput(event.target.value)}
                placeholder={t('addReportOnlyTask')}
              />
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white hover:bg-slate-800"
                onClick={addCustomTask}
                aria-label={t('addCustomTask')}
                title={t('addCustomTask')}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {customTasks.length > 0 ? (
              <div className="space-y-2">
                {customTasks.map((task, index) => (
                  <div
                    key={`${task}-${index}`}
                    className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700"
                  >
                    <span>{task}</span>
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-700 hover:bg-red-50"
                      onClick={() => removeCustomTask(index)}
                      aria-label={t('removeCustomTask')}
                      title={t('removeCustomTask')}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-950">{t('preview')}</h3>
            <div className="flex items-center gap-2">
              {copyStatus ? <span className="text-xs text-slate-500">{copyStatus}</span> : null}
              <button
                type="button"
                className="inline-flex min-h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800"
                onClick={copyPreview}
              >
                <Clipboard className="h-4 w-4" aria-hidden="true" />
                {t('copy')}
              </button>
            </div>
          </div>
          <textarea
            className="min-h-[520px] w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm leading-6 text-slate-800 outline-none focus:border-slate-500"
            value={previewText}
            onChange={(event) => setPreviewText(event.target.value)}
          />
        </section>
      </div>
    </Modal>
  );
}
