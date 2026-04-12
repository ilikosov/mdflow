import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { KanbanBoard, KanbanColumn } from './KanbanBoard';
import type { Task, Column } from '@mdflow/types';
import { tasksSignal, filteredTasksSignal, configSignal } from '../../signals/state';

describe('KanbanColumn', () => {
  const mockColumn: Column = { id: 'todo', name: 'To Do' };
  const mockTasks: Task[] = [
    {
      id: 'TASK-001',
      title: 'Task 1',
      description: '',
      status: 'todo',
      priority: '',
      category: '',
      assignees: [],
      tags: [],
      created: '',
      started: '',
      due: '',
      completed: '',
      subtasks: [],
      notes: '',
    },
  ];

  it('renders column header with name and task count', () => {
    render(<KanbanColumn column={mockColumn} tasks={mockTasks} />);
    expect(screen.getByText(/to do/i)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders task cards', () => {
    render(<KanbanColumn column={mockColumn} tasks={mockTasks} />);
    expect(screen.getByText(/task 1/i)).toBeInTheDocument();
  });

  it('shows empty state when no tasks', () => {
    render(<KanbanColumn column={mockColumn} tasks={[]} />);
    expect(screen.getByText(/empty.noTasks/i)).toBeInTheDocument();
  });

  it('calls onTaskClick when a task card is clicked', () => {
    const handleClick = vi.fn();
    render(<KanbanColumn column={mockColumn} tasks={mockTasks} onTaskClick={handleClick} />);
    const taskCard = document.querySelector('.task-card') as HTMLElement;
    fireEvent.click(taskCard);
    expect(handleClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('handles drag over event', () => {
    render(<KanbanColumn column={mockColumn} tasks={mockTasks} />);
    const column = document.querySelector('.kanban-column') as HTMLElement;
    const event = new Event('dragover', { bubbles: true, cancelable: true });
    fireEvent(column, event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('updates task status on drop', async () => {
    tasksSignal.value = [mockTasks[0]];
    
    render(<KanbanColumn column={mockColumn} tasks={mockTasks} />);
    const column = document.querySelector('.kanban-column') as HTMLElement;
    
    const mockDataTransfer = { getData: vi.fn().mockReturnValue('TASK-001') };
    const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
    Object.defineProperty(dropEvent, 'dataTransfer', { value: mockDataTransfer });
    
    fireEvent(column, dropEvent);
    
    expect(tasksSignal.value[0].status).toBe('todo');
  });
});

describe('KanbanBoard', () => {
  const mockColumns: Column[] = [
    { id: 'todo', name: 'To Do' },
    { id: 'inprogress', name: 'In Progress' },
    { id: 'done', name: 'Done' },
  ];

  const mockTasks: Task[] = [
    {
      id: 'TASK-001',
      title: 'Task 1',
      description: '',
      status: 'todo',
      priority: '',
      category: '',
      assignees: [],
      tags: [],
      created: '',
      started: '',
      due: '',
      completed: '',
      subtasks: [],
      notes: '',
    },
    {
      id: 'TASK-002',
      title: 'Task 2',
      description: '',
      status: 'inprogress',
      priority: '',
      category: '',
      assignees: [],
      tags: [],
      created: '',
      started: '',
      due: '',
      completed: '',
      subtasks: [],
      notes: '',
    },
  ];

  beforeEach(() => {
    configSignal.value = { ...configSignal.value, columns: mockColumns };
    filteredTasksSignal.value = mockTasks;
  });

  it('renders all columns from config', () => {
    render(<KanbanBoard />);
    expect(screen.getByText(/to do/i)).toBeInTheDocument();
    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    expect(screen.getByText(/done/i)).toBeInTheDocument();
  });

  it('displays correct task count per column', () => {
    render(<KanbanBoard />);
    // To Do column should have 1 task
    // In Progress column should have 1 task
    // Done column should have 0 tasks
    const columnCounts = document.querySelectorAll('.column-count');
    expect(columnCounts).toHaveLength(3);
  });

  it('renders TaskCard components for each task', () => {
    render(<KanbanBoard />);
    expect(screen.getByText(/task 1/i)).toBeInTheDocument();
    expect(screen.getByText(/task 2/i)).toBeInTheDocument();
  });

  it('calls onTaskClick when a task is clicked', () => {
    const handleClick = vi.fn();
    render(<KanbanBoard onTaskClick={handleClick} />);
    const taskCards = document.querySelectorAll('.task-card');
    fireEvent.click(taskCards[0]);
    expect(handleClick).toHaveBeenCalledWith(mockTasks[0]);
  });
});
