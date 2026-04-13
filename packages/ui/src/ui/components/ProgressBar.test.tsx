import { render, screen } from '@testing-library/preact';
import { describe, it, expect } from 'vitest';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders with correct percentage when completed is less than total', () => {
    render(<ProgressBar completed={3} total={10} />);
    const fill = document.querySelector('.progress-fill') as HTMLElement;
    expect(fill).toBeInTheDocument();
    expect(fill.style.width).toBe('30%');
  });

  it('renders 100% when completed equals total', () => {
    render(<ProgressBar completed={5} total={5} />);
    const fill = document.querySelector('.progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('100%');
  });

  it('renders 0% when completed is 0', () => {
    render(<ProgressBar completed={0} total={10} />);
    const fill = document.querySelector('.progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });

  it('handles total of 0 without error', () => {
    render(<ProgressBar completed={0} total={0} />);
    const fill = document.querySelector('.progress-fill') as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });

  it('has the correct CSS classes', () => {
    render(<ProgressBar completed={2} total={4} />);
    expect(document.querySelector('.progress-bar')).toBeInTheDocument();
    expect(document.querySelector('.progress-fill')).toBeInTheDocument();
  });

  it('calculates percentage correctly for various values', () => {
    const { rerender } = render(<ProgressBar completed={1} total={2} />);
    expect((document.querySelector('.progress-fill') as HTMLElement).style.width).toBe('50%');

    rerender(<ProgressBar completed={7} total={8} />);
    expect((document.querySelector('.progress-fill') as HTMLElement).style.width).toBe('87.5%');
  });
});
