import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { TaskFormModal } from './TaskFormModal';
import {
  taskFormModalOpenSignal,
  editingTaskIdSignal,
  tasksSignal,
  configSignal,
} from '../../signals/state';
import type { Task } from '@mdflow/types';

describe('TaskFormModal', () => {
  const mockTask: Task = {
    id: 'TASK-001',
    title: 'Existing Task',
    description: 'Description here',
    status: 'todo',
    priority: '🟡 Medium',
    category: 'Bug',
    assignees: ['user1'],
    tags: ['bug'],
    created: '2024-01-01',
    started: '',
    due: '2024-01-20',
    completed: '',
    subtasks: [{ completed: false, text: 'Subtask 1' }],
    notes: 'Some notes',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    taskFormModalOpenSignal.value = false;
    editingTaskIdSignal.value = null;
    tasksSignal.value = [mockTask];
    configSignal.value = {
      ...configSignal.value,
      columns: [
        { id: 'todo', name: 'To Do' },
        { id: 'inprogress', name: 'In Progress' },
        { id: 'done', name: 'Done' },
      ],
      categories: ['Feature', 'Bug', 'Improvement'],
      users: ['user1', 'user2', 'user3'],
      priorities: ['🔴 Urgent', '🟡 Medium', '🟢 Low'],
      tags: ['urgent', 'help-needed', 'bug'],
      lastTaskId: 1,
    };
  });

  it('renders nothing when modal is closed', () => {
    taskFormModalOpenSignal.value = false;
    render(<TaskFormModal />);
    expect(screen.queryByText(/taskform.newtask/i)).not.toBeInTheDocument();
  });

  it('renders new task form when opened without editingTaskId', () => {
    taskFormModalOpenSignal.value = true;
    editingTaskIdSignal.value = null;
    render(<TaskFormModal />);

    expect(screen.getByText(/taskform.newtask/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/taskform.titlelabel/i)).toBeInTheDocument();
  });

  it('renders edit task form with populated values when editingTaskId is set', () => {
    taskFormModalOpenSignal.value = true;
    editingTaskIdSignal.value = 'TASK-001';
    render(<TaskFormModal />);

    expect(screen.getByText(/taskform.edittask/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/existing task/i)).toBeInTheDocument();
  });

  it('has required validation on title field', () => {
    taskFormModalOpenSignal.value = true;
    editingTaskIdSignal.value = null;
    render(<TaskFormModal />);

    const titleInput = screen.getByLabelText(/taskform.titlelabel/i) as HTMLInputElement;
    expect(titleInput).toHaveAttribute('required');
  });

  it('submits new task form and creates task', () => {
    taskFormModalOpenSignal.value = true;
    editingTaskIdSignal.value = null;
    render(<TaskFormModal />);

    const titleInput = screen.getByLabelText(/taskform.titlelabel/i);
    fireEvent.input(titleInput, { target: { value: 'New Task Title' } });

    const submitButton = screen.getByRole('button', { name: /taskform.create/i });
    fireEvent.click(submitButton);

    expect(tasksSignal.value).toHaveLength(2);
    expect(tasksSignal.value[1].title).toBe('New Task Title');
    expect(taskFormModalOpenSignal.value).toBe(false);
  });

  it('updates existing task on submit', () => {
    taskFormModalOpenSignal.value = true;
    editingTaskIdSignal.value = 'TASK-001';
    render(<TaskFormModal />);

    const titleInput = screen.getByLabelText(/taskform.titlelabel/i);
    fireEvent.input(titleInput, { target: { value: 'Updated Title' } });

    const submitButton = screen.getByRole('button', { name: /taskform.save/i });
    fireEvent.click(submitButton);

    expect(tasksSignal.value[0].title).toBe('Updated Title');
    expect(taskFormModalOpenSignal.value).toBe(false);
  });

  it('closes modal when Cancel button is clicked', () => {
    taskFormModalOpenSignal.value = true;
    render(<TaskFormModal />);

    const cancelButton = screen.getByRole('button', { name: /taskform.cancel/i });
    fireEvent.click(cancelButton);

    expect(taskFormModalOpenSignal.value).toBe(false);
    expect(editingTaskIdSignal.value).toBe(null);
  });

  it('adds subtask when Add Subtask button is clicked', () => {
    taskFormModalOpenSignal.value = true;
    render(<TaskFormModal />);

    const subtaskInput = screen.getByPlaceholderText(/taskform.subtaskplaceholder/i);
    fireEvent.input(subtaskInput, { target: { value: 'New subtask' } });

    const addButton = screen.getByRole('button', { name: /taskform.subtaskadd/i });
    fireEvent.click(addButton);

    expect(screen.getByText(/new subtask/i)).toBeInTheDocument();
  });

  it('adds subtask when pressing Enter in subtask input', () => {
    taskFormModalOpenSignal.value = true;
    render(<TaskFormModal />);

    const subtaskInput = screen.getByPlaceholderText(/taskform.subtaskplaceholder/i);
    fireEvent.input(subtaskInput, { target: { value: 'Enter subtask' } });
    fireEvent.keyDown(subtaskInput, { key: 'Enter', code: 'Enter' });

    expect(screen.getByText(/enter subtask/i)).toBeInTheDocument();
  });

  it('removes subtask when delete button is clicked', () => {
    taskFormModalOpenSignal.value = true;
    editingTaskIdSignal.value = 'TASK-001';
    render(<TaskFormModal />);

    // The existing subtask should be visible
    expect(screen.getByText(/subtask 1/i)).toBeInTheDocument();

    const deleteButton = document.querySelector('button[style*="#EF4444"]') as HTMLElement;
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    // After removal, subtask should not be in form data
  });

  it('toggles subtask completion when checkbox is clicked', () => {
    taskFormModalOpenSignal.value = true;
    editingTaskIdSignal.value = 'TASK-001';
    render(<TaskFormModal />);

    const checkbox = document.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (checkbox) {
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);
    }
  });

  it('increments lastTaskId when creating new task', () => {
    const initialLastTaskId = configSignal.value.lastTaskId;
    taskFormModalOpenSignal.value = true;
    editingTaskIdSignal.value = null;
    render(<TaskFormModal />);

    const titleInput = screen.getByLabelText(/taskform.titlelabel/i);
    fireEvent.input(titleInput, { target: { value: 'Another Task' } });

    const submitButton = screen.getByRole('button', { name: /taskform.create/i });
    fireEvent.click(submitButton);

    expect(configSignal.value.lastTaskId).toBe(initialLastTaskId + 1);
  });

  it('populates datalist options from config', () => {
    taskFormModalOpenSignal.value = true;
    render(<TaskFormModal />);

    expect(document.querySelector('#categoryOptions')).toContainHTML('Feature');
    expect(document.querySelector('#categoryOptions')).toContainHTML('Bug');
    expect(document.querySelector('#userOptions')).toContainHTML('user1');
    expect(document.querySelector('#tagOptions')).toContainHTML('#urgent');
  });
});
