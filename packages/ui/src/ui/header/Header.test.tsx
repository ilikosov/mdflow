import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './Header';
import { setLanguage } from '../../lib/i18n';

describe('Header', () => {
  const defaultProps = {
    onNewTask: vi.fn(),
    onOpenArchive: vi.fn(),
    onOpenColumns: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the application title', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText(/📋 mdflow/i)).toBeInTheDocument();
  });

  it('renders New Task button', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByRole('button', { name: /new task/i })).toBeInTheDocument();
  });

  it('renders Archives button', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByRole('button', { name: /archives/i })).toBeInTheDocument();
  });

  it('renders Columns button', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByRole('button', { name: /columns/i })).toBeInTheDocument();
  });

  it('calls onNewTask when New Task button is clicked', () => {
    render(<Header {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /new task/i }));
    expect(defaultProps.onNewTask).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenArchive when Archives button is clicked', () => {
    render(<Header {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /archives/i }));
    expect(defaultProps.onOpenArchive).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenColumns when Columns button is clicked', () => {
    render(<Header {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /columns/i }));
    expect(defaultProps.onOpenColumns).toHaveBeenCalledTimes(1);
  });

  it('renders language selector with English and French options', () => {
    render(<Header {...defaultProps} />);
    const select = document.querySelector('select') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.options).toHaveLength(2);
    expect(select.options[0].value).toBe('en');
    expect(select.options[1].value).toBe('fr');
  });

  it('displays current language in selector', () => {
    render(<Header {...defaultProps} />);
    const select = document.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('en');
  });

  it('changes language when selector value changes', () => {
    render(<Header {...defaultProps} />);
    const select = document.querySelector('select') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'fr' } });
    expect(setLanguage).toHaveBeenCalledWith('fr');
  });
});
