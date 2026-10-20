import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FindingItem } from '../../data/mockData.js';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../components/ui/Sheet.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { SeverityDot } from '../../components/ui/SeverityDot.js';
import { 
  GitPullRequest, 
  MessageSquare, 
  Send, 
  FileCode, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight,
  GitCommit,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface OutletContextType {
  findings: FindingItem[];
  onUpdateStatus: (findingId: string, status: FindingItem['status'], reason?: string) => void;
}

export const PullsPage: React.FC = () => {
  const { findings } = useOutletContext<OutletContextType>();
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'bot'; text: string; time: string }>>([
    {
      role: 'bot',
      text: 'Sherlock evaluated PR #42 commit `7c32bf1`. Found 2 Critical, 4 High vulnerabilities. Gate status is BLOCKING. Type `@sherlock explain <finding>`, `@sherlock fix`, or `@sherlock suppress <reason>`.',
      time: '10:42 AM'
    }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMessages(prev => [...prev, { role: 'user', text: userText, time }]);
    setInput('');

    setTimeout(() => {
      let reply = '';
      if (userText.includes('explain')) {
        reply = 'SQL injection in src/routes/users.ts:10. Untrusted user parameter is concatenated into raw query without parameterized placeholder ($1).';
      } else if (userText.includes('fix')) {
        reply = 'Generated verified patch for src/routes/users.ts. Parameterized query tested in sandbox container with 0 regressions.';
      } else if (userText.includes('suppress')) {
        reply = 'Recorded learned suppression rule in repository policy memory for path src/routes/users.ts.';
      } else {
        reply = 'Command acknowledged. Sherlock is actively enforcing the PR gate against security policies.';
      }

      setMessages(prev => [...prev, { role: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 500);
  };

  const fileChanges = [
    {
      file: 'src/routes/users.ts',
      status: 'modified',
      changes: '+42 / -8',
      findingsCount: findings.filter(f => f.location.file === 'src/routes/users.ts').length,
      critical: findings.filter(f => f.location.file === 'src/routes/users.ts' && f.severity === 'critical').length,
      high: findings.filter(f => f.location.file === 'src/routes/users.ts' && f.severity === 'high').length
    },
    {
      file: 'src/routes/files.ts',
      status: 'modified',
      changes: '+34 / -4',
      findingsCount: findings.filter(f => f.location.file === 'src/routes/files.ts').length,
      critical: findings.filter(f => f.location.file === 'src/routes/files.ts' && f.severity === 'critical').length,
      high: findings.filter(f => f.location.file === 'src/routes/files.ts' && f.severity === 'high').length
    },
    {
      file: 'src/components/UserProfile.tsx',
      status: 'modified',
      changes: '+18 / -2',
      findingsCount: findings.filter(f => f.location.file === 'src/components/UserProfile.tsx').length,
      critical: 0,
      high: findings.filter(f => f.location.file === 'src/components/UserProfile.tsx' && f.severity === 'high').length
    },
    {
      file: 'src/routes/proxy.ts',
      status: 'added',
      changes: '+18 / -0',
      findingsCount: findings.filter(f => f.location.file === 'src/routes/proxy.ts').length,
      critical: 0,
      high: findings.filter(f => f.location.file === 'src/routes/proxy.ts' && f.severity === 'high').length
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* PR Header */}
      <div className="p-5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-4 h-4 text-[var(--ink-muted)]" />
            <h1 className="text-base font-semibold text-[var(--ink)]">
              PR #42: Feature/User-Management-API & File-Processing
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--ink-muted)] flex-wrap">
            <span>Author: developer</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <GitCommit className="w-3 h-3" /> <code>7c32bf1</code>
            </span>
            <span>·</span>
            <span><code>feature/user-management</code> → <code>main</code></span>
            <span>·</span>
            <span>4 changed files (+112 / -14)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-sm)] border border-[#E5484D]/40 bg-[#E5484D]/10 text-[#E5484D] font-mono text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>RISK LEVEL: CRITICAL</span>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setChatDrawerOpen(true)}
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
            <span>Review Agent ({messages.length})</span>
          </Button>
        </div>
      </div>

      {/* SVG Architecture Change Trace Diagram */}
      <div className="p-5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
            PR Data Flow & Change Topology
          </h2>
          <span className="text-[11px] font-mono text-[var(--ink-faint)]">
            Taint graph across changed modules
          </span>
        </div>

        <div className="p-4 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] overflow-x-auto">
          <svg viewBox="0 0 740 120" className="w-full max-w-[740px] text-[var(--ink)] font-mono text-xs">
            {/* Connection Paths */}
            <path d="M 130 60 L 250 60" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 370 60 L 490 60" stroke="#E5484D" strokeWidth="2" />
            <path d="M 610 60 L 710 60" stroke="#E5484D" strokeWidth="2" />

            {/* Ingress Node */}
            <rect x="10" y="35" width="120" height="50" rx="6" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1" />
            <text x="70" y="58" textAnchor="middle" fill="var(--ink)" fontSize="11" fontWeight="600">Client / Ingress</text>
            <text x="70" y="73" textAnchor="middle" fill="var(--ink-muted)" fontSize="9">POST / GET Routes</text>

            {/* Changed Router Node */}
            <rect x="250" y="35" width="120" height="50" rx="6" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1" />
            <text x="310" y="58" textAnchor="middle" fill="var(--ink)" fontSize="11" fontWeight="600">users.ts / files.ts</text>
            <text x="310" y="73" textAnchor="middle" fill="var(--ink-muted)" fontSize="9">PR #42 (+112 lines)</text>

            {/* Taint Flow Node */}
            <rect x="490" y="35" width="120" height="50" rx="6" fill="var(--surface)" stroke="#E5484D" strokeWidth="1.5" />
            <text x="550" y="58" textAnchor="middle" fill="#E5484D" fontSize="11" fontWeight="600">Unsanitized Sinks</text>
            <text x="550" y="73" textAnchor="middle" fill="var(--ink-muted)" fontSize="9">db.query / exec</text>

            {/* Sandbox Verification Node */}
            <rect x="610" y="35" width="120" height="50" rx="6" fill="var(--surface)" stroke="#30A46C" strokeWidth="1.5" />
            <text x="670" y="58" textAnchor="middle" fill="#30A46C" fontSize="11" fontWeight="600">Proof Sandbox</text>
            <text x="670" y="73" textAnchor="middle" fill="var(--ink-muted)" fontSize="9">Canary Proved</text>
          </svg>
        </div>
      </div>

      {/* Per-File Change Table */}
      <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
        <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
          <h2 className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
            Changed Files & Security Findings
          </h2>
          <span className="text-xs font-mono text-[var(--ink-muted)]">
            {fileChanges.length} files reviewed
          </span>
        </div>

        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink-muted)]">
            <tr>
              <th className="py-2.5 px-4 font-medium">File Path</th>
              <th className="py-2.5 px-4 font-medium">Changes</th>
              <th className="py-2.5 px-4 font-medium">Critical Findings</th>
              <th className="py-2.5 px-4 font-medium">High Findings</th>
              <th className="py-2.5 px-4 font-medium text-right">Gate Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {fileChanges.map((f, i) => (
              <tr key={i} className="hover:bg-[var(--bg-subtle)] transition-colors">
                <td className="py-3 px-4 font-medium text-[var(--ink)] flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
                  <span>{f.file}</span>
                </td>
                <td className="py-3 px-4 text-[var(--ink-muted)]">
                  <code>{f.changes}</code>
                </td>
                <td className="py-3 px-4">
                  {f.critical > 0 ? (
                    <span className="text-[#E5484D] font-bold">{f.critical} critical</span>
                  ) : (
                    <span className="text-[var(--ink-faint)]">0</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {f.high > 0 ? (
                    <span className="text-[#F76B15] font-bold">{f.high} high</span>
                  ) : (
                    <span className="text-[var(--ink-faint)]">0</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {f.critical > 0 ? (
                    <Badge variant="danger">Blocking</Badge>
                  ) : (
                    <Badge variant="outline">Advisory</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                placeholder="Type @sherlock explain, fix, or ignore..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 h-8 px-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--ink)] focus:border-[var(--line-strong)]"
              />
              <Button size="sm" onClick={handleSend}>
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
