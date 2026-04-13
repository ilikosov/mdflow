import { signal, computed } from '@preact/signals';
import type { Task, Config } from '@mdflow/types';
import { defaultConfig } from '@mdflow/types';

// Global signals for reactive state
export const tasksSignal = signal<Task[]>([]);
export const configSignal = signal<Config>(defaultConfig);
export const archivedTasksSignal = signal<Task[]>([]);
export const isLoadingSignal = signal<boolean>(true);
export const errorSignal = signal<string | null>(null);

// Filter signals
export const activeFiltersSignal = signal<Array<{ type: string; value: string }>>([]);
export const searchTermSignal = signal<string>('');

// Modal control signals
export const selectedTaskIdSignal = signal<string | null>(null);
export const editingTaskIdSignal = signal<string | null>(null);
export const taskDetailModalOpenSignal = signal(false);
export const taskFormModalOpenSignal = signal(false);
export const archiveModalOpenSignal = signal(false);
export const columnsModalOpenSignal = signal(false);

// Computed: filtered tasks based on active filters and search term
export const filteredTasksSignal = computed(() => {
  const tasks = tasksSignal.value;
  const filters = activeFiltersSignal.value;
  const searchTerm = searchTermSignal.value.toLowerCase();

  return tasks.filter(task => {
    // Check active filters
    if (filters.length > 0) {
      const matchesFilters = filters.every(filter => {
        if (filter.type === 'tag') {
          return task.tags.includes(filter.value) || task.tags.includes('#' + filter.value);
        } else if (filter.type === 'category') {
          return task.category === filter.value;
        } else if (filter.type === 'user') {
          return task.assignees.some(a => normalizeUserId(a) === filter.value);
        } else if (filter.type === 'priority') {
          return task.priority === filter.value;
        }
        return false;
      });
      if (!matchesFilters) return false;
    }

    // Check global search
    if (searchTerm) {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm) ||
        task.notes.toLowerCase().includes(searchTerm);
      if (!matchesSearch) return false;
    }

    return true;
  });
});

// Computed: tasks grouped by column
export const tasksByColumnSignal = computed(() => {
  const columns = configSignal.value.columns;
  const filteredTasks = filteredTasksSignal.value;

  return columns.map(column => ({
    column,
    tasks: filteredTasks.filter(t => t.status === column.id),
  }));
});

// Helper: normalize user ID (extract @username from "@username (Display Name)")
export function normalizeUserId(userString: string): string {
  if (!userString) return '';
  const match = userString.match(/^(@[^\s(]+)/);
  return match ? match[1] : userString;
}

// Helper: get full user format from user ID
export function getUserFullFormat(userId: string, users: string[]): string {
  const configUser = users.find(u => normalizeUserId(u) === userId);
  return configUser || userId;
}
