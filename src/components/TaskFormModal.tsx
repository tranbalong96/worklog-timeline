import { useState, type FormEvent } from 'react';
import { Modal } from './Modal';
import { translate } from '../helpers/i18n';
import type { AppLanguage, Task, TaskFormData, TaskStatus, TaskType } from '../types/worklog';

const taskTypes: TaskType[] = ['feature', 'bug', 'chore', 'research', 'meeting'];
const taskStatuses: TaskStatus[] = ['todo', 'in-progress', 'done'];

type TaskFormModalProps = {
  language: AppLanguage;
  task?: Task;
  onClose: () => void;
  onSave: (taskData: TaskFormData) => void;
};

export function TaskFormModal({ language, task, onClose, onSave }: TaskFormModalProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
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
    <Modal title={task ? t('editTask') : t('addTaskTitle')} closeLabel={t('closeModal')} onClose={onClose}>
      <form className="space-y-4 px-5 py-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="label">
            <span>{t('taskCodeOptional')}</span>
            <input
              className="field"
              value={formData.code}
              onChange={(event) => updateField('code', event.target.value)}
            />
          </label>
          <label className="label">
            <span>{t('status')}</span>
            <select
              className="field"
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
        <label className="label block">
          <span>{t('title')}</span>
          <input
            className="field"
            value={formData.title}
            onChange={(event) => updateField('title', event.target.value)}
            required
          />
        </label>
        <label className="label block">
          <span>{t('description')}</span>
          <textarea
            className="textarea-field min-h-24 resize-y"
            value={formData.description}
            onChange={(event) => updateField('description', event.target.value)}
          />
        </label>
        <label className="label block">
          <span>{t('type')}</span>
          <select
            className="field"
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
            {t('saveTask')}
          </button>
        </div>
      </form>
    </Modal>
  );
}
