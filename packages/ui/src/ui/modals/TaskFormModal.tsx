import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { signal } from '@preact/signals';
import type { Task, Subtask, Column } from '@mdflow/types';
import { t } from '../../lib/i18n';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import {
  tasksSignal,
  configSignal,
  editingTaskIdSignal,
  taskFormModalOpenSignal,
} from '../../signals/state';

export function TaskFormModal() {
  const isOpen = taskFormModalOpenSignal.value;
  const editingTaskId = editingTaskIdSignal.value;
  const config = configSignal.value;

  const [formData, setFormData] = useState({
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

  const [newSubtask, setNewSubtask] = useState('');

  // Load task data when editing
  useEffect(() => {
    if (editingTaskId) {
      const task = tasksSignal.value.find(t => t.id === editingTaskId);
      if (task) {
        setFormData({
          title: task.title,
          status: task.status,
          priority: task.priority,
          category: task.category,
          assignees: task.assignees.join(', '),
          created: task.created,
          started: task.started,
          due: task.due,
          completed: task.completed,
          tags: task.tags.join(' '),
          description: task.description,
          subtasks: [...task.subtasks],
          notes: task.notes,
        });
      }
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
  }, [editingTaskId]);

  if (!isOpen) return null;

  const handleClose = () => {
    taskFormModalOpenSignal.value = false;
    editingTaskIdSignal.value = null;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    const task: Task = {
      id: editingTaskId || `TASK-${String(config.lastTaskId + 1).padStart(3, '0')}`,
      title: formData.title,
      status: formData.status,
      priority: formData.priority,
      category: formData.category,
      assignees: formData.assignees
        .split(',')
        .map(a => a.trim())
        .filter(Boolean),
      tags: formData.tags
        .split(/\s+/)
        .filter(Boolean)
        .map(t => t.replace(/^#/, '')),
      created: formData.created,
      started: formData.started,
      due: formData.due,
      completed: formData.completed,
      description: formData.description,
      subtasks: formData.subtasks,
      notes: formData.notes,
    };

    if (editingTaskId) {
      // Update existing task
      const newTasks = tasksSignal.value.map(t => (t.id === task.id ? task : t));
      tasksSignal.value = newTasks;
    } else {
      // Create new task
      const newTasks = [...tasksSignal.value, task];
      tasksSignal.value = newTasks;
      configSignal.value = { ...config, lastTaskId: config.lastTaskId + 1 };
    }

    handleClose();
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setFormData({
        ...formData,
        subtasks: [...formData.subtasks, { completed: false, text: newSubtask.trim() }],
      });
      setNewSubtask('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.filter((_, i) => i !== index),
    });
  };

  const handleToggleSubtask = (index: number) => {
    const subtasks = [...formData.subtasks];
    subtasks[index] = { ...subtasks[index], completed: !subtasks[index].completed };
    setFormData({ ...formData, subtasks });
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingTaskId ? t('taskForm.editTask') : t('taskForm.newTask')}
    >
      <form onSubmit={handleSubmit}>
        <div class="form-group">
          <label htmlFor="taskForm-title">{t('taskForm.titleLabel')}</label>
          <input
            id="taskForm-title"
            type="text"
            required
            value={formData.title}
            onInput={e => handleChange('title', (e.target as HTMLInputElement).value)}
          />
        </div>
        <div class="form-group">
          <label htmlFor="taskForm-status">{t('taskForm.columnLabel')}</label>
          <select
            id="taskForm-status"
            value={formData.status}
            onInput={e => handleChange('status', (e.target as HTMLSelectElement).value)}
          >
            {config.columns.map(col => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
        </div>
        <div class="form-group">
          <label htmlFor="taskForm-priority">{t('taskForm.priorityLabel')}</label>
          <select
            id="taskForm-priority"
            value={formData.priority}
            onInput={e => handleChange('priority', (e.target as HTMLSelectElement).value)}
          >
            <option value="">{t('taskForm.priorityNone')}</option>
            {config.priorities.map(pri => (
              <option key={pri} value={pri}>
                {pri}
              </option>
            ))}
          </select>
        </div>
        <div class="form-group">
          <label htmlFor="taskForm-category">{t('taskForm.categoryLabel')}</label>
          <input
            id="taskForm-category"
            type="text"
            placeholder={t('taskForm.categoryPlaceholder')}
            list="categoryOptions"
            value={formData.category}
            onInput={e => handleChange('category', (e.target as HTMLInputElement).value)}
          />
          <datalist id="categoryOptions">
            {config.categories.map(cat => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>
        <div class="form-group">
          <label htmlFor="taskForm-assignees">{t('taskForm.assignedLabel')}</label>
          <input
            id="taskForm-assignees"
            type="text"
            placeholder={t('taskForm.assignedPlaceholder')}
            list="userOptions"
            value={formData.assignees}
            onInput={e => handleChange('assignees', (e.target as HTMLInputElement).value)}
          />
          <datalist id="userOptions">
            {config.users.map(user => (
              <option key={user} value={user} />
            ))}
          </datalist>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div class="form-group">
            <label htmlFor="taskForm-created">{t('taskForm.createdLabel')}</label>
            <input
              id="taskForm-created"
              type="date"
              value={formData.created}
              onInput={e => handleChange('created', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="form-group">
            <label htmlFor="taskForm-started">{t('taskForm.startedLabel')}</label>
            <input
              id="taskForm-started"
              type="date"
              value={formData.started}
              onInput={e => handleChange('started', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="form-group">
            <label htmlFor="taskForm-due">{t('taskForm.dueLabel')}</label>
            <input
              id="taskForm-due"
              type="date"
              value={formData.due}
              onInput={e => handleChange('due', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="form-group">
            <label htmlFor="taskForm-completed">{t('taskForm.completedLabel')}</label>
            <input
              id="taskForm-completed"
              type="date"
              value={formData.completed}
              onInput={e => handleChange('completed', (e.target as HTMLInputElement).value)}
            />
          </div>
        </div>
        <div class="form-group">
          <label htmlFor="taskForm-tags">{t('taskForm.tagsLabel')}</label>
          <input
            id="taskForm-tags"
            type="text"
            placeholder={t('taskForm.tagsPlaceholder')}
            list="tagOptions"
            value={formData.tags}
            onInput={e => handleChange('tags', (e.target as HTMLInputElement).value)}
          />
          <small style={{ color: 'var(--text-secondary)' }}>{t('taskForm.tagsHelp')}</small>
          <datalist id="tagOptions">
            {config.tags.map(tag => (
              <option key={tag} value={`#${tag}`} />
            ))}
          </datalist>
        </div>
        <div class="form-group">
          <label htmlFor="taskForm-description">{t('taskForm.descriptionLabel')}</label>
          <textarea
            id="taskForm-description"
            rows={3}
            value={formData.description}
            onInput={e => handleChange('description', (e.target as HTMLTextAreaElement).value)}
          />
        </div>
        <div class="form-group">
          <label htmlFor="taskForm-newSubtask">{t('taskForm.subtasksLabel')}</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              id="taskForm-newSubtask"
              type="text"
              placeholder={t('taskForm.subtaskPlaceholder')}
              value={newSubtask}
              onInput={e => setNewSubtask((e.target as HTMLInputElement).value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
            />
            <Button type="button" onClick={handleAddSubtask} variant="secondary">
              {t('taskForm.subtaskAdd')}
            </Button>
          </div>
          {formData.subtasks.length > 0 && (
            <ul style={{ listStyle: 'none' }}>
              {formData.subtasks.map((st, i) => (
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
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#EF4444',
                    }}
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div class="form-group">
          <label htmlFor="taskForm-notes">{t('taskForm.notesLabel')}</label>
          <textarea
            id="taskForm-notes"
            rows={5}
            placeholder={t('taskForm.notesPlaceholder')}
            value={formData.notes}
            onInput={e => handleChange('notes', (e.target as HTMLTextAreaElement).value)}
          />
          <small style={{ color: 'var(--text-secondary)' }}>{t('taskForm.notesHelp')}</small>
        </div>
        <div class="actions">
          <Button type="button" onClick={handleClose} variant="secondary">
            {t('taskForm.cancel')}
          </Button>
          <Button type="submit" variant="primary">
            {editingTaskId ? t('taskForm.save') : t('taskForm.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
