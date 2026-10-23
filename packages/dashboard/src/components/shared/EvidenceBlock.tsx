import React, { useState } from 'react';
import { Evidence } from '../../lib/types.js';
import { cn } from '../../lib/utils.js';
import { FileCode, Terminal, Image, CheckSquare, Copy, Check } from 'lucide-react';

interface EvidenceBlockProps {
  evidence: Evidence | Evidence[];
  title?: string;
  className?: string;
}

export const EvidenceBlock: React.FC<EvidenceBlockProps> = ({
  evidence,
  title = 'Verified Evidence',
  className
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const items = Array.isArray(evidence) ? evidence : [evidence];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getIcon = (kind: Evidence['kind']) => {
    switch (kind) {
      case 'code': return <FileCode className="w-3.5 h-3.5 text-[var(--ink-muted)] shrink-0" />;
      case 'log': return <Terminal className="w-3.5 h-3.5 text-[var(--ink-muted)] shrink-0" />;
      case 'screenshot': return <Image className="w-3.5 h-3.5 text-[var(--ink-muted)] shrink-0" />;
      case 'test': return <CheckSquare className="w-3.5 h-3.5 text-[var(--ink-muted)] shrink-0" />;
    }
  };

  return (
    <div className={cn('rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] p-3 space-y-2', className)}>
      <div className="flex items-center justify-between text-[11px] font-mono text-[var(--ink-muted)] uppercase tracking-wider font-semibold">
        <span>{title}</span>
        <span>{items.length} item{items.length === 1 ? '' : 's'}</span>
      </div>

      <div className="space-y-1.5 font-mono text-xs">
        {items.map((ev, idx) => (
          <div
            key={idx}
            className="p-2 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] space-y-1"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate text-[11px] font-medium text-[var(--ink)]">
                {getIcon(ev.kind)}
                <span className="truncate">{ev.ref}</span>
              </div>
              {ev.excerpt && (
                <button
                  onClick={() => handleCopy(ev.excerpt!, idx)}
                  className="text-[var(--ink-muted)] hover:text-[var(--ink)] p-0.5 rounded transition-colors"
                  title="Copy evidence excerpt"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3 h-3 text-[#30A46C]" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>

            {ev.excerpt && (
              <pre className="text-[11px] text-[var(--ink-muted)] bg-[var(--bg-subtle)] p-2 rounded-xs border border-[var(--line)] overflow-x-auto whitespace-pre-wrap leading-relaxed select-text">
                {ev.excerpt}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
