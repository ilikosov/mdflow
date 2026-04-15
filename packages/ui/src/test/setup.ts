import '@testing-library/preact';
import '@testing-library/jest-dom/vitest';

// Mock i18n module
vi.mock('../lib/i18n', () => ({
  t: (key: string) => key,
  setLanguage: vi.fn(),
  getLanguage: () => 'en',
}));

// Mock signals/state module
vi.mock('../signals/state', () => ({
  tasksSignal: { value: [], subscribe: vi.fn() },
  configSignal: {
    value: {
      columns: [
        { id: 'todo', name: 'To Do' },
        { id: 'inprogress', name: 'In Progress' },
        { id: 'done', name: 'Done' },
      ],
      categories: ['Feature', 'Bug'],
      users: ['user1', 'user2'],
      priorities: ['🔴 Urgent', '🟡 Medium', '🟢 Low'],
      tags: ['urgent', 'help-needed'],
      lastTaskId: 1,
    },
  },
  activeFiltersSignal: { value: [], subscribe: vi.fn() },
  searchTermSignal: { value: '', subscribe: vi.fn() },
  isLoadingSignal: { value: false, subscribe: vi.fn() },
  archivedTasksSignal: { value: [], subscribe: vi.fn() },
  selectedTaskIdSignal: { value: null as string | null, subscribe: vi.fn() },
  editingTaskIdSignal: { value: null as string | null, subscribe: vi.fn() },
  taskDetailModalOpenSignal: { value: false, subscribe: vi.fn() },
  taskFormModalOpenSignal: { value: false, subscribe: vi.fn() },
  archiveModalOpenSignal: { value: false, subscribe: vi.fn() },
  columnsModalOpenSignal: { value: false, subscribe: vi.fn() },
  filteredTasksSignal: { value: [], subscribe: vi.fn() },
  normalizeUserId: (id: string) => id,
}));

// Mock markdown module
vi.mock('../lib/markdown', () => ({
  markdownToHtml: (text: string) => `<p>${text}</p>`,
}));

// Mock utils module
vi.mock('../lib/utils', () => ({
  getFirstEmoji: (str: string) => str.charAt(0),
  priorityIconClasses: {
    '🔴': 'Urgent',
    '🟡': 'Medium',
    '🟢': 'Low',
    Default: 'Default',
  },
}));

// Mock API client
vi.mock('../api/client', () => ({
  archiveApi: {
    put: vi.fn(),
    get: vi.fn(),
  },
}));
