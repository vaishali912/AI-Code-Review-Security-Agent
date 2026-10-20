import React from 'react';
import { cn } from '../../lib/utils.js';
import { ShieldCheck } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center border border-dashed border-[var(--line)] rounded-[var(--radius-md)] bg-[var(--bg-subtle)]', className)}>
      <div className="w-10 h-10 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink-muted)] mb-3 bg-[var(--surface)]">
        {icon || <ShieldCheck className="w-5 h-5 text-[var(--ink-muted)]" />}
      </div>
      <h3 className="text-sm font-semibold text-[var(--ink)] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-[var(--ink-muted)] max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn('animate-pulse rounded-[var(--radius-sm)] bg-[var(--line)]/50', className)}
      {...props}
    />
  );
};
