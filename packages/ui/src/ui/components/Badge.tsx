import { h } from 'preact';
import { getFirstEmoji, priorityIconClasses } from '../../lib/utils';

export type BadgeType = 'priority' | 'category' | 'assignee' | 'tag';

export interface BadgeProps {
  type: BadgeType;
  value: string;
  onClick?: () => void;
}

export function Badge({ type, value, onClick }: BadgeProps) {
  let className = 'badge';
  
  if (type === 'priority') {
    const emoji = getFirstEmoji(value);
    const colorClass = priorityIconClasses[emoji] || 'Default';
    className += ` badge-priority ${colorClass}`;
  } else if (type === 'category') {
    className += ' badge-category';
  } else if (type === 'assignee') {
    className += ' badge-assignee';
  } else if (type === 'tag') {
    className = 'tag';
  }

  const displayValue = type === 'tag' && !value.startsWith('#') ? `#${value}` : value;

  return (
    <span 
      class={className} 
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      {displayValue}
    </span>
  );
}
