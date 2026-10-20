import React from 'react';
import { cn } from '../../lib/utils.js';

export interface TraceStep {
  role: 'source' | 'propagator' | 'sink';
  file: string;
  line: number;
  snippet?: string;
  description?: string;
}

interface TraceStepperProps {
  steps: TraceStep[];
  className?: string;
}

export const TraceStepper: React.FC<TraceStepperProps> = ({ steps, className }) => {
  return (
    <div className={cn('relative pl-6 space-y-6', className)}>
      {/* Continuous vertical trace line */}
      <div
        className="absolute left-[11px] top-3 bottom-4 w-[1px] bg-[var(--line-strong)]"
        aria-hidden="true"
      />

      {steps.map((step, idx) => {
        const isSource = step.role === 'source';
        const isSink = step.role === 'sink';

        const nodeColor = isSource
          ? 'bg-[#E5A50A] border-[var(--bg)]'
          : isSink
          ? 'bg-[#E5484D] border-[var(--bg)]'
          : 'bg-[var(--ink-muted)] border-[var(--bg)]';

        return (
          <div key={idx} className="relative group">
            {/* Trace node marker */}
            <div
              className={cn(
                'absolute -left-[20px] top-1.5 w-3 h-3 rounded-full border-2 ring-1 ring-[var(--line)] shadow-xs transition-transform',
                nodeColor
              )}
              aria-hidden="true"
            />

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-[11px] font-mono uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-[var(--radius-sm)] border',
                    isSource && 'border-[#E5A50A]/40 text-[#E5A50A] bg-[#E5A50A]/10',
                    isSink && 'border-[#E5484D]/40 text-[#E5484D] bg-[#E5484D]/10',
                    !isSource && !isSink && 'border-[var(--line)] text-[var(--ink-muted)] bg-[var(--bg-subtle)]'
                  )}
                >
                  /{step.role}
                </span>
                <span className="text-xs font-mono text-[var(--ink-muted)]">
                  {step.file}:{step.line}
                </span>
              </div>

              {step.description && (
                <p className="text-xs text-[var(--ink)] leading-snug">
                  {step.description}
                </p>
              )}

              {step.snippet && (
                <div className="p-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] font-mono text-xs text-[var(--ink)] overflow-x-auto whitespace-pre">
                  <code>{step.snippet}</code>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
