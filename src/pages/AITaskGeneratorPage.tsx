import { AlertTriangle, Plus, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { generateTaskFromNotes } from '../services/aiClient';
import type { AISettings, GeneratedTask, TaskFormData, TaskType } from '../types/worklog';

type AITaskGeneratorPageProps = {
  settings: AISettings;
  onAddTask: (taskData: TaskFormData) => void;
};

const taskTypes: TaskType[] = ['feature', 'bug', 'chore', 'research', 'meeting'];

const emptyPreview: GeneratedTask = {
  taskCode: '',
  taskTitle: '',
  taskDescription: '',
  taskType: 'feature',
};

function isLocalhostProvider(provider: AISettings['provider']): boolean {
  return provider === 'ollama' || provider === 'lm-studio';
}

function isLocalHostName(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

export function AITaskGeneratorPage({ settings, onAddTask }: AITaskGeneratorPageProps) {
  const [notes, setNotes] = useState('');
  const [previewTask, setPreviewTask] = useState<GeneratedTask | undefined>();
  const [rawResponse, setRawResponse] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const showLocalhostWarning = useMemo(() => {
    if (!isLocalhostProvider(settings.provider) || typeof window === 'undefined') {
      return false;
    }

    return !isLocalHostName(window.location.hostname);
  }, [settings.provider]);

  async function handleGenerate() {
    setError('');
    setStatusMessage('');
    setIsLoading(true);

    const result = await generateTaskFromNotes(notes, settings);

    setIsLoading(false);
    setRawResponse(result.rawResponse ?? '');

    if (result.task) {
      setPreviewTask(result.task);
      return;
    }

    setError(result.error ?? 'Unable to generate task.');
    setPreviewTask(emptyPreview);
  }

  function updatePreview<Field extends keyof GeneratedTask>(field: Field, value: GeneratedTask[Field]) {
    setPreviewTask((currentTask) => ({
      ...(currentTask ?? emptyPreview),
      [field]: value,
    }));
  }

  function addPreviewToTimeline() {
    if (!previewTask?.taskCode.trim() || !previewTask.taskTitle.trim()) {
      setError('Task code and title are required before adding to Timeline.');
      return;
    }

    onAddTask({
      code: previewTask.taskCode.trim(),
      title: previewTask.taskTitle.trim(),
      description: previewTask.taskDescription.trim(),
      type: previewTask.taskType,
      status: 'todo',
    });
    setStatusMessage('Task added to Timeline.');
    setError('');
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">AI Task Generator</h2>
        <p className="mt-1 text-sm text-slate-600">
          Convert rough developer notes into an editable task preview.
        </p>
      </div>

      {showLocalhostWarning ? (
        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            Localhost providers usually only work when this app is running on the same machine as
            the model server.
          </p>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-950">Developer notes</h3>
              <p className="mt-1 text-xs text-slate-500">
                Provider: {settings.enabled ? settings.provider : 'disabled'}
              </p>
            </div>
            <button
              type="button"
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              onClick={handleGenerate}
              disabled={isLoading || !settings.enabled || settings.provider === 'disabled'}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {isLoading ? 'Generating' : 'Generate'}
            </button>
          </div>
          <textarea
            className="min-h-56 w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-500"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Paste messy notes, standup updates, or implementation details."
          />
          {!settings.enabled || settings.provider === 'disabled' ? (
            <p className="text-sm text-slate-500">Enable an AI provider in Settings first.</p>
          ) : null}
          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {statusMessage ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {statusMessage}
            </p>
          ) : null}
          {rawResponse ? (
            <label className="block space-y-1 text-sm font-medium text-slate-700">
              <span>Raw response</span>
              <textarea
                className="min-h-32 w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 outline-none focus:border-slate-500"
                value={rawResponse}
                onChange={(event) => setRawResponse(event.target.value)}
              />
            </label>
          ) : null}
        </div>

        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-950">Editable preview</h3>
            <button
              type="button"
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              onClick={addPreviewToTimeline}
              disabled={!previewTask}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add to Timeline
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Task code</span>
              <input
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
                value={previewTask?.taskCode ?? ''}
                onChange={(event) => updatePreview('taskCode', event.target.value)}
                placeholder="WORKLOG-123"
              />
            </label>
            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Task type</span>
              <select
                className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
                value={previewTask?.taskType ?? 'feature'}
                onChange={(event) => updatePreview('taskType', event.target.value as TaskType)}
              >
                {taskTypes.map((taskType) => (
                  <option key={taskType} value={taskType}>
                    {taskType}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block space-y-1 text-sm font-medium text-slate-700">
            <span>Title</span>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
              value={previewTask?.taskTitle ?? ''}
              onChange={(event) => updatePreview('taskTitle', event.target.value)}
              placeholder="Generated task title"
            />
          </label>
          <label className="block space-y-1 text-sm font-medium text-slate-700">
            <span>Description</span>
            <textarea
              className="min-h-56 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={previewTask?.taskDescription ?? ''}
              onChange={(event) => updatePreview('taskDescription', event.target.value)}
              placeholder="Generated task description"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
