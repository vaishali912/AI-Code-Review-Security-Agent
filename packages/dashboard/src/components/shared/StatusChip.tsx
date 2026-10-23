import React from 'react';
import { RunStatus } from '../../lib/types.js';
import { cn } from '../../lib/utils.js';
import { Check, X, AlertTriangle, Clock, RefreshCw, ShieldCheck, UserCheck } from 'lucide-react';

interface StatusChipProps {
  status: RunStatus;
  size?: 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  size = 'md',
  className,
  showIcon = true
}) => {
  const configs: Record<RunStatus, { label: string; icon: any; style: string }> = {
    queued: {
      label: 'Queued',
      icon: Clock,
      style: 'border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink-muted)]'
    },
    running: {
      label: 'Running',
      icon: RefreshCw,
      style: 'border-[#3E63DD]/40 bg-[#3E63DD]/10 text-[#3E63DD] animate-pulse'
    },
    passed: {
      label: 'Passed',
      icon: Check,
      style: 'border-[#30A46C]/40 bg-[#30A46C]/10 text-[#30A46C]'
    },
    failed: {
      label: 'Failed',
      icon: X,
      style: 'border-[#E5484D]/40 bg-[#E5484D]/10 text-[#E5484D]'
    },
    blocked: {
      label: 'Blocked',
      icon: AlertTriangle,
      style: 'border-[#E5A50A]/40 bg-[#E5A50A]/10 text-[#E5A50A]'
    },
    verified: {
      label: 'Verified',
      icon: ShieldCheck,
      style: 'border-[#30A46C]/40 bg-[#30A46C]/15 text-[#30A46C] font-semibold'
    },
    needs_approval: {
      label: 'Needs Approval',
      icon: UserCheck,
      style: 'border-[#F76B15]/40 bg-[#F76B15]/10 text-[#F76B15]'
    }
  };

  const config = configs[status] || configs.queued;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[var(--radius-sm)] border font-mono font-medium select-none',
        size === 'sm' ? 'text-[10px] px-1.5 py-0.2 gap-1' : 'text-xs px-2 py-0.5 gap-1.5',
        config.style,
        className
      )}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-2.5 h-2.5 shrink-0' : 'w-3 h-3 shrink-0'} />}
      <span>{config.label}</span>
    </span>
  );
};
