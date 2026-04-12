import { h } from 'preact';
import type { JSX } from 'preact';

export interface ModalProps extends JSX.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: any;
  size?: 'small' | 'medium' | 'large';
}

export function Modal({ isOpen, onClose, title, children, size = 'medium', ...props }: ModalProps) {
  if (!isOpen) return null;

  const sizeClass = size === 'small' ? '' : size === 'large' ? 'modal-large' : '';

  return (
    <div class={`modal ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div 
        class={`modal-content ${sizeClass}`} 
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        <div class="modal-header">
          <h2>{title}</h2>
          <button class="close-btn" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
