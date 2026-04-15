import { signal, effect } from '@preact/signals';
import { Fragment } from 'preact';
import { useEffect } from 'preact/hooks';
import {
  tasksSignal,
  configSignal,
  archivedTasksSignal,
  isLoadingSignal,
  errorSignal,
  selectedTaskIdSignal,
  editingTaskIdSignal,
  taskDetailModalOpenSignal,
  taskFormModalOpenSignal,
  archiveModalOpenSignal,
  columnsModalOpenSignal,
} from '../signals/state';
import { kanbanApi, archiveApi } from '../api/client';
import { t, setLanguage, getLanguage, type Language } from '../lib/i18n';
import { debounce } from '../lib/utils';
import { defaultConfig, type Task } from '@mdflow/types';

// Import UI components
import { Header } from './header/Header';
import { FilterBar } from './filters/FilterBar';
import { KanbanBoard } from './kanban/KanbanBoard';
import { TaskDetailModal } from './modals/TaskDetailModal';
import { TaskFormModal } from './modals/TaskFormModal';
import { ArchiveModal } from './modals/ArchiveModal';
import { ColumnsModal } from './modals/ColumnsModal';
import { Spinner } from './components/Spinner';

// Notification signal
const notificationSignal = signal<{ message: string; type: 'success' | 'error' } | null>(null);

// Show notification helper
function showNotification(message: string, type: 'success' | 'error' = 'success') {
  notificationSignal.value = { message, type };
  setTimeout(() => {
    notificationSignal.value = null;
  }, 3000);
}

// Load kanban data on startup
async function loadKanbanData() {
  try {
    const data = await kanbanApi.get();
    tasksSignal.value = data.tasks || [];
    configSignal.value = data.config || defaultConfig;
  } catch (err: any) {
    if (err.message.includes('404')) {
      // Initialize with default config
      const newData = { tasks: [], config: defaultConfig };
      await kanbanApi.put(newData);
      tasksSignal.value = [];
      configSignal.value = defaultConfig;
    } else {
      errorSignal.value = t('notif.loadError');
    }
  } finally {
    isLoadingSignal.value = false;
  }
}

// Load archived tasks
async function loadArchivedTasks() {
  try {
    const tasks = await archiveApi.get();
    archivedTasksSignal.value = tasks;
  } catch (err) {
    console.error('Failed to load archived tasks:', err);
  }
}

// Auto-save with debounce
const debouncedSave = debounce(async () => {
  try {
    const data = { tasks: tasksSignal.value, config: configSignal.value };
    await kanbanApi.put(data);
    showNotification(t('notif.saved'), 'success');
  } catch (err) {
    showNotification(t('notif.saveError'), 'error');
  }
}, 1000);

// Watch for changes and auto-save
effect(() => {
  if (!isLoadingSignal.value && !errorSignal.value) {
    debouncedSave();
  }
});

// Initialize on mount
useEffect(() => {
  loadKanbanData();
  loadArchivedTasks();
  setLanguage(getLanguage());
}, []);

// Handle task click - open detail modal
function handleTaskClick(task: Task) {
  selectedTaskIdSignal.value = task.id;
  taskDetailModalOpenSignal.value = true;
}

// Open new task form
function handleNewTask() {
  editingTaskIdSignal.value = null;
  taskFormModalOpenSignal.value = true;
}

// Open archive modal
function handleOpenArchive() {
  archiveModalOpenSignal.value = true;
}

// Open columns modal
function handleOpenColumns() {
  columnsModalOpenSignal.value = true;
}

// Notification component
function Notification() {
  const notification = notificationSignal.value;

  if (!notification) return null;

  return (
    <div class={`notification ${notification.type} show`}>
      <span>{notification.message}</span>
    </div>
  );
}

// Main App component
export function App() {
  const loading = isLoadingSignal.value;
  const error = errorSignal.value;

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          color: '#EF4444',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <Fragment>
      <Header
        onNewTask={handleNewTask}
        onOpenArchive={handleOpenArchive}
        onOpenColumns={handleOpenColumns}
      />
      <FilterBar />
      <main class="container">
        <KanbanBoard onTaskClick={handleTaskClick} />
      </main>
      <TaskDetailModal />
      <TaskFormModal />
      <ArchiveModal />
      <ColumnsModal />
      <Notification />
    </Fragment>
  );
}
