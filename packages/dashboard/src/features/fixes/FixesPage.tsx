import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader.js';
import { StatusChip } from '../../components/shared/StatusChip.js';
import { BeforeAfterTable } from '../../components/shared/BeforeAfterTable.js';
import { ApprovalBar } from '../../components/shared/ApprovalBar.js';
import { DiffView } from '../../components/ui/DiffView.js';
import { Sheet, SheetContent } from '../../components/ui/Sheet.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/Dialog.js';
import { MOCK_FIX_ATTEMPTS } from '../../data/marketMockData.js';
import { FixAttempt } from '../../lib/types.js';
import { 
  Wrench, 
  GitBranch, 
  Bug, 
  RotateCw, 
  CheckCircle2, 
  FileCode, 
  Download, 
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils.js';

export const FixesPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [fixes, setFixes] = useState<FixAttempt[]>(MOCK_FIX_ATTEMPTS);
  const [selectedId, setSelectedId] = useState<string | null>(id || fixes[0]?.id || null);
  const [isMobile, setIsMobile] = useState(false);
  const [sentryDialogOpen, setSentryDialogOpen] = useState(false);
  const [sentryStackTrace, setSentryStackTrace] = useState(`TypeError: Cannot read properties of undefined (reading 'query')
    at /app/src/routes/users.ts:10:18
    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
    at next (/app/node_modules/express/lib/router/route.js:144:13)`);
  const [sentryIssueId, setSentryIssueId] = useState('PROD-AUTH-982');

  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth < 1280);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const selectedFix = fixes.find(f => f.id === selectedId) || fixes[0];

  const handleApprove = (reason: string) => {
    setFixes(prev => prev.map(f => f.id === selectedFix.id ? { ...f, status: 'verified' } : f));
  };

  const handleRequestChanges = (reason: string) => {
    setFixes(prev => prev.map(f => f.id === selectedFix.id ? { ...f, status: 'needs_approval', failureReason: reason } : f));
  };

  const handleImportSentry = () => {
    const newFix: FixAttempt = {
      id: `fix_sentry_${Date.now()}`,
      findingId: `fnd_sentry_${Date.now()}`,
      title: `Remediate production crash in users.ts (${sentryIssueId})`,
      branch: 'sherlock/fix-sentry-prod-crash',
      attempt: 1,
      maxAttempts: 3,
      status: 'verified',
      rootCause: 'Database connection pool dropped during query execution; unhandled promise rejection.',
      reproSteps: [
        `Imported from Sentry error ${sentryIssueId}`,
        'High load concurrency triggered socket timeout in database pool'
      ],
      diff: `--- a/src/routes/users.ts\n+++ b/src/routes/users.ts\n@@ -10,1 +10,3 @@\n-const result = await db.query(rawQuery);\n+if (!db.isReady()) await db.reconnect();\n+const result = await db.query(rawQuery);`,
      before: { 'Sentry Crash Canary Probe': 'failed' },
      after: { 'Sentry Crash Canary Probe': 'passed' }
    };
    setFixes(prev => [newFix, ...prev]);
    setSelectedId(newFix.id);
    setSentryDialogOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg)] font-sans">
      <PageHeader
        title="Autonomous Debugging & Fix Loops"
        description="Isolated fix branches, root-cause analysis, and human sign-off gates with before/after verification."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setSentryDialogOpen(true)}>
              <Download className="w-3.5 h-3.5 mr-1" />
              <span>Import from Sentry</span>
            </Button>
          </div>
        }
      />

      {/* Master-Detail Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Master List */}
        <div className={cn('flex-1 overflow-y-auto min-w-0 divide-y divide-[var(--line)]', !isMobile && 'max-w-xl border-r border-[var(--line)]')}>
          {fixes.map((fix) => {
            const isSelected = fix.id === selectedId;

            return (
              <div
                key={fix.id}
                onClick={() => setSelectedId(fix.id)}
                className={cn(
                  'p-4 flex items-start justify-between gap-3 cursor-pointer select-none transition-colors font-mono text-xs',
                  isSelected
                    ? 'bg-[var(--bg-subtle)] border-l-2 border-l-[var(--ink)]'
                    : 'hover:bg-[var(--bg-subtle)]/60'
                )}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--ink)] truncate">{fix.title}</span>
                    <StatusChip status={fix.status} size="sm" />
                  </div>
                  <div className="text-[11px] text-[var(--ink-muted)] truncate flex items-center gap-1.5">
                    <GitBranch className="w-3 h-3 text-[var(--ink-faint)]" />
                    <span>{fix.branch}</span>
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-0.5">
                  <div className="text-[11px] text-[var(--ink-muted)]">
                    Attempt {fix.attempt}/{fix.maxAttempts}
                  </div>
                  {fix.status === 'verified' && (
                    <span className="text-[10px] text-[#30A46C] font-semibold">Green In Sandbox</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detail Pane */}
        {!isMobile ? (
          <div className="flex-1 min-w-0 h-full flex flex-col bg-[var(--surface)]">
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {selectedFix && <FixDetailContent fix={selectedFix} />}
            </div>
            {selectedFix && (
              <ApprovalBar
                isVerified={selectedFix.status === 'verified'}
                onApprove={handleApprove}
                onRequestChanges={handleRequestChanges}
              />
            )}
          </div>
        ) : (
          <Sheet open={Boolean(selectedFix && isMobile)} onOpenChange={(open: boolean) => !open && setSelectedId(null)}>
            <SheetContent side="right" className="p-0 flex flex-col max-w-2xl w-full">
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {selectedFix && <FixDetailContent fix={selectedFix} />}
              </div>
              {selectedFix && (
                <ApprovalBar
                  isVerified={selectedFix.status === 'verified'}
                  onApprove={handleApprove}
                  onRequestChanges={handleRequestChanges}
                />
              )}
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Sentry Import Dialog */}
      <Dialog open={sentryDialogOpen} onOpenChange={setSentryDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Production Error from Sentry</DialogTitle>
            <DialogDescription>
              Converts a production runtime exception into a reproducible finding and triggers an autonomous fix branch.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs font-mono">
            <div>
              <label className="text-[var(--ink)] block mb-1">Sentry Issue Key / Link</label>
              <input
                type="text"
                value={sentryIssueId}
                onChange={(e) => setSentryIssueId(e.target.value)}
                className="w-full h-8 px-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink)]"
              />
            </div>

            <div>
              <label className="text-[var(--ink)] block mb-1">Production Stack Trace</label>
              <textarea
                rows={5}
                value={sentryStackTrace}
                onChange={(e) => setSentryStackTrace(e.target.value)}
                className="w-full p-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink)] leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
            <Button size="sm" variant="ghost" onClick={() => setSentryDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleImportSentry}>
              Import & Synthesize Fix
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const FixDetailContent: React.FC<{ fix: FixAttempt }> = ({ fix }) => {
  return (
    <div className="space-y-5 font-mono text-xs">
      {/* Title & Metadata */}
      <div className="border-b border-[var(--line)] pb-4 space-y-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[var(--ink)]">{fix.title}</h2>
          <StatusChip status={fix.status} />
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[var(--ink-muted)] flex-wrap">
          <span>Branch: <code>{fix.branch}</code></span>
          <span>·</span>
          <span>Loop Attempt: {fix.attempt} of {fix.maxAttempts}</span>
          <span>·</span>
          <span>Target Finding: <code>{fix.findingId}</code></span>
        </div>
      </div>

      {/* Root Cause Analysis Card */}
      <div className="p-4 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] space-y-2">
        <div className="flex items-center gap-2 font-semibold text-[var(--ink)] text-xs">
          <Bug className="w-3.5 h-3.5 text-[#E5484D]" />
          <span>Root Cause Analysis</span>
        </div>
        <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
          {fix.rootCause}
        </p>

        <div className="pt-2 border-t border-[var(--line)] space-y-1">
          <div className="text-[10px] text-[var(--ink-faint)] uppercase font-semibold">Reproduction Steps</div>
          <ol className="list-decimal pl-4 space-y-0.5 text-[11px] text-[var(--ink)]">
            {fix.reproSteps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* Before / After Verification Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
            Before vs. After Verification Matrix
          </span>
          <span className="text-[10px] text-[var(--ink-faint)]">Evaluated in ephemeral micro-VM</span>
        </div>
        <BeforeAfterTable before={fix.before} after={fix.after} />
      </div>

      {/* Diff View */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
          Proposed Git Patch (Branch: {fix.branch})
        </span>
        <DiffView patch={fix.diff} />
      </div>
    </div>
  );
};
