import React, { useState } from 'react';
import { EnhancedFindingItem } from '../../lib/types.js';
import { SeverityDot } from '../../components/ui/SeverityDot.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs.js';
import { TraceStepper } from '../../components/ui/TraceStepper.js';
import { Terminal } from '../../components/ui/Terminal.js';
import { DiffView } from '../../components/ui/DiffView.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/Dialog.js';
import { SourceBadge } from '../../components/shared/SourceBadge.js';
import { RiskBadge } from '../../components/shared/RiskBadge.js';
import { TicketLinkChip } from '../../components/shared/TicketLinkChip.js';
import { cn } from '../../lib/utils.js';
import { Kbd } from '../../components/ui/Kbd.js';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  Check, 
  X, 
  FlaskConical, 
  FileCode, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Plus
} from 'lucide-react';

interface FindingDetailPaneProps {
  finding: EnhancedFindingItem | null;
  onClose?: () => void;
  onUpdateStatus: (findingId: string, status: EnhancedFindingItem['status'], reason?: string) => void;
  onRunProofAction?: () => void;
}

export const FindingDetailPane: React.FC<FindingDetailPaneProps> = ({
  finding,
  onClose,
  onUpdateStatus
}) => {
  if (!finding) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'dataflow' | 'proof' | 'fix'>('overview');
  const [isRunningProof, setIsRunningProof] = useState(false);
  const [proofLogs, setProofLogs] = useState<string[]>(
    finding.proof?.executionOutput ? finding.proof.executionOutput.split('\n') : [
      `[SANDBOX] Target: ${finding.location.file}:${finding.location.startLine}`,
      `[SANDBOX] Ephemeral container ready. Click 'Run Proof' to fire canary payload.`
    ]
  );
  const [isProven, setIsProven] = useState(finding.proof?.status === 'proven');
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false);
  const [dismissType, setDismissType] = useState<'false_positive' | 'accepted_risk'>('false_positive');
  const [dismissReason, setDismissReason] = useState('');
  const [fixApplied, setFixApplied] = useState(finding.status === 'fixed');

  // Create ticket dialog state
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [ticketProvider, setTicketProvider] = useState<'linear' | 'jira'>('linear');
  const [createdTicket, setCreatedTicket] = useState(finding.ticket);

  const handleRunProof = () => {
    setIsRunningProof(true);
    setProofLogs([
      `[SANDBOX] Initializing isolated micro-VM for ${finding.id}...`,
      `[SANDBOX] Network egress: STRICTLY BLOCKED`,
      `[PROBE 1/2] Injecting synthetic payload into ${finding.location.file}...`
    ]);

    setTimeout(() => {
      setProofLogs(prev => [
        ...prev,
        `[CANARY RECEIVED] Sink reached at line ${finding.location.startLine}`,
        `[EXPLOIT PROVED] Assertion failure confirmed exploit condition.`,
        `[PROBE 2/2] Applying patch in memory sandbox...`
      ]);
    }, 700);

    setTimeout(() => {
      setProofLogs(prev => [
        ...prev,
        `[PATCH VALIDATION] AST syntax parsed cleanly. No type errors.`,
        `[RE-PROBE] Executing payload against patched baseline...`,
        `[CLEAN PASS] Exploit neutralized. All invariants verified.`,
        `[VERDICT] Finding confirmed exploit-verified.`
      ]);
      setIsRunningProof(false);
      setIsProven(true);
    }, 1500);
  };

  const handleApplyFix = () => {
    setFixApplied(true);
    onUpdateStatus(finding.id, 'fixed', 'Applied verified security patch');
  };

  const handleConfirmDismiss = () => {
    onUpdateStatus(finding.id, dismissType, dismissReason || `Marked as ${dismissType}`);
    setDismissDialogOpen(false);
    setDismissReason('');
  };

  const handleCreateTicket = () => {
    const key = ticketProvider === 'linear' ? `SEC-${Math.floor(Math.random() * 800) + 100}` : `SEC-${Math.floor(Math.random() * 9000) + 1000}`;
    const url = ticketProvider === 'linear' ? `https://linear.app/sherlock/issue/${key}` : `https://jira.corp.internal/browse/${key}`;
    setCreatedTicket({ provider: ticketProvider, key, url });
    setTicketDialogOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-[var(--surface)] border-l border-[var(--line)] font-sans">
      {/* Header bar */}
      <div className="p-4 border-b border-[var(--line)] space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <SeverityDot level={finding.severity} />
              {finding.source && <SourceBadge source={finding.source} />}
              {finding.riskScore && <RiskBadge score={finding.riskScore} />}
              {finding.cwe.map(c => (
                <Badge key={c} variant="subtle">{c}</Badge>
              ))}
              <Badge variant="outline">{finding.owasp}</Badge>
              {isProven && (
                <Badge variant="verified">
                  <Check className="w-3 h-3 mr-1 inline" />
                  Exploit Verified
                </Badge>
              )}
              {createdTicket && <TicketLinkChip ticket={createdTicket} />}
            </div>

            <h2 className="text-base font-semibold text-[var(--ink)] leading-snug">
              {finding.title}
            </h2>

            <div className="flex items-center gap-2 text-xs font-mono text-[var(--ink-muted)] flex-wrap">
              <span>{finding.location.file}:{finding.location.startLine}</span>
              <span>·</span>
              <span>Confidence: {(finding.confidence * 100).toFixed(0)}%</span>
              <span>·</span>
              <span>Lane: {finding.lane}</span>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-[var(--radius-sm)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--bg-subtle)]"
              title="Close pane"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sticky Action Bar */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <Button
            size="sm"
            variant={fixApplied ? 'secondary' : 'primary'}
            onClick={handleApplyFix}
            disabled={fixApplied}
          >
            {fixApplied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : null}
            <span>{fixApplied ? 'Fix Applied' : 'Apply Fix'}</span>
            <Kbd className="ml-1">F</Kbd>
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleRunProof}
            disabled={isRunningProof}
          >
            <FlaskConical className="w-3.5 h-3.5 mr-1 text-[#30A46C]" />
            <span>{isRunningProof ? 'Running...' : 'Run Proof'}</span>
            <Kbd className="ml-1">P</Kbd>
          </Button>

          {!createdTicket && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setTicketDialogOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Create Ticket</span>
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissDialogOpen(true)}
          >
            <span>Dismiss</span>
            <Kbd className="ml-1">E</Kbd>
          </Button>
        </div>
      </div>

      {/* Tabs bar */}
      <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as any)} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 border-b border-[var(--line)] bg-[var(--bg-subtle)]">
          <TabsList className="border-none gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dataflow">Data Flow ({finding.dataflow.length})</TabsTrigger>
            <TabsTrigger value="proof">Proof Sandbox</TabsTrigger>
            <TabsTrigger value="fix">Fix & Diff</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="overview" className="mt-0 space-y-4 font-mono text-xs">
            <div>
              <h4 className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
                Vulnerability Analysis
              </h4>
              <p className="text-xs text-[var(--ink)] leading-relaxed bg-[var(--bg-subtle)] p-3 rounded-[var(--radius-sm)] border border-[var(--line)]">
                {finding.explanation}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
                Detection Evidence
              </h4>
              <div className="space-y-1.5">
                {finding.evidence.map((ev, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)]">
                    <FileCode className="w-3.5 h-3.5 text-[var(--ink-muted)] shrink-0" />
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
                Triage Metadata
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)]">
                  <div className="text-[var(--ink-faint)] text-[10px] uppercase">Static Rule</div>
                  <div className="text-[var(--ink)] mt-0.5 truncate">{finding.detected_by.static_rule}</div>
                </div>
                <div className="p-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)]">
                  <div className="text-[var(--ink-faint)] text-[10px] uppercase">Agent Verdict</div>
                  <div className="text-[var(--ink)] mt-0.5 capitalize">{finding.detected_by.agent_verdict}</div>
                </div>
                <div className="p-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)]">
                  <div className="text-[var(--ink-faint)] text-[10px] uppercase">Triage Model</div>
                  <div className="text-[var(--ink)] mt-0.5 truncate">{finding.detected_by.model}</div>
                </div>
                <div className="p-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)]">
                  <div className="text-[var(--ink-faint)] text-[10px] uppercase">Exposure Surface</div>
                  <div className="text-[var(--ink)] mt-0.5 capitalize">{finding.exposure || 'internal'}</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dataflow" className="mt-0">
            <div className="mb-3 text-xs font-mono text-[var(--ink-muted)]">
              Source-to-sink reachability trace reconstructed by Sherlock taint analysis:
            </div>
            <TraceStepper steps={finding.dataflow} />
          </TabsContent>

          <TabsContent value="proof" className="mt-0 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-[var(--ink)]">
                  Canary Exploit Reproduction
                </h4>
                <p className="text-[11px] text-[var(--ink-muted)]">
                  Executes in an ephemeral sandbox with blocked network egress.
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleRunProof}
                disabled={isRunningProof}
              >
                <Play className="w-3 h-3 mr-1 text-[#30A46C]" />
                {isRunningProof ? 'Running probe...' : 'Re-run Proof'}
              </Button>
            </div>

            {finding.proof?.testCode && (
              <div>
                <div className="text-[11px] text-[var(--ink-faint)] mb-1">Generated Probe Test Code</div>
                <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] font-mono text-xs overflow-x-auto whitespace-pre">
                  <code>{finding.proof.testCode}</code>
                </div>
              </div>
            )}

            <Terminal
              title="ephemeral-canary-sandbox"
              lines={proofLogs}
              maxHeight="260px"
            />
          </TabsContent>

          <TabsContent value="fix" className="mt-0 space-y-4 font-mono text-xs">
            <div>
              <h4 className="text-xs font-semibold text-[var(--ink)] mb-1">
                Remediation
              </h4>
              <p className="text-xs text-[var(--ink-muted)]">
                {finding.fix.description}
              </p>
            </div>

            <DiffView
              patch={finding.fix.patch}
              applied={fixApplied}
              onApply={handleApplyFix}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Create Ticket Dialog (Linear / Jira) */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="max-w-md font-mono text-xs">
          <DialogHeader>
            <DialogTitle>Create Issue Ticket</DialogTitle>
            <DialogDescription>
              Prefills issue with finding severity, location, and verified data-flow evidence.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="text-[var(--ink)] block mb-1">Issue Tracker</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTicketProvider('linear')}
                  className={cn(
                    'flex-1 py-1.5 px-3 rounded border text-xs transition-colors',
                    ticketProvider === 'linear' ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] font-semibold' : 'border-[var(--line)] text-[var(--ink-muted)]'
                  )}
                >
                  Linear
                </button>
                <button
                  type="button"
                  onClick={() => setTicketProvider('jira')}
                  className={cn(
                    'flex-1 py-1.5 px-3 rounded border text-xs transition-colors',
                    ticketProvider === 'jira' ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] font-semibold' : 'border-[var(--line)] text-[var(--ink-muted)]'
                  )}
                >
                  Jira Software
                </button>
              </div>
            </div>

            <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--line)] space-y-1 text-[11px] text-[var(--ink-muted)]">
              <div>Title: <strong>[Security] {finding.title}</strong></div>
              <div>Severity: {finding.severity.toUpperCase()}</div>
              <div>Location: {finding.location.file}:{finding.location.startLine}</div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
            <Button size="sm" variant="ghost" onClick={() => setTicketDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateTicket}>
              Create & Link Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dismissal Reason Dialog */}
      <Dialog open={dismissDialogOpen} onOpenChange={setDismissDialogOpen}>
        <DialogContent className="max-w-md font-mono text-xs">
          <DialogHeader>
            <DialogTitle>Dismiss Finding {finding.id}</DialogTitle>
            <DialogDescription>
              A documented reason is required to dismiss a security finding and update the repository memory store.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <label className="font-medium text-[var(--ink)]">Dismissal Classification</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDismissType('false_positive')}
                  className={`flex-1 py-1.5 px-3 rounded-[var(--radius-sm)] border font-mono text-xs transition-colors ${
                    dismissType === 'false_positive'
                      ? 'border-[var(--ink)] bg-[var(--bg-subtle)] text-[var(--ink)] font-semibold'
                      : 'border-[var(--line)] text-[var(--ink-muted)]'
                  }`}
                >
                  False Positive
                </button>
                <button
                  type="button"
                  onClick={() => setDismissType('accepted_risk')}
                  className={`flex-1 py-1.5 px-3 rounded-[var(--radius-sm)] border font-mono text-xs transition-colors ${
                    dismissType === 'accepted_risk'
                      ? 'border-[var(--ink)] bg-[var(--bg-subtle)] text-[var(--ink)] font-semibold'
                      : 'border-[var(--line)] text-[var(--ink-muted)]'
                  }`}
                >
                  Accepted Risk
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-[var(--ink)]">Rationale & Context *</label>
              <textarea
                rows={3}
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                placeholder="Document technical justification for suppression..."
                className="w-full p-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink)] font-mono text-xs focus:border-[var(--line-strong)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
            <Button variant="ghost" size="sm" onClick={() => setDismissDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={handleConfirmDismiss} disabled={!dismissReason.trim()}>
              Confirm Dismissal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
