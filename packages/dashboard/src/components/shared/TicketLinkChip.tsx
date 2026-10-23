import React from 'react';
import { TicketLink } from '../../lib/types.js';
import { cn } from '../../lib/utils.js';
import { ExternalLink } from 'lucide-react';

interface TicketLinkChipProps {
  ticket: TicketLink;
  className?: string;
}

export const TicketLinkChip: React.FC<TicketLinkChipProps> = ({ ticket, className }) => {
  return (
    <a
      href={ticket.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--bg-subtle)] text-[var(--ink)] font-mono text-[11px] font-medium transition-colors select-none',
        className
      )}
      title={`Open ${ticket.provider.toUpperCase()} ticket: ${ticket.key}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#3E63DD]" />
      <span className="uppercase text-[10px] text-[var(--ink-muted)]">{ticket.provider}</span>
      <span>{ticket.key}</span>
      <ExternalLink className="w-2.5 h-2.5 text-[var(--ink-faint)]" />
    </a>
  );
};
