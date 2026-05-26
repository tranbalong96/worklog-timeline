import type { AIProvider, AISettings, GeneratedTask, TaskType } from '../src/types/worklog';

type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  status: (statusCode: number) => {
    json: (body: unknown) => void;
  };
};

type GenerateTaskRequest = {
  notes: string;
  settings: AISettings;
};

const taskTypes: TaskType[] = ['feature', 'bug', 'chore', 'research', 'meeting'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAIProvider(value: unknown): value is AIProvider {
  return (
    value === 'disabled' ||
    value === 'gemini' ||
    value === 'openai-compatible' ||
    value === 'ollama' ||
    value === 'lm-studio'
  );
}

function parseRequestBody(body: unknown): GenerateTaskRequest | undefined {
  if (!isRecord(body) || typeof body.notes !== 'string' || !isRecord(body.settings)) {
    return undefined;
  }

  const settings = body.settings;

  if (
    typeof settings.enabled !== 'boolean' ||
    !isAIProvider(settings.provider) ||
    typeof settings.apiKey !== 'string' ||
    typeof settings.baseUrl !== 'string' ||
    typeof settings.model !== 'string' ||
    typeof settings.temperature !== 'number'
  ) {
    return undefined;
  }

  return {
    notes: body.notes,
    settings: settings as AISettings,
  };
}

function createPrompt(notes: string): string {
  return [
    'Convert these developer notes into one Jira-style task.',
    'Return JSON only with these fields:',
    '- taskCode',
    '- taskTitle',
    '- taskDescription',
    '- taskType: one of feature, bug, chore, research, meeting',
    '',
    'Developer notes:',
    notes,
  ].join('\n');
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

function extractJsonText(text: string): string {
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return text;
}

function parseGeneratedTask(rawText: string): GeneratedTask | undefined {
  try {
    const parsed: unknown = JSON.parse(extractJsonText(rawText));

    if (!isRecord(parsed)) {
      return undefined;
    }

    const taskType = taskTypes.includes(parsed.taskType as TaskType)
      ? (parsed.taskType as TaskType)
      : undefined;

    if (
      typeof parsed.taskCode !== 'string' ||
      typeof parsed.taskTitle !== 'string' ||
      typeof parsed.taskDescription !== 'string' ||
      !taskType
    ) {
      return undefined;
    }

    return {
      taskCode: parsed.taskCode,
      taskTitle: parsed.taskTitle,
      taskDescription: parsed.taskDescription,
      taskType,
    };
  } catch {
    return undefined;
  }
}

async function readResponseText(response: Response): Promise<string> {
  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `Provider request failed with ${response.status}`);
  }

  return text;
}

function parseTextFromOpenAIResponse(text: string): string {
  const parsed: unknown = JSON.parse(text);

  if (!isRecord(parsed) || !Array.isArray(parsed.choices)) {
    return text;
  }

  const firstChoice: unknown = parsed.choices[0];

  if (!isRecord(firstChoice) || !isRecord(firstChoice.message)) {
    return text;
  }

  return typeof firstChoice.message.content === 'string' ? firstChoice.message.content : text;
}

function parseTextFromGeminiResponse(text: string): string {
  const parsed: unknown = JSON.parse(text);

  if (!isRecord(parsed) || !Array.isArray(parsed.candidates)) {
    return text;
  }

  const firstCandidate: unknown = parsed.candidates[0];

  if (!isRecord(firstCandidate) || !isRecord(firstCandidate.content)) {
    return text;
  }

  const parts = firstCandidate.content.parts;

  if (!Array.isArray(parts) || !isRecord(parts[0])) {
    return text;
  }

  return typeof parts[0].text === 'string' ? parts[0].text : text;
}

function parseTextFromOllamaResponse(text: string): string {
  const parsed: unknown = JSON.parse(text);

  if (!isRecord(parsed)) {
    return text;
  }

  return typeof parsed.response === 'string' ? parsed.response : text;
}

async function callOpenAICompatible(settings: AISettings, prompt: string): Promise<string> {
  const baseUrl = normalizeBaseUrl(settings.baseUrl);
  const endpoint = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (settings.apiKey) {
    headers.Authorization = `Bearer ${settings.apiKey}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: settings.model,
      temperature: settings.temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  return parseTextFromOpenAIResponse(await readResponseText(response));
}

async function callGemini(settings: AISettings, prompt: string): Promise<string> {
  const baseUrl = normalizeBaseUrl(settings.baseUrl);
  const endpoint = `${baseUrl}/v1beta/models/${encodeURIComponent(
    settings.model,
  )}:generateContent?key=${encodeURIComponent(settings.apiKey)}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: settings.temperature,
      },
    }),
  });

  return parseTextFromGeminiResponse(await readResponseText(response));
}

async function callOllama(settings: AISettings, prompt: string): Promise<string> {
  const baseUrl = normalizeBaseUrl(settings.baseUrl);
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: settings.model,
      prompt,
      stream: false,
      options: {
        temperature: settings.temperature,
      },
    }),
  });

  return parseTextFromOllamaResponse(await readResponseText(response));
}

async function callProvider(settings: AISettings, prompt: string): Promise<string> {
  if (settings.provider === 'gemini') {
    return callGemini(settings, prompt);
  }

  if (settings.provider === 'ollama') {
    return callOllama(settings, prompt);
  }

  return callOpenAICompatible(settings, prompt);
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const requestBody = parseRequestBody(req.body);

  if (!requestBody) {
    res.status(400).json({ error: 'Invalid request.' });
    return;
  }

  const { notes, settings } = requestBody;

  if (!settings.enabled || settings.provider === 'disabled') {
    res.status(400).json({ error: 'AI provider is disabled.' });
    return;
  }

  if (!notes.trim()) {
    res.status(400).json({ error: 'Developer notes are required.' });
    return;
  }

  if (!settings.baseUrl || !settings.model) {
    res.status(400).json({ error: 'AI provider base URL and model are required.' });
    return;
  }

  if ((settings.provider === 'gemini' || settings.provider === 'openai-compatible') && !settings.apiKey) {
    res.status(400).json({ error: 'API key is required for this provider.' });
    return;
  }

  try {
    const rawResponse = await callProvider(settings, createPrompt(notes));
    const task = parseGeneratedTask(rawResponse);

    if (!task) {
      res.status(422).json({
        error: 'AI returned invalid JSON. Edit the raw response manually.',
        rawResponse,
      });
      return;
    }

    res.status(200).json({ task, rawResponse });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'AI request failed.',
    });
  }
}
