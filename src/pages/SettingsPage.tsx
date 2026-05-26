import { Download, RotateCcw, Upload } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { translate } from '../helpers/i18n';
import {
  createDefaultAppData,
  exportAppDataToJson,
  importAppDataFromJson,
} from '../services/storageService';
import type {
  AIProvider,
  AISettings,
  AppData,
  AppLanguage,
  AppTheme,
  Settings,
  WeekStart,
} from '../types/worklog';

type SettingsPageProps = {
  appData: AppData;
  language: AppLanguage;
  settings: Settings;
  onReplaceAppData: (appData: AppData) => void;
  onUpdateSettings: (settings: Settings) => void;
};

type PendingConfirmation =
  | {
      kind: 'import';
      data: AppData;
    }
  | {
      kind: 'reset';
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
  language,
  settings,
  onReplaceAppData,
  onUpdateSettings,
}: SettingsPageProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [backupMessage, setBackupMessage] = useState('');
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | undefined>();

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
    setBackupMessage(t('backupExported'));
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
        setBackupMessage(
          importResult.error.includes('valid JSON') ? t('importInvalidJson') : t('importInvalidFormat'),
        );
        return;
      }

      setPendingConfirmation({ kind: 'import', data: importResult.data });
    };

    reader.onerror = () => {
      setBackupMessage(t('fileReadError'));
    };

    reader.readAsText(file);
  }

  function resetData() {
    setPendingConfirmation({ kind: 'reset' });
  }

  function cancelConfirmation() {
    if (pendingConfirmation?.kind === 'import') {
      setBackupMessage(t('importCancelled'));
    }

    if (pendingConfirmation?.kind === 'reset') {
      setBackupMessage(t('resetCancelled'));
    }

    setPendingConfirmation(undefined);
  }

  function confirmPendingAction() {
    if (!pendingConfirmation) {
      return;
    }

    if (pendingConfirmation.kind === 'import') {
      onReplaceAppData(pendingConfirmation.data);
      setBackupMessage(t('backupImported'));
    } else {
      onReplaceAppData(createDefaultAppData());
      setBackupMessage(t('dataReset'));
    }

    setPendingConfirmation(undefined);
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">{t('settings')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('settingsSubtitle')}</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-slate-950">{t('general')}</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>{t('defaultWorkHoursPerDay')}</span>
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
            <span>{t('weekStart')}</span>
            <select
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
              value={settings.weekStart}
              onChange={(event) =>
                updateGeneralSettings({
                  weekStart: event.target.value as WeekStart,
                })
              }
            >
              <option value="monday">{t('monday')}</option>
              <option value="sunday">{t('sunday')}</option>
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>{t('language')}</span>
            <select
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
              value={settings.language}
              onChange={(event) =>
                updateGeneralSettings({
                  language: event.target.value as AppLanguage,
                })
              }
            >
              <option value="en">{t('english')}</option>
              <option value="vi">{t('vietnamese')}</option>
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>{t('theme')}</span>
            <select
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
              value={settings.theme}
              onChange={(event) =>
                updateGeneralSettings({
                  theme: event.target.value as AppTheme,
                })
              }
            >
              <option value="light">{t('light')}</option>
              <option value="dark">{t('dark')}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">{t('aiProvider')}</h3>
            <p className="mt-1 text-sm text-slate-500">{t('apiKeyLocalNote')}</p>
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
            {t('enabled')}
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>{t('provider')}</span>
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
            <span>{t('apiKey')}</span>
            <input
              type="password"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
              value={settings.ai.apiKey}
              onChange={(event) => updateAISettings({ apiKey: event.target.value })}
              placeholder="Stored in browser localStorage"
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>{t('baseUrl')}</span>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
              value={settings.ai.baseUrl}
              onChange={(event) => updateAISettings({ baseUrl: event.target.value })}
              placeholder="Provider endpoint"
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>{t('model')}</span>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
              value={settings.ai.model}
              onChange={(event) => updateAISettings({ model: event.target.value })}
              placeholder="Model name"
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700 sm:col-span-2">
            <span>
              {t('temperature')}: {settings.ai.temperature}
            </span>
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
          <h3 className="text-sm font-semibold text-slate-950">{t('backupAndRestore')}</h3>
          <p className="mt-1 text-sm text-slate-500">{t('backupSubtitle')}</p>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
            onClick={exportJson}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {t('exportJson')}
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100"
            onClick={requestImportJson}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            {t('importJson')}
          </button>
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-red-50 px-4 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-100"
            onClick={resetData}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t('resetData')}
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
      {pendingConfirmation ? (
        <ConfirmDialog
          cancelLabel={t('cancel')}
          closeLabel={t('closeModal')}
          confirmLabel={t('confirm')}
          destructive
          message={
            pendingConfirmation.kind === 'import'
              ? t('importConfirmMessage')
              : t('resetConfirmMessage')
          }
          title={
            pendingConfirmation.kind === 'import' ? t('importConfirmTitle') : t('resetConfirmTitle')
          }
          onCancel={cancelConfirmation}
          onConfirm={confirmPendingAction}
        />
      ) : null}
    </section>
  );
}
