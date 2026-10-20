import React from 'react';
import { cn } from '../../lib/utils.js';

export const Kbd: React.FC<React.HTMLAttributes<HTMLElement>> = ({ className, children, ...props }) => {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center font-mono text-[11px] font-medium h-5 min-w-[20px] px-1.5 rounded-[var(--radius-sm)] border border-[var(--line-strong)] bg-[var(--bg-subtle)] text-[var(--ink-muted)] select-none shadow-xs',
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
};
