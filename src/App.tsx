import { useEffect, useRef, useState } from 'react';
import { CalendarDays, FileText, Settings, Sparkles } from 'lucide-react';
import { AppShell } from './components/AppShell';
import {
  addTask,
  addTodayWorklog,
  deleteWorklog,
  markWorklogLogged,
  updateTodayWorklog,
  updateSettings,
} from './helpers/appDataHelper';
import { AITaskGeneratorPage } from './pages/AITaskGeneratorPage';
import { DailyReportPage } from './pages/DailyReportPage';
import { SettingsPage } from './pages/SettingsPage';
import { TimelinePage } from './pages/TimelinePage';
import { createDefaultAppData, loadAppData, saveAppData } from './services/storageService';
import { translate } from './helpers/i18n';
import type {
  Settings as AppSettings,
  TaskFormData,
  TodayWorklogFormData,
  TodayWorklogUpdateData,
} from './types/worklog';

type PageKey = 'timeline' | 'daily-report' | 'ai-task-generator' | 'settings';

function App() {
  const [activePage, setActivePage] = useState<PageKey>('timeline');
  const [appData, setAppData] = useState(createDefaultAppData);
  const [hasLoadedStoredData, setHasLoadedStoredData] = useState(false);
  const saveTimeoutRef = useRef<number | undefined>();
  const language = appData.settings.language;
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const pages = [
    {
      key: 'timeline',
      label: t('todayWorklog'),
      icon: CalendarDays,
    },
    {
      key: 'daily-report',
      label: t('dailyReport'),
      icon: FileText,
    },
    {
      key: 'ai-task-generator',
      label: t('aiTaskGenerator'),
      icon: Sparkles,
    },
    {
      key: 'settings',
      label: t('settings'),
      icon: Settings,
    },
  ] satisfies Array<{
    key: PageKey;
    label: string;
    icon: typeof CalendarDays;
  }>;

  useEffect(() => {
    let isMounted = true;

    loadAppData()
      .then((storedData) => {
        if (!isMounted) {
          return;
        }

        setAppData(storedData);
        setHasLoadedStoredData(true);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setHasLoadedStoredData(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredData) {
      return undefined;
    }

    window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      saveAppData(appData).catch(() => {
        // Keep the UI responsive even if browser storage is temporarily unavailable.
      });
    }, 600);

    return () => {
      window.clearTimeout(saveTimeoutRef.current);
    };
  }, [appData, hasLoadedStoredData]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', appData.settings.theme === 'dark');
  }, [appData.settings.theme]);

  const pageContent = {
    timeline: (
      <TimelinePage
        tasks={appData.tasks}
        language={language}
        weekStart={appData.settings.weekStart}
        worklogs={appData.worklogs}
        onAddTodayWorklog={(worklogData: TodayWorklogFormData) =>
          setAppData((currentData) => addTodayWorklog(currentData, worklogData))
        }
        onDeleteWorklog={(worklogId: string) =>
          setAppData((currentData) => deleteWorklog(currentData, worklogId))
        }
        onMarkWorklogLogged={(worklogId: string) =>
          setAppData((currentData) => markWorklogLogged(currentData, worklogId))
        }
        onUpdateTodayWorklog={(worklogData: TodayWorklogUpdateData) =>
          setAppData((currentData) => updateTodayWorklog(currentData, worklogData))
        }
      />
    ),
    'daily-report': (
      <DailyReportPage language={language} tasks={appData.tasks} worklogs={appData.worklogs} />
    ),
    'ai-task-generator': (
      <AITaskGeneratorPage
        language={language}
        settings={appData.settings.ai}
        onAddTask={(taskData: TaskFormData) =>
          setAppData((currentData) => addTask(currentData, taskData))
        }
      />
    ),
    settings: (
      <SettingsPage
        language={language}
        settings={appData.settings}
        onUpdateSettings={(settings: AppSettings) =>
          setAppData((currentData) => updateSettings(currentData, settings))
        }
      />
    ),
  }[activePage];

  return (
    <AppShell
      activePage={activePage}
      navLabel={t('primaryNavigation')}
      pages={pages}
      subtitle={t('appSubtitle')}
      onPageChange={setActivePage}
    >
      {pageContent}
    </AppShell>
  );
}

export default App;
