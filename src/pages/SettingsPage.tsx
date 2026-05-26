import type { AIProvider, AISettings, Settings, WeekStart } from '../types/worklog';

type SettingsPageProps = {
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

export function SettingsPage({ settings, onUpdateSettings }: SettingsPageProps) {
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
    </section>
  );
}
