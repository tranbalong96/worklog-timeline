import type {
  AppData,
  Settings,
  Task,
  TaskFormData,
  TodayWorklogFormData,
  TodayWorklogUpdateData,
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

  const now = getTimestamp();
  const worklog: WorklogEntry = {
    id: existingWorklog?.id ?? createId('worklog'),
    taskId: worklogData.taskId,
    date: worklogData.date,
    hours: Math.max(0, worklogData.hours),
    note: worklogData.note,
    status: worklogData.status ?? existingWorklog?.status ?? 'draft',
    createdAt: existingWorklog?.createdAt ?? now,
    updatedAt: now,
  };

  return {
    ...appData,
    worklogs: [...remainingWorklogs, worklog],
  };
}

export function addTodayWorklog(appData: AppData, worklogData: TodayWorklogFormData): AppData {
  const now = getTimestamp();
  const taskId = createId('task');
  const task: Task = {
    id: taskId,
    code: worklogData.taskCode.trim(),
    title: worklogData.taskTitle.trim(),
    description: '',
    type: 'chore',
    status: worklogData.status === 'logged' ? 'done' : 'in-progress',
    createdAt: now,
    updatedAt: now,
  };
  const worklog: WorklogEntry = {
    id: createId('worklog'),
    taskId,
    date: worklogData.date,
    hours: Math.max(0, worklogData.hours),
    note: worklogData.note.trim(),
    status: worklogData.status ?? 'draft',
    createdAt: now,
    updatedAt: now,
  };

  return {
    ...appData,
    tasks: [...appData.tasks, task],
    worklogs: [...appData.worklogs, worklog],
  };
}

export function updateTodayWorklog(
  appData: AppData,
  worklogData: TodayWorklogUpdateData,
): AppData {
  const now = getTimestamp();

  return {
    ...appData,
    tasks: appData.tasks.map((task) =>
      task.id === worklogData.taskId
        ? {
            ...task,
            code: worklogData.taskCode.trim(),
            title: worklogData.taskTitle.trim(),
            status: worklogData.status === 'logged' ? 'done' : task.status,
            updatedAt: now,
          }
        : task,
    ),
    worklogs: appData.worklogs.map((worklog) =>
      worklog.id === worklogData.worklogId
        ? {
            ...worklog,
            date: worklogData.date,
            hours: Math.max(0, worklogData.hours),
            note: worklogData.note.trim(),
            status: worklogData.status ?? worklog.status,
            updatedAt: now,
          }
        : worklog,
    ),
  };
}

export function deleteWorklog(appData: AppData, worklogId: string): AppData {
  return {
    ...appData,
    worklogs: appData.worklogs.filter((worklog) => worklog.id !== worklogId),
  };
}

export function markWorklogLogged(appData: AppData, worklogId: string): AppData {
  const now = getTimestamp();
  const targetWorklog = appData.worklogs.find((worklog) => worklog.id === worklogId);

  return {
    ...appData,
    tasks: targetWorklog
      ? appData.tasks.map((task) =>
          task.id === targetWorklog.taskId
            ? {
                ...task,
                status: 'done',
                updatedAt: now,
              }
            : task,
        )
      : appData.tasks,
    worklogs: appData.worklogs.map((worklog) =>
      worklog.id === worklogId
        ? {
            ...worklog,
            status: 'logged',
            updatedAt: now,
          }
        : worklog,
    ),
  };
}

export function updateSettings(appData: AppData, settings: Settings): AppData {
  return {
    ...appData,
    settings,
  };
}
