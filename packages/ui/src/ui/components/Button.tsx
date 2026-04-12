import { h } from 'preact';
import type { JSX } from 'preact';

export interface ButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  children: any;
  disabled?: boolean;
  icon?: string;
}

export function Button({ variant = 'secondary', onClick, children, disabled, icon, ...props }: ButtonProps) {
  const className = `btn ${variant === 'primary' ? 'btn-primary' : 'btn-secondary'}${props.class ? ` ${props.class}` : ''}`;
  
  return (
    <button
      class={className}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span style={{ marginRight: '0.5rem' }}>{icon}</span>}
      {children}
    </button>
  );
}
