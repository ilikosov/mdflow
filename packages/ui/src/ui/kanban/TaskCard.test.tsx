import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { TaskCard } from './TaskCard';
import type { Task } from '@mdflow/types';

describe('TaskCard', () => {
  const mockTask: Task = {
    id: 'TASK-001',
    title: 'Test Task',
    description: 'This is a test task description',
    status: 'todo',
    priority: '🔴 Urgent',
    category: 'Feature',
    assignees: ['user1', 'user2'],
    tags: ['urgent', 'help-needed'],
    created: '2024-01-01',
    started: '',
    due: '2024-01-15',
    completed: '',
    subtasks: [
      { completed: true, text: 'Completed subtask' },
      { completed: false, text: 'Pending subtask' },
    ],
    notes: '',
  };

  it('renders task ID and title', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText(/TASK-001/i)).toBeInTheDocument();
    expect(screen.getByText(/test task/i)).toBeInTheDocument();
  });

  it('renders task description', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText(/this is a test task description/i)).toBeInTheDocument();
  });

  it('renders priority badge', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText(/🔴 urgent/i)).toBeInTheDocument();
  });

  it('renders category badge', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText(/feature/i)).toBeInTheDocument();
  });

  it('renders assignee badges', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText(/user1/i)).toBeInTheDocument();
    expect(screen.getByText(/user2/i)).toBeInTheDocument();
  });

  it('renders tag badges with # prefix', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText(/#urgent/i)).toBeInTheDocument();
    expect(screen.getByText(/#help-needed/i)).toBeInTheDocument();
  });

  it('renders subtask progress bar', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.getByText(/1\/2/i)).toBeInTheDocument();
    const progressBar = document.querySelector('.progress-fill') as HTMLElement;
    expect(progressBar.style.width).toBe('50%');
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = vi.fn();
    render(<TaskCard task={mockTask} onClick={handleClick} />);
    const card = document.querySelector('.task-card') as HTMLElement;
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledWith(mockTask);
  });

  it('is draggable', () => {
    render(<TaskCard task={mockTask} />);
    const card = document.querySelector('.task-card') as HTMLElement;
    expect(card).toHaveAttribute('draggable', 'true');
  });

  it('sets dataTransfer on drag start', () => {
    render(<TaskCard task={mockTask} />);
    const card = document.querySelector('.task-card') as HTMLElement;
    const mockDataTransfer = { setData: vi.fn() };
    fireEvent.dragStart(card, { dataTransfer: mockDataTransfer });
    expect(mockDataTransfer.setData).toHaveBeenCalledWith('text/plain', 'TASK-001');
  });

  it('removes dragging class on drag end', () => {
    render(<TaskCard task={mockTask} />);
    const card = document.querySelector('.task-card') as HTMLElement;
    fireEvent.dragEnd(card);
    expect(card.classList.contains('dragging')).toBe(false);
  });

  it('limits displayed assignees to 2', () => {
    const taskWithMultipleAssignees: Task = {
      ...mockTask,
      assignees: ['user1', 'user2', 'user3', 'user4'],
    };
    render(<TaskCard task={taskWithMultipleAssignees} />);
    expect(screen.getByText(/user1/i)).toBeInTheDocument();
    expect(screen.getByText(/user2/i)).toBeInTheDocument();
  });

  it('limits displayed tags to 3', () => {
    const taskWithMultipleTags: Task = {
      ...mockTask,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    };
    render(<TaskCard task={taskWithMultipleTags} />);
    expect(screen.getByText(/#tag1/i)).toBeInTheDocument();
    expect(screen.getByText(/#tag2/i)).toBeInTheDocument();
    expect(screen.getByText(/#tag3/i)).toBeInTheDocument();
  });
});
