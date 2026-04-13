import { h } from 'preact';
import type { Task } from '@mdflow/types';
import { getFirstEmoji, priorityIconClasses } from '../../lib/utils';
import { t } from '../../lib/i18n';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
import { normalizeUserId } from '../../signals/state';

export interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

function getPriorityClass(priority: string): string {
  const emoji = getFirstEmoji(priority);
  return priorityIconClasses[emoji] || 'Default';
}

function displayPriority(priority: string): string {
  // In a real implementation, this would use i18n translations
  return priority;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
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
    if (onClick) {
      onClick(task);
    }
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
          <Badge type="priority" value={task.priority} />
        )}
        {task.category && <Badge type="category" value={task.category} />}
        {task.assignees.slice(0, 2).map((assignee) => (
          <Badge key={assignee} type="assignee" value={normalizeUserId(assignee)} />
        ))}
        {task.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} type="tag" value={tag} />
        ))}
      </div>
      {totalSubtasks > 0 && (
        <div class="task-subtasks">
          <div class="subtask-progress">
            <span>
              {completedSubtasks}/{totalSubtasks}
            </span>
            <ProgressBar completed={completedSubtasks} total={totalSubtasks} />
          </div>
        </div>
      )}
    </div>
  );
}
