import { useState } from 'react';
import { CalendarDays, Settings, Sparkles } from 'lucide-react';
import { AppShell } from './components/AppShell';
import { AITaskGeneratorPage } from './pages/AITaskGeneratorPage';
import { SettingsPage } from './pages/SettingsPage';
import { TimelinePage } from './pages/TimelinePage';

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

  const pageContent = {
    timeline: <TimelinePage />,
    'ai-task-generator': <AITaskGeneratorPage />,
    settings: <SettingsPage />,
  }[activePage];

  return (
    <AppShell activePage={activePage} pages={pages} onPageChange={setActivePage}>
      {pageContent}
    </AppShell>
  );
}

export default App;
