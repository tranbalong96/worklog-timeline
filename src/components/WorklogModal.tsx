import { useState, type FormEvent } from 'react';
import { Modal } from './Modal';
import { translate } from '../helpers/i18n';
import type { AppLanguage, Task, WorklogEntry, WorklogFormData } from '../types/worklog';

type WorklogModalProps = {
  date: string;
  language: AppLanguage;
  task: Task;
  worklog?: WorklogEntry;
  onClose: () => void;
  onSave: (worklogData: WorklogFormData) => void;
};

export function WorklogModal({ date, language, task, worklog, onClose, onSave }: WorklogModalProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const [hours, setHours] = useState(worklog?.hours.toString() ?? '0');
  const [note, setNote] = useState(worklog?.note ?? '');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({
      taskId: task.id,
      date,
      hours: Number(hours) || 0,
      note: note.trim(),
    });
  }

  return (
    <Modal title={t('logHours')} closeLabel={t('closeModal')} onClose={onClose}>
      <form className="space-y-4 px-5 py-5" onSubmit={handleSubmit}>
        <div>
          {task.code ? <p className="text-sm font-semibold text-slate-950">{task.code}</p> : null}
          <p className="mt-1 text-sm text-slate-600">{task.title}</p>
          <p className="mt-1 text-xs text-slate-500">{date}</p>
        </div>
        <label className="block space-y-1 text-sm font-medium text-slate-700">
          <span>{t('hours')}</span>
          <input
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
            min="0"
            step="0.25"
            type="number"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm font-medium text-slate-700">
          <span>{t('note')}</span>
          <textarea
            className="min-h-24 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button
            type="button"
            className="inline-flex min-h-10 items-center rounded-md px-4 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
            onClick={onClose}
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="inline-flex min-h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800"
          >
            {t('saveHours')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
