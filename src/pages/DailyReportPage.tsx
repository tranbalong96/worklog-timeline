import { FileText } from 'lucide-react';
import { useState } from 'react';
import { DailyReportModal } from '../components/DailyReportModal';
import { formatDateKey } from '../helpers/dateHelper';
import type { Task, WorklogEntry } from '../types/worklog';

type DailyReportPageProps = {
  tasks: Task[];
  worklogs: WorklogEntry[];
};

export function DailyReportPage({ tasks, worklogs }: DailyReportPageProps) {
  const [reportDate, setReportDate] = useState(() => formatDateKey(new Date()));
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">Daily Report</h2>
        <p className="mt-1 text-sm text-slate-600">
          Build a copy-ready report from existing worklogs and report-only custom tasks.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Report date</span>
            <input
              type="date"
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-500 sm:w-48"
              value={reportDate}
              onChange={(event) => setReportDate(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800"
            onClick={() => setIsBuilderOpen(true)}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Build report
          </button>
        </div>
      </div>

      {isBuilderOpen ? (
        <DailyReportModal
          reportDate={reportDate}
          tasks={tasks}
          worklogs={worklogs}
          onClose={() => setIsBuilderOpen(false)}
        />
      ) : null}
    </section>
  );
}
