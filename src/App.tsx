import { useEffect, useState } from 'react';
import { CalendarDays, Settings, Sparkles } from 'lucide-react';
import { AppShell } from './components/AppShell';
import { addTask, deleteTask, saveWorklog, updateTask } from './helpers/appDataHelper';
import { AITaskGeneratorPage } from './pages/AITaskGeneratorPage';
import { SettingsPage } from './pages/SettingsPage';
import { TimelinePage } from './pages/TimelinePage';
import { loadAppData, saveAppData } from './services/storageService';
import type { TaskFormData, WorklogFormData } from './types/worklog';

type PageKey = 'timeline' | 'ai-task-generator' | 'settings';

const pages = [
  {
    key: 'timeline',
    label: 'Timeline',
    icon: CalendarDays,
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
    'ai-task-generator': <AITaskGeneratorPage />,
    settings: <SettingsPage settings={appData.settings} />,
  }[activePage];

  return (
    <AppShell activePage={activePage} pages={pages} onPageChange={setActivePage}>
      {pageContent}
    </AppShell>
  );
}

export default App;
