import { useState, type FormEvent } from 'react';
import { Modal } from './Modal';
import { translate } from '../helpers/i18n';
import { quickLogHourOptions } from '../helpers/quickLog';
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
  const formatQuickHour = (hourValue: number) =>
    language === 'vi' ? hourValue.toString().replace('.', ',') : hourValue.toString();

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
        <label className="label block">
          <span>{t('hours')}</span>
          <input
            className="field"
            min="0"
            step="0.25"
            type="number"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
          />
        </label>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">{t('quickHourOptions')}</p>
          <div className="flex flex-wrap gap-2">
            {quickLogHourOptions.map((hourOption) => (
              <button
                key={hourOption}
                type="button"
                className="btn-secondary min-h-8 px-3"
                onClick={() => setHours(hourOption.toString())}
              >
                {formatQuickHour(hourOption)}h
              </button>
            ))}
          </div>
        </div>
        <label className="label block">
          <span>{t('note')}</span>
          <textarea
            className="textarea-field min-h-24 resize-y"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        <div className="flex justify-end gap-2 border-t border-slate-200/80 pt-4">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            {t('saveHours')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
