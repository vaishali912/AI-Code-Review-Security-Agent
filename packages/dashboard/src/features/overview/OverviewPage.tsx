import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader.js';
import { MetricTile } from '../../components/shared/MetricTile.js';
import { RiskBadge } from '../../components/shared/RiskBadge.js';
import { StatusChip } from '../../components/shared/StatusChip.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { MOCK_RISK_REPOS, MOCK_RECURRING_DEFECTS, MOCK_FIX_ATTEMPTS } from '../../data/marketMockData.js';
import { 
  GitPullRequest, 
  Bug, 
  ShieldAlert, 
  FlaskConical, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Play, 
  ArrowRight,
  AlertTriangle,
  FolderGit2
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();

  const needsHumanQueue = [
    {
      id: 'item_1',
      type: 'fix_approval',
      title: 'Fix approval ready: SQL injection in GET /users',
      target: 'PR #42 (branch: sherlock/fix-fnd-sqli-01)',
      status: 'verified' as const,
      actionText: 'Review & Approve',
      route: '/app/fixes'
    },
    {
      id: 'item_2',
      type: 'gate_blocker',
      title: 'Gate blocking merge: 2 critical vulnerabilities unaddressed',
      target: 'PR #42: Feature/User-Management-API',
      status: 'blocked' as const,
      actionText: 'Inspect PR Gate',
      route: '/app/pulls'
    },
    {
      id: 'item_3',
      type: 'quarantine',
      title: 'Flaky test quarantined: Redis session cache TTL race',
      target: 'tests/users.spec.ts',
      status: 'needs_approval' as const,
      actionText: 'Manage Quarantines',
      route: '/app/tests'
    }
  ];

  return (
    <div className="min-h-full flex flex-col bg-[var(--bg)] pb-12">
      <PageHeader
        title="Security & Code Review Overview"
        description="Continuous autonomous review metrics, automated test coverage, and human approval queues across all repositories."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[var(--ink-faint)] hidden sm:inline">
              Sample data
            </span>
            <Button size="sm" onClick={() => navigate('/app/scan')}>
              <Play className="w-3.5 h-3.5 mr-1 text-[#30A46C]" />
              <span>Run Scan</span>
            </Button>
          </div>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* MetricTiles Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <MetricTile
            label="PRs Reviewed"
            value="142"
            delta="+18%"
            deltaType="positive"
            icon={<GitPullRequest className="w-3.5 h-3.5" />}
          />
          <MetricTile
            label="Confirmed Bugs"
            value="18"
            subtext="Pre-merge"
            icon={<Bug className="w-3.5 h-3.5" />}
          />
          <MetricTile
            label="Active Vulns"
            value="6"
            delta="2 Crit"
            deltaType="negative"
            icon={<ShieldAlert className="w-3.5 h-3.5" />}
          />
          <MetricTile
            label="Tests Run"
            value="1,280"
            subtext="48ms avg"
            icon={<FlaskConical className="w-3.5 h-3.5" />}
          />
          <MetricTile
            label="Verified Fixes"
            value="24"
            delta="100%"
            deltaType="positive"
            icon={<Wrench className="w-3.5 h-3.5" />}
          />
          <MetricTile
            label="False Positive"
            value="3.2%"
            delta="↓ 14%"
            deltaType="positive"
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          />
          <MetricTile
            label="Turnaround"
            value="2.4m"
            subtext="Bench 45m"
            icon={<Clock className="w-3.5 h-3.5" />}
          />
        </div>

        {/* Needs Human Action Queue */}
        <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div>
              <h2 className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
                Needs-Human Queue
              </h2>
              <p className="text-xs text-[var(--ink)] mt-0.5">
                Pending approvals, unverified fixes, and flaky test quarantines awaiting manual sign-off.
              </p>
            </div>
            <Badge variant="subtle">{needsHumanQueue.length} pending</Badge>
          </div>

          <div className="divide-y divide-[var(--line)] font-mono text-xs">
            {needsHumanQueue.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-[var(--bg-subtle)] transition-colors px-2 rounded-[var(--radius-sm)]"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--ink)] truncate">{item.title}</span>
                    <StatusChip status={item.status} size="sm" />
                  </div>
                  <div className="text-[11px] text-[var(--ink-muted)] truncate">{item.target}</div>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(item.route)}
                >
                  <span>{item.actionText}</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Two-Column Grid: Riskiest Repositories & Repeated Defects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Riskiest Repositories Table */}
          <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
            <div className="p-4 border-b border-[var(--line)] flex items-center justify-between">
              <h2 className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
                Riskiest Repositories
              </h2>
              <span className="text-[11px] font-mono text-[var(--ink-faint)]">Sorted by combined risk score</span>
            </div>

            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink-muted)]">
                <tr>
                  <th className="py-2.5 px-3">Repository</th>
                  <th className="py-2.5 px-3">Risk Score</th>
                  <th className="py-2.5 px-3">Critical Vulns</th>
                  <th className="py-2.5 px-3">Hotspots</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {MOCK_RISK_REPOS.map((repo, i) => (
                  <tr key={i} className="hover:bg-[var(--bg-subtle)] transition-colors">
                    <td className="py-3 px-3 font-semibold text-[var(--ink)] flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
                      <span>{repo.repo}</span>
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge score={repo.score} showLabel={false} />
                    </td>
                    <td className="py-3 px-3">
                      {repo.critical > 0 ? (
                        <span className="text-[#E5484D] font-bold">{repo.critical} Critical</span>
                      ) : (
                        <span className="text-[#30A46C]">0 Critical</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-[var(--ink-muted)]">
                      {repo.hotspots.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Repeated-Defect List */}
          <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div>
                <h2 className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
                  Recurring Defect Patterns (≥ 3 Occurrences)
                </h2>
                <p className="text-xs text-[var(--ink)] mt-0.5">
                  Synthesize architectural repository rules from persistent defect classes.
                </p>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {MOCK_RECURRING_DEFECTS.map((defect) => (
                <div
                  key={defect.id}
                  className="p-3.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--ink)]">{defect.pattern}</span>
                        <Badge variant="danger">{defect.cwe}</Badge>
                      </div>
                      <div className="text-[11px] text-[var(--ink-muted)]">
                        Detected in {defect.occurrences} PRs across: {defect.affectedFiles.join(', ')}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate('/app/settings/policy')}
                    >
                      <span>Create Rule</span>
                    </Button>
                  </div>

                  <div className="p-2 rounded bg-[var(--surface)] border border-[var(--line)] text-[11px] text-[var(--ink)]">
                    <span className="text-[var(--ink-muted)]">Suggested Enforcement: </span>
                    {defect.suggestedRule}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
