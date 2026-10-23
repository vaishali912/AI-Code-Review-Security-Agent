import React from 'react';
import { FindingSource } from '../../lib/types.js';
import { cn } from '../../lib/utils.js';
import { Search, Database, KeyRound, Package, Sparkles } from 'lucide-react';

interface SourceBadgeProps {
  source: FindingSource;
  className?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source, className }) => {
  const configs: Record<FindingSource, { label: string; icon: any }> = {
    semgrep: { label: 'Semgrep', icon: Search },
    codeql: { label: 'CodeQL', icon: Database },
    secrets: { label: 'Secrets', icon: KeyRound },
    dependency: { label: 'Dependency', icon: Package },
    ai: { label: 'AI Triage', icon: Sparkles }
  };

  const config = configs[source] || configs.ai;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.2 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink-muted)] font-mono text-[10px] select-none',
        className
      )}
      title={`Detected by engine: ${config.label}`}
    >
      <Icon className="w-2.5 h-2.5 text-[var(--ink-faint)]" />
      <span>{config.label}</span>
    </span>
  );
};
