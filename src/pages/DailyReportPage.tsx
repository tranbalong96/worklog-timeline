import { FileText } from 'lucide-react';
import { useState } from 'react';
import { DailyReportModal } from '../components/DailyReportModal';
import { formatDateKey } from '../helpers/dateHelper';
import { translate } from '../helpers/i18n';
import type { AppLanguage, Task, WorklogEntry } from '../types/worklog';

type DailyReportPageProps = {
  language: AppLanguage;
  tasks: Task[];
  worklogs: WorklogEntry[];
};

export function DailyReportPage({ language, tasks, worklogs }: DailyReportPageProps) {
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const [reportDate, setReportDate] = useState(() => formatDateKey(new Date()));
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  return (
    <section className="space-y-5">
      <div>
        <p className="eyebrow">{t('reportBuilderEyebrow')}</p>
        <h2 className="section-title mt-1">{t('dailyReport')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('dailyReportSubtitle')}</p>
      </div>

      <div className="app-panel p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="label">
            <span>{t('reportDate')}</span>
            <input
              type="date"
              className="field sm:w-48"
              value={reportDate}
              onChange={(event) => setReportDate(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setIsBuilderOpen(true)}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            {t('buildReport')}
          </button>
        </div>
      </div>

      {isBuilderOpen ? (
        <DailyReportModal
          language={language}
          reportDate={reportDate}
          tasks={tasks}
          worklogs={worklogs}
          onClose={() => setIsBuilderOpen(false)}
        />
      ) : null}
    </section>
  );
}
