import React, { useState } from 'react';
import { AgentStep, AgentRole } from '../../lib/types.js';
import { StatusChip } from './StatusChip.js';
import { EvidenceBlock } from './EvidenceBlock.js';
import { cn } from '../../lib/utils.js';
import { 
  GitBranch, 
  Search, 
  ShieldAlert, 
  FlaskConical, 
  Bug, 
  Wrench, 
  ShieldCheck, 
  ChevronDown, 
  ChevronRight,
  Clock,
  Coins
} from 'lucide-react';

interface AgentTimelineProps {
  steps: AgentStep[];
  className?: string;
}

const AGENT_META: Record<AgentRole, { label: string; icon: any; responsibility: string }> = {
  repository: {
    label: 'Repository Agent',
    icon: GitBranch,
    responsibility: 'Index code, map dependencies & entry points'
  },
  review: {
    label: 'Review Agent',
    icon: Search,
    responsibility: 'Logic, concurrency, assumption errors, missing tests'
  },
  security: {
    label: 'Security Agent',
    icon: ShieldAlert,
    responsibility: 'Semgrep/CodeQL, data flow, secrets & supply chain'
  },
  testing: {
    label: 'Testing Agent',
    icon: FlaskConical,
    responsibility: 'Plan & generate tests from diff, execute runs'
  },
  debugging: {
    label: 'Debugging Agent',
    icon: Bug,
    responsibility: 'Trace failures to change, root cause & repro steps'
  },
  fix: {
    label: 'Fix Agent',
    icon: Wrench,
    responsibility: 'Synthesize patch in isolated sandbox branch'
  },
  verification: {
    label: 'Verification Agent',
    icon: ShieldCheck,
    responsibility: 'Independently rerun canary checks & compare before/after'
  }
};

export const AgentTimeline: React.FC<AgentTimelineProps> = ({ steps, className }) => {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({
    [steps[steps.length - 1]?.id || '']: true
  });

  const toggleStep = (id: string) => {
    setExpandedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Guarantees Callout */}
      <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] flex items-center justify-between text-xs font-mono text-[var(--ink-muted)]">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#30A46C]" />
          <span>7 Specialized Agent Roles · Zero Blind Trust Between Agents</span>
        </div>
        <span className="text-[11px] text-[var(--ink-faint)]">
          Verification independently reproves all claims
        </span>
      </div>

      {/* Stepper Chain */}
      <div className="relative pl-6 space-y-4">
        {/* Continuous vertical connector */}
        <div className="absolute left-[11px] top-3 bottom-3 w-[1px] bg-[var(--line)]" aria-hidden="true" />

        {steps.map((step, idx) => {
          const meta = AGENT_META[step.agent] || {
            label: step.agent,
            icon: Search,
            responsibility: 'Autonomous pipeline step'
          };
          const Icon = meta.icon;
          const isExpanded = Boolean(expandedSteps[step.id]);

          return (
            <div key={step.id} className="relative group">
              {/* Timeline Node Dot */}
              <div className="absolute -left-[20px] top-3 w-3 h-3 rounded-full border-2 border-[var(--surface)] bg-[var(--ink)] shadow-xs" />

              <div className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden transition-colors hover:border-[var(--line-strong)]">
                {/* Step Header */}
                <div
                  onClick={() => toggleStep(step.id)}
                  className="p-3 px-4 flex items-center justify-between gap-3 cursor-pointer select-none bg-[var(--surface)] hover:bg-[var(--bg-subtle)]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button className="text-[var(--ink-muted)]">
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                    <Icon className="w-4 h-4 text-[var(--ink)] shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[var(--ink)] font-mono">
                          {meta.label}
                        </span>
                        <StatusChip status={step.status} size="sm" />
                      </div>
                      <p className="text-[11px] text-[var(--ink-muted)] truncate">
                        {meta.responsibility}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-xs font-mono text-[var(--ink-muted)] shrink-0">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {step.durationMs}ms
                    </span>
                    {step.tokens && (
                      <span className="flex items-center gap-1 hidden sm:flex">
                        <Coins className="w-3 h-3 text-[var(--ink-faint)]" /> {step.tokens} tokens
                      </span>
                    )}
                  </div>
                </div>

                {/* Collapsible Step Body */}
                {isExpanded && (
                  <div className="p-4 pt-1 border-t border-[var(--line)] bg-[var(--bg-subtle)] space-y-3">
                    {step.summary && (
                      <p className="text-xs text-[var(--ink)] font-mono leading-relaxed">
                        {step.summary}
                      </p>
                    )}

                    {step.evidence && step.evidence.length > 0 && (
                      <EvidenceBlock evidence={step.evidence} />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
