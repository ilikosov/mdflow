import { render, screen } from '@testing-library/preact';
import { describe, it, expect } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders with default size (medium)', () => {
    render(<Spinner />);
    const spinner = document.querySelector('.spinner') as HTMLElement;
    expect(spinner).toBeInTheDocument();
    expect(spinner.style.width).toBe('20px');
    expect(spinner.style.height).toBe('20px');
  });

  it('renders with small size', () => {
    render(<Spinner size="small" />);
    const spinner = document.querySelector('.spinner') as HTMLElement;
    expect(spinner.style.width).toBe('16px');
    expect(spinner.style.height).toBe('16px');
  });

  it('renders with large size', () => {
    render(<Spinner size="large" />);
    const spinner = document.querySelector('.spinner') as HTMLElement;
    expect(spinner.style.width).toBe('32px');
    expect(spinner.style.height).toBe('32px');
  });

  it('has the correct CSS class', () => {
    render(<Spinner />);
    expect(document.querySelector('.spinner')).toBeInTheDocument();
  });
});
