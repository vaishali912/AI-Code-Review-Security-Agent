import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils.js';
import { Terminal as TerminalIcon, Copy, Check } from 'lucide-react';

interface TerminalProps {
  title?: string;
  lines: string[];
  animated?: boolean;
  className?: string;
  maxHeight?: string;
}

export const Terminal: React.FC<TerminalProps> = ({
  title = 'sherlock-sandbox',
  lines,
  animated = false,
  className,
  maxHeight = '320px'
}) => {
  const [visibleCount, setVisibleCount] = useState(animated ? 1 : lines.length);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!animated) {
      setVisibleCount(lines.length);
      return;
    }
    setVisibleCount(1);
    const interval = setInterval(() => {
      setVisibleCount(prev => {
        if (prev < lines.length) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [lines, animated]);

  const handleCopy = () => {
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('rounded-[var(--radius-md)] border border-[#26262A] bg-[#0A0A0B] text-[#F5F5F4] overflow-hidden font-mono text-xs shadow-lg', className)}>
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-[#26262A] bg-[#141416]/90 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3A3A40]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#3A3A40]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#3A3A40]" />
          </div>
          <span className="text-[#A1A1AA] text-[11px] ml-1 flex items-center gap-1.5">
            <TerminalIcon className="w-3 h-3 text-[#71717A]" />
            {title}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="text-[#71717A] hover:text-[#F5F5F4] p-1 rounded hover:bg-[#26262A] transition-colors"
          title="Copy output"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#30A46C]" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div
        className="p-3.5 space-y-1 overflow-y-auto leading-relaxed select-text"
        style={{ maxHeight }}
      >
        {lines.slice(0, visibleCount).map((line, idx) => {
          const isError = line.includes('ERR') || line.includes('EXPLOIT') || line.includes('BLOCKING');
          const isSuccess = line.includes('PASS') || line.includes('VERIFIED') || line.includes('CLEAN');
          const isAccent = line.includes('SHERLOCK') || line.includes('PROBE') || line.includes('SANDBOX');
          const isFunnel = line.includes('candidates,') || line.includes('shown');

          return (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-[#5F5F5F] select-none shrink-0">{String(idx + 1).padStart(2, '0')}</span>
              <span
                className={cn(
                  'break-all',
                  isError && 'text-[#E5484D] font-medium',
                  isSuccess && 'text-[#30A46C] font-medium',
                  isAccent && 'text-[#A1A1AA]',
                  isFunnel && 'text-[#F5F5F4] font-semibold underline decoration-[#3A3A40]'
                )}
              >
                {line}
              </span>
            </div>
          );
        })}
        {animated && visibleCount < lines.length && (
          <div className="flex items-center gap-1 text-[#71717A]">
            <span className="inline-block w-1.5 h-3.5 bg-[#A1A1AA] animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};
