import { useState, type FormEvent } from 'react';
import { Modal } from './Modal';
import type { Task, TaskFormData, TaskStatus, TaskType } from '../types/worklog';

const taskTypes: TaskType[] = ['feature', 'bug', 'chore', 'research', 'meeting'];
const taskStatuses: TaskStatus[] = ['todo', 'in-progress', 'done'];

type TaskFormModalProps = {
  task?: Task;
  onClose: () => void;
  onSave: (taskData: TaskFormData) => void;
};

export function TaskFormModal({ task, onClose, onSave }: TaskFormModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    code: task?.code ?? '',
    title: task?.title ?? '',
    description: task?.description ?? '',
    type: task?.type ?? 'feature',
    status: task?.status ?? 'todo',
  });

  function updateField<Field extends keyof TaskFormData>(field: Field, value: TaskFormData[Field]) {
    setFormData((currentData) => ({
      ...currentData,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({
      ...formData,
      code: formData.code.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
    });
  }

  return (
    <Modal title={task ? 'Edit Task' : 'Add Task'} onClose={onClose}>
      <form className="space-y-4 px-5 py-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Task code</span>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
              value={formData.code}
              onChange={(event) => updateField('code', event.target.value)}
              required
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Status</span>
            <select
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
              value={formData.status}
              onChange={(event) => updateField('status', event.target.value as TaskStatus)}
            >
              {taskStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block space-y-1 text-sm font-medium text-slate-700">
          <span>Title</span>
          <input
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
            value={formData.title}
            onChange={(event) => updateField('title', event.target.value)}
            required
          />
        </label>
        <label className="block space-y-1 text-sm font-medium text-slate-700">
          <span>Description</span>
          <textarea
            className="min-h-24 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            value={formData.description}
            onChange={(event) => updateField('description', event.target.value)}
          />
        </label>
        <label className="block space-y-1 text-sm font-medium text-slate-700">
          <span>Type</span>
          <select
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
            value={formData.type}
            onChange={(event) => updateField('type', event.target.value as TaskType)}
          >
            {taskTypes.map((taskType) => (
              <option key={taskType} value={taskType}>
                {taskType}
              </option>
            ))}
          </select>
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
            Save task
          </button>
        </div>
      </form>
    </Modal>
  );
}
