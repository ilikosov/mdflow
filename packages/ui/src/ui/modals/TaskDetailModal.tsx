import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { Task, Subtask } from '@mdflow/types';
import { t } from '../../lib/i18n';
import { markdownToHtml } from '../../lib/markdown';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { getFirstEmoji, priorityIconClasses } from '../../lib/utils';
import {
  tasksSignal,
  archivedTasksSignal,
  selectedTaskIdSignal,
  editingTaskIdSignal,
  taskDetailModalOpenSignal,
  taskFormModalOpenSignal,
} from '../../signals/state';
import { archiveApi } from '../../api/client';

function getPriorityClass(priority: string): string {
  const emoji = getFirstEmoji(priority);
  return priorityIconClasses[emoji] || 'Default';
}

export function TaskDetailModal() {
  const isOpen = taskDetailModalOpenSignal.value;
  const selectedTaskId = selectedTaskIdSignal.value;
  const task = selectedTaskId 
    ? tasksSignal.value.find((t) => t.id === selectedTaskId) || null
    : null;

  if (!isOpen || !task) return null;

  const handleClose = () => {
    taskDetailModalOpenSignal.value = false;
    selectedTaskIdSignal.value = null;
  };

  const handleEdit = () => {
    editingTaskIdSignal.value = task.id;
    taskDetailModalOpenSignal.value = false;
    taskFormModalOpenSignal.value = true;
  };

  const handleArchive = async () => {
    if (confirm(t('confirm.archiveTask', { title: task.title }))) {
      const newArchived = [...archivedTasksSignal.value, task];
      await archiveApi.put(newArchived);
      archivedTasksSignal.value = newArchived;
      
      const newTasks = tasksSignal.value.filter((t) => t.id !== task.id);
      tasksSignal.value = newTasks;
      
      taskDetailModalOpenSignal.value = false;
      selectedTaskIdSignal.value = null;
    }
  };

  const handleDelete = async () => {
    if (confirm(t('confirm.deleteTask', { title: task.title }))) {
      const newTasks = tasksSignal.value.filter((t) => t.id !== task.id);
      tasksSignal.value = newTasks;
      
      taskDetailModalOpenSignal.value = false;
      selectedTaskIdSignal.value = null;
    }
  };

  const priorityClass = getPriorityClass(task.priority);
  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('taskDetail.title')}>
      <div class="task-detail">
        <h3 style={{ marginBottom: '1rem' }}>{task.title}</h3>
        
        <p>
          <strong>{t('meta.priority')}:</strong>{' '}
          <span class={`badge badge-priority ${priorityClass}`}>{task.priority}</span>
        </p>
        <p>
          <strong>{t('meta.status')}:</strong>{' '}
          {task.status}
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
        <Button onClick={handleEdit} variant="primary">
          {t('taskDetail.edit')}
        </Button>
        <Button onClick={handleArchive} variant="secondary">
          {t('taskDetail.archive')}
        </Button>
        <Button onClick={handleDelete} variant="secondary" style={{ color: '#EF4444' }}>
          {t('taskDetail.delete')}
        </Button>
        <Button onClick={handleClose} variant="secondary">
          {t('taskDetail.close')}
        </Button>
      </div>
    </Modal>
  );
}
