import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders priority badge with correct class', () => {
    render(<Badge type="priority" value="🔴 Urgent" />);
    const badge = screen.getByText(/🔴 urgent/i);
    expect(badge).toHaveClass('badge');
    expect(badge).toHaveClass('badge-priority');
    expect(badge).toHaveClass('Urgent');
  });

  it('renders category badge', () => {
    render(<Badge type="category" value="Feature" />);
    const badge = screen.getByText(/feature/i);
    expect(badge).toHaveClass('badge');
    expect(badge).toHaveClass('badge-category');
  });

  it('renders assignee badge', () => {
    render(<Badge type="assignee" value="user1" />);
    const badge = screen.getByText(/user1/i);
    expect(badge).toHaveClass('badge');
    expect(badge).toHaveClass('badge-assignee');
  });

  it('renders tag badge with # prefix', () => {
    render(<Badge type="tag" value="urgent" />);
    const badge = screen.getByText(/#urgent/i);
    expect(badge).toHaveClass('tag');
  });

  it('does not add # prefix if already present for tags', () => {
    render(<Badge type="tag" value="#help-needed" />);
    const badge = screen.getByText(/#help-needed/i);
    expect(badge.textContent).toBe('#help-needed');
  });

  it('calls onClick when clicked and has pointer cursor', () => {
    const handleClick = vi.fn();
    render(<Badge type="category" value="Feature" onClick={handleClick} />);
    const badge = screen.getByText(/feature/i);
    fireEvent.click(badge);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(badge).toHaveAttribute('style', 'cursor: pointer;');
  });

  it('does not call onClick when not provided', () => {
    render(<Badge type="category" value="Feature" />);
    const badge = screen.getByText(/feature/i);
    expect(badge).not.toHaveAttribute('style');
  });

  it('uses default class for unknown priority emoji', () => {
    render(<Badge type="priority" value="⭐ Special" />);
    const badge = screen.getByText(/⭐ special/i);
    expect(badge).toHaveClass('Default');
  });
});
