import type { Settings } from '../types/worklog';

type SettingsPageProps = {
  settings: Settings;
};

export function SettingsPage({ settings }: SettingsPageProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">Settings</h2>
        <p className="mt-1 text-sm text-slate-600">
          Work hours, week start, and AI provider settings will be configured here.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-700">General</p>
          <p className="mt-1 text-sm text-slate-500">
            {settings.defaultWorkHoursPerDay}h days, week starts on {settings.weekStart}.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-medium text-slate-700">AI Provider</p>
          <p className="mt-1 text-sm text-slate-500">
            {settings.ai.enabled ? settings.ai.provider : 'Disabled'}.
          </p>
        </div>
      </div>
    </section>
  );
}
