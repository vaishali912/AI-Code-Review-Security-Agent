import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader.js';
import { StatusChip } from '../../components/shared/StatusChip.js';
import { ScreenshotCompare } from '../../components/shared/ScreenshotCompare.js';
import { Terminal } from '../../components/ui/Terminal.js';
import { Sheet, SheetContent } from '../../components/ui/Sheet.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/Dialog.js';
import { MOCK_TEST_RUNS } from '../../data/marketMockData.js';
import { TestCase } from '../../lib/types.js';
import { 
  FlaskConical, 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sliders, 
  GitCommit, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  Layers, 
  Plus, 
  AlertOctagon 
} from 'lucide-react';
import { cn } from '../../lib/utils.js';

export const TestsPage: React.FC = () => {
  const { runId } = useParams<{ runId?: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'runs' | 'plan' | 'flaky'>('runs');
  const [testCases, setTestCases] = useState<TestCase[]>(MOCK_TEST_RUNS[0]?.cases || []);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(testCases[0]?.id || null);
  const [isMobile, setIsMobile] = useState(false);
  const [quarantineDialogOpen, setQuarantineDialogOpen] = useState(false);
  const [quarantineReason, setQuarantineReason] = useState('');
  const [quarantinedTests, setQuarantinedTests] = useState<string[]>(['test_flaky_session']);

  // Natural language plan builder state
  const [newFlowName, setNewFlowName] = useState('Cart Checkout SQL Injection Canary');
  const [newStepText, setNewStepText] = useState('1. Send order payload with unescaped single quote in item SKU\n2. Verify database connection pool drops malicious query syntax\n3. Assert zero sensitive column values returned in error response');

  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth < 1280);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const selectedTest = testCases.find(t => t.id === selectedTestId) || testCases[0];

  const handleQuarantineConfirm = () => {
    if (selectedTest) {
      setQuarantinedTests(prev => [...prev, selectedTest.id]);
    }
    setQuarantineDialogOpen(false);
    setQuarantineReason('');
  };

  const handleAddTestPlanFlow = () => {
    if (!newFlowName.trim()) return;
    const newCase: TestCase = {
      id: `test_${Date.now()}`,
      title: newFlowName.trim(),
      description: newStepText.trim(),
      flow: 'Synthesized from natural language steps',
      risk: 'high',
      status: 'queued',
      retries: 0,
      reason: 'Generated from test plan builder'
    };
    setTestCases(prev => [newCase, ...prev]);
    setSelectedTestId(newCase.id);
    setActiveTab('runs');
  };

  return (
    <div className="h-full flex flex-col bg-[var(--bg)] font-sans">
      <PageHeader
        title="Autonomous Testing Engine"
        description="Synthesize canary tests from PR diffs, execute targeted test selection, and track flaky test quarantines."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setActiveTab('plan')}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Test Plan Builder</span>
            </Button>
            <Button size="sm" onClick={() => {}}>
              <Play className="w-3.5 h-3.5 mr-1 text-[#30A46C]" />
              <span>Run Selected Tests</span>
            </Button>
          </div>
        }
      />

      {/* Test Selection Banner */}
      <div className="border-b border-[var(--line)] bg-[var(--surface)] px-6 py-2.5 flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#30A46C]" />
          <span className="font-semibold text-[var(--ink)]">
            Ran 14 of 212 tests, saved about 11 min
          </span>
          <span className="text-[var(--ink-muted)] hidden md:inline">
            (Diff impact selection: changed files + security sinks + flaky quarantine)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('runs')}
            className={cn('px-2.5 py-1 rounded-[var(--radius-sm)] border text-xs font-mono transition-colors', activeTab === 'runs' ? 'bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]' : 'border-[var(--line)] text-[var(--ink-muted)]')}
          >
            Runs & Evidence
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={cn('px-2.5 py-1 rounded-[var(--radius-sm)] border text-xs font-mono transition-colors', activeTab === 'plan' ? 'bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]' : 'border-[var(--line)] text-[var(--ink-muted)]')}
          >
            Plan Builder
          </button>
          <button
            onClick={() => setActiveTab('flaky')}
            className={cn('px-2.5 py-1 rounded-[var(--radius-sm)] border text-xs font-mono transition-colors', activeTab === 'flaky' ? 'bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]' : 'border-[var(--line)] text-[var(--ink-muted)]')}
          >
            Flaky Tracker ({quarantinedTests.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'runs' && (
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Master List */}
          <div className={cn('flex-1 overflow-y-auto min-w-0 divide-y divide-[var(--line)]', !isMobile && 'max-w-xl border-r border-[var(--line)]')}>
            {testCases.map((tc) => {
              const isSelected = tc.id === selectedTestId;
              const isQuarantined = quarantinedTests.includes(tc.id);

              return (
                <div
                  key={tc.id}
                  onClick={() => setSelectedTestId(tc.id)}
                  className={cn(
                    'p-4 flex items-start justify-between gap-3 cursor-pointer select-none transition-colors font-mono text-xs',
                    isSelected
                      ? 'bg-[var(--bg-subtle)] border-l-2 border-l-[var(--ink)]'
                      : 'hover:bg-[var(--bg-subtle)]/60'
                  )}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--ink)] truncate">{tc.title}</span>
                      <StatusChip status={tc.status} size="sm" />
                      {isQuarantined && <Badge variant="subtle">Quarantined</Badge>}
                    </div>
                    <div className="text-[11px] text-[var(--ink-muted)] truncate">
                      {tc.flow}
                    </div>
                    <div className="text-[10px] text-[var(--ink-faint)] truncate">
                      Reason: {tc.reason}
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-0.5">
                    <div className="text-[11px] text-[var(--ink-muted)]">{tc.durationMs ? `${tc.durationMs}ms` : '—'}</div>
                    {tc.retries > 0 && <span className="text-[10px] text-[#E5A50A]">{tc.retries} retries</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail Pane (Desktop side panel, mobile sheet) */}
          {!isMobile ? (
            <div className="flex-1 min-w-0 h-full overflow-y-auto p-6 space-y-5 bg-[var(--surface)]">
              {selectedTest ? (
                <TestDetailContent
                  test={selectedTest}
                  isQuarantined={quarantinedTests.includes(selectedTest.id)}
                  onOpenQuarantine={() => setQuarantineDialogOpen(true)}
                />
              ) : (
                <div className="p-8 text-center text-xs font-mono text-[var(--ink-muted)]">Select a test run to inspect evidence.</div>
              )}
            </div>
          ) : (
            <Sheet open={Boolean(selectedTest && isMobile)} onOpenChange={(open: boolean) => !open && setSelectedTestId(null)}>
              <SheetContent side="right" className="p-6 max-w-2xl w-full overflow-y-auto">
                {selectedTest && (
                  <TestDetailContent
                    test={selectedTest}
                    isQuarantined={quarantinedTests.includes(selectedTest.id)}
                    onOpenQuarantine={() => setQuarantineDialogOpen(true)}
                  />
                )}
              </SheetContent>
            </Sheet>
          )}
        </div>
      )}

      {/* Plan Builder Tab */}
      {activeTab === 'plan' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
          <div className="p-5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] space-y-4 font-mono text-xs">
            <h3 className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
              Natural Language Test Plan Builder
            </h3>
            <p className="text-xs text-[var(--ink)]">
              Specify user flows and security assertions in plain English. The agent converts them to canary probes.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-[var(--ink-muted)] block mb-1">Flow Name / Objective</label>
                <input
                  type="text"
                  value={newFlowName}
                  onChange={(e) => setNewFlowName(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] text-xs text-[var(--ink)]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[var(--ink-muted)] block mb-1">Natural-Language Steps (One sentence per step)</label>
                <textarea
                  rows={4}
                  value={newStepText}
                  onChange={(e) => setNewStepText(e.target.value)}
                  className="w-full p-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] text-xs text-[var(--ink)] leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <Button size="sm" onClick={handleAddTestPlanFlow}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Synthesize Canary Test</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flaky Tracker Tab */}
      {activeTab === 'flaky' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-4 font-mono text-xs">
          <div className="p-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] space-y-2">
            <h3 className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
              Flaky Test Quarantine Manager
            </h3>
            <p className="text-xs text-[var(--ink)]">
              Quarantined tests are isolated from the blocking PR gate until verified stable over 20 consecutive runs.
            </p>
          </div>

          <div className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink-muted)]">
                <tr>
                  <th className="py-2.5 px-3">Test Identifier</th>
                  <th className="py-2.5 px-3">Pass Rate (30d)</th>
                  <th className="py-2.5 px-3">Last Failure</th>
                  <th className="py-2.5 px-3">Quarantine Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                <tr className="hover:bg-[var(--bg-subtle)]">
                  <td className="py-3 px-3 font-semibold text-[var(--ink)]">
                    test_flaky_session (Redis TTL race)
                  </td>
                  <td className="py-3 px-3 text-[#E5A50A] font-semibold">68.2%</td>
                  <td className="py-3 px-3 text-[var(--ink-muted)]">Commit 7c32bf1 (2h ago)</td>
                  <td className="py-3 px-3">
                    <Badge variant="subtle">Quarantined</Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Button size="sm" variant="secondary" onClick={() => setQuarantinedTests(prev => prev.filter(id => id !== 'test_flaky_session'))}>
                      Unquarantine
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quarantine Dialog requiring reason */}
      <Dialog open={quarantineDialogOpen} onOpenChange={setQuarantineDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quarantine Flaky Test</DialogTitle>
            <DialogDescription>
              A documented reason is required to quarantine tests and suppress CI gate blockage.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs font-mono">
            <label className="text-[var(--ink)] block">Quarantine Rationale *</label>
            <textarea
              rows={3}
              value={quarantineReason}
              onChange={(e) => setQuarantineReason(e.target.value)}
              placeholder="e.g. Test exhibits network latency flakiness in Redis mock runner; team investigating ticket SEC-104."
              className="w-full p-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] text-xs text-[var(--ink)]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
            <Button size="sm" variant="ghost" onClick={() => setQuarantineDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={handleQuarantineConfirm} disabled={!quarantineReason.trim()}>
              Confirm Quarantine
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Sub-component for Test Detail Pane
const TestDetailContent: React.FC<{
  test: TestCase;
  isQuarantined: boolean;
  onOpenQuarantine: () => void;
}> = ({ test, isQuarantined, onOpenQuarantine }) => {
  return (
    <div className="space-y-5 font-mono text-xs">
      <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[var(--ink)]">{test.title}</h2>
            <StatusChip status={test.status} />
          </div>
          <p className="text-xs text-[var(--ink-muted)]">{test.description}</p>
        </div>

        <Button size="sm" variant="secondary" onClick={onOpenQuarantine} disabled={isQuarantined}>
          {isQuarantined ? 'Quarantined' : 'Quarantine Test'}
        </Button>
      </div>

      {/* Failure-to-Change Card */}
      {test.status === 'failed' && test.failingCommit && (
        <div className="p-4 rounded-[var(--radius-sm)] border border-[#E5484D]/40 bg-[#E5484D]/5 space-y-2">
          <div className="flex items-center gap-2 text-[#E5484D] font-semibold">
            <AlertOctagon className="w-4 h-4" />
            <span>Failure Traced Directly to Change</span>
          </div>
          <div className="text-[11px] text-[var(--ink)]">
            Failing Commit: <code>{test.failingCommit}</code> · Offending Lines: <code>{test.failingLine}</code>
          </div>
          <p className="text-[11px] text-[var(--ink-muted)]">
            The failure assertion correlates with modified route controller lacking session authorization middleware.
          </p>
        </div>
      )}

      {/* Execution Logs */}
      {test.log && test.log.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
            Execution Log & Canary Probes
          </div>
          <Terminal title="autonomous-test-runner" lines={test.log} maxHeight="200px" />
        </div>
      )}

      {/* Visual Compare */}
      <ScreenshotCompare
        beforeLabel="Failing Baseline Canary"
        afterLabel="Sanitized DOM Sandbox"
      />
    </div>
  );
};
