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
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-medium text-slate-500">{subtitle}</p>
            <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
              Worklog Timeline
            </h1>
          </div>
          <nav className="flex gap-2 overflow-x-auto" aria-label={navLabel}>
            {pages.map((page) => {
              const Icon = page.icon;
              const isActive = page.key === activePage;

              return (
                <button
                  key={page.key}
                  type="button"
                  className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-950 text-white shadow-sm'
                      : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-100'
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
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
