import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { FindingItem } from '../../data/mockData.js';
import { FindingDetailPane } from './FindingDetailPane.js';
import { SeverityDot, SeverityLevel } from '../../components/ui/SeverityDot.js';
import { Badge } from '../../components/ui/Badge.js';
import { Sheet, SheetContent } from '../../components/ui/Sheet.js';
import { EmptyState, Skeleton } from '../../components/ui/EmptyState.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog.js';
import { Kbd } from '../../components/ui/Kbd.js';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Check, 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  FlaskConical,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface OutletContextType {
  findings: FindingItem[];
  onUpdateStatus: (findingId: string, status: FindingItem['status'], reason?: string) => void;
}

export const FindingsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { findings, onUpdateStatus } = useOutletContext<OutletContextType>();

  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLane, setSelectedLane] = useState<string>('all');
  const [density, setDensity] = useState<'compact' | 'normal'>('compact');
  const [selectedId, setSelectedId] = useState<string | null>(id || findings[0]?.id || null);
  const [isMobile, setIsMobile] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync route param with selection
  useEffect(() => {
    if (id) {
      setSelectedId(id);
    }
  }, [id]);

  // Responsive breakpoint check for 1280px master-detail split vs slide-over sheet
  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 1280);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Filter findings
  const filtered = findings.filter(f => {
    const matchesSearch = 
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.location.file.toLowerCase().includes(search.toLowerCase()) ||
      f.cwe.some(c => c.toLowerCase().includes(search.toLowerCase())) ||
      f.id.toLowerCase().includes(search.toLowerCase());

    const matchesSev = selectedSeverity === 'all' || f.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || f.status === selectedStatus;
    const matchesLane = selectedLane === 'all' || f.lane === selectedLane;

    return matchesSearch && matchesSev && matchesStatus && matchesLane;
  });

  const selectedFinding = findings.find(f => f.id === selectedId) || null;

  // Keyboard navigation: j/k move, Enter opens, e dismiss, f fix, p proof, / search, ? shortcuts
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

  // Metrics for slim summary strip
  const blockingCount = findings.filter(f => (f.severity === 'critical' || f.severity === 'high') && f.status === 'open').length;
  const openCount = findings.filter(f => f.status === 'open').length;
  const provenCount = findings.filter(f => f.proof?.status === 'proven').length;
  const medianTimeToFix = '2.4h';

  const handleSelect = (item: FindingItem) => {
    setSelectedId(item.id);
    navigate(`/app/findings/${item.id}`, { replace: true });
  };

  return (
    <div className="h-full flex flex-col min-w-0 bg-[var(--bg)]">
      {/* 1. Slim Summary Strip (replaces 4 cards) */}
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
            <span className="text-[var(--ink-muted)]">Median time to fix:</span>
            <span className="font-bold text-[var(--ink)]">{medianTimeToFix}</span>
          </div>
        </div>

        <button
          onClick={() => setShortcutsModalOpen(true)}
          className="text-[var(--ink-muted)] hover:text-[var(--ink)] flex items-center gap-1.5 font-mono text-[11px] shrink-0"
          title="Keyboard shortcuts (?)"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Shortcuts</span>
          <Kbd>?</Kbd>
        </button>
      </div>

      {/* 2. Toolbar */}
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
              className="w-full h-8 pl-8 pr-3 text-xs bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-sm)] text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--line-strong)]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
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

        {/* Status and density toggles */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-8 px-2 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-mono text-[11px]"
          >
            <option value="all">Status: All</option>
            <option value="open">Open</option>
            <option value="fixed">Fixed</option>
            <option value="false_positive">False Positive</option>
            <option value="accepted_risk">Accepted Risk</option>
          </select>

          <select
            value={selectedLane}
            onChange={(e) => setSelectedLane(e.target.value)}
            className="h-8 px-2 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] font-mono text-[11px] hidden sm:block"
          >
            <option value="all">Lane: All</option>
            <option value="security">Security</option>
            <option value="bug">Bug</option>
            <option value="quality">Quality</option>
            <option value="performance">Performance</option>
          </select>

          <button
            onClick={() => setDensity(d => d === 'compact' ? 'normal' : 'compact')}
            className="h-8 px-2.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)] text-[11px] font-mono text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            title="Toggle table density"
          >
            Density: {density}
          </button>
        </div>
      </div>

      {/* 3. Master-Detail Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left: Master List */}
        <div className={cn('flex-1 overflow-y-auto min-w-0', !isMobile && selectedFinding && 'max-w-2xl border-r border-[var(--line)]')}>
          {filtered.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No matching security findings"
                description="Adjust search filters or clear the active query to review repository findings."
                action={
                  <button
                    onClick={() => { setSearch(''); setSelectedSeverity('all'); setSelectedStatus('all'); }}
                    className="text-xs font-mono text-[var(--focus-link)] hover:underline"
                  >
                    Reset all filters
                  </button>
                }
              />
            </div>
          ) : (
            <div className="divide-y divide-[var(--line)]">
              {filtered.map((item, index) => {
                const isSelected = item.id === selectedId;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
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
                        {item.proof?.status === 'proven' && (
                          <Badge variant="verified" className="shrink-0 text-[10px] py-0">
                            Proven
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--ink-muted)] flex-wrap">
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

        {/* Right: Detail Pane (Desktop: persistent side panel; Mobile: slide-over sheet) */}
        {!isMobile ? (
          <div className="flex-1 min-w-0 h-full">
            {selectedFinding ? (
              <FindingDetailPane
                finding={selectedFinding}
                onUpdateStatus={onUpdateStatus}
              />
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center text-xs text-[var(--ink-muted)] font-mono">
                Select a finding from the list or use J / K to inspect details.
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

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={shortcutsModalOpen} onOpenChange={setShortcutsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 py-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-[var(--radius-sm)] bg-[var(--bg-subtle)]">
              <span>Next finding</span>
              <div className="flex gap-1"><Kbd>J</Kbd> or <Kbd>↓</Kbd></div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-[var(--radius-sm)] bg-[var(--bg-subtle)]">
              <span>Previous finding</span>
              <div className="flex gap-1"><Kbd>K</Kbd> or <Kbd>↑</Kbd></div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-[var(--radius-sm)] bg-[var(--bg-subtle)]">
              <span>Apply validated fix</span>
              <Kbd>F</Kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-[var(--radius-sm)] bg-[var(--bg-subtle)]">
              <span>Run exploit proof in sandbox</span>
              <Kbd>P</Kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-[var(--radius-sm)] bg-[var(--bg-subtle)]">
              <span>Dismiss finding (false positive)</span>
              <Kbd>E</Kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-[var(--radius-sm)] bg-[var(--bg-subtle)]">
              <span>Focus search query</span>
              <Kbd>/</Kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-[var(--radius-sm)] bg-[var(--bg-subtle)]">
              <span>Global command palette</span>
              <div className="flex gap-1"><Kbd>⌘</Kbd><Kbd>K</Kbd></div>
            </div>
            <div className="flex items-center justify-between p-2 rounded-[var(--radius-sm)] bg-[var(--bg-subtle)]">
              <span>Show this help dialog</span>
              <Kbd>?</Kbd>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
