import React from 'react';
import { cn } from '../../lib/utils.js';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  badge,
  className
}) => {
  return (
    <div className={cn('border-b border-[var(--line)] bg-[var(--surface)] px-6 py-4 flex items-start justify-between gap-4 flex-wrap shrink-0', className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-base font-semibold text-[var(--ink)] tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-xs text-[var(--ink-muted)] leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
