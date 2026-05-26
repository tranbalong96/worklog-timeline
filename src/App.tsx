import { useEffect, useState } from 'react';
import { CalendarDays, FileText, Settings, Sparkles } from 'lucide-react';
import { AppShell } from './components/AppShell';
import {
  addTask,
  deleteTask,
  saveWorklog,
  updateSettings,
  updateTask,
} from './helpers/appDataHelper';
import { AITaskGeneratorPage } from './pages/AITaskGeneratorPage';
import { DailyReportPage } from './pages/DailyReportPage';
import { SettingsPage } from './pages/SettingsPage';
import { TimelinePage } from './pages/TimelinePage';
import { loadAppData, saveAppData } from './services/storageService';
import { translate } from './helpers/i18n';
import type { Settings as AppSettings, TaskFormData, WorklogFormData } from './types/worklog';

type PageKey = 'timeline' | 'daily-report' | 'ai-task-generator' | 'settings';

function App() {
  const [activePage, setActivePage] = useState<PageKey>('timeline');
  const [appData, setAppData] = useState(loadAppData);
  const language = appData.settings.language;
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key);
  const pages = [
    {
      key: 'timeline',
      label: t('timeline'),
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
    saveAppData(appData);
  }, [appData]);

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
        onCreateTask={(taskData: TaskFormData) =>
          setAppData((currentData) => addTask(currentData, taskData))
        }
        onDeleteTask={(taskId: string) =>
          setAppData((currentData) => deleteTask(currentData, taskId))
        }
        onSaveWorklog={(worklogData: WorklogFormData) =>
          setAppData((currentData) => saveWorklog(currentData, worklogData))
        }
        onUpdateTask={(taskId: string, taskData: TaskFormData) =>
          setAppData((currentData) => updateTask(currentData, taskId, taskData))
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
        appData={appData}
        language={language}
        settings={appData.settings}
        onReplaceAppData={setAppData}
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
