import React from 'react';
import { cn } from '../../lib/utils.js';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'outline' | 'subtle' | 'verified' | 'danger';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'outline',
  children,
  ...props
}) => {
  const variants = {
    outline: 'border border-[var(--line-strong)] text-[var(--ink-muted)] bg-transparent',
    subtle: 'border border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink)]',
    verified: 'border border-[#30A46C]/40 bg-[#30A46C]/10 text-[#30A46C]',
    danger: 'border border-[#E5484D]/40 bg-[#E5484D]/10 text-[#E5484D]'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-[var(--radius-sm)] text-xs font-mono font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
