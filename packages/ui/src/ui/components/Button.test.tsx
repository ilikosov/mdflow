import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with default variant (secondary)', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('btn');
    expect(button).toHaveClass('btn-secondary');
  });

  it('renders with primary variant', () => {
    render(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByRole('button', { name: /primary button/i });
    expect(button).toHaveClass('btn-primary');
    expect(button).not.toHaveClass('btn-secondary');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('respects disabled prop', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders icon when provided', () => {
    render(<Button icon="🔥">With Icon</Button>);
    const button = screen.getByRole('button', { name: /with icon/i });
    expect(button).toContainHTML('🔥');
  });

  it('applies additional class names', () => {
    render(<Button class="custom-class">Custom Class</Button>);
    const button = screen.getByRole('button', { name: /custom class/i });
    expect(button).toHaveClass('custom-class');
  });
});
