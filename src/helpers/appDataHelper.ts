import type {
  AppData,
  Settings,
  Task,
  TaskFormData,
  WorklogEntry,
  WorklogFormData,
} from '../types/worklog';

function getTimestamp(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function addTask(appData: AppData, taskData: TaskFormData): AppData {
  const now = getTimestamp();
  const task: Task = {
    id: createId('task'),
    ...taskData,
    createdAt: now,
    updatedAt: now,
  };

  return {
    ...appData,
    tasks: [...appData.tasks, task],
  };
}

export function updateTask(appData: AppData, taskId: string, taskData: TaskFormData): AppData {
  return {
    ...appData,
    tasks: appData.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            ...taskData,
            updatedAt: getTimestamp(),
          }
        : task,
    ),
  };
}

export function deleteTask(appData: AppData, taskId: string): AppData {
  return {
    ...appData,
    tasks: appData.tasks.filter((task) => task.id !== taskId),
    worklogs: appData.worklogs.filter((worklog) => worklog.taskId !== taskId),
  };
}

export function saveWorklog(appData: AppData, worklogData: WorklogFormData): AppData {
  const existingWorklog = appData.worklogs.find(
    (worklog) => worklog.taskId === worklogData.taskId && worklog.date === worklogData.date,
  );
  const remainingWorklogs = appData.worklogs.filter(
    (worklog) => !(worklog.taskId === worklogData.taskId && worklog.date === worklogData.date),
  );

  if (worklogData.hours <= 0) {
    return {
      ...appData,
      worklogs: remainingWorklogs,
    };
  }

  const now = getTimestamp();
  const worklog: WorklogEntry = {
    id: existingWorklog?.id ?? createId('worklog'),
    taskId: worklogData.taskId,
    date: worklogData.date,
    hours: worklogData.hours,
    note: worklogData.note,
    createdAt: existingWorklog?.createdAt ?? now,
    updatedAt: now,
  };

  return {
    ...appData,
    worklogs: [...remainingWorklogs, worklog],
  };
}

export function updateSettings(appData: AppData, settings: Settings): AppData {
  return {
    ...appData,
    settings,
  };
}
