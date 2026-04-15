import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { TaskDetailModal } from './TaskDetailModal';
import {
  taskDetailModalOpenSignal,
  selectedTaskIdSignal,
  tasksSignal,
  archivedTasksSignal,
  taskFormModalOpenSignal,
  editingTaskIdSignal,
} from '../../signals/state';
import type { Task } from '@mdflow/types';

describe('TaskDetailModal', () => {
  const mockTask: Task = {
    id: 'TASK-001',
    title: 'Test Task Title',
    description: 'This is a test description',
    status: 'todo',
    priority: '🔴 Urgent',
    category: 'Feature',
    assignees: ['user1', 'user2'],
    tags: ['urgent'],
    created: '2024-01-01',
    started: '2024-01-02',
    due: '2024-01-15',
    completed: '',
    subtasks: [
      { completed: true, text: 'Done subtask' },
      { completed: false, text: 'Pending subtask' },
    ],
    notes: '# Test Notes\n\nThis is **bold** text.',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    taskDetailModalOpenSignal.value = false;
    selectedTaskIdSignal.value = null;
    tasksSignal.value = [mockTask];
    archivedTasksSignal.value = [];
  });

  it('renders nothing when modal is closed', () => {
    taskDetailModalOpenSignal.value = false;
    render(<TaskDetailModal />);
    expect(screen.queryByText(/taskdetail.title/i)).not.toBeInTheDocument();
  });

  it('renders nothing when no task is selected', () => {
    taskDetailModalOpenSignal.value = true;
    selectedTaskIdSignal.value = null;
    render(<TaskDetailModal />);
    expect(screen.queryByText(/taskdetail.title/i)).not.toBeInTheDocument();
  });

  it('renders task details when modal is open and task is selected', () => {
    taskDetailModalOpenSignal.value = true;
    selectedTaskIdSignal.value = 'TASK-001';
    render(<TaskDetailModal />);

    expect(screen.getByText(/test task title/i)).toBeInTheDocument();
    expect(screen.getByText(/this is a test description/i)).toBeInTheDocument();
    expect(screen.getByText(/🔴 urgent/i)).toBeInTheDocument();
    expect(screen.getByText(/feature/i)).toBeInTheDocument();
  });

  it('displays task metadata', () => {
    taskDetailModalOpenSignal.value = true;
    selectedTaskIdSignal.value = 'TASK-001';
    render(<TaskDetailModal />);

    expect(screen.getByText(/user1, user2/i)).toBeInTheDocument();
    expect(screen.getByText(/2024-01-01/i)).toBeInTheDocument();
    expect(screen.getByText(/2024-01-15/i)).toBeInTheDocument();
    expect(screen.getByText(/#urgent/i)).toBeInTheDocument();
  });

  it('displays subtasks with completed ones crossed out', () => {
    taskDetailModalOpenSignal.value = true;
    selectedTaskIdSignal.value = 'TASK-001';
    render(<TaskDetailModal />);

    expect(screen.getByText(/done subtask/i)).toHaveStyle('text-decoration: line-through');
    expect(screen.getByText(/pending subtask/i)).not.toHaveStyle('text-decoration: line-through');
  });

  it('renders notes as HTML', () => {
    taskDetailModalOpenSignal.value = true;
    selectedTaskIdSignal.value = 'TASK-001';
    render(<TaskDetailModal />);

    // Notes should be rendered as HTML via markdownToHtml
    expect(document.querySelector('.task-detail')).toContainHTML(
      '<p>This is <strong>bold</strong> text.</p>'
    );
  });

  it('calls handleClose when close button is clicked', () => {
    taskDetailModalOpenSignal.value = true;
    selectedTaskIdSignal.value = 'TASK-001';
    render(<TaskDetailModal />);

    const closeButton = document.querySelector('.close-btn') as HTMLElement;
    fireEvent.click(closeButton);

    expect(taskDetailModalOpenSignal.value).toBe(false);
    expect(selectedTaskIdSignal.value).toBe(null);
  });

  it('opens edit form when Edit button is clicked', () => {
    taskDetailModalOpenSignal.value = true;
    selectedTaskIdSignal.value = 'TASK-001';
    render(<TaskDetailModal />);

    const editButton = screen.getByRole('button', { name: /taskdetail.edit/i });
    fireEvent.click(editButton);

    expect(editingTaskIdSignal.value).toBe('TASK-001');
    expect(taskDetailModalOpenSignal.value).toBe(false);
    expect(taskFormModalOpenSignal.value).toBe(true);
  });

  it('archives task when Archive button is clicked and confirmed', async () => {
    global.confirm = vi.fn(() => true);
    taskDetailModalOpenSignal.value = true;
    selectedTaskIdSignal.value = 'TASK-001';
    render(<TaskDetailModal />);

    const archiveButton = screen.getByRole('button', { name: /taskdetail.archive/i });
    fireEvent.click(archiveButton);

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(global.confirm).toHaveBeenCalled();
    expect(archivedTasksSignal.value).toHaveLength(1);
    expect(tasksSignal.value).toHaveLength(0);
  });

  it('deletes task when Delete button is clicked and confirmed', () => {
    global.confirm = vi.fn(() => true);
    taskDetailModalOpenSignal.value = true;
    selectedTaskIdSignal.value = 'TASK-001';
    render(<TaskDetailModal />);

    const deleteButton = screen.getByRole('button', { name: /taskdetail.delete/i });
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalled();
    expect(tasksSignal.value).toHaveLength(0);
    expect(taskDetailModalOpenSignal.value).toBe(false);
  });

  it('does not archive if confirmation is cancelled', () => {
    global.confirm = vi.fn(() => false);
    taskDetailModalOpenSignal.value = true;
    selectedTaskIdSignal.value = 'TASK-001';
    render(<TaskDetailModal />);

    const archiveButton = screen.getByRole('button', { name: /taskdetail.archive/i });
    fireEvent.click(archiveButton);

    expect(archivedTasksSignal.value).toHaveLength(0);
    expect(tasksSignal.value).toHaveLength(1);
  });
});
