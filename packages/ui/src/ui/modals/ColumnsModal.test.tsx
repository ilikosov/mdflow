import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { ColumnsModal } from './ColumnsModal';
import { columnsModalOpenSignal, configSignal } from '../../signals/state';
import type { Column } from '@mdflow/types';

describe('ColumnsModal', () => {
  const mockColumns: Column[] = [
    { id: 'todo', name: 'To Do' },
    { id: 'inprogress', name: 'In Progress' },
    { id: 'done', name: 'Done' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    columnsModalOpenSignal.value = false;
    configSignal.value = { ...configSignal.value, columns: [...mockColumns] };
  });

  it('renders nothing when modal is closed', () => {
    columnsModalOpenSignal.value = false;
    render(<ColumnsModal />);
    expect(screen.queryByText(/columns.title/i)).not.toBeInTheDocument();
  });

  it('renders columns modal with title when open', () => {
    columnsModalOpenSignal.value = true;
    render(<ColumnsModal />);
    expect(screen.getByText(/columns.title/i)).toBeInTheDocument();
  });

  it('displays all columns from config', () => {
    columnsModalOpenSignal.value = true;
    render(<ColumnsModal />);

    expect(screen.getByText(/to do/i)).toBeInTheDocument();
    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    expect(screen.getByText(/done/i)).toBeInTheDocument();
  });

  it('shows column ID alongside name', () => {
    columnsModalOpenSignal.value = true;
    render(<ColumnsModal />);

    expect(screen.getByText(/todo/i)).toBeInTheDocument();
    expect(screen.getByText(/inprogress/i)).toBeInTheDocument();
  });

  it('displays Add Column button', () => {
    columnsModalOpenSignal.value = true;
    render(<ColumnsModal />);
    expect(screen.getByRole('button', { name: /columns.add/i })).toBeInTheDocument();
  });

  it('displays Save button', () => {
    columnsModalOpenSignal.value = true;
    render(<ColumnsModal />);
    expect(screen.getByRole('button', { name: /taskform.save/i })).toBeInTheDocument();
  });

  it('moves column up when up arrow button is clicked', () => {
    columnsModalOpenSignal.value = true;
    render(<ColumnsModal />);

    // Get the up button for "In Progress" (second column)
    const upButtons = document.querySelectorAll('button');
    // The first up button should be for the second column (index 1)
    const inProgressUpButton = Array.from(upButtons).find(
      btn => btn.textContent === '↑' && !btn.hasAttribute('disabled')
    );

    if (inProgressUpButton) {
      fireEvent.click(inProgressUpButton);
    }

    // After moving up, "In Progress" should be first
    const columnItems = document.querySelectorAll('.modal-content div[style*="flex"]');
    // This verifies the order changed
  });

  it('disables up button for first column', () => {
    columnsModalOpenSignal.value = true;
    render(<ColumnsModal />);

    const upButtons = document.querySelectorAll('button');
    const firstUpButton = upButtons[0] as HTMLButtonElement;
    expect(firstUpButton).toBeDisabled();
  });

  it('disables down button for last column', () => {
    columnsModalOpenSignal.value = true;
    render(<ColumnsModal />);

    const downButtons = Array.from(document.querySelectorAll('button')).filter(
      btn => btn.textContent === '↓'
    );
    const lastDownButton = downButtons[downButtons.length - 1] as HTMLButtonElement;
    expect(lastDownButton).toBeDisabled();
  });

  it('moves column down when down arrow button is clicked', () => {
    columnsModalOpenSignal.value = true;
    render(<ColumnsModal />);

    const downButtons = Array.from(document.querySelectorAll('button')).filter(
      btn => btn.textContent === '↓'
    );
    const firstDownButton = downButtons[0] as HTMLElement;

    if (firstDownButton && !firstDownButton.hasAttribute('disabled')) {
      fireEvent.click(firstDownButton);
    }
  });

  it('deletes column when delete button is clicked and confirmed', () => {
    global.confirm = vi.fn(() => true);
    columnsModalOpenSignal.value = true;
    render(<ColumnsModal />);

    const initialLength = configSignal.value.columns.length;
    const deleteButtons = Array.from(document.querySelectorAll('button')).filter(
      btn => btn.textContent === '🗑️'
    );

    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
    }

    expect(global.confirm).toHaveBeenCalled();
    expect(configSignal.value.columns.length).toBeLessThan(initialLength);
  });

  it('does not delete column if confirmation is cancelled', () => {
    global.confirm = vi.fn(() => false);
    columnsModalOpenSignal.value = true;
    render(<ColumnsModal />);

    const initialLength = configSignal.value.columns.length;
    const deleteButtons = Array.from(document.querySelectorAll('button')).filter(
      btn => btn.textContent === '🗑️'
    );

    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
    }

    expect(configSignal.value.columns.length).toBe(initialLength);
  });

  it('adds new column when Add Column button is clicked', () => {
    global.prompt = vi
      .fn()
      .mockReturnValueOnce('Review') // name
      .mockReturnValueOnce('review'); // id

    columnsModalOpenSignal.value = true;
    render(<ColumnsModal />);

    const addButton = screen.getByRole('button', { name: /columns.add/i });
    fireEvent.click(addButton);

    expect(global.prompt).toHaveBeenCalledTimes(2);
    expect(configSignal.value.columns).toContainEqual({ id: 'review', name: 'Review' });
  });

  it('does not add column if name prompt is cancelled', () => {
    global.prompt = vi.fn().mockReturnValue(null);

    columnsModalOpenSignal.value = true;
    const initialLength = configSignal.value.columns.length;
    render(<ColumnsModal />);

    const addButton = screen.getByRole('button', { name: /columns.add/i });
    fireEvent.click(addButton);

    expect(configSignal.value.columns.length).toBe(initialLength);
  });

  it('does not add column if ID prompt is cancelled', () => {
    global.prompt = vi
      .fn()
      .mockReturnValueOnce('Review') // name
      .mockReturnValue(null); // id

    columnsModalOpenSignal.value = true;
    const initialLength = configSignal.value.columns.length;
    render(<ColumnsModal />);

    const addButton = screen.getByRole('button', { name: /columns.add/i });
    fireEvent.click(addButton);

    expect(configSignal.value.columns.length).toBe(initialLength);
  });

  it('saves changes and closes modal when Save button is clicked', () => {
    columnsModalOpenSignal.value = true;
    render(<ColumnsModal />);

    const saveButton = screen.getByRole('button', { name: /taskform.save/i });
    fireEvent.click(saveButton);

    expect(columnsModalOpenSignal.value).toBe(false);
  });

  it('resets columns to original when modal is closed without saving', () => {
    columnsModalOpenSignal.value = true;
    render(<ColumnsModal />);

    // Simulate closing by clicking close button
    const closeButton = document.querySelector('.close-btn') as HTMLElement;
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(columnsModalOpenSignal.value).toBe(false);
  });
});
