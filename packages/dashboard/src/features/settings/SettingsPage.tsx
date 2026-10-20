import React, { useState } from 'react';
import { 
  FileCode, 
  Brain, 
  Share2, 
  Terminal as TerminalIcon, 
  Save, 
  Check, 
  Copy, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { cn } from '../../lib/utils.js';

export const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'policy' | 'learnings' | 'integrations' | 'mcp'>('policy');
  
  // Policy section state
  const [policyYaml, setPolicyYaml] = useState(`version: "1.0"
ignorePaths:
  - "**/node_modules/**"
  - "**/dist/**"
  - "**/.next/**"
  - "**/*.test.ts"
  - "**/*.spec.ts"

gate:
  failOnSeverity: "high"
  blockOnNewOnly: true
  maxFindings: 10

review:
  commentCap: 10
  showMermaidDiagrams: true
  enabledLanes:
    - "security"
    - "bug"
    - "quality"
    - "performance"
    - "tests"
  suppressLowConfidence: true

verification:
  exploitProofEnabled: true
  sandboxTimeoutSeconds: 120
`);
  const [savedPolicy, setSavedPolicy] = useState(false);
  const [gateSeverity, setGateSeverity] = useState('high');
  const [commentCap, setCommentCap] = useState(10);
  const [enabledLanes, setEnabledLanes] = useState({
    security: true,
    bug: true,
    quality: true,
    performance: true,
    tests: false
  });

  // Learnings section state
  const [learnings, setLearnings] = useState([
    {
      id: 'lrn_01',
      scope: 'src/routes/users.ts',
      rule: 'Sanitized by Gateway WAF regex',
      source: 'PR #42 comment by @saurabh',
      date: '2026-10-18'
    },
    {
      id: 'lrn_02',
      scope: 'src/benchmark/**',
      rule: 'Intentional vulnerable fixtures',
      source: 'PR #12 comment by @security-lead',
      date: '2026-10-15'
    },
    {
      id: 'lrn_03',
      scope: 'src/admin/**',
      rule: 'RequireAuth enforced at load balancer level',
      source: 'Policy synchronization',
      date: '2026-10-10'
    }
  ]);

  // Integrations state
  const [integrations, setIntegrations] = useState([
    { name: 'GitHub Actions & PR Bot', connected: true, description: 'Post review walkthroughs and enforce CI status check gates on PRs.' },
    { name: 'GitLab CI / CD', connected: false, description: 'Run containerized Sherlock scanner on merge request pipelines.' },
    { name: 'Slack Security Alerts', connected: true, description: 'Broadcast verified critical exploit alerts directly into #sec-alerts channel.' },
    { name: 'Jira Software', connected: false, description: 'Automatically create remediation tracking tickets for verified vulnerabilities.' }
  ]);

  // Copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyCommand = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSavePolicy = () => {
    setSavedPolicy(true);
    setTimeout(() => setSavedPolicy(false), 2000);
  };

  const handleDeleteLearning = (id: string) => {
    setLearnings(prev => prev.filter(l => l.id !== id));
  };

  const toggleIntegration = (name: string) => {
    setIntegrations(prev => prev.map(intg => 
      intg.name === name ? { ...intg, connected: !intg.connected } : intg
    ));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-base font-semibold text-[var(--ink)]">
          Repository Security Policy & Settings
        </h1>
        <p className="text-xs text-[var(--ink-muted)]">
          Configure <code>.secreview.yml</code>, manage learned suppressions, and integrate CI/CD and coding agents.
        </p>
      </div>

      {/* Two Column Layout: Left Sub-nav + Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left Sub-Nav */}
        <div className="space-y-1 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-2">
          {[
            { key: 'policy', label: 'Policy (.secreview.yml)', icon: FileCode },
            { key: 'learnings', label: `Learnings Memory (${learnings.length})`, icon: Brain },
            { key: 'integrations', label: 'Integrations', icon: Share2 },
            { key: 'mcp', label: 'MCP & CLI Setup', icon: TerminalIcon }
          ].map(item => {
            const Icon = item.icon;
            const active = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key as any)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-xs font-mono transition-colors text-left',
                  active
                    ? 'bg-[var(--bg-subtle)] text-[var(--ink)] font-semibold border border-[var(--line)]'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--bg-subtle)]'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="md:col-span-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-5">
          {/* 1. Policy View */}
          {activeSection === 'policy' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--ink)]">
                    Policy Configuration (.secreview.yml)
                  </h2>
                  <p className="text-xs text-[var(--ink-muted)]">
                    Validated inline schema for PR review limits, severity thresholds, and lane filters.
                  </p>
                </div>
                <Button size="sm" onClick={handleSavePolicy}>
                  {savedPolicy ? <Check className="w-3.5 h-3.5 mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                  <span>{savedPolicy ? 'Saved' : 'Save Policy'}</span>
                </Button>
              </div>

              {/* Quick Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] text-xs font-mono">
                <div>
                  <label className="text-[11px] text-[var(--ink-muted)] block mb-1">Gate Blocking Severity</label>
                  <select
                    value={gateSeverity}
                    onChange={(e) => setGateSeverity(e.target.value)}
                    className="w-full h-8 px-2 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                  >
                    <option value="critical">Critical Only</option>
                    <option value="high">High & Critical</option>
                    <option value="medium">Medium, High & Critical</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[var(--ink-muted)] block mb-1">PR Comment Cap</label>
                  <input
                    type="number"
                    value={commentCap}
                    onChange={(e) => setCommentCap(Number(e.target.value))}
                    className="w-full h-8 px-2 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[var(--ink-muted)] block mb-1">Active Lanes</label>
                  <div className="flex gap-1.5 flex-wrap pt-0.5">
                    {Object.keys(enabledLanes).map(lane => (
                      <button
                        key={lane}
                        type="button"
                        onClick={() => setEnabledLanes(prev => ({ ...prev, [lane]: !prev[lane as keyof typeof prev] }))}
                        className={cn(
                          'px-2 py-0.5 rounded-[var(--radius-sm)] text-[10px] uppercase border font-semibold transition-colors',
                          enabledLanes[lane as keyof typeof enabledLanes]
                            ? 'bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]'
                            : 'bg-transparent text-[var(--ink-muted)] border-[var(--line)]'
                        )}
                      >
                        {lane}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* YAML Editor */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-muted)]">
                  <span>YAML Editor</span>
                  <span className="text-[#30A46C] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Schema Valid
                  </span>
                </div>
                <textarea
                  rows={14}
                  value={policyYaml}
                  onChange={(e) => setPolicyYaml(e.target.value)}
                  className="w-full p-3 font-mono text-xs rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink)] leading-relaxed focus:border-[var(--line-strong)] select-text"
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {/* 2. Learnings Memory View */}
          {activeSection === 'learnings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--ink)]">
                    Active Learned Suppressions
                  </h2>
                  <p className="text-xs text-[var(--ink-muted)]">
                    Feedback memories synthesized from PR comments and false-positive dismissals.
                  </p>
                </div>
                <span className="text-xs font-mono text-[var(--ink-muted)]">
                  {learnings.length} rules active
                </span>
              </div>

              <div className="rounded-[var(--radius-sm)] border border-[var(--line)] overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="border-b border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink-muted)]">
                    <tr>
                      <th className="py-2.5 px-3">Scope Target</th>
                      <th className="py-2.5 px-3">Learned Rule</th>
                      <th className="py-2.5 px-3">Source Origin</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {learnings.map(item => (
                      <tr key={item.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-[var(--ink)]">
                          {item.scope}
                        </td>
                        <td className="py-2.5 px-3 text-[var(--ink-muted)]">
                          {item.rule}
                        </td>
                        <td className="py-2.5 px-3 text-[var(--ink-faint)] text-[11px]">
                          {item.source} · {item.date}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteLearning(item.id)}
                            className="p-1 rounded text-[var(--ink-muted)] hover:text-[#E5484D] transition-colors"
                            title="Delete learned memory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Integrations View */}
          {activeSection === 'integrations' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-[var(--ink)]">
                  Developer Platform Integrations
                </h2>
                <p className="text-xs text-[var(--ink-muted)]">
                  Connect Sherlock to your code host, messaging platforms, and project trackers.
                </p>
              </div>

              <div className="space-y-3">
                {integrations.map((intg, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-semibold text-[var(--ink)]">{intg.name}</h3>
                        {intg.connected ? (
                          <Badge variant="verified">Connected</Badge>
                        ) : (
                          <Badge variant="outline">Disconnected</Badge>
                        )}
                      </div>
                      <p className="text-xs text-[var(--ink-muted)]">{intg.description}</p>
                    </div>

                    <Button
                      size="sm"
                      variant={intg.connected ? 'secondary' : 'primary'}
                      onClick={() => toggleIntegration(intg.name)}
                    >
                      {intg.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. MCP & CLI Setup */}
          {activeSection === 'mcp' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-semibold text-[var(--ink)]">
                  Model Context Protocol (MCP) & CLI Setup
                </h2>
                <p className="text-xs text-[var(--ink-muted)]">
                  Allow coding agents (Claude Code, Cursor, Antigravity) to query Sherlock security tools.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-[var(--ink)]">Run Sherlock CLI in Terminal</span>
                    <button
                      onClick={() => copyCommand('npx @sherlock/cli scan .', 'cli')}
                      className="text-[var(--ink-muted)] hover:text-[var(--ink)] flex items-center gap-1"
                    >
                      {copiedKey === 'cli' ? <Check className="w-3.5 h-3.5 text-[#30A46C]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[11px]">{copiedKey === 'cli' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-2 rounded bg-[var(--surface)] border border-[var(--line)] text-xs font-mono text-[var(--ink)] select-all">
                    npx @sherlock/cli scan . --strict --fail-on=high
                  </pre>
                </div>

                <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-[var(--ink)]">Add Sherlock MCP Server (Claude / Cursor / IDE)</span>
                    <button
                      onClick={() => copyCommand(`{
  "mcpServers": {
    "sherlock": {
      "command": "node",
      "args": ["packages/cli/dist/index.js", "mcp"]
    }
  }
}`, 'mcp')}
                      className="text-[var(--ink-muted)] hover:text-[var(--ink)] flex items-center gap-1"
                    >
                      {copiedKey === 'mcp' ? <Check className="w-3.5 h-3.5 text-[#30A46C]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[11px]">{copiedKey === 'mcp' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 rounded bg-[var(--surface)] border border-[var(--line)] text-xs font-mono text-[var(--ink)] overflow-x-auto select-all">
{`{
  "mcpServers": {
    "sherlock": {
      "command": "node",
      "args": ["packages/cli/dist/index.js", "mcp"]
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
