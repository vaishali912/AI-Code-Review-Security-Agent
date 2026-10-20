import React from 'react';
import { cn } from '../../lib/utils.js';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'verified';

interface SeverityDotProps {
  level: SeverityLevel;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

const COLOR_MAP: Record<SeverityLevel, string> = {
  critical: 'bg-[#E5484D]',
  high: 'bg-[#F76B15]',
  medium: 'bg-[#E5A50A]',
  low: 'bg-[#8B8D98]',
  verified: 'bg-[#30A46C]'
};

const TEXT_MAP: Record<SeverityLevel, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  verified: 'Verified'
};

export const SeverityDot: React.FC<SeverityDotProps> = ({
  level,
  label,
  className,
  size = 'md'
}) => {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const displayLabel = label !== undefined ? label : TEXT_MAP[level];

  return (
    <span className={cn('inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[var(--ink)]', className)}>
      <span className={cn('rounded-full shrink-0', dotSize, COLOR_MAP[level])} aria-hidden="true" />
      {displayLabel && <span>{displayLabel}</span>}
    </span>
  );
};
