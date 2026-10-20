import React from 'react';
import { cn } from '../../lib/utils.js';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none select-none';
    
    const variants = {
      primary: 'bg-[var(--ink)] text-[var(--bg)] hover:opacity-90 active:scale-[0.99]',
      secondary: 'bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--line-strong)] hover:bg-[var(--bg-subtle)]',
      ghost: 'text-[var(--ink)] hover:bg-[var(--bg-subtle)] active:bg-[var(--line)]',
      danger: 'bg-[var(--sev-critical)] text-white hover:opacity-90 active:scale-[0.99]'
    };

    const sizes = {
      sm: 'text-xs h-7 px-2.5 rounded-[var(--radius-sm)] gap-1.5',
      md: 'text-sm h-9 px-3.5 rounded-[var(--radius-sm)] gap-2',
      lg: 'text-base h-11 px-5 rounded-[var(--radius-md)] gap-2.5'
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
