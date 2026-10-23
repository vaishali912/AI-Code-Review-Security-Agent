import React, { useState } from 'react';
import { useOutletContext, useNavigate, useParams } from 'react-router-dom';
import { EnhancedFindingItem } from '../../lib/types.js';
import { PageHeader } from '../../components/shared/PageHeader.js';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs.js';
import { StatusChip } from '../../components/shared/StatusChip.js';
import { SourceBadge } from '../../components/shared/SourceBadge.js';
import { RiskBadge } from '../../components/shared/RiskBadge.js';
import { ImpactGraph } from '../../components/shared/ImpactGraph.js';
import { AgentTimeline } from '../../components/shared/AgentTimeline.js';
import { RuleEditor } from '../../components/shared/RuleEditor.js';
import { DiffView } from '../../components/ui/DiffView.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { SeverityDot } from '../../components/ui/SeverityDot.js';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/Sheet.js';
import { 
  MOCK_AGENT_RUNS, 
  MOCK_TEST_RUNS, 
  MOCK_FIX_ATTEMPTS, 
  MOCK_REVIEW_RULES 
} from '../../data/marketMockData.js';
import { 
  GitPullRequest, 
  GitCommit, 
  ShieldAlert, 
  MessageSquare, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sliders, 
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  Send,
  FileCode,
  Check
} from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface OutletContextType {
  findings: EnhancedFindingItem[];
  onUpdateStatus: (findingId: string, status: EnhancedFindingItem['status'], reason?: string) => void;
}

export const PullsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { findings } = useOutletContext<OutletContextType>();

  const [activeTab, setActiveTab] = useState<'summary' | 'impact' | 'findings' | 'tests' | 'fixes' | 'timeline'>('summary');
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'bot'; text: string; time: string }>>([
    {
      role: 'bot',
      text: 'Sherlock evaluated PR #42 commit `7c32bf1`. Found 2 Critical, 4 High vulnerabilities. Gate status is BLOCKING. Type `@sherlock explain`, `@sherlock fix`, or `@sherlock suppress <reason>`.',
      time: '10:42 AM'
    }
  ]);

  // Comment controls state
  const [commentCap, setCommentCap] = useState(10);
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [dedupeEnabled, setDedupeEnabled] = useState(true);

  // Stacked PRs definition
  const stackedPRs = [
    { id: 'pr_40', number: 40, title: 'chore/db-connection-pool', status: 'passed' as const, isCurrent: false },
    { id: 'pr_42', number: 42, title: 'feat/user-management-api', status: 'blocked' as const, isCurrent: true },
    { id: 'pr_43', number: 43, title: 'feat/client-user-admin', status: 'queued' as const, isCurrent: false }
  ];

  // Review checklist
  const reviewChecklist: Array<{ title: string; status: 'pass' | 'fail' | 'warn'; evidence: string }> = [
    { title: 'Automated test suite additions', status: 'pass', evidence: '4 canary test cases generated' },
    { title: 'Database schema migration safety', status: 'pass', evidence: 'Non-breaking additive column changes only' },
    { title: 'Authentication & Authorization guardrails', status: 'fail', evidence: 'Missing requireAuth on DELETE /users/:id' },
    { title: 'Untrusted input sanitization', status: 'fail', evidence: 'Reachable unparameterized query in GET /users' },
    { title: 'No committed secrets or API tokens', status: 'fail', evidence: '1 active GitHub token detected in src/config/github.ts' }
  ];

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', text, time }]);
    setChatInput('');

    setTimeout(() => {
      let reply = 'Command acknowledged. Sherlock is actively enforcing the PR security gate.';
      if (text.includes('explain')) {
        reply = 'SQL injection in src/routes/users.ts:10. Untrusted user parameter is concatenated into raw query without parameterized placeholder ($1).';
      } else if (text.includes('fix')) {
        reply = 'Generated verified patch for src/routes/users.ts. Parameterized query tested in sandbox container with 0 regressions.';
      }
      setMessages(prev => [...prev, { role: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 500);
  };

  return (
    <div className="min-h-full flex flex-col bg-[var(--bg)] pb-12 font-sans">
      <PageHeader
        title="Pull Request Review & Deep Analysis"
        description="Cross-file impact analysis, specialized agent timeline, automated canary tests, and patch verification."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setChatDrawerOpen(true)}>
              <MessageSquare className="w-3.5 h-3.5 mr-1" />
              <span>Review Agent ({messages.length})</span>
            </Button>
            <Button size="sm" onClick={() => navigate('/app/fixes')}>
              <span>View Fixes</span>
            </Button>
          </div>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Stacked PRs Navigation Bar */}
        <div className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] p-2.5 px-4 flex items-center justify-between text-xs font-mono overflow-x-auto gap-4">
          <div className="flex items-center gap-2 text-[var(--ink-muted)] shrink-0">
            <Layers className="w-3.5 h-3.5" />
            <span className="font-semibold uppercase text-[10px]">Stacked PRs:</span>
          </div>

          <div className="flex items-center gap-3">
            {stackedPRs.map((pr, idx) => (
              <React.Fragment key={pr.id}>
                {idx > 0 && <span className="text-[var(--ink-faint)]">→</span>}
                <div
                  className={cn(
                    'flex items-center gap-2 px-2.5 py-1 rounded-[var(--radius-sm)] border select-none transition-colors',
                    pr.isCurrent
                      ? 'border-[var(--ink)] bg-[var(--bg-subtle)] text-[var(--ink)] font-semibold shadow-xs'
                      : 'border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)]'
                  )}
                >
                  <span>PR #{pr.number}: {pr.title}</span>
                  <StatusChip status={pr.status} size="sm" />
                </div>
              </React.Fragment>
            ))}
          </div>

          <span className="text-[11px] text-[var(--ink-faint)] shrink-0">Branch: feature/user-management → main</span>
        </div>

        {/* PR Main Header Card with CI Gate & Coverage */}
        <div className="p-5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <GitPullRequest className="w-4 h-4 text-[var(--ink)]" />
                <h2 className="text-base font-semibold text-[var(--ink)]">
                  PR #42: Feature/User-Management-API & File-Processing
                </h2>
                <Badge variant="danger">CI Gate: Blocking</Badge>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-[var(--ink-muted)] flex-wrap">
                <span>Author: <strong>developer</strong></span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <GitCommit className="w-3 h-3" /> Commit <code>7c32bf1</code>
                </span>
                <span>·</span>
                <a
                  href="https://github.com/org/repo/actions/runs/10892"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[var(--focus-link)] hover:underline"
                >
                  <span>GitHub Actions #10892</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Changed line coverage mini-bar */}
            <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] space-y-1.5 min-w-[200px] text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--ink-muted)]">Changed Code Coverage</span>
                <span className="font-bold text-[#30A46C]">86.4%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--line)] overflow-hidden">
                <div className="h-full bg-[#30A46C] rounded-full" style={{ width: '86.4%' }} />
              </div>
              <div className="text-[10px] text-[var(--ink-faint)]">Target: ≥ 80% (Passes policy)</div>
            </div>
          </div>
        </div>

        {/* Six PR Depth Tabs */}
        <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as any)}>
          <TabsList className="border-b border-[var(--line)] bg-[var(--bg-subtle)] px-4 gap-2">
            <TabsTrigger value="summary">Summary & Checklist</TabsTrigger>
            <TabsTrigger value="impact">Impact Graph & Blast Radius</TabsTrigger>
            <TabsTrigger value="findings">Findings ({findings.length})</TabsTrigger>
            <TabsTrigger value="tests">Autonomous Tests (14)</TabsTrigger>
            <TabsTrigger value="fixes">Fix Attempts (2)</TabsTrigger>
            <TabsTrigger value="timeline">Agent Run Timeline (7)</TabsTrigger>
          </TabsList>

          {/* 1. Summary Tab */}
          <TabsContent value="summary" className="space-y-6">
            {/* PR Checklist */}
            <div className="p-5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] space-y-3">
              <h3 className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
                Automated Pre-Merge Review Checklist
              </h3>

              <div className="divide-y divide-[var(--line)] font-mono text-xs">
                {reviewChecklist.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      {item.status === 'pass' && <CheckCircle2 className="w-4 h-4 text-[#30A46C] shrink-0" />}
                      {item.status === 'fail' && <XCircle className="w-4 h-4 text-[#E5484D] shrink-0" />}
                      {item.status === 'warn' && <AlertTriangle className="w-4 h-4 text-[#E5A50A] shrink-0" />}
                      <span className="text-[var(--ink)] font-medium">{item.title}</span>
                    </div>
                    <span className="text-[11px] text-[var(--ink-muted)]">{item.evidence}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comment Deduplication & Suppression Controls */}
            <div className="p-5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                <div>
                  <h3 className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
                    PR Comment Controls & Noise Suppression
                  </h3>
                  <p className="text-xs text-[var(--ink)] mt-0.5">
                    Currently showing <strong>8 of 31</strong> findings; <strong>23 suppressed</strong> by reachability and dedupe filters.
                  </p>
                </div>
                <Badge variant="subtle">Dedupe Active</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <label className="text-[11px] text-[var(--ink-muted)] block mb-1">Max PR Comment Cap</label>
                  <input
                    type="number"
                    value={commentCap}
                    onChange={(e) => setCommentCap(Number(e.target.value))}
                    className="w-full h-8 px-2 rounded border border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[var(--ink-muted)] block mb-1">Confidence Floor (%)</label>
                  <input
                    type="number"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                    className="w-full h-8 px-2 rounded border border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[var(--ink-muted)] block mb-1">Deduplication</label>
                  <button
                    onClick={() => setDedupeEnabled(!dedupeEnabled)}
                    className={cn(
                      'w-full h-8 px-3 rounded border text-xs font-semibold transition-colors',
                      dedupeEnabled
                        ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)]'
                        : 'border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink-muted)]'
                    )}
                  >
                    {dedupeEnabled ? 'Deduplication: ON' : 'Deduplication: OFF'}
                  </button>
                </div>
              </div>
            </div>

            {/* Per-Path Rules Editor Component */}
            <RuleEditor initialRules={MOCK_REVIEW_RULES} />
          </TabsContent>

          {/* 2. Impact Graph Tab */}
          <TabsContent value="impact">
            <ImpactGraph onSelectNode={(file) => {
              setActiveTab('findings');
            }} />
          </TabsContent>

          {/* 3. Findings Tab with Source Badges & Risk Scores */}
          <TabsContent value="findings" className="space-y-4">
            <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
              <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
                  Findings in PR #42 (6 Total)
                </span>
                <span className="text-[11px] font-mono text-[var(--ink-faint)]">Source engines: Semgrep, CodeQL, AI</span>
              </div>

              <div className="divide-y divide-[var(--line)] font-mono text-xs">
                {findings.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => navigate(`/app/findings/${f.id}`)}
                    className="p-3.5 px-4 flex items-center justify-between gap-4 hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <SeverityDot level={f.severity} />
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--ink)] truncate">{f.title}</span>
                          {f.source && <SourceBadge source={f.source} />}
                          {f.riskScore && <RiskBadge score={f.riskScore} />}
                        </div>
                        <div className="text-[11px] text-[var(--ink-muted)] truncate">
                          {f.location.file}:{f.location.startLine} · {f.cwe.join(', ')}
                        </div>
                      </div>
                    </div>

                    <Button size="sm" variant="ghost">
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 4. Tests Tab */}
          <TabsContent value="tests" className="space-y-4">
            <div className="p-3 px-4 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] flex items-center justify-between font-mono text-xs">
              <span className="text-[var(--ink)] font-semibold">
                Ran 14 of 212 tests, saved about 11 min
              </span>
              <span className="text-[var(--ink-muted)]">Targeted diff execution selection</span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {MOCK_TEST_RUNS[0]?.cases.map((testCase) => (
                <div
                  key={testCase.id}
                  className="p-3.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--ink)]">{testCase.title}</span>
                      <StatusChip status={testCase.status} size="sm" />
                    </div>
                    <div className="text-[11px] text-[var(--ink-muted)]">
                      {testCase.flow} · Reason: {testCase.reason}
                    </div>
                  </div>

                  <span className="text-[11px] text-[var(--ink-muted)] shrink-0">{testCase.durationMs}ms</span>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* 5. Fixes Tab */}
          <TabsContent value="fixes" className="space-y-4">
            {MOCK_FIX_ATTEMPTS.map((attempt) => (
              <div
                key={attempt.id}
                className="p-5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] space-y-3 font-mono text-xs"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--ink)] text-sm">{attempt.title}</span>
                      <StatusChip status={attempt.status} size="sm" />
                    </div>
                    <div className="text-[11px] text-[var(--ink-muted)]">
                      Branch: <code>{attempt.branch}</code> · Attempt {attempt.attempt} of {attempt.maxAttempts}
                    </div>
                  </div>

                  <Button size="sm" onClick={() => navigate('/app/fixes')}>
                    Review Fix
                  </Button>
                </div>

                <DiffView patch={attempt.diff} />
              </div>
            ))}
          </TabsContent>

          {/* 6. Timeline Tab */}
          <TabsContent value="timeline">
            <AgentTimeline steps={MOCK_AGENT_RUNS[0]?.steps || []} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Chat Right-Side Drawer */}
      <Sheet open={chatDrawerOpen} onOpenChange={setChatDrawerOpen}>
        <SheetContent side="right" className="p-0 flex flex-col w-full max-w-md">
          <SheetHeader className="p-4 border-b border-[var(--line)] m-0">
            <SheetTitle className="text-sm font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[var(--ink-muted)]" />
              <span>Sherlock PR Review Assistant</span>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={cn(
                  'p-3 rounded-[var(--radius-sm)] border space-y-1',
                  m.role === 'user'
                    ? 'ml-6 bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]'
                    : 'mr-6 bg-[var(--bg-subtle)] text-[var(--ink)] border-[var(--line)]'
                )}
              >
                <div className="flex items-center justify-between text-[10px] font-mono opacity-70">
                  <span>{m.role === 'user' ? 'You' : 'Sherlock Agent'}</span>
                  <span>{m.time}</span>
                </div>
                <div className="leading-relaxed whitespace-pre-wrap">{m.text}</div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-[var(--line)] bg-[var(--bg-subtle)] space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type @sherlock explain, fix, or suppress..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                className="flex-1 h-8 px-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--ink)] focus:border-[var(--line-strong)] font-mono"
              />
              <Button size="sm" onClick={handleSendChat}>
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="text-[10px] font-mono text-[var(--ink-faint)]">
              Commands: <code>@sherlock explain</code> · <code>@sherlock fix</code> · <code>@sherlock suppress</code>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
