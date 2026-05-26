import { Download, RotateCcw, Upload } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';
import {
  createDefaultAppData,
  exportAppDataToJson,
  importAppDataFromJson,
} from '../services/storageService';
import type { AIProvider, AISettings, AppData, Settings, WeekStart } from '../types/worklog';

type SettingsPageProps = {
  appData: AppData;
  settings: Settings;
  onReplaceAppData: (appData: AppData) => void;
  onUpdateSettings: (settings: Settings) => void;
};

const providerOptions: Array<{ value: AIProvider; label: string }> = [
  { value: 'disabled', label: 'Disabled' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'openai-compatible', label: 'OpenAI-compatible' },
  { value: 'ollama', label: 'Ollama' },
  { value: 'lm-studio', label: 'LM Studio' },
];

const providerDefaults: Record<AIProvider, Pick<AISettings, 'baseUrl' | 'model' | 'temperature'>> = {
  disabled: {
    baseUrl: '',
    model: '',
    temperature: 0.2,
  },
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com',
    model: 'gemini-1.5-flash',
    temperature: 0.2,
  },
  'openai-compatible': {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    temperature: 0.2,
  },
  ollama: {
    baseUrl: 'http://localhost:11434',
    model: 'llama3.1',
    temperature: 0.2,
  },
  'lm-studio': {
    baseUrl: 'http://localhost:1234/v1',
    model: 'local-model',
    temperature: 0.2,
  },
};

export function SettingsPage({
  appData,
  settings,
  onReplaceAppData,
  onUpdateSettings,
}: SettingsPageProps) {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [backupMessage, setBackupMessage] = useState('');

  function updateGeneralSettings(nextSettings: Partial<Settings>) {
    onUpdateSettings({
      ...settings,
      ...nextSettings,
    });
  }

  function updateAISettings(nextAISettings: Partial<AISettings>) {
    onUpdateSettings({
      ...settings,
      ai: {
        ...settings.ai,
        ...nextAISettings,
      },
    });
  }

  function updateProvider(provider: AIProvider) {
    const providerDefault = providerDefaults[provider];

    updateAISettings({
      enabled: provider !== 'disabled',
      provider,
      ...providerDefault,
    });
  }

  function exportJson() {
    const backupJson = exportAppDataToJson(appData);
    const backupBlob = new Blob([backupJson], {
      type: 'application/json',
    });
    const backupUrl = URL.createObjectURL(backupBlob);
    const downloadLink = document.createElement('a');

    downloadLink.href = backupUrl;
    downloadLink.download = `worklog-timeline-backup-${new Date().toISOString().slice(0, 10)}.json`;
    downloadLink.click();
    URL.revokeObjectURL(backupUrl);
    setBackupMessage('Backup exported.');
  }

  function requestImportJson() {
    importInputRef.current?.click();
  }

  function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const fileContent = typeof reader.result === 'string' ? reader.result : '';
      const importResult = importAppDataFromJson(fileContent);

      if (!importResult.ok) {
        setBackupMessage(importResult.error);
        return;
      }

      const shouldReplace = window.confirm(
        'Importing this backup will replace all current Worklog Timeline data. Continue?',
      );

      if (!shouldReplace) {
        setBackupMessage('Import cancelled.');
        return;
      }

      onReplaceAppData(importResult.data);
      setBackupMessage('Backup imported.');
    };

    reader.onerror = () => {
      setBackupMessage('Could not read the selected file.');
    };

    reader.readAsText(file);
  }

  function resetData() {
    const shouldReset = window.confirm(
      'Reset all Worklog Timeline data to default mock data? This replaces current tasks, worklogs, reports, and settings.',
    );

    if (!shouldReset) {
      setBackupMessage('Reset cancelled.');
      return;
    }

    onReplaceAppData(createDefaultAppData());
    setBackupMessage('Data reset.');
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">Settings</h2>
        <p className="mt-1 text-sm text-slate-600">
          Configure worklog defaults and optional AI provider details.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-950">General</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Default work hours per day</span>
            <input
              type="number"
              min="1"
              max="24"
              step="0.25"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
              value={settings.defaultWorkHoursPerDay}
              onChange={(event) =>
                updateGeneralSettings({
                  defaultWorkHoursPerDay: Number(event.target.value) || 8,
                })
              }
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Week start</span>
            <select
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
              value={settings.weekStart}
              onChange={(event) =>
                updateGeneralSettings({
                  weekStart: event.target.value as WeekStart,
                })
              }
            >
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">AI Provider</h3>
            <p className="mt-1 text-sm text-slate-500">
              API keys are stored locally in this browser.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
              checked={settings.ai.enabled}
              onChange={(event) =>
                updateAISettings({
                  enabled: event.target.checked,
                  provider: event.target.checked ? settings.ai.provider : 'disabled',
                })
              }
            />
            Enabled
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Provider</span>
            <select
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
              value={settings.ai.provider}
              onChange={(event) => updateProvider(event.target.value as AIProvider)}
            >
              {providerOptions.map((provider) => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>API key</span>
            <input
              type="password"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
              value={settings.ai.apiKey}
              onChange={(event) => updateAISettings({ apiKey: event.target.value })}
              placeholder="Stored in browser localStorage"
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Base URL</span>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
              value={settings.ai.baseUrl}
              onChange={(event) => updateAISettings({ baseUrl: event.target.value })}
              placeholder="Provider endpoint"
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Model</span>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
              value={settings.ai.model}
              onChange={(event) => updateAISettings({ model: event.target.value })}
              placeholder="Model name"
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700 sm:col-span-2">
            <span>Temperature: {settings.ai.temperature}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              className="w-full"
              value={settings.ai.temperature}
              onChange={(event) => updateAISettings({ temperature: Number(event.target.value) })}
            />
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Backup And Restore</h3>
          <p className="mt-1 text-sm text-slate-500">
            Export a JSON backup, restore from a backup file, or reset this browser data.
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
            onClick={exportJson}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export JSON
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
            onClick={requestImportJson}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Import JSON
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-red-50 px-4 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-100"
            onClick={resetData}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset Data
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={importJson}
          />
        </div>
        {backupMessage ? <p className="mt-3 text-sm text-slate-600">{backupMessage}</p> : null}
      </div>
    </section>
  );
}
