import { signal, effect } from '@preact/signals';
import { Fragment } from 'preact';
import { useEffect } from 'preact/hooks';
import {
  tasksSignal,
  configSignal,
  archivedTasksSignal,
  isLoadingSignal,
  errorSignal,
  activeFiltersSignal,
  searchTermSignal,
  tasksByColumnSignal,
  normalizeUserId,
} from '../signals/state';
import { kanbanApi, archiveApi } from '../api/client';
import { markdownToHtml } from '../lib/markdown';
import { t, setLanguage, getLanguage, type Language } from '../lib/i18n';
import { debounce, priorityIconClasses, getFirstEmoji } from '../lib/utils';
import { defaultConfig, type Task, type Subtask, type Column } from '@mdflow/types';

// Modal visibility signals
const taskDetailModalOpen = signal(false);
const taskFormModalOpen = signal(false);
const archiveModalOpen = signal(false);
const columnsModalOpen = signal(false);

// Current item signals
const currentTaskSignal = signal<Task | null>(null);
const editingTaskSignal = signal<Task | null>(null);
const archiveSearchSignal = signal('');

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

// Priority class helper
function getPriorityClass(priority: string): string {
  const emoji = getFirstEmoji(priority);
  return priorityIconClasses[emoji] || 'Default';
}

// Display priority (translate if needed)
function displayPriority(priority: string): string {
  const lang = getLanguage();
  if (lang === 'en' || !priority) return priority;
  
  const priorityMap: Record<string, string> = {
    '🔴 Critical': '🔴 Critique',
    '🟠 High': '🟠 Haute',
    '🟡 Medium': '🟡 Moyenne',
    '🟢 Low': '🟢 Basse',
  };
  return priorityMap[priority] || priority;
}

// Spinner component
function Spinner() {
  return <span class="spinner" />;
}

// Button component
interface ButtonProps {
  onClick?: () => void;
  class?: string;
  children: any;
  disabled?: boolean;
  title?: string;
  type?: 'button' | 'submit';
  style?: Record<string, string>;
}

function Button({ onClick, class: className, children, disabled, title, type, style }: ButtonProps) {
  return (
    <button
      class={`btn ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      type={type}
      style={style}
    >
      {children}
    </button>
  );
}

// FilterBar component
function FilterBar() {
  const config = configSignal.value;
  const filters = activeFiltersSignal.value;
  const searchTerm = searchTermSignal.value;

  const addFilter = (type: string, value: string) => {
    if (value) {
      activeFiltersSignal.value = [...filters, { type, value }];
    }
  };

  const removeFilter = (index: number) => {
    activeFiltersSignal.value = filters.filter((_, i) => i !== index);
  };

  const clearAllFilters = () => {
    activeFiltersSignal.value = [];
    searchTermSignal.value = '';
  };

  const handleSearchInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    searchTermSignal.value = target.value;
  };

  const clearSearch = () => {
    searchTermSignal.value = '';
    const input = document.getElementById('globalSearchInput') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <div class="filter-bar">
      <div class="filter-bar-content">
        {/* Global Search */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', maxWidth: '600px', width: '100%' }}>
            <input
              type="text"
              id="globalSearchInput"
              placeholder={t('filters.search')}
              style={{
                width: '100%',
                padding: '0.75rem 3rem 0.75rem 1rem',
                border: '2px solid #cbd5e0',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.2s',
              }}
              onInput={handleSearchInput}
              value={searchTerm}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#718096',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '0.5rem',
                }}
                title={t('filters.searchClear')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter dropdowns */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '0.75rem',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ fontWeight: 500, fontSize: '0.9rem' }}>{t('filters.tags')}:</label>
            <select
              style={{ padding: '0.5rem', border: '1px solid #cbd5e0', borderRadius: '4px', minWidth: '150px' }}
              onChange={(e) => {
                const target = e.target as HTMLSelectElement;
                addFilter('tag', target.value);
                target.value = '';
              }}
              value=""
            >
              <option value="">{t('filters.select')}</option>
              {config.tags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ fontWeight: 500, fontSize: '0.9rem' }}>{t('filters.category')}:</label>
            <select
              style={{ padding: '0.5rem', border: '1px solid #cbd5e0', borderRadius: '4px', minWidth: '150px' }}
              onChange={(e) => {
                const target = e.target as HTMLSelectElement;
                addFilter('category', target.value);
                target.value = '';
              }}
              value=""
            >
              <option value="">{t('filters.select')}</option>
              {config.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ fontWeight: 500, fontSize: '0.9rem' }}>{t('filters.user')}:</label>
            <select
              style={{ padding: '0.5rem', border: '1px solid #cbd5e0', borderRadius: '4px', minWidth: '150px' }}
              onChange={(e) => {
                const target = e.target as HTMLSelectElement;
                addFilter('user', normalizeUserId(target.value));
                target.value = '';
              }}
              value=""
            >
              <option value="">{t('filters.select')}</option>
              {config.users.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ fontWeight: 500, fontSize: '0.9rem' }}>{t('filters.priority')}:</label>
            <select
              style={{ padding: '0.5rem', border: '1px solid #cbd5e0', borderRadius: '4px', minWidth: '150px' }}
              onChange={(e) => {
                const target = e.target as HTMLSelectElement;
                addFilter('priority', target.value);
                target.value = '';
              }}
              value=""
            >
              <option value="">{t('filters.select')}</option>
              {config.priorities.map((pri) => (
                <option key={pri} value={pri}>
                  {displayPriority(pri)}
                </option>
              ))}
            </select>
          </div>

          {filters.length > 0 && (
            <Button onClick={clearAllFilters} class="btn-secondary" title={t('filters.clearAll')}>
              {t('filters.clearAll')}
            </Button>
          )}
        </div>

        {/* Active filter chips */}
        {filters.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {filters.map((filter, index) => (
              <span
                key={index}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: '#E3F2FD',
                  color: '#1565C0',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '16px',
                  fontSize: '0.85rem',
                }}
              >
                {filter.type === 'tag' && '#'}
                {filter.value}
                <button
                  onClick={() => removeFilter(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// TaskCard component
interface TaskCardProps {
  task: Task;
}

function TaskCard({ task }: TaskCardProps) {
  const priorityClass = getPriorityClass(task.priority);
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleDragStart = (e: DragEvent) => {
    e.dataTransfer?.setData('text/plain', task.id);
    (e.target as HTMLElement).classList.add('dragging');
  };

  const handleDragEnd = (e: DragEvent) => {
    (e.target as HTMLElement).classList.remove('dragging');
  };

  const handleClick = () => {
    currentTaskSignal.value = task;
    taskDetailModalOpen.value = true;
  };

  return (
    <div
      class="task-card"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      title={t('tooltip.doubleClickEdit')}
    >
      <div class="task-header">
        <span class="task-id">{task.id}</span>
      </div>
      <div class="task-title">{task.title}</div>
      {task.description && <div class="task-description">{task.description}</div>}
      <div class="task-meta">
        {task.priority && (
          <span class={`badge badge-priority ${priorityClass}`}>{displayPriority(task.priority)}</span>
        )}
        {task.category && <span class="badge badge-category">{task.category}</span>}
        {task.assignees.slice(0, 2).map((assignee) => (
          <span key={assignee} class="badge badge-assignee">
            {normalizeUserId(assignee)}
          </span>
        ))}
        {task.tags.slice(0, 3).map((tag) => (
          <span key={tag} class="tag">
            {tag.startsWith('#') ? tag : `#${tag}`}
          </span>
        ))}
      </div>
      {totalSubtasks > 0 && (
        <div class="task-subtasks">
          <div class="subtask-progress">
            <span>
              {completedSubtasks}/{totalSubtasks}
            </span>
            <div class="progress-bar">
              <div class="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// KanbanColumn component
interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
}

function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer?.getData('text/plain');
    if (taskId) {
      const taskIndex = tasksSignal.value.findIndex((t) => t.id === taskId);
      if (taskIndex !== -1) {
        const updatedTasks = [...tasksSignal.value];
        updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status: column.id };
        tasksSignal.value = updatedTasks;
        showNotification(t('notif.taskMoved'), 'success');
      }
    }
  };

  return (
    <div class="kanban-column" onDragOver={handleDragOver} onDrop={handleDrop}>
      <div class="column-header">
        <span class="column-title">{column.name}</span>
        <span class="column-count">{tasks.length}</span>
      </div>
      <div class="task-list">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div class="empty-state" style={{ padding: '1rem', fontSize: '0.9rem' }}>
            {t('empty.noTasks')}
          </div>
        )}
      </div>
    </div>
  );
}

// KanbanBoard component
function KanbanBoard() {
  const columnsWithTasks = tasksByColumnSignal.value;

  return (
    <div class="kanban-board">
      {columnsWithTasks.map(({ column, tasks }) => (
        <KanbanColumn key={column.id} column={column} tasks={tasks} />
      ))}
    </div>
  );
}

// TaskDetailModal component
function TaskDetailModal() {
  const task = currentTaskSignal.value;
  const isOpen = taskDetailModalOpen.value;
  const config = configSignal.value;

  if (!isOpen || !task) return null;

  const handleClose = () => {
    taskDetailModalOpen.value = false;
    currentTaskSignal.value = null;
  };

  const handleEdit = () => {
    editingTaskSignal.value = { ...task };
    taskDetailModalOpen.value = false;
    taskFormModalOpen.value = true;
  };

  const handleArchive = async () => {
    if (confirm(t('confirm.archiveTask', { title: task.title }))) {
      const newArchived = [...archivedTasksSignal.value, task];
      await archiveApi.put(newArchived);
      archivedTasksSignal.value = newArchived;
      
      const newTasks = tasksSignal.value.filter((t) => t.id !== task.id);
      tasksSignal.value = newTasks;
      
      taskDetailModalOpen.value = false;
      currentTaskSignal.value = null;
      showNotification(t('notif.taskArchived'), 'success');
    }
  };

  const handleDelete = async () => {
    if (confirm(t('confirm.deleteTask', { title: task.title }))) {
      const newTasks = tasksSignal.value.filter((t) => t.id !== task.id);
      tasksSignal.value = newTasks;
      
      taskDetailModalOpen.value = false;
      currentTaskSignal.value = null;
      showNotification(t('notif.taskDeleted'), 'success');
    }
  };

  const priorityClass = getPriorityClass(task.priority);
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <div class={`modal ${isOpen ? 'active' : ''}`} onClick={handleClose}>
      <div class="modal-content" onClick={(e) => e.stopPropagation()}>
        <div class="modal-header">
          <h2>{t('taskDetail.title')}</h2>
          <button class="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>
        <div class="task-detail">
          <h3 style={{ marginBottom: '1rem' }}>{task.title}</h3>
          
          <p>
            <strong>{t('meta.priority')}:</strong>{' '}
            <span class={`badge badge-priority ${priorityClass}`}>{displayPriority(task.priority)}</span>
          </p>
          <p>
            <strong>{t('meta.status')}:</strong>{' '}
            {config.columns.find((c) => c.id === task.status)?.name || task.status}
          </p>
          {task.category && (
            <p>
              <strong>{t('meta.category')}:</strong> {task.category}
            </p>
          )}
          {task.assignees.length > 0 && (
            <p>
              <strong>{t('meta.assigned')}:</strong> {task.assignees.join(', ')}
            </p>
          )}
          {task.created && (
            <p>
              <strong>{t('meta.created')}:</strong> {task.created}
            </p>
          )}
          {task.started && (
            <p>
              <strong>{t('meta.started')}:</strong> {task.started}
            </p>
          )}
          {task.due && (
            <p>
              <strong>{t('meta.due')}:</strong> {task.due}
            </p>
          )}
          {task.completed && (
            <p>
              <strong>{t('meta.completed')}:</strong> {task.completed}
            </p>
          )}
          {task.tags.length > 0 && (
            <p>
              <strong>{t('meta.tags')}:</strong> {task.tags.join(' ')}
            </p>
          )}
          {task.description && (
            <div style={{ marginTop: '1rem' }}>
              <strong>{t('meta.description')}:</strong>
              <p style={{ marginTop: '0.5rem' }}>{task.description}</p>
            </div>
          )}
          {totalSubtasks > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <strong>{t('meta.subtasks', { completed: String(completedSubtasks), total: String(totalSubtasks) })}:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                {task.subtasks.map((st, i) => (
                  <li key={i} style={{ textDecoration: st.completed ? 'line-through' : 'none' }}>
                    {st.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {task.notes && (
            <div style={{ marginTop: '1rem' }}>
              <strong>{t('meta.notes')}:</strong>
              <div
                style={{ marginTop: '0.5rem', lineHeight: '1.8' }}
                dangerouslySetInnerHTML={{ __html: markdownToHtml(task.notes) }}
              />
            </div>
          )}
        </div>
        <div class="actions">
          <Button onClick={handleEdit} class="btn-primary">
            {t('taskDetail.edit')}
          </Button>
          <Button onClick={handleArchive} class="btn-secondary">
            {t('taskDetail.archive')}
          </Button>
          <Button onClick={handleDelete} class="btn-secondary" style={{ color: '#EF4444' }}>
            {t('taskDetail.delete')}
          </Button>
          <Button onClick={handleClose} class="btn-secondary">
            {t('taskDetail.close')}
          </Button>
        </div>
      </div>
    </div>
  );
}

// TaskFormModal component
function TaskFormModal() {
  const isOpen = taskFormModalOpen.value;
  const editingTask = editingTaskSignal.value;
  const config = configSignal.value;

  const [formData, setFormData] = signal({
    title: '',
    status: config.columns[0]?.id || 'todo',
    priority: '',
    category: '',
    assignees: '',
    created: '',
    started: '',
    due: '',
    completed: '',
    tags: '',
    description: '',
    subtasks: [] as Subtask[],
    notes: '',
  });

  const [newSubtask, setNewSubtask] = signal('');

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        status: editingTask.status,
        priority: editingTask.priority,
        category: editingTask.category,
        assignees: editingTask.assignees.join(', '),
        created: editingTask.created,
        started: editingTask.started,
        due: editingTask.due,
        completed: editingTask.completed,
        tags: editingTask.tags.join(' '),
        description: editingTask.description,
        subtasks: [...editingTask.subtasks],
        notes: editingTask.notes,
      });
    } else {
      setFormData({
        title: '',
        status: config.columns[0]?.id || 'todo',
        priority: '',
        category: '',
        assignees: '',
        created: new Date().toISOString().split('T')[0],
        started: '',
        due: '',
        completed: '',
        tags: '',
        description: '',
        subtasks: [],
        notes: '',
      });
    }
  }, [editingTask]);

  if (!isOpen) return null;

  const handleClose = () => {
    taskFormModalOpen.value = false;
    editingTaskSignal.value = null;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    const data = formData.value;
    const task: Task = {
      id: editingTask?.id || `TASK-${String(config.lastTaskId + 1).padStart(3, '0')}`,
      title: data.title,
      status: data.status,
      priority: data.priority,
      category: data.category,
      assignees: data.assignees.split(',').map((a) => a.trim()).filter(Boolean),
      tags: data.tags.split(/\s+/).filter(Boolean).map((t) => t.replace(/^#/, '')),
      created: data.created,
      started: data.started,
      due: data.due,
      completed: data.completed,
      description: data.description,
      subtasks: data.subtasks,
      notes: data.notes,
    };

    if (editingTask) {
      // Update existing task
      const newTasks = tasksSignal.value.map((t) => (t.id === task.id ? task : t));
      tasksSignal.value = newTasks;
      showNotification(t('notif.taskEdited', { id: task.id }), 'success');
    } else {
      // Create new task
      const newTasks = [...tasksSignal.value, task];
      tasksSignal.value = newTasks;
      configSignal.value = { ...config, lastTaskId: config.lastTaskId + 1 };
      showNotification(t('notif.taskCreated', { id: task.id }), 'success');
    }

    handleClose();
  };

  const handleAddSubtask = () => {
    if (newSubtask.value.trim()) {
      formData.value = {
        ...formData.value,
        subtasks: [...formData.value.subtasks, { completed: false, text: newSubtask.value.trim() }],
      };
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    if (confirm(t('confirm.deleteSubtask'))) {
      formData.value = {
        ...formData.value,
        subtasks: formData.value.subtasks.filter((_, i) => i !== index),
      };
    }
  };

  const handleToggleSubtask = (index: number) => {
    const subtasks = [...formData.value.subtasks];
    subtasks[index] = { ...subtasks[index], completed: !subtasks[index].completed };
    formData.value = { ...formData.value, subtasks };
  };

  const handleChange = (field: string, value: string) => {
    formData.value = { ...formData.value, [field]: value };
  };

  return (
    <div class={`modal ${isOpen ? 'active' : ''}`} onClick={handleClose}>
      <div class="modal-content" onClick={(e) => e.stopPropagation()}>
        <div class="modal-header">
          <h2>{editingTask ? t('taskForm.editTask') : t('taskForm.newTask')}</h2>
          <button class="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div class="form-group">
            <label>{t('taskForm.titleLabel')}</label>
            <input
              type="text"
              required
              value={formData.value.title}
              onInput={(e) => handleChange('title', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="form-group">
            <label>{t('taskForm.columnLabel')}</label>
            <select
              value={formData.value.status}
              onInput={(e) => handleChange('status', (e.target as HTMLSelectElement).value)}
            >
              {config.columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>
          <div class="form-group">
            <label>{t('taskForm.priorityLabel')}</label>
            <select
              value={formData.value.priority}
              onInput={(e) => handleChange('priority', (e.target as HTMLSelectElement).value)}
            >
              <option value="">{t('taskForm.priorityNone')}</option>
              {config.priorities.map((pri) => (
                <option key={pri} value={pri}>
                  {displayPriority(pri)}
                </option>
              ))}
            </select>
          </div>
          <div class="form-group">
            <label>{t('taskForm.categoryLabel')}</label>
            <input
              type="text"
              placeholder={t('taskForm.categoryPlaceholder')}
              list="categoryOptions"
              value={formData.value.category}
              onInput={(e) => handleChange('category', (e.target as HTMLInputElement).value)}
            />
            <datalist id="categoryOptions">
              {config.categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          <div class="form-group">
            <label>{t('taskForm.assignedLabel')}</label>
            <input
              type="text"
              placeholder={t('taskForm.assignedPlaceholder')}
              list="userOptions"
              value={formData.value.assignees}
              onInput={(e) => handleChange('assignees', (e.target as HTMLInputElement).value)}
            />
            <datalist id="userOptions">
              {config.users.map((user) => (
                <option key={user} value={user} />
              ))}
            </datalist>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div class="form-group">
              <label>{t('taskForm.createdLabel')}</label>
              <input
                type="date"
                value={formData.value.created}
                onInput={(e) => handleChange('created', (e.target as HTMLInputElement).value)}
              />
            </div>
            <div class="form-group">
              <label>{t('taskForm.startedLabel')}</label>
              <input
                type="date"
                value={formData.value.started}
                onInput={(e) => handleChange('started', (e.target as HTMLInputElement).value)}
              />
            </div>
            <div class="form-group">
              <label>{t('taskForm.dueLabel')}</label>
              <input
                type="date"
                value={formData.value.due}
                onInput={(e) => handleChange('due', (e.target as HTMLInputElement).value)}
              />
            </div>
            <div class="form-group">
              <label>{t('taskForm.completedLabel')}</label>
              <input
                type="date"
                value={formData.value.completed}
                onInput={(e) => handleChange('completed', (e.target as HTMLInputElement).value)}
              />
            </div>
          </div>
          <div class="form-group">
            <label>{t('taskForm.tagsLabel')}</label>
            <input
              type="text"
              placeholder={t('taskForm.tagsPlaceholder')}
              list="tagOptions"
              value={formData.value.tags}
              onInput={(e) => handleChange('tags', (e.target as HTMLInputElement).value)}
            />
            <small style={{ color: 'var(--text-secondary)' }}>{t('taskForm.tagsHelp')}</small>
            <datalist id="tagOptions">
              {config.tags.map((tag) => (
                <option key={tag} value={`#${tag}`} />
              ))}
            </datalist>
          </div>
          <div class="form-group">
            <label>{t('taskForm.descriptionLabel')}</label>
            <textarea
              rows={3}
              value={formData.value.description}
              onInput={(e) => handleChange('description', (e.target as HTMLTextAreaElement).value)}
            />
          </div>
          <div class="form-group">
            <label>{t('taskForm.subtasksLabel')}</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <input
                type="text"
                placeholder={t('taskForm.subtaskPlaceholder')}
                value={newSubtask.value}
                onInput={(e) => setNewSubtask((e.target as HTMLInputElement).value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <Button type="button" onClick={handleAddSubtask} class="btn-secondary">
                {t('taskForm.subtaskAdd')}
              </Button>
            </div>
            {formData.value.subtasks.length > 0 && (
              <ul style={{ listStyle: 'none' }}>
                {formData.value.subtasks.map((st, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(i)}
                    />
                    <span style={{ flex: 1, textDecoration: st.completed ? 'line-through' : 'none' }}>
                      {st.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}
                    >
                      🗑️
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div class="form-group">
            <label>{t('taskForm.notesLabel')}</label>
            <textarea
              rows={5}
              placeholder={t('taskForm.notesPlaceholder')}
              value={formData.value.notes}
              onInput={(e) => handleChange('notes', (e.target as HTMLTextAreaElement).value)}
            />
            <small style={{ color: 'var(--text-secondary)' }}>{t('taskForm.notesHelp')}</small>
          </div>
          <div class="actions">
            <Button type="button" onClick={handleClose} class="btn-secondary">
              {t('taskForm.cancel')}
            </Button>
            <Button type="submit" class="btn-primary">
              {editingTask ? t('taskForm.save') : t('taskForm.create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ArchiveModal component
function ArchiveModal() {
  const isOpen = archiveModalOpen.value;
  const search = archiveSearchSignal.value;

  const filteredArchives = archivedTasksSignal.value.filter(
    (task) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase()) ||
      task.notes.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  const handleClose = () => {
    archiveModalOpen.value = false;
    archiveSearchSignal.value = '';
  };

  const handleRestore = async (task: Task) => {
    const newArchived = archivedTasksSignal.value.filter((t) => t.id !== task.id);
    await archiveApi.put(newArchived);
    archivedTasksSignal.value = newArchived;
    
    const newTasks = [...tasksSignal.value, task];
    tasksSignal.value = newTasks;
    
    showNotification(t('notif.taskRestored'), 'success');
  };

  const handleDelete = async (task: Task) => {
    if (confirm(t('confirm.deleteTaskFromArchive', { title: task.title }))) {
      const newArchived = archivedTasksSignal.value.filter((t) => t.id !== task.id);
      await archiveApi.put(newArchived);
      archivedTasksSignal.value = newArchived;
      showNotification(t('notif.taskDeleted'), 'success');
    }
  };

  return (
    <div class={`modal ${isOpen ? 'active' : ''}`} onClick={handleClose}>
      <div class="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
        <div class="modal-header">
          <h2>{t('archives.title')}</h2>
          <button class="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder={t('archives.search')}
            value={search}
            onInput={(e) => (archiveSearchSignal.value = (e.target as HTMLInputElement).value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '0.95rem',
            }}
          />
        </div>
        {filteredArchives.length === 0 ? (
          <div class="empty-state">{t('archives.empty')}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredArchives.map((task) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  background: 'white',
                }}
              >
                <div>
                  <strong>{task.id}</strong> - {task.title}
                  {task.priority && (
                    <span
                      class={`badge badge-priority ${getPriorityClass(task.priority)}`}
                      style={{ marginLeft: '0.5rem' }}
                    >
                      {displayPriority(task.priority)}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button onClick={() => handleRestore(task)} class="btn-secondary">
                    {t('action.restore')}
                  </Button>
                  <Button onClick={() => handleDelete(task)} class="btn-secondary">
                    {t('action.delete')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ColumnsModal component
function ColumnsModal() {
  const isOpen = columnsModalOpen.value;
  const config = configSignal.value;
  const [columns, setColumns] = signal([...config.columns]);

  if (!isOpen) return null;

  const handleClose = () => {
    columnsModalOpen.value = false;
    setColumns([...configSignal.value.columns]);
  };

  const handleSave = () => {
    configSignal.value = { ...config, columns: columns.value };
    handleClose();
    showNotification(t('notif.saved'), 'success');
  };

  const handleAdd = () => {
    const name = prompt(t('prompt.columnName'));
    if (!name) return;
    const id = prompt(t('prompt.columnId'));
    if (!id) return;
    setColumns([...columns.value, { name, id }]);
  };

  const handleDelete = (index: number) => {
    if (confirm(t('confirm.deleteColumn'))) {
      setColumns(columns.value.filter((_, i) => i !== index));
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newColumns = [...columns.value];
    [newColumns[index - 1], newColumns[index]] = [newColumns[index], newColumns[index - 1]];
    setColumns(newColumns);
  };

  const handleMoveDown = (index: number) => {
    if (index === columns.value.length - 1) return;
    const newColumns = [...columns.value];
    [newColumns[index], newColumns[index + 1]] = [newColumns[index + 1], newColumns[index]];
    setColumns(newColumns);
  };

  return (
    <div class={`modal ${isOpen ? 'active' : ''}`} onClick={handleClose}>
      <div class="modal-content" onClick={(e) => e.stopPropagation()}>
        <div class="modal-header">
          <h2>{t('columns.title')}</h2>
          <button class="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {columns.value.map((col, index) => (
            <div
              key={col.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
              }}
            >
              <span style={{ fontWeight: 600 }}>{index + 1}.</span>
              <span style={{ flex: 1 }}>
                {col.name} ({col.id})
              </span>
              <Button onClick={() => handleMoveUp(index)} class="btn-secondary" disabled={index === 0}>
                ↑
              </Button>
              <Button
                onClick={() => handleMoveDown(index)}
                class="btn-secondary"
                disabled={index === columns.value.length - 1}
              >
                ↓
              </Button>
              <Button onClick={() => handleDelete(index)} class="btn-secondary" style={{ color: '#EF4444' }}>
                🗑️
              </Button>
            </div>
          ))}
        </div>
        <div class="actions">
          <Button onClick={handleAdd} class="btn-secondary">
            {t('columns.add')}
          </Button>
          <Button onClick={handleSave} class="btn-primary">
            {t('taskForm.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Header component
function Header() {
  const lang = getLanguage();

  const handleLanguageChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    setLanguage(target.value as Language);
    // Force re-render by updating a signal
    searchTermSignal.value = searchTermSignal.value;
  };

  const handleNewTask = () => {
    editingTaskSignal.value = null;
    taskFormModalOpen.value = true;
  };

  return (
    <header class="header">
      <div class="header-content">
        <h1>{t('header.title')}</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={lang}
            onChange={handleLanguageChange}
            style={{
              padding: '0.6rem 1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontSize: '0.9rem',
              background: 'white',
              cursor: 'pointer',
            }}
          >
            <option value="en">{t('language.en')}</option>
            <option value="fr">{t('language.fr')}</option>
          </select>
          <Button onClick={handleNewTask} class="btn-secondary">
            {t('header.newTask')}
          </Button>
          <Button onClick={() => archiveModalOpen.value = true} class="btn-secondary">
            {t('header.archives')}
          </Button>
          <Button onClick={() => columnsModalOpen.value = true} class="btn-secondary">
            {t('header.columns')}
          </Button>
        </div>
      </div>
    </header>
  );
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
      <Header />
      <FilterBar />
      <main class="container">
        <KanbanBoard />
      </main>
      <TaskDetailModal />
      <TaskFormModal />
      <ArchiveModal />
      <ColumnsModal />
      <Notification />
    </Fragment>
  );
}