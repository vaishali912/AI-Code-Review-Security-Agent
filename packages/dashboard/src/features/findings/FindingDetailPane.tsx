import React, { useState } from 'react';
import { FindingItem } from '../../data/mockData.js';
import { SeverityDot } from '../../components/ui/SeverityDot.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs.js';
import { TraceStepper } from '../../components/ui/TraceStepper.js';
import { Terminal } from '../../components/ui/Terminal.js';
import { DiffView } from '../../components/ui/DiffView.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/Dialog.js';
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
  ExternalLink 
} from 'lucide-react';

interface FindingDetailPaneProps {
  finding: FindingItem | null;
  onClose?: () => void;
  onUpdateStatus: (findingId: string, status: FindingItem['status'], reason?: string) => void;
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

  return (
    <div className="h-full flex flex-col bg-[var(--surface)] border-l border-[var(--line)]">
      {/* Header bar */}
      <div className="p-4 border-b border-[var(--line)] space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <SeverityDot level={finding.severity} />
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
              {finding.status === 'fixed' && (
                <Badge variant="verified">Fixed</Badge>
              )}
              {finding.status === 'false_positive' && (
                <Badge variant="outline">False Positive</Badge>
              )}
              {finding.status === 'accepted_risk' && (
                <Badge variant="outline">Accepted Risk</Badge>
              )}
            </div>

            <h2 className="text-base font-semibold text-[var(--ink)] leading-snug">
              {finding.title}
            </h2>

            <div className="flex items-center gap-2 text-xs font-mono text-[var(--ink-muted)]">
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
        <div className="flex items-center gap-2 pt-1">
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
          <TabsContent value="overview" className="mt-0 space-y-4">
            <div>
              <h4 className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
                Vulnerability Analysis
              </h4>
              <p className="text-xs text-[var(--ink)] leading-relaxed bg-[var(--bg-subtle)] p-3 rounded-[var(--radius-sm)] border border-[var(--line)]">
                {finding.explanation}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
                Detection Evidence
              </h4>
              <div className="space-y-1.5 font-mono text-xs">
                {finding.evidence.map((ev, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)]">
                    <FileCode className="w-3.5 h-3.5 text-[var(--ink-muted)] shrink-0" />
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider mb-1.5">
                Triage Metadata
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
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

            {finding.triageReason && (
              <div className="p-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] text-xs">
                <span className="font-semibold text-[var(--ink)]">Resolution Note: </span>
                <span className="text-[var(--ink-muted)]">{finding.triageReason}</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="dataflow" className="mt-0">
            <div className="mb-3 text-xs text-[var(--ink-muted)]">
              Source-to-sink reachability trace reconstructed by Sherlock taint analysis:
            </div>
            <TraceStepper steps={finding.dataflow} />
          </TabsContent>

          <TabsContent value="proof" className="mt-0 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-mono font-semibold text-[var(--ink)]">
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
                <div className="text-[11px] font-mono text-[var(--ink-faint)] mb-1">Generated Probe Test Code</div>
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

          <TabsContent value="fix" className="mt-0 space-y-4">
            <div>
              <h4 className="text-xs font-mono font-semibold text-[var(--ink)] mb-1">
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

            <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] space-y-2">
              <div className="text-[11px] font-mono text-[var(--ink-muted)] uppercase tracking-wider font-semibold">
                Pre-validation Checks
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between text-[#30A46C]">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> AST Syntax & Structure
                  </span>
                  <span>PASSED</span>
                </div>
                <div className="flex items-center justify-between text-[#30A46C]">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> TypeScript Type Checking
                  </span>
                  <span>0 ERRORS</span>
                </div>
                <div className="flex items-center justify-between text-[#30A46C]">
                  <span className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Sandbox Regression Tests
                  </span>
                  <span>CLEAN</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Dismissal Reason Dialog */}
      <Dialog open={dismissDialogOpen} onOpenChange={setDismissDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dismiss Finding {finding.id}</DialogTitle>
            <DialogDescription>
              A documented reason is required to dismiss a security finding and update the repository memory store.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
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
              <label className="font-medium text-[var(--ink)]">Rationale & Context</label>
              <textarea
                rows={3}
                value={dismissReason}
                onChange={(e) => setDismissReason(e.target.value)}
                placeholder={
                  dismissType === 'false_positive'
                    ? 'e.g., Input sanitized by upstream gateway middleware; unreachable from external routes.'
                    : 'e.g., Internal benchmark diagnostic endpoint; risk accepted by security team.'
                }
                className="w-full p-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink)] font-mono text-xs focus:border-[var(--line-strong)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
            <Button variant="ghost" size="sm" onClick={() => setDismissDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={handleConfirmDismiss}>
              Confirm Dismissal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
