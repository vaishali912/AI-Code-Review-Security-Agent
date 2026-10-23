import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader.js';
import { PolicyConditionRow } from '../../components/shared/PolicyConditionRow.js';
import { RuleEditor } from '../../components/shared/RuleEditor.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Tooltip } from '../../components/ui/Tooltip.js';
import { 
  MOCK_POLICY_GATES, 
  MOCK_REVIEW_RULES, 
  MOCK_AUDIT_LOGS 
} from '../../data/marketMockData.js';
import { PolicyGate } from '../../lib/types.js';
import { 
  FileCode, 
  Brain, 
  Share2, 
  Terminal as TerminalIcon, 
  Shield, 
  Save, 
  Check, 
  Copy, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Lock, 
  MessageSquare, 
  Sliders, 
  Download,
  AlertTriangle,
  Server
} from 'lucide-react';
import { cn } from '../../lib/utils.js';

export const SettingsPage: React.FC = () => {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<'policy' | 'rules' | 'learnings' | 'integrations' | 'enterprise' | 'mcp'>(
    (section as any) || 'policy'
  );

  // Sync route param with active section
  React.useEffect(() => {
    if (section && ['policy', 'rules', 'learnings', 'integrations', 'enterprise', 'mcp'].includes(section)) {
      setActiveSection(section as any);
    }
  }, [section]);

  // Policy YAML state
  const [policyYaml, setPolicyYaml] = useState(`version: "1.0"
ignorePaths:
  - "**/node_modules/**"
  - "**/dist/**"
  - "**/.next/**"
  - "**/*.test.ts"

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

  // Quality Gates state
  const [gates, setGates] = useState<PolicyGate[]>(MOCK_POLICY_GATES);

  // Integrations state
  const [integrations, setIntegrations] = useState([
    { name: 'Linear', connected: true, description: 'Direct issue creation from security findings and automated fix status syncing.' },
    { name: 'Jira Software', connected: true, description: 'Bidirectional sync with security remediation tickets and compliance backlogs.' },
    { name: 'GitHub Actions', connected: true, description: 'Run containerized Sherlock scanner on merge request pipelines.' },
    { name: 'Harness CI / CD', connected: false, description: 'Enforce status check gates in automated continuous deployment pipelines.' },
    { name: 'Slack Alerts & Digest', connected: true, description: 'Scheduled daily digests and real-time alerts for verified critical exploits.' }
  ]);

  // Slack digest settings state
  const [slackFrequency, setSlackFrequency] = useState<'daily' | 'per_critical'>('per_critical');
  const [slackChannel, setSlackChannel] = useState('#sec-ops');

  // Audit log filter
  const [auditLogs, setAuditLogs] = useState(MOCK_AUDIT_LOGS);
  const [auditFilter, setAuditFilter] = useState('');

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

  const toggleGateScope = (id: string, scope: 'new_code' | 'all') => {
    setGates(prev => prev.map(g => g.id === id ? { ...g, scope } : g));
  };

  const handleSectionClick = (sec: typeof activeSection) => {
    setActiveSection(sec);
    navigate(`/app/settings/${sec}`, { replace: true });
  };

  return (
    <div className="min-h-full flex flex-col bg-[var(--bg)] pb-12 font-sans">
      <PageHeader
        title="Settings & Repository Governance"
        description="Quality gates editor, per-path rules, integrations, and enterprise compliance controls."
        actions={
          <span className="text-[11px] font-mono text-[var(--ink-faint)]">
            Changes stored in .secreview.yml
          </span>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Left Sub-Nav */}
          <div className="space-y-1 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-2 font-mono text-xs">
            {[
              { key: 'policy', label: 'Policy & Quality Gates', icon: FileCode },
              { key: 'rules', label: 'Review Rules (.secreview)', icon: Sliders },
              { key: 'learnings', label: 'Learnings Memory', icon: Brain },
              { key: 'integrations', label: 'Workflow Integrations', icon: Share2 },
              { key: 'enterprise', label: 'Enterprise & Audit', icon: Shield },
              { key: 'mcp', label: 'MCP & CLI Tokens', icon: TerminalIcon }
            ].map(item => {
              const Icon = item.icon;
              const active = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleSectionClick(item.key as any)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-xs transition-colors text-left select-none',
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

          {/* Right Content Panel */}
          <div className="md:col-span-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-6 space-y-6">
            {/* 1. Policy & Quality Gates */}
            {activeSection === 'policy' && (
              <div className="space-y-6 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-[var(--ink)]">Quality Gates & Severity Floor</h2>
                    <p className="text-xs text-[var(--ink-muted)]">
                      Conditions evaluated against every PR. Apply to new code only by default.
                    </p>
                  </div>
                  <Button size="sm" onClick={handleSavePolicy}>
                    {savedPolicy ? <Check className="w-3.5 h-3.5 mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                    <span>{savedPolicy ? 'Saved' : 'Save Policy'}</span>
                  </Button>
                </div>

                {/* Quality Gates Condition Rows */}
                <div className="space-y-2">
                  <span className="text-[11px] text-[var(--ink-muted)] uppercase tracking-wider font-semibold">
                    Configured Quality Gate Rules ({gates.length})
                  </span>
                  <div className="space-y-2">
                    {gates.map(gate => (
                      <PolicyConditionRow
                        key={gate.id}
                        gate={gate}
                        onToggleScope={toggleGateScope}
                      />
                    ))}
                  </div>
                </div>

                {/* YAML Editor */}
                <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[var(--ink-muted)] uppercase tracking-wider font-semibold">
                      Raw .secreview.yml Configuration
                    </span>
                    <span className="text-[#30A46C] text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Validated Against Schema
                    </span>
                  </div>
                  <textarea
                    rows={12}
                    value={policyYaml}
                    onChange={(e) => setPolicyYaml(e.target.value)}
                    className="w-full p-3 font-mono text-xs rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink)] leading-relaxed select-text"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {/* 2. Review Rules Sub-Nav */}
            {activeSection === 'rules' && (
              <div>
                <RuleEditor initialRules={MOCK_REVIEW_RULES} />
              </div>
            )}

            {/* 3. Learnings Memory */}
            {activeSection === 'learnings' && (
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--ink)]">Active Learnings Memory Store</h2>
                  <p className="text-xs text-[var(--ink-muted)]">
                    Feedback memories synthesized from PR comments and false-positive dismissals.
                  </p>
                </div>

                <div className="rounded-[var(--radius-sm)] border border-[var(--line)] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink-muted)]">
                      <tr>
                        <th className="py-2.5 px-3">Scope Target</th>
                        <th className="py-2.5 px-3">Learned Rule</th>
                        <th className="py-2.5 px-3">Source Origin</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)]">
                      <tr className="hover:bg-[var(--bg-subtle)]">
                        <td className="py-2.5 px-3 font-semibold text-[var(--ink)]">src/routes/users.ts</td>
                        <td className="py-2.5 px-3 text-[var(--ink-muted)]">Sanitized by Gateway WAF regex</td>
                        <td className="py-2.5 px-3 text-[var(--ink-faint)] text-[11px]">PR #42 comment · 2026-10-18</td>
                        <td className="py-2.5 px-3 text-right">
                          <button className="text-[var(--ink-muted)] hover:text-[#E5484D]">Delete</button>
                        </td>
                      </tr>
                      <tr className="hover:bg-[var(--bg-subtle)]">
                        <td className="py-2.5 px-3 font-semibold text-[var(--ink)]">benchmark/vulnerable-app/**</td>
                        <td className="py-2.5 px-3 text-[var(--ink-muted)]">Intentional synthetic test fixtures</td>
                        <td className="py-2.5 px-3 text-[var(--ink-faint)] text-[11px]">Policy sync · 2026-10-15</td>
                        <td className="py-2.5 px-3 text-right">
                          <button className="text-[var(--ink-muted)] hover:text-[#E5484D]">Delete</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. Workflow Integrations (Linear, Jira, Slack preview, CI status) */}
            {activeSection === 'integrations' && (
              <div className="space-y-6 font-mono text-xs">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--ink)]">Workflow & Developer Integrations</h2>
                  <p className="text-xs text-[var(--ink-muted)]">
                    Connect ticket trackers, CI pipelines, and notification channels.
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
                          <h3 className="font-semibold text-[var(--ink)]">{intg.name}</h3>
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
                        onClick={() => {
                          setIntegrations(prev => prev.map(i => i.name === intg.name ? { ...i, connected: !i.connected } : i));
                        }}
                      >
                        {intg.connected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Slack Digest Configuration & Live Message Preview */}
                <div className="p-4 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                    <div>
                      <h3 className="font-semibold text-[var(--ink)]">Slack Digest & Alert Settings</h3>
                      <p className="text-[11px] text-[var(--ink-muted)]">Customize delivery channel and notification cadence.</p>
                    </div>
                    <Badge variant="subtle">Webhook Active</Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-[var(--ink-muted)] block mb-1">Target Channel</label>
                      <input
                        type="text"
                        value={slackChannel}
                        onChange={(e) => setSlackChannel(e.target.value)}
                        className="w-full h-8 px-2 rounded border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[var(--ink-muted)] block mb-1">Notification Cadence</label>
                      <select
                        value={slackFrequency}
                        onChange={(e) => setSlackFrequency(e.target.value as any)}
                        className="w-full h-8 px-2 rounded border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-xs"
                      >
                        <option value="per_critical">Immediate Alert on Critical Blockers</option>
                        <option value="daily">Daily Morning Digest (09:00 UTC)</option>
                      </select>
                    </div>
                  </div>

                  {/* Slack Notification Preview */}
                  <div className="p-3.5 rounded border border-[var(--line-strong)] bg-[#0A0A0B] text-[#F5F5F4] space-y-2">
                    <div className="text-[10px] text-[#A1A1AA] flex items-center justify-between">
                      <span>Slack Bot Preview · {slackChannel}</span>
                      <span>10:42 AM</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[#FDA4AF] font-bold">
                        🚨 Sherlock Security Gate: PR #42 Blocked (2 Critical, 4 High)
                      </div>
                      <div className="text-xs text-[#E5484D]">
                        SQL injection via unparameterized query in GET /users (src/routes/users.ts:10)
                      </div>
                      <div className="text-[11px] text-[#A1A1AA]">
                        Verified in sandbox (48ms). Patch available on branch <code>sherlock/fix-sqli-users</code>.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Enterprise Controls & Audit Log */}
            {activeSection === 'enterprise' && (
              <div className="space-y-6 font-mono text-xs">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--ink)]">Enterprise Governance & Compliance Shell</h2>
                  <p className="text-xs text-[var(--ink-muted)]">
                    Audit logs, deployment mode configurations, and role-based access control.
                  </p>
                </div>

                {/* Deployment Mode Card */}
                <div className="p-4 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 text-[var(--ink)]" />
                      <span className="font-semibold text-[var(--ink)]">Deployment Mode</span>
                    </div>
                    <Badge variant="verified">Cloud Hosted (Multi-tenant VPC)</Badge>
                  </div>
                  <p className="text-[11px] text-[var(--ink-muted)]">
                    Ephemeral sandboxes operate under isolated network namespace with loopback access blocked.
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <Tooltip content="Private VPC self-hosted runner support is coming soon in Q1">
                      <span className="inline-block cursor-not-allowed">
                        <Button size="sm" variant="secondary" disabled className="opacity-50">
                          <Lock className="w-3.5 h-3.5 mr-1" />
                          <span>Private VPC Isolation (Coming Soon)</span>
                        </Button>
                      </span>
                    </Tooltip>

                    <Tooltip content="Custom KMS customer-managed key encryption is coming soon">
                      <span className="inline-block cursor-not-allowed">
                        <Button size="sm" variant="secondary" disabled className="opacity-50">
                          <Lock className="w-3.5 h-3.5 mr-1" />
                          <span>Custom KMS Keys (Coming Soon)</span>
                        </Button>
                      </span>
                    </Tooltip>
                  </div>
                </div>

                {/* Audit Log Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[var(--ink-muted)] uppercase tracking-wider font-semibold">
                      Security Audit Log ({auditLogs.length} events)
                    </span>
                    <Button size="sm" variant="secondary" onClick={() => copyCommand(JSON.stringify(auditLogs, null, 2), 'audit')}>
                      <Download className="w-3.5 h-3.5 mr-1" />
                      <span>{copiedKey === 'audit' ? 'Copied JSON' : 'Export Audit Log'}</span>
                    </Button>
                  </div>

                  <div className="rounded-[var(--radius-sm)] border border-[var(--line)] overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink-muted)]">
                        <tr>
                          <th className="py-2 px-3">Timestamp</th>
                          <th className="py-2 px-3">Actor</th>
                          <th className="py-2 px-3">Action</th>
                          <th className="py-2 px-3">Target</th>
                          <th className="py-2 px-3 text-right">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--line)]">
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-[var(--bg-subtle)]">
                            <td className="py-2 px-3 text-[var(--ink-faint)] text-[11px]">{log.timestamp}</td>
                            <td className="py-2 px-3 font-semibold text-[var(--ink)]">{log.actor}</td>
                            <td className="py-2 px-3 text-[var(--ink-muted)]">{log.action}</td>
                            <td className="py-2 px-3"><code>{log.target}</code></td>
                            <td className="py-2 px-3 text-right">
                              <span className={log.status === 'success' ? 'text-[#30A46C] font-semibold' : 'text-[#E5484D] font-semibold'}>
                                {log.status.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 6. MCP & CLI Tokens */}
            {activeSection === 'mcp' && (
              <div className="space-y-5 font-mono text-xs">
                <div>
                  <h2 className="text-sm font-semibold text-[var(--ink)]">Model Context Protocol (MCP) & CLI Tokens</h2>
                  <p className="text-xs text-[var(--ink-muted)]">
                    Connect autonomous coding agents (Claude Code, Cursor, Antigravity) to Sherlock security analysis tools.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[var(--ink)]">CLI Local Execution</span>
                      <button
                        onClick={() => copyCommand('npx @sherlock/cli scan . --strict --fail-on=high', 'cli')}
                        className="text-[var(--ink-muted)] hover:text-[var(--ink)] flex items-center gap-1"
                      >
                        {copiedKey === 'cli' ? <Check className="w-3.5 h-3.5 text-[#30A46C]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'cli' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-2 rounded bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] select-all">
                      npx @sherlock/cli scan . --strict --fail-on=high
                    </pre>
                  </div>

                  <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[var(--ink)]">MCP Agent Config (Claude / Cursor / IDE)</span>
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
                        <span>{copiedKey === 'mcp' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-2.5 rounded bg-[var(--surface)] border border-[var(--line)] text-xs text-[var(--ink)] overflow-x-auto select-all">
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
    </div>
  );
};
