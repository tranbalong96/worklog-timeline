import type { AISettings, GeneratedTask } from '../types/worklog';

type GenerateTaskResponse = {
  task?: GeneratedTask;
  error?: string;
  rawResponse?: string;
};

export async function generateTaskFromNotes(
  notes: string,
  settings: AISettings,
): Promise<GenerateTaskResponse> {
  const response = await fetch('/api/generate-task', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      notes,
      settings,
    }),
  });

  const data = (await response.json()) as GenerateTaskResponse;

  if (!response.ok) {
    return {
      error: data.error ?? 'Unable to generate task.',
      rawResponse: data.rawResponse,
    };
  }

  return data;
}
