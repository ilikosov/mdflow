import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { FilterBar } from './FilterBar';
import {
  activeFiltersSignal,
  searchTermSignal,
  configSignal,
  tasksSignal,
  archivedTasksSignal,
} from '../../signals/state';

describe('FilterBar', () => {
  beforeEach(() => {
    // Reset signals
    activeFiltersSignal.value = [];
    searchTermSignal.value = '';
    tasksSignal.value = [];
    archivedTasksSignal.value = [];
  });

  it('renders search input', () => {
    render(<FilterBar />);
    const searchInput = screen.getByPlaceholderText(/filters.search/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('renders filter dropdowns', () => {
    render(<FilterBar />);
    expect(screen.getByLabelText(/filters.tags/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filters.category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filters.user/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filters.priority/i)).toBeInTheDocument();
  });

  it('updates searchTermSignal when search input changes', () => {
    render(<FilterBar />);
    const searchInput = screen.getByPlaceholderText(/filters.search/i);
    fireEvent.input(searchInput, { target: { value: 'test query' } });
    expect(searchTermSignal.value).toBe('test query');
  });

  it('adds filter when selecting from dropdown', () => {
    configSignal.value = {
      ...configSignal.value,
      tags: ['urgent'],
      categories: ['Feature'],
      users: ['user1'],
      priorities: ['🔴 Urgent'],
    };

    render(<FilterBar />);

    // Test tag filter
    const tagSelect = screen.getByLabelText(/filters.tags/i);
    fireEvent.change(tagSelect, { target: { value: 'urgent' } });
    expect(activeFiltersSignal.value).toContainEqual({
      type: 'tag',
      value: 'urgent',
    });
  });

  it('displays active filter chips', () => {
    activeFiltersSignal.value = [
      { type: 'tag', value: 'urgent' },
      { type: 'category', value: 'Feature' },
    ];

    render(<FilterBar />);
    expect(screen.getByText(/#urgent/i)).toBeInTheDocument();
    expect(screen.getByText(/feature/i)).toBeInTheDocument();
  });

  it('removes filter when clicking remove button on chip', () => {
    activeFiltersSignal.value = [{ type: 'tag', value: 'urgent' }];

    render(<FilterBar />);
    const removeButton = screen.getByText(/#urgent/i).nextSibling as HTMLElement;
    fireEvent.click(removeButton);
    expect(activeFiltersSignal.value).toHaveLength(0);
  });

  it('clears all filters and search when clicking Clear all button', () => {
    activeFiltersSignal.value = [{ type: 'tag', value: 'urgent' }];
    searchTermSignal.value = 'test';

    render(<FilterBar />);
    const clearButton = screen.getByRole('button', {
      name: /filters.clearall/i,
    });
    fireEvent.click(clearButton);
    expect(activeFiltersSignal.value).toHaveLength(0);
    expect(searchTermSignal.value).toBe('');
  });

  it('shows clear search button when search has value', () => {
    searchTermSignal.value = 'test';
    render(<FilterBar />);
    expect(screen.getByTitle(/clear search|filters.searchclear/i)).toBeInTheDocument();
  });

  it('clears search when clicking clear search button', () => {
    searchTermSignal.value = 'test';
    render(<FilterBar />);
    const clearButton = screen.getByTitle(/clear search|filters.searchclear/i);
    fireEvent.click(clearButton);
    expect(searchTermSignal.value).toBe('');
  });

  it('populates dropdown options from config', () => {
    configSignal.value = {
      ...configSignal.value,
      tags: ['urgent', 'help-needed'],
      categories: ['Feature', 'Bug'],
      users: ['alice', 'bob'],
      priorities: ['🔴 Urgent', '🟢 Low'],
    };

    render(<FilterBar />);

    const tagSelect = screen.getByLabelText(/filters.tags/i);
    expect(tagSelect).toContainHTML('urgent');
    expect(tagSelect).toContainHTML('help-needed');
  });
});
