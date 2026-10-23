import React from 'react';
import { cn } from '../../lib/utils.js';

interface MetricTileProps {
  label: string;
  value: string | number;
  subtext?: string;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  subtext,
  delta,
  deltaType = 'neutral',
  icon,
  className
}) => {
  return (
    <div className={cn('p-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] space-y-1 transition-colors hover:border-[var(--line-strong)]', className)}>
      <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] font-mono">
        <span className="truncate">{label}</span>
        {icon && <div className="text-[var(--ink-muted)] shrink-0">{icon}</div>}
      </div>

      <div className="text-2xl font-bold font-mono text-[var(--ink)] tracking-tight">
        {value}
      </div>

      {(subtext || delta) && (
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          {delta && (
            <span
              className={cn(
                'font-medium',
                deltaType === 'positive' && 'text-[#30A46C]',
                deltaType === 'negative' && 'text-[#E5484D]',
                deltaType === 'neutral' && 'text-[var(--ink-muted)]'
              )}
            >
              {delta}
            </span>
          )}
          {subtext && <span className="text-[var(--ink-muted)] truncate">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
