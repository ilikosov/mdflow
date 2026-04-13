import { h } from 'preact';

export interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

export function Spinner({ size = 'medium' }: SpinnerProps) {
  const sizeMap = {
    small: '16px',
    medium: '20px',
    large: '32px',
  };

  return (
    <span 
      class="spinner" 
      style={{ width: sizeMap[size], height: sizeMap[size] }} 
    />
  );
}
