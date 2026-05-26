import { exportAppDataToJson, importAppDataFromJson } from './storageService';
import type { AppData } from '../types/worklog';

export type LocalFileTarget = 'file' | 'directory';

export type LocalFileLinkSettings = {
  target: LocalFileTarget | '';
  displayName: string;
  localUrl: string;
  copyMode: boolean;
  maxCopies: number;
  updatedAt: string;
};

export type LocalFileReadResult =
  | {
      ok: true;
      data: AppData;
      fileName: string;
    }
  | {
      ok: false;
      error: string;
    };

const FILE_LINK_STORAGE_KEY = 'worklog_timeline_file_link_v1';
const DB_NAME = 'worklog_timeline_file_handles';
const STORE_NAME = 'handles';
const HANDLE_KEY = 'active';
const MAIN_FILE_NAME = 'worklog-timeline-data.json';
const COPY_PREFIX = 'worklog-timeline-data-';

type PermissionMode = 'read' | 'readwrite';

type FilePickerWindow = Window &
  typeof globalThis & {
    showOpenFilePicker?: (options?: unknown) => Promise<FileSystemFileHandleLike[]>;
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandleLike>;
  };

type FileSystemHandleLike = {
  kind: 'file' | 'directory';
  name: string;
  queryPermission?: (descriptor?: { mode: PermissionMode }) => Promise<PermissionState>;
  requestPermission?: (descriptor?: { mode: PermissionMode }) => Promise<PermissionState>;
};

type FileSystemFileHandleLike = FileSystemHandleLike & {
  kind: 'file';
  getFile: () => Promise<File>;
  createWritable: () => Promise<{
    write: (data: string) => Promise<void>;
    close: () => Promise<void>;
  }>;
};

type FileSystemDirectoryHandleLike = FileSystemHandleLike & {
  kind: 'directory';
  getFileHandle: (
    name: string,
    options?: {
      create?: boolean;
    },
  ) => Promise<FileSystemFileHandleLike>;
  removeEntry: (name: string) => Promise<void>;
  values: () => AsyncIterable<FileSystemHandleLike>;
};

export function isLocalFileLinkSupported(): boolean {
  const pickerWindow = window as FilePickerWindow;

  return Boolean(pickerWindow.showOpenFilePicker && pickerWindow.showDirectoryPicker);
}

export function loadLocalFileLinkSettings(): LocalFileLinkSettings {
  const storedValue = window.localStorage.getItem(FILE_LINK_STORAGE_KEY);

  if (!storedValue) {
    return createDefaultSettings();
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);

    if (!isLocalFileLinkSettings(parsedValue)) {
      return createDefaultSettings();
    }

    return parsedValue;
  } catch {
    return createDefaultSettings();
  }
}

export function saveLocalFileLinkSettings(settings: LocalFileLinkSettings): void {
  window.localStorage.setItem(FILE_LINK_STORAGE_KEY, JSON.stringify(settings));
}

export async function linkLocalFile(): Promise<LocalFileLinkSettings> {
  const pickerWindow = window as FilePickerWindow;
  const [fileHandle] =
    (await pickerWindow.showOpenFilePicker?.({
      types: [
        {
          description: 'JSON',
          accept: {
            'application/json': ['.json'],
          },
        },
      ],
      multiple: false,
    })) ?? [];

  if (!fileHandle) {
    throw new Error('No file selected.');
  }

  await saveLinkedHandle(fileHandle);

  const settings: LocalFileLinkSettings = {
    target: 'file',
    displayName: fileHandle.name,
    localUrl: `local-file://${fileHandle.name}`,
    copyMode: false,
    maxCopies: 10,
    updatedAt: new Date().toISOString(),
  };

  saveLocalFileLinkSettings(settings);

  return settings;
}

export async function linkLocalDirectory(): Promise<LocalFileLinkSettings> {
  const pickerWindow = window as FilePickerWindow;
  const directoryHandle = await pickerWindow.showDirectoryPicker?.();

  if (!directoryHandle) {
    throw new Error('No folder selected.');
  }

  await saveLinkedHandle(directoryHandle);

  const settings: LocalFileLinkSettings = {
    target: 'directory',
    displayName: directoryHandle.name,
    localUrl: `local-folder://${directoryHandle.name}`,
    copyMode: false,
    maxCopies: 10,
    updatedAt: new Date().toISOString(),
  };

  saveLocalFileLinkSettings(settings);

  return settings;
}

export async function writeAppDataToLinkedTarget(
  appData: AppData,
  settings: LocalFileLinkSettings,
): Promise<string> {
  const handle = await loadLinkedHandle();

  if (!handle || !settings.target) {
    throw new Error('No local file or folder is linked.');
  }

  await ensurePermission(handle, 'readwrite');

  if (settings.target === 'file' && handle.kind === 'file') {
    const fileHandle = toFileHandle(handle);

    await writeFile(fileHandle, exportAppDataToJson(appData));
    return handle.name;
  }

  if (settings.target === 'directory' && handle.kind === 'directory') {
    const directoryHandle = toDirectoryHandle(handle);
    const fileName = settings.copyMode ? createCopyFileName() : MAIN_FILE_NAME;
    const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });

    await writeFile(fileHandle, exportAppDataToJson(appData));

    if (settings.copyMode) {
      await pruneOldCopies(directoryHandle, settings.maxCopies);
    }

    return fileName;
  }

  throw new Error('Linked target no longer matches the saved settings.');
}

export async function readAppDataFromLinkedTarget(
  settings: LocalFileLinkSettings,
): Promise<LocalFileReadResult> {
  const handle = await loadLinkedHandle();

  if (!handle || !settings.target) {
    return {
      ok: false,
      error: 'No local file or folder is linked.',
    };
  }

  await ensurePermission(handle, 'read');

  try {
    const fileHandle =
      settings.target === 'directory' && handle.kind === 'directory'
        ? await getReadableFileFromDirectory(toDirectoryHandle(handle), settings.copyMode)
        : handle;

    if (fileHandle.kind !== 'file') {
      return {
        ok: false,
        error: 'Linked target is not readable as a file.',
      };
    }

    const file = await toFileHandle(fileHandle).getFile();
    const content = await file.text();
    const importResult = importAppDataFromJson(content);

    if (!importResult.ok) {
      return importResult;
    }

    return {
      ok: true,
      data: importResult.data,
      fileName: fileHandle.name,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unable to read linked file.',
    };
  }
}

function createDefaultSettings(): LocalFileLinkSettings {
  return {
    target: '',
    displayName: '',
    localUrl: '',
    copyMode: false,
    maxCopies: 10,
    updatedAt: '',
  };
}

function isLocalFileLinkSettings(value: unknown): value is LocalFileLinkSettings {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const recordValue = value as Record<string, unknown>;

  return (
    (recordValue.target === '' ||
      recordValue.target === 'file' ||
      recordValue.target === 'directory') &&
    typeof recordValue.displayName === 'string' &&
    typeof recordValue.localUrl === 'string' &&
    typeof recordValue.copyMode === 'boolean' &&
    typeof recordValue.maxCopies === 'number' &&
    typeof recordValue.updatedAt === 'string'
  );
}

function toFileHandle(handle: FileSystemHandleLike): FileSystemFileHandleLike {
  return handle as FileSystemFileHandleLike;
}

function toDirectoryHandle(handle: FileSystemHandleLike): FileSystemDirectoryHandleLike {
  return handle as FileSystemDirectoryHandleLike;
}

async function ensurePermission(
  handle: FileSystemHandleLike,
  mode: PermissionMode,
): Promise<void> {
  const descriptor = { mode };
  const currentPermission = await handle.queryPermission?.(descriptor);

  if (currentPermission === 'granted') {
    return;
  }

  const nextPermission = await handle.requestPermission?.(descriptor);

  if (nextPermission !== 'granted') {
    throw new Error('Permission was not granted for the linked local target.');
  }
}

async function writeFile(fileHandle: FileSystemFileHandleLike, content: string): Promise<void> {
  const writable = await fileHandle.createWritable();

  await writable.write(content);
  await writable.close();
}

async function getReadableFileFromDirectory(
  directoryHandle: FileSystemDirectoryHandleLike,
  copyMode: boolean,
): Promise<FileSystemFileHandleLike> {
  if (!copyMode) {
    return directoryHandle.getFileHandle(MAIN_FILE_NAME);
  }

  const copyNames = await getCopyFileNames(directoryHandle);
  const latestCopyName = copyNames[copyNames.length - 1];

  if (!latestCopyName) {
    return directoryHandle.getFileHandle(MAIN_FILE_NAME);
  }

  return directoryHandle.getFileHandle(latestCopyName);
}

async function getCopyFileNames(directoryHandle: FileSystemDirectoryHandleLike): Promise<string[]> {
  const fileNames: string[] = [];

  for await (const handle of directoryHandle.values()) {
    if (
      handle.kind === 'file' &&
      handle.name.startsWith(COPY_PREFIX) &&
      handle.name.endsWith('.json')
    ) {
      fileNames.push(handle.name);
    }
  }

  return fileNames.sort();
}

function createCopyFileName(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  return `${COPY_PREFIX}${timestamp}.json`;
}

async function pruneOldCopies(
  directoryHandle: FileSystemDirectoryHandleLike,
  maxCopies: number,
): Promise<void> {
  const copyNames = await getCopyFileNames(directoryHandle);
  const copiesToDelete = copyNames.slice(0, Math.max(0, copyNames.length - maxCopies));

  await Promise.all(copiesToDelete.map((fileName) => directoryHandle.removeEntry(fileName)));
}

async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveLinkedHandle(handle: FileSystemHandleLike): Promise<void> {
  const database = await openDatabase();

  await createStoreRequest(database, 'readwrite', (store) => store.put(handle, HANDLE_KEY));
  database.close();
}

async function loadLinkedHandle(): Promise<FileSystemHandleLike | undefined> {
  const database = await openDatabase();
  const handle = await createStoreRequest(database, 'readonly', (store) => store.get(HANDLE_KEY));

  database.close();

  return handle as FileSystemHandleLike | undefined;
}

function createStoreRequest(
  database: IDBDatabase,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = run(transaction.objectStore(STORE_NAME));

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
