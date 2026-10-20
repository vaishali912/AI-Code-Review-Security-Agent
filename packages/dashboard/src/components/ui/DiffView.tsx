import React, { useState } from 'react';
import { cn } from '../../lib/utils.js';
import { Copy, Check } from 'lucide-react';
import { Button } from './Button.js';

interface DiffViewProps {
  patch: string;
  onApply?: () => void;
  applied?: boolean;
  className?: string;
}

export const DiffView: React.FC<DiffViewProps> = ({
  patch,
  onApply,
  applied = false,
  className
}) => {
  const [copied, setCopied] = useState(false);
  const lines = patch.split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(patch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden font-mono text-xs', className)}>
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-[var(--line)] bg-[var(--bg-subtle)]">
        <span className="text-[11px] text-[var(--ink-muted)] font-medium">Git Patch</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-[var(--ink-muted)] hover:text-[var(--ink)] p-1 rounded hover:bg-[var(--line)] transition-colors flex items-center gap-1 text-[11px]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#30A46C]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy patch'}</span>
          </button>
          {onApply && (
            <Button
              size="sm"
              variant={applied ? 'secondary' : 'primary'}
              onClick={onApply}
              disabled={applied}
            >
              {applied ? 'Fix Applied' : 'Apply Fix'}
            </Button>
          )}
        </div>
      </div>

      <div className="p-3 overflow-x-auto select-text leading-relaxed">
        {lines.map((line, idx) => {
          const isAddition = line.startsWith('+') && !line.startsWith('+++');
          const isDeletion = line.startsWith('-') && !line.startsWith('---');
          const isHeader = line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++');

          return (
            <div
              key={idx}
              className={cn(
                'flex items-start px-2 py-0.5 rounded-xs',
                isAddition && 'bg-[#30A46C]/10 text-[#30A46C]',
                isDeletion && 'bg-[#E5484D]/10 text-[#E5484D]',
                isHeader && 'text-[var(--ink-faint)] bg-[var(--bg-subtle)] font-medium'
              )}
            >
              <span className="w-6 select-none text-[var(--ink-faint)] shrink-0 text-right pr-2">
                {idx + 1}
              </span>
              <span className="whitespace-pre">{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
