export type TaskType = 'feature' | 'bug' | 'chore' | 'research' | 'meeting';

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type WeekStart = 'monday' | 'sunday';

export type AIProvider = 'disabled' | 'gemini' | 'openai-compatible' | 'ollama' | 'lm-studio';

export type Task = {
  id: string;
  code: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type WorklogEntry = {
  id: string;
  taskId: string;
  date: string;
  hours: number;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type DailyReport = {
  id: string;
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type AISettings = {
  enabled: boolean;
  provider: AIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
};

export type Settings = {
  defaultWorkHoursPerDay: number;
  weekStart: WeekStart;
  ai: AISettings;
};

export type AppData = {
  version: number;
  settings: Settings;
  tasks: Task[];
  worklogs: WorklogEntry[];
  dailyReports: DailyReport[];
};

export type TaskFormData = {
  code: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
};

export type WorklogFormData = {
  taskId: string;
  date: string;
  hours: number;
  note: string;
};

export type GeneratedTask = {
  taskCode: string;
  taskTitle: string;
  taskDescription: string;
  taskType: TaskType;
};
