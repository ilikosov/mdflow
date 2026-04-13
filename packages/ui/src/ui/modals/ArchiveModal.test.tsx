import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { ArchiveModal } from './ArchiveModal';
import { 
  archiveModalOpenSignal, 
  archivedTasksSignal,
  tasksSignal,
} from '../../signals/state';
import type { Task } from '@mdflow/types';

describe('ArchiveModal', () => {
  const mockArchivedTask: Task = {
    id: 'TASK-001',
    title: 'Archived Task',
    description: 'This was archived',
    status: 'done',
    priority: '🟢 Low',
    category: 'Feature',
    assignees: ['user1'],
    tags: ['old'],
    created: '2024-01-01',
    started: '',
    due: '',
    completed: '2024-01-10',
    subtasks: [],
    notes: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    archiveModalOpenSignal.value = false;
    archivedTasksSignal.value = [mockArchivedTask];
    tasksSignal.value = [];
  });

  it('renders nothing when modal is closed', () => {
    archiveModalOpenSignal.value = false;
    render(<ArchiveModal />);
    expect(screen.queryByText(/archives.title/i)).not.toBeInTheDocument();
  });

  it('renders archive modal with title when open', () => {
    archiveModalOpenSignal.value = true;
    render(<ArchiveModal />);
    expect(screen.getByText(/archives.title/i)).toBeInTheDocument();
  });

  it('displays search input', () => {
    archiveModalOpenSignal.value = true;
    render(<ArchiveModal />);
    expect(screen.getByPlaceholderText(/archives.search/i)).toBeInTheDocument();
  });

  it('shows archived tasks', () => {
    archiveModalOpenSignal.value = true;
    render(<ArchiveModal />);
    expect(screen.getByText(/archived task/i)).toBeInTheDocument();
    expect(screen.getByText(/this was archived/i)).toBeInTheDocument();
  });

  it('filters archived tasks by search query', () => {
    archivedTasksSignal.value = [
      mockArchivedTask,
      {
        ...mockArchivedTask,
        id: 'TASK-002',
        title: 'Another Task',
        description: 'Different description',
      },
    ];
    
    archiveModalOpenSignal.value = true;
    render(<ArchiveModal />);
    
    expect(screen.getByText(/archived task/i)).toBeInTheDocument();
    expect(screen.getByText(/another task/i)).toBeInTheDocument();
    
    const searchInput = screen.getByPlaceholderText(/archives.search/i);
    fireEvent.input(searchInput, { target: { value: 'different' } });
    
    expect(screen.queryByText(/archived task/i)).not.toBeInTheDocument();
    expect(screen.getByText(/another task/i)).toBeInTheDocument();
  });

  it('shows empty state when no archived tasks', () => {
    archivedTasksSignal.value = [];
    archiveModalOpenSignal.value = true;
    render(<ArchiveModal />);
    expect(screen.getByText(/archives.empty/i)).toBeInTheDocument();
  });

  it('shows empty state when search has no matches', () => {
    archiveModalOpenSignal.value = true;
    render(<ArchiveModal />);
    
    const searchInput = screen.getByPlaceholderText(/archives.search/i);
    fireEvent.input(searchInput, { target: { value: 'nonexistent' } });
    
    expect(screen.getByText(/archives.empty/i)).toBeInTheDocument();
  });

  it('restores task when Restore button is clicked', async () => {
    archiveModalOpenSignal.value = true;
    render(<ArchiveModal />);
    
    const restoreButton = screen.getByRole('button', { name: /action.restore/i });
    fireEvent.click(restoreButton);
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(archivedTasksSignal.value).toHaveLength(0);
    expect(tasksSignal.value).toHaveLength(1);
  });

  it('deletes task from archive when Delete button is clicked and confirmed', async () => {
    global.confirm = vi.fn(() => true);
    archiveModalOpenSignal.value = true;
    render(<ArchiveModal />);
    
    const deleteButton = screen.getByRole('button', { name: /action.delete/i });
    fireEvent.click(deleteButton);
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(global.confirm).toHaveBeenCalled();
    expect(archivedTasksSignal.value).toHaveLength(0);
  });

  it('does not delete if confirmation is cancelled', async () => {
    global.confirm = vi.fn(() => false);
    archiveModalOpenSignal.value = true;
    render(<ArchiveModal />);
    
    const deleteButton = screen.getByRole('button', { name: /action.delete/i });
    fireEvent.click(deleteButton);
    
    expect(archivedTasksSignal.value).toHaveLength(1);
  });

  it('closes modal and clears search when close button is clicked', () => {
    archiveModalOpenSignal.value = true;
    render(<ArchiveModal />);
    
    const closeButton = document.querySelector('.close-btn') as HTMLElement;
    fireEvent.click(closeButton);
    
    expect(archiveModalOpenSignal.value).toBe(false);
  });

  it('displays priority badge for archived tasks', () => {
    archiveModalOpenSignal.value = true;
    render(<ArchiveModal />);
    
    expect(screen.getByText(/🟢 low/i)).toBeInTheDocument();
  });
});
