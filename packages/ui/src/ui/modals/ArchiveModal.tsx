import { h } from 'preact';
import { useState } from 'preact/hooks';
import type { Task } from '@mdflow/types';
import { t } from '../../lib/i18n';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { getFirstEmoji, priorityIconClasses } from '../../lib/utils';
import {
  archivedTasksSignal,
  archiveModalOpenSignal,
  tasksSignal,
} from '../../signals/state';
import { archiveApi } from '../../api/client';

function getPriorityClass(priority: string): string {
  const emoji = getFirstEmoji(priority);
  return priorityIconClasses[emoji] || 'Default';
}

export function ArchiveModal() {
  const isOpen = archiveModalOpenSignal.value;
  const [search, setSearch] = useState('');

  const filteredArchives = archivedTasksSignal.value.filter(
    (task) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase()) ||
      task.notes.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  const handleClose = () => {
    archiveModalOpenSignal.value = false;
    setSearch('');
  };

  const handleRestore = async (task: Task) => {
    const newArchived = archivedTasksSignal.value.filter((t) => t.id !== task.id);
    await archiveApi.put(newArchived);
    archivedTasksSignal.value = newArchived;
    
    const newTasks = [...tasksSignal.value, task];
    tasksSignal.value = newTasks;
  };

  const handleDelete = async (task: Task) => {
    if (confirm(t('confirm.deleteTaskFromArchive', { title: task.title }))) {
      const newArchived = archivedTasksSignal.value.filter((t) => t.id !== task.id);
      await archiveApi.put(newArchived);
      archivedTasksSignal.value = newArchived;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('archives.title')} size="large">
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder={t('archives.search')}
          value={search}
          onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
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
                    {task.priority}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button onClick={() => handleRestore(task)} variant="secondary">
                  {t('action.restore')}
                </Button>
                <Button onClick={() => handleDelete(task)} variant="secondary">
                  {t('action.delete')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
