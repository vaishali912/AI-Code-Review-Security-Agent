import React from 'react';
import { PolicyGate } from '../../lib/types.js';
import { cn } from '../../lib/utils.js';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface PolicyConditionRowProps {
  gate: PolicyGate;
  onToggleScope?: (id: string, scope: 'new_code' | 'all') => void;
  className?: string;
}

export const PolicyConditionRow: React.FC<PolicyConditionRowProps> = ({
  gate,
  onToggleScope,
  className
}) => {
  const getResultBadge = () => {
    switch (gate.result) {
      case 'pass':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#30A46C] bg-[#30A46C]/10 border border-[#30A46C]/30 px-2 py-0.5 rounded-[var(--radius-sm)]">
            <CheckCircle2 className="w-3 h-3" /> Passing
          </span>
        );
      case 'fail':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#E5484D] bg-[#E5484D]/10 border border-[#E5484D]/30 px-2 py-0.5 rounded-[var(--radius-sm)]">
            <XCircle className="w-3 h-3" /> Failing Gate
          </span>
        );
      case 'warn':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#E5A50A] bg-[#E5A50A]/10 border border-[#E5A50A]/30 px-2 py-0.5 rounded-[var(--radius-sm)]">
            <AlertTriangle className="w-3 h-3" /> Advisory
          </span>
        );
    }
  };

  return (
    <div className={cn('p-3.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] flex items-center justify-between gap-4 font-mono text-xs flex-wrap', className)}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--ink)]">{gate.condition}</span>
          {getResultBadge()}
        </div>
        <div className="text-[11px] text-[var(--ink-muted)] flex items-center gap-3">
          <span>Current PR Value: <strong className="text-[var(--ink)]">{gate.currentValue || 'Evaluated'}</strong></span>
          <span>·</span>
          <span>Scope: {gate.scope === 'new_code' ? 'New code only (PR Diff)' : 'Entire Repository'}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggleScope && onToggleScope(gate.id, gate.scope === 'new_code' ? 'all' : 'new_code')}
          className="px-2 py-1 rounded border border-[var(--line)] bg-[var(--bg-subtle)] text-[11px] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
        >
          Toggle: {gate.scope === 'new_code' ? 'Apply to all' : 'New code only'}
        </button>
      </div>
    </div>
  );
};
