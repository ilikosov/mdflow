import { h } from 'preact';
import type { Task, Column } from '@mdflow/types';
import { t } from '../../lib/i18n';
import { TaskCard } from './TaskCard';
import { tasksSignal, filteredTasksSignal, configSignal } from '../../signals/state';

export interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function KanbanColumn({ column, tasks, onTaskClick }: KanbanColumnProps) {
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
          <TaskCard key={task.id} task={task} onClick={onTaskClick} />
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

export interface KanbanBoardProps {
  onTaskClick?: (task: Task) => void;
}

export function KanbanBoard({ onTaskClick }: KanbanBoardProps) {
  const columns = configSignal.value.columns;
  const filteredTasks = filteredTasksSignal.value;

  return (
    <div class="kanban-board">
      {columns.map((column) => {
        const tasks = filteredTasks.filter((t) => t.status === column.id);
        return (
          <KanbanColumn 
            key={column.id} 
            column={column} 
            tasks={tasks} 
            onTaskClick={onTaskClick} 
          />
        );
      })}
    </div>
  );
}
