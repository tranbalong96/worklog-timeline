import { useState, type FormEvent } from 'react';
import { Modal } from './Modal';
import type { Task, WorklogEntry, WorklogFormData } from '../types/worklog';

type WorklogModalProps = {
  date: string;
  task: Task;
  worklog?: WorklogEntry;
  onClose: () => void;
  onSave: (worklogData: WorklogFormData) => void;
};

export function WorklogModal({ date, task, worklog, onClose, onSave }: WorklogModalProps) {
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
    <Modal title="Log Hours" onClose={onClose}>
      <form className="space-y-4 px-5 py-5" onSubmit={handleSubmit}>
        <div>
          <p className="text-sm font-semibold text-slate-950">{task.code}</p>
          <p className="mt-1 text-sm text-slate-600">{task.title}</p>
          <p className="mt-1 text-xs text-slate-500">{date}</p>
        </div>
        <label className="block space-y-1 text-sm font-medium text-slate-700">
          <span>Hours</span>
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
          <span>Note</span>
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
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex min-h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800"
          >
            Save hours
          </button>
        </div>
      </form>
    </Modal>
  );
}
