import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { EnhancedFindingItem } from '../../lib/types.js';
import { FindingDetailPane } from './FindingDetailPane.js';
import { SeverityDot } from '../../components/ui/SeverityDot.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Sheet, SheetContent } from '../../components/ui/Sheet.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/Dialog.js';
import { SourceBadge } from '../../components/shared/SourceBadge.js';
import { RiskBadge } from '../../components/shared/RiskBadge.js';
import { MaskedSecret } from '../../components/shared/MaskedSecret.js';
import { DiffView } from '../../components/ui/DiffView.js';
import { Kbd } from '../../components/ui/Kbd.js';
import { 
  MOCK_SECRETS, 
  MOCK_DEPENDENCIES, 
  MOCK_SUPPRESSIONS 
} from '../../data/marketMockData.js';
import { 
  Search, 
  Filter, 
  Check, 
  ShieldAlert, 
  HelpCircle, 
  FlaskConical,
  X,
  Play,
  Download,
  Printer,
  Plus,
  KeyRound,
  Package,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface OutletContextType {
  findings: EnhancedFindingItem[];
  onUpdateStatus: (findingId: string, status: EnhancedFindingItem['status'], reason?: string) => void;
}

export const FindingsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { findings, onUpdateStatus } = useOutletContext<OutletContextType>();

  const [activeMainTab, setActiveMainTab] = useState<'code' | 'secrets' | 'dependencies' | 'suppressions'>('code');
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [density, setDensity] = useState<'compact' | 'normal'>('compact');
  const [selectedId, setSelectedId] = useState<string | null>(id || findings[0]?.id || null);
  const [isMobile, setIsMobile] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [customRuleDialogOpen, setCustomRuleDialogOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Custom rule creator state
  const [ruleDesc, setRuleDesc] = useState('Disallow unvalidated redirect URLs from query params');
  const [badExample, setBadExample] = useState('res.redirect(req.query.targetUrl);');
  const [goodExample, setGoodExample] = useState('if (isAllowedHost(target)) res.redirect(target);');
  const [generatedRule, setGeneratedRule] = useState('pattern: res.redirect($URL)\nwhere: not isAllowedHost($URL)');

  // Sync route param with selection
  useEffect(() => {
    if (id) {
      setSelectedId(id);
    }
  }, [id]);

  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth < 1280);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const filtered = findings.filter(f => {
    const matchesSearch = 
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.location.file.toLowerCase().includes(search.toLowerCase()) ||
      f.cwe.some(c => c.toLowerCase().includes(search.toLowerCase())) ||
      f.id.toLowerCase().includes(search.toLowerCase());

    const matchesSev = selectedSeverity === 'all' || f.severity === selectedSeverity;
    const matchesSource = selectedSource === 'all' || f.source === selectedSource;

    return matchesSearch && matchesSev && matchesSource;
  });

  const selectedFinding = findings.find(f => f.id === selectedId) || null;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && ['INPUT', 'TEXTAREA'].includes(activeEl.tagName);

      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setShortcutsModalOpen(true);
        return;
      }

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (isInput) return;

      const currentIndex = filtered.findIndex(f => f.id === selectedId);

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < filtered.length - 1) {
          const next = filtered[currentIndex + 1];
          setSelectedId(next.id);
          navigate(`/app/findings/${next.id}`, { replace: true });
        }
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          const prev = filtered[currentIndex - 1];
          setSelectedId(prev.id);
          navigate(`/app/findings/${prev.id}`, { replace: true });
        }
      } else if (e.key === 'f' && selectedFinding) {
        e.preventDefault();
        onUpdateStatus(selectedFinding.id, 'fixed', 'Applied verified security patch');
      } else if (e.key === 'e' && selectedFinding) {
        e.preventDefault();
        onUpdateStatus(selectedFinding.id, 'false_positive', 'Suppressed via keyboard shortcut');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtered, selectedId, selectedFinding, navigate, onUpdateStatus]);

  // Export SARIF json file
  const handleExportSARIF = () => {
    const sarif = {
      $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      version: '2.1.0',
      runs: [{
        tool: { driver: { name: 'Sherlock', version: '1.0.0' } },
        results: findings.map(f => ({
          ruleId: f.detected_by.static_rule,
          message: { text: f.title },
          locations: [{
            physicalLocation: {
              artifactLocation: { uri: f.location.file },
              region: { startLine: f.location.startLine }
            }
          }]
        }))
      }]
    };
    const blob = new Blob([JSON.stringify(sarif, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sherlock-findings.sarif';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Printable compliance summary trigger
  const handlePrintSummary = () => {
    window.print();
  };

  const blockingCount = findings.filter(f => (f.severity === 'critical' || f.severity === 'high') && f.status === 'open').length;
  const openCount = findings.filter(f => f.status === 'open').length;
  const provenCount = findings.filter(f => f.proof?.status === 'proven').length;

  return (
    <div className="h-full flex flex-col min-w-0 bg-[var(--bg)] font-sans">
      {/* 1. Slim Summary Strip */}
      <div className="border-b border-[var(--line)] bg-[var(--surface)] px-6 py-2.5 flex items-center justify-between text-xs font-mono overflow-x-auto gap-6 shrink-0">
        <div className="flex items-center gap-6 divide-x divide-[var(--line)]">
          <div className="flex items-center gap-2 pr-6">
            <span className="text-[var(--ink-muted)]">Blocking:</span>
            <span className="font-bold text-[#E5484D]">{blockingCount}</span>
            <span className="text-[10px] text-[var(--ink-faint)]">(PR gate)</span>
          </div>

          <div className="flex items-center gap-2 pl-6 pr-6">
            <span className="text-[var(--ink-muted)]">Open:</span>
            <span className="font-bold text-[var(--ink)]">{openCount}</span>
          </div>

          <div className="flex items-center gap-2 pl-6 pr-6">
            <span className="text-[var(--ink-muted)]">Proven:</span>
            <span className="font-bold text-[#30A46C]">{provenCount}</span>
            <span className="text-[10px] text-[var(--ink-faint)]">(sandbox verified)</span>
          </div>

          <div className="flex items-center gap-2 pl-6">
            <span className="text-[var(--ink-muted)]">Secrets:</span>
            <span className="font-bold text-[#E5484D]">{MOCK_SECRETS.length}</span>
          </div>

          <div className="flex items-center gap-2 pl-6">
            <span className="text-[var(--ink-muted)]">Supply-chain:</span>
            <span className="font-bold text-[#F76B15]">{MOCK_DEPENDENCIES.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button size="sm" variant="secondary" onClick={handleExportSARIF}>
            <Download className="w-3.5 h-3.5 mr-1" />
            <span>SARIF</span>
          </Button>

          <Button size="sm" variant="secondary" onClick={handlePrintSummary}>
            <Printer className="w-3.5 h-3.5 mr-1" />
            <span>PDF Print</span>
          </Button>

          <Button size="sm" onClick={() => navigate('/app/scan')}>
            <Play className="w-3.5 h-3.5 mr-1 text-[#30A46C]" />
            <span>Run Scan</span>
          </Button>
        </div>
      </div>

      {/* Domain Sub-Tabs: Code Findings, Secrets, Dependencies, Suppressions */}
      <div className="border-b border-[var(--line)] bg-[var(--surface)] px-6 flex items-center justify-between text-xs font-mono shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveMainTab('code')}
            className={cn(
              'px-3 py-2 border-b-2 font-medium transition-colors select-none',
              activeMainTab === 'code' ? 'border-[var(--ink)] text-[var(--ink)] font-semibold' : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
            )}
          >
            Code Vulnerabilities ({findings.length})
          </button>
          <button
            onClick={() => setActiveMainTab('secrets')}
            className={cn(
              'px-3 py-2 border-b-2 font-medium transition-colors select-none flex items-center gap-1.5',
              activeMainTab === 'secrets' ? 'border-[var(--ink)] text-[var(--ink)] font-semibold' : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
            )}
          >
            <KeyRound className="w-3.5 h-3.5 text-[#E5484D]" />
            <span>Secrets ({MOCK_SECRETS.length})</span>
          </button>
          <button
            onClick={() => setActiveMainTab('dependencies')}
            className={cn(
              'px-3 py-2 border-b-2 font-medium transition-colors select-none flex items-center gap-1.5',
              activeMainTab === 'dependencies' ? 'border-[var(--ink)] text-[var(--ink)] font-semibold' : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
            )}
          >
            <Package className="w-3.5 h-3.5 text-[#F76B15]" />
            <span>Dependencies ({MOCK_DEPENDENCIES.length})</span>
          </button>
          <button
            onClick={() => setActiveMainTab('suppressions')}
            className={cn(
              'px-3 py-2 border-b-2 font-medium transition-colors select-none flex items-center gap-1.5',
              activeMainTab === 'suppressions' ? 'border-[var(--ink)] text-[var(--ink)] font-semibold' : 'border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]'
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Suppressions & Expirations ({MOCK_SUPPRESSIONS.length})</span>
          </button>
        </div>

        <Button size="sm" variant="ghost" onClick={() => setCustomRuleDialogOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>Custom Rule Creator</span>
        </Button>
      </div>

      {/* 2. Code Findings Toolbar (visible when activeMainTab is code) */}
      {activeMainTab === 'code' && (
        <div className="border-b border-[var(--line)] bg-[var(--bg-subtle)] px-6 py-2 flex items-center justify-between gap-3 flex-wrap shrink-0">
          <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-[var(--ink-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search findings (title, file, CWE, rule...) [/]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-sm)] text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--line-strong)] font-mono"
              />
            </div>

            {/* Severity filter chips */}
            <div className="hidden md:flex items-center gap-1 border-l border-[var(--line)] pl-3">
              {['all', 'critical', 'high', 'medium', 'low'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={cn(
                    'px-2 py-0.5 rounded-[var(--radius-sm)] text-[11px] font-mono capitalize transition-colors',
                    selectedSeverity === sev
                      ? 'bg-[var(--ink)] text-[var(--bg)] font-medium'
                      : 'text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--line)]'
                  )}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="h-8 px-2 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-[11px]"
            >
              <option value="all">Source: All Engines</option>
              <option value="semgrep">Semgrep</option>
              <option value="codeql">CodeQL</option>
              <option value="ai">AI Triage</option>
            </select>

            <button
              onClick={() => setDensity(d => d === 'compact' ? 'normal' : 'compact')}
              className="h-8 px-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] text-[11px] text-[var(--ink-muted)] hover:text-[var(--ink)]"
            >
              Density: {density}
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Views */}
      {activeMainTab === 'code' && (
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Master List */}
          <div className={cn('flex-1 overflow-y-auto min-w-0', !isMobile && selectedFinding && 'max-w-2xl border-r border-[var(--line)]')}>
            {filtered.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No matching security findings"
                  description="Adjust search filters or clear the active query."
                />
              </div>
            ) : (
              <div className="divide-y divide-[var(--line)] font-mono text-xs">
                {filtered.map((item) => {
                  const isSelected = item.id === selectedId;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedId(item.id);
                        navigate(`/app/findings/${item.id}`, { replace: true });
                      }}
                      className={cn(
                        'group flex items-start gap-3 transition-colors cursor-pointer select-none',
                        density === 'compact' ? 'p-3' : 'p-4',
                        isSelected
                          ? 'bg-[var(--bg-subtle)] border-l-2 border-l-[var(--ink)]'
                          : 'hover:bg-[var(--bg-subtle)]/60'
                      )}
                    >
                      <div className="pt-0.5 shrink-0">
                        <SeverityDot level={item.severity} label="" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-[var(--ink)] truncate group-hover:underline">
                            {item.title}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.source && <SourceBadge source={item.source} />}
                            {item.riskScore && <RiskBadge score={item.riskScore} />}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[var(--ink-muted)] flex-wrap">
                          <span className="truncate">{item.location.file}:{item.location.startLine}</span>
                          <span>·</span>
                          {item.cwe[0] && <span>{item.cwe[0]}</span>}
                          <span>·</span>
                          <span>{(item.confidence * 100).toFixed(0)}% conf</span>
                          <span>·</span>
                          <span className="capitalize">{item.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail Pane */}
          {!isMobile ? (
            <div className="flex-1 min-w-0 h-full">
              {selectedFinding ? (
                <FindingDetailPane
                  finding={selectedFinding}
                  onUpdateStatus={onUpdateStatus}
                />
              ) : (
                <div className="h-full flex items-center justify-center p-8 text-center text-xs text-[var(--ink-muted)] font-mono">
                  Select a finding to inspect data-flow trace and canary proof.
                </div>
              )}
            </div>
          ) : (
            <Sheet open={Boolean(selectedFinding && isMobile)} onOpenChange={(open: boolean) => !open && setSelectedId(null)}>
              <SheetContent side="right" className="p-0 max-w-2xl w-full">
                {selectedFinding && (
                  <FindingDetailPane
                    finding={selectedFinding}
                    onClose={() => setSelectedId(null)}
                    onUpdateStatus={onUpdateStatus}
                  />
                )}
              </SheetContent>
            </Sheet>
          )}
        </div>
      )}

      {/* Secrets Tab */}
      {activeMainTab === 'secrets' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-4">
          <div className="p-4 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] space-y-1 font-mono text-xs">
            <h3 className="font-semibold text-[var(--ink)]">Committed Secrets & Token Exposure</h3>
            <p className="text-[11px] text-[var(--ink-muted)]">
              Sherlock enforces strict redaction: values are SHA-256 masked and never rendered in the UI or client payloads.
            </p>
          </div>

          <div className="space-y-3">
            {MOCK_SECRETS.map(secret => (
              <MaskedSecret key={secret.id} secret={secret} />
            ))}
          </div>
        </div>
      )}

      {/* Dependencies Tab */}
      {activeMainTab === 'dependencies' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-4 font-mono text-xs">
          <div className="p-4 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] space-y-1">
            <h3 className="font-semibold text-[var(--ink)]">Supply-Chain & Dependency Advisories</h3>
            <p className="text-[11px] text-[var(--ink-muted)]">
              Reachability triage confirms whether imported vulnerable package methods are invoked by application code.
            </p>
          </div>

          <div className="space-y-4">
            {MOCK_DEPENDENCIES.map(dep => (
              <div
                key={dep.id}
                className="p-5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--ink)]">{dep.package} @ {dep.currentVersion}</span>
                      <SeverityDot level={dep.severity} />
                      <Badge variant="subtle">{dep.cve}</Badge>
                      {dep.reachable ? (
                        <Badge variant="danger">Reachable In AST</Badge>
                      ) : (
                        <Badge variant="outline">Unreachable Dead Code</Badge>
                      )}
                      {dep.maliciousPackage && <Badge variant="danger">Malicious Package</Badge>}
                    </div>
                    <p className="text-xs text-[var(--ink-muted)]">{dep.advisory}</p>
                  </div>

                  <span className="text-[11px] text-[#30A46C] font-semibold">
                    Fixed in: {dep.fixedVersion}
                  </span>
                </div>

                <DiffView patch={dep.upgradeDiff} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suppressions Tab with Expiry Alerts */}
      {activeMainTab === 'suppressions' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-4 font-mono text-xs">
          <div className="p-4 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] space-y-1">
            <h3 className="font-semibold text-[var(--ink)]">Active Suppressions with Expiration Enforced</h3>
            <p className="text-[11px] text-[var(--ink-muted)]">
              All false positives and accepted risks require documented justification and auto-expire after 30 to 90 days.
            </p>
          </div>

          <div className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink-muted)]">
                <tr>
                  <th className="py-2.5 px-3">Target Scope</th>
                  <th className="py-2.5 px-3">Documented Rationale</th>
                  <th className="py-2.5 px-3">Author</th>
                  <th className="py-2.5 px-3">Expiry Date</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {MOCK_SUPPRESSIONS.map(sup => (
                  <tr key={sup.id} className="hover:bg-[var(--bg-subtle)]">
                    <td className="py-3 px-3 font-semibold text-[var(--ink)]">{sup.target}</td>
                    <td className="py-3 px-3 text-[var(--ink-muted)]">{sup.reason}</td>
                    <td className="py-3 px-3 text-[var(--ink-faint)] text-[11px]">{sup.author}</td>
                    <td className="py-3 px-3 text-[var(--ink)]">{sup.expiresAt}</td>
                    <td className="py-3 px-3 text-right">
                      {sup.daysRemaining <= 7 ? (
                        <span className="text-[#E5484D] font-bold">Expiring Soon ({sup.daysRemaining}d)</span>
                      ) : (
                        <span className="text-[#30A46C]">Active ({sup.daysRemaining}d)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom Rule Creator Dialog */}
      <Dialog open={customRuleDialogOpen} onOpenChange={setCustomRuleDialogOpen}>
        <DialogContent className="max-w-lg font-mono text-xs">
          <DialogHeader>
            <DialogTitle>Custom SAST & Reachability Rule Creator</DialogTitle>
            <DialogDescription>
              Supply good and bad code examples; Sherlock agent generates the AST pattern and computes false-positive rates on repository sample data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="text-[var(--ink)] block mb-1">Rule Description</label>
              <input
                type="text"
                value={ruleDesc}
                onChange={(e) => setRuleDesc(e.target.value)}
                className="w-full h-8 px-2.5 rounded border border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink)] text-xs"
              />
            </div>

            <div>
              <label className="text-[#E5484D] block mb-1">Bad Code Example (Vulnerable)</label>
              <textarea
                rows={2}
                value={badExample}
                onChange={(e) => setBadExample(e.target.value)}
                className="w-full p-2 rounded border border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink)] text-xs"
              />
            </div>

            <div>
              <label className="text-[#30A46C] block mb-1">Good Code Example (Sanitized)</label>
              <textarea
                rows={2}
                value={goodExample}
                onChange={(e) => setGoodExample(e.target.value)}
                className="w-full p-2 rounded border border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink)] text-xs"
              />
            </div>

            <div className="p-2.5 rounded bg-[var(--bg-subtle)] border border-[var(--line)] space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-[var(--ink)]">Generated AST Pattern</span>
                <span className="text-[#30A46C]">False-Positive Rate on Sample: 0.0%</span>
              </div>
              <pre className="text-[11px] text-[var(--ink-muted)]">{generatedRule}</pre>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--line)]">
            <Button size="sm" variant="ghost" onClick={() => setCustomRuleDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => setCustomRuleDialogOpen(false)}>
              Enable Custom Rule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
