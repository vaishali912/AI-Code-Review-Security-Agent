import React from 'react';
import { cn } from '../../lib/utils.js';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'interactive';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-[var(--surface)] border border-[var(--line)]',
      subtle: 'bg-[var(--bg-subtle)] border border-[var(--line)]',
      interactive: 'bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--line-strong)] cursor-pointer transition-colors'
    };

    return (
      <div
        ref={ref}
        className={cn('rounded-[var(--radius-md)] p-4', variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
