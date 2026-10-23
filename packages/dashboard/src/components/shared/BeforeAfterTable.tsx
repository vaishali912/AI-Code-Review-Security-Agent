import React from 'react';
import { RunStatus } from '../../lib/types.js';
import { StatusChip } from './StatusChip.js';
import { cn } from '../../lib/utils.js';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

interface BeforeAfterTableProps {
  before: Record<string, RunStatus>;
  after: Record<string, RunStatus>;
  className?: string;
}

export const BeforeAfterTable: React.FC<BeforeAfterTableProps> = ({
  before,
  after,
  className
}) => {
  const allChecks = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));

  return (
    <div className={cn('rounded-[var(--radius-sm)] border border-[var(--line)] overflow-hidden', className)}>
      <table className="w-full text-left text-xs font-mono">
        <thead className="border-b border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink-muted)]">
          <tr>
            <th className="py-2 px-3 font-medium">Verification Probe / Check</th>
            <th className="py-2 px-3 font-medium">Before Patch</th>
            <th className="py-2 px-3 font-medium">After Patch</th>
            <th className="py-2 px-3 font-medium text-right">Delta</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)] bg-[var(--surface)]">
          {allChecks.map((check) => {
            const beforeStatus = before[check] || 'queued';
            const afterStatus = after[check] || 'queued';
            const isResolved = beforeStatus === 'failed' && (afterStatus === 'passed' || afterStatus === 'verified');

            return (
              <tr key={check} className="hover:bg-[var(--bg-subtle)] transition-colors">
                <td className="py-2.5 px-3 font-medium text-[var(--ink)]">
                  {check}
                </td>
                <td className="py-2.5 px-3">
                  <StatusChip status={beforeStatus} size="sm" />
                </td>
                <td className="py-2.5 px-3">
                  <StatusChip status={afterStatus} size="sm" />
                </td>
                <td className="py-2.5 px-3 text-right">
                  {isResolved ? (
                    <span className="text-[#30A46C] font-semibold flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Neutralized
                    </span>
                  ) : beforeStatus === afterStatus ? (
                    <span className="text-[var(--ink-faint)]">Unchanged</span>
                  ) : (
                    <span className="text-[#E5A50A]">Modified</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
