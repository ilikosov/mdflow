import { h } from 'preact';

export interface ProgressBarProps {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div class="progress-bar">
      <div class="progress-fill" style={{ width: `${percentage}%` }} />
    </div>
  );
}
