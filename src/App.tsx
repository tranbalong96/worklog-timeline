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
import type { Settings as AppSettings, TaskFormData, WorklogFormData } from './types/worklog';

type PageKey = 'timeline' | 'daily-report' | 'ai-task-generator' | 'settings';

const pages = [
  {
    key: 'timeline',
    label: 'Timeline',
    icon: CalendarDays,
  },
  {
    key: 'daily-report',
    label: 'Daily Report',
    icon: FileText,
  },
  {
    key: 'ai-task-generator',
    label: 'AI Task Generator',
    icon: Sparkles,
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings,
  },
] satisfies Array<{
  key: PageKey;
  label: string;
  icon: typeof CalendarDays;
}>;

function App() {
  const [activePage, setActivePage] = useState<PageKey>('timeline');
  const [appData, setAppData] = useState(loadAppData);

  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  const pageContent = {
    timeline: (
      <TimelinePage
        tasks={appData.tasks}
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
    'daily-report': <DailyReportPage tasks={appData.tasks} worklogs={appData.worklogs} />,
    'ai-task-generator': (
      <AITaskGeneratorPage
        settings={appData.settings.ai}
        onAddTask={(taskData: TaskFormData) =>
          setAppData((currentData) => addTask(currentData, taskData))
        }
      />
    ),
    settings: (
      <SettingsPage
        appData={appData}
        settings={appData.settings}
        onReplaceAppData={setAppData}
        onUpdateSettings={(settings: AppSettings) =>
          setAppData((currentData) => updateSettings(currentData, settings))
        }
      />
    ),
  }[activePage];

  return (
    <AppShell activePage={activePage} pages={pages} onPageChange={setActivePage}>
      {pageContent}
    </AppShell>
  );
}

export default App;
