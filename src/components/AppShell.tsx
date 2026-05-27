import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type AppShellPage<Key extends string> = {
  key: Key;
  label: string;
  icon: LucideIcon;
};

type AppShellProps<Key extends string> = {
  activePage: Key;
  children: ReactNode;
  navLabel: string;
  pages: AppShellPage<Key>[];
  subtitle: string;
  onPageChange: (page: Key) => void;
};

export function AppShell<Key extends string>({
  activePage,
  children,
  navLabel,
  pages,
  subtitle,
  onPageChange,
}: AppShellProps<Key>) {
  return (
    <div className="app-surface">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/70 backdrop-blur-2xl dark:border-slate-800/80 dark:bg-slate-950/70">
        <div className="app-container flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">{subtitle}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">
              Worklog Timeline
            </h1>
          </div>
          <nav
            className="flex gap-2 overflow-x-auto rounded-lg border border-slate-200/70 bg-slate-100/70 p-1 shadow-inner dark:border-slate-800 dark:bg-slate-900/70"
            aria-label={navLabel}
          >
            {pages.map((page) => {
              const Icon = page.icon;
              const isActive = page.key === activePage;

              return (
                <button
                  key={page.key}
                  type="button"
                  className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950'
                      : 'text-slate-600 hover:bg-white/80 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => onPageChange(page.key)}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{page.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="app-container py-6 lg:py-8">{children}</main>
    </div>
  );
}
