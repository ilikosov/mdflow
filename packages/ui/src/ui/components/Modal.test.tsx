import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div>Modal Content</div>,
  };

  it('renders nothing when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText(/test modal/i)).not.toBeInTheDocument();
  });

  it('renders modal with title and content when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText(/test modal/i)).toBeInTheDocument();
    expect(screen.getByText(/modal content/i)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    const closeButton = screen.getByRole('button', { name: /×/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside modal content', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    const overlay = document.querySelector('.modal') as HTMLElement;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside modal content', () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    const content = document.querySelector('.modal-content') as HTMLElement;
    fireEvent.click(content);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<Modal {...defaultProps} size="small" />);
    const content = document.querySelector('.modal-content');
    expect(content).not.toHaveClass('modal-large');

    rerender(<Modal {...defaultProps} size="large" />);
    expect(document.querySelector('.modal-content')).toHaveClass('modal-large');
  });
});
