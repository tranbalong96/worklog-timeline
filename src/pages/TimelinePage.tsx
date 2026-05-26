import type { Task, WorklogEntry } from '../types/worklog';

type TimelinePageProps = {
  tasks: Task[];
  worklogs: WorklogEntry[];
};

export function TimelinePage({ tasks, worklogs }: TimelinePageProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">Timeline</h2>
        <p className="mt-1 text-sm text-slate-600">
          Loaded {tasks.length} tasks and {worklogs.length} worklog entries from local data.
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="grid min-w-[720px] grid-cols-[1.5fr_repeat(5,1fr)] border-b border-slate-200 bg-slate-100 text-sm font-medium text-slate-600">
          <div className="px-4 py-3">Task</div>
          <div className="px-4 py-3">Mon</div>
          <div className="px-4 py-3">Tue</div>
          <div className="px-4 py-3">Wed</div>
          <div className="px-4 py-3">Thu</div>
          <div className="px-4 py-3">Fri</div>
        </div>
        <div className="grid min-w-[720px] grid-cols-[1.5fr_repeat(5,1fr)] text-sm text-slate-500">
          <div className="px-4 py-5 font-medium text-slate-700">
            {tasks[0]?.title ?? 'No tasks yet'}
          </div>
          <div className="px-4 py-5">0h</div>
          <div className="px-4 py-5">0h</div>
          <div className="px-4 py-5">0h</div>
          <div className="px-4 py-5">0h</div>
          <div className="px-4 py-5">0h</div>
        </div>
      </div>
    </section>
  );
}
