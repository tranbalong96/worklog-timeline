import { translate } from '../helpers/i18n';
import type {
  AIProvider,
  AISettings,
  AppLanguage,
  AppTheme,
  Settings,
  WeekStart,
} from '../types/worklog';

type SettingsPageProps = {
  language: AppLanguage;
  settings: Settings;
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
  language,
  settings,
  onUpdateSettings,
}: SettingsPageProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);

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
              placeholder="Stored locally in this browser"
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
    </section>
  );
}
