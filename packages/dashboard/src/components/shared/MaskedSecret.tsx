import React, { useState } from 'react';
import { SecretItem } from '../../lib/types.js';
import { cn } from '../../lib/utils.js';
import { KeyRound, ShieldAlert, Check, Copy, AlertTriangle, ShieldCheck } from 'lucide-react';

interface MaskedSecretProps {
  secret: SecretItem;
  className?: string;
}

export const MaskedSecret: React.FC<MaskedSecretProps> = ({ secret, className }) => {
  const [copied, setCopied] = useState(false);
  const [checklist, setChecklist] = useState(secret.rotationChecklist);

  const toggleCheck = (idx: number) => {
    setChecklist(prev => prev.map((item, i) => i === idx ? { ...item, completed: !item.completed } : item));
  };

  const copyMasked = () => {
    navigator.clipboard.writeText(secret.maskedValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('p-4 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] space-y-3 font-mono text-xs', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <KeyRound className="w-3.5 h-3.5 text-[#E5484D]" />
            <span className="font-semibold text-[var(--ink)]">{secret.name}</span>
            <span
              className={cn(
                'px-1.5 py-0.2 rounded text-[10px] uppercase font-bold border',
                secret.validityStatus === 'active'
                  ? 'border-[#E5484D]/40 bg-[#E5484D]/10 text-[#E5484D]'
                  : 'border-[#30A46C]/40 bg-[#30A46C]/10 text-[#30A46C]'
              )}
            >
              {secret.validityStatus === 'active' ? 'Active / Exposed' : 'Revoked'}
            </span>
          </div>

          <div className="text-[11px] text-[var(--ink-muted)]">
            Found in <code>{secret.file}:{secret.line}</code> · Commit: <code>{secret.commit}</code>
          </div>
        </div>

        <button
          onClick={copyMasked}
          className="flex items-center gap-1 px-2 py-1 rounded border border-[var(--line)] bg-[var(--bg-subtle)] text-[11px] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
          title="Copy masked identifier"
        >
          {copied ? <Check className="w-3 h-3 text-[#30A46C]" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy reference'}</span>
        </button>
      </div>

      {/* Masked display only - hard guarantee never renders full secret */}
      <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--line)] flex items-center justify-between text-xs text-[var(--ink)]">
        <span><code>{secret.maskedValue}</code></span>
        <span className="text-[10px] text-[var(--ink-faint)] select-none">SHA-256 masked preview</span>
      </div>

      {/* Rotation Checklist */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[11px] font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
          Secret Remediation & Rotation Checklist
        </div>
        <div className="space-y-1">
          {checklist.map((item, idx) => (
            <label
              key={idx}
              className="flex items-center gap-2 p-1.5 rounded hover:bg-[var(--bg-subtle)] cursor-pointer text-xs select-none"
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleCheck(idx)}
                className="rounded border-[var(--line-strong)] text-[var(--ink)] focus:ring-0"
              />
              <span className={item.completed ? 'line-through text-[var(--ink-muted)]' : 'text-[var(--ink)]'}>
                {item.task}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
