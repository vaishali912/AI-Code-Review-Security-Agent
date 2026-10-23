import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader.js';
import { MetricTile } from '../../components/shared/MetricTile.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { MOCK_HOTSPOTS, MOCK_RECURRING_DEFECTS } from '../../data/marketMockData.js';
import { Clock, ShieldCheck, TrendingUp, Activity, AlertTriangle, Layers, Plus } from 'lucide-react';
import { cn } from '../../lib/utils.js';

const INTRODUCED_VS_FIXED = [
  { week: 'W1', introduced: 18, fixed: 16 },
  { week: 'W2', introduced: 14, fixed: 15 },
  { week: 'W3', introduced: 22, fixed: 20 },
  { week: 'W4', introduced: 9, fixed: 11 },
  { week: 'W5', introduced: 12, fixed: 14 },
  { week: 'W6', introduced: 6, fixed: 8 }
];

const SEVERITY_DATA = [
  { severity: 'Critical', count: 2, fill: '#E5484D' },
  { severity: 'High', count: 4, fill: '#F76B15' },
  { severity: 'Medium', count: 5, fill: '#E5A50A' },
  { severity: 'Low', count: 3, fill: '#8B8D98' }
];

export const InsightsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'border-[#30A46C]/40 bg-[#30A46C]/10 text-[#30A46C]';
    if (score >= 60) return 'border-[#E5A50A]/40 bg-[#E5A50A]/10 text-[#E5A50A]';
    return 'border-[#E5484D]/40 bg-[#E5484D]/10 text-[#E5484D]';
  };

  return (
    <div className="min-h-full flex flex-col bg-[var(--bg)] pb-12 font-sans">
      <PageHeader
        title="Code Health & Architectural Trends"
        description="Directory change velocity hotspots, health scoring, recurring defect patterns, and resolution velocity."
        actions={
          <span className="text-[11px] font-mono text-[var(--ink-faint)]">
            Continuous repository telemetry
          </span>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* 4 KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricTile
            label="MTTR (Remediation Velocity)"
            value="2.4 days"
            delta="↓ 42%"
            deltaType="positive"
            subtext="Industry bench: 14d"
            icon={<Clock className="w-3.5 h-3.5" />}
          />
          <MetricTile
            label="True Positive Precision"
            value="94.2%"
            delta="Target: ≥ 80%"
            deltaType="positive"
            subtext="On High & Critical"
            icon={<ShieldCheck className="w-3.5 h-3.5" />}
          />
          <MetricTile
            label="Pre-Merge Fix Rate"
            value="87.5%"
            subtext="Resolved before PR merge"
            icon={<TrendingUp className="w-3.5 h-3.5" />}
          />
          <MetricTile
            label="Escaped Criticals"
            value="0"
            delta="Zero escapes"
            deltaType="positive"
            subtext="Production branches"
            icon={<Activity className="w-3.5 h-3.5" />}
          />
        </div>

        {/* Hotspot Treemap Grid */}
        <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div>
              <h2 className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
                Directory Hotspot Map
              </h2>
              <p className="text-xs text-[var(--ink)] mt-0.5">
                Sized by PR change frequency and colored by architectural health score.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#30A46C]" /> Healthy (≥80)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#E5A50A]" /> Moderate (60-79)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#E5484D]" /> Degraded (&lt;60)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {MOCK_HOTSPOTS.map((hotspot) => (
              <div
                key={hotspot.directory}
                onClick={() => setSelectedHotspot(hotspot.directory)}
                className={cn(
                  'p-3.5 rounded-[var(--radius-sm)] border cursor-pointer select-none transition-all hover:scale-102 space-y-2',
                  getHealthColor(hotspot.healthScore),
                  selectedHotspot === hotspot.directory && 'ring-2 ring-[var(--ink)]'
                )}
                style={{
                  minHeight: `${Math.max(100, hotspot.changeFrequency * 1.4)}px`
                }}
              >
                <div className="font-semibold text-xs truncate">{hotspot.directory}</div>
                <div className="text-[11px] opacity-90">
                  Health: <strong>{hotspot.healthScore}/100</strong>
                </div>
                <div className="text-[10px] opacity-80">
                  {hotspot.linesOfCode} LOC · {hotspot.defectsCount} defects
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2 Clean Recharts Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Introduced vs Fixed */}
          <div className="p-5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] space-y-4">
            <div>
              <h3 className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
                Findings Introduced vs. Fixed Over Time
              </h3>
              <div className="flex items-center gap-4 text-xs font-mono mt-1">
                <span className="flex items-center gap-1.5 text-[var(--ink-muted)]">
                  <span className="w-2.5 h-[2px] bg-[#E5484D]" /> Introduced
                </span>
                <span className="flex items-center gap-1.5 text-[var(--ink-muted)]">
                  <span className="w-2.5 h-[2px] bg-[#30A46C]" /> Fixed
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={INTRODUCED_VS_FIXED} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" stroke="var(--ink-faint)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--ink-faint)" fontSize={11} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--line-strong)',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      borderRadius: '6px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="introduced"
                    stroke="#E5484D"
                    strokeWidth={1.5}
                    dot={{ r: 3, fill: '#E5484D' }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="fixed"
                    stroke="#30A46C"
                    strokeWidth={1.5}
                    dot={{ r: 3, fill: '#30A46C' }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Open Findings by Severity */}
          <div className="p-5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] space-y-4">
            <div>
              <h3 className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
                Open Findings by Severity
              </h3>
              <p className="text-xs font-mono text-[var(--ink-faint)] mt-1">
                Active backlog distribution across triage lanes
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SEVERITY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="severity" stroke="var(--ink-faint)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--ink-faint)" fontSize={11} tickLine={false} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--line-strong)',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                    {SEVERITY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recurring Defects List with Create Rule Action */}
        <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <div>
              <h3 className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
                Recurring Defect Patterns (≥ 3 Occurrences)
              </h3>
              <p className="text-xs text-[var(--ink)] mt-0.5">
                Repeated vulnerabilities identified across multiple pull requests.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {MOCK_RECURRING_DEFECTS.map((defect) => (
              <div
                key={defect.id}
                className="p-3.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] flex items-center justify-between gap-4 flex-wrap"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--ink)]">{defect.pattern}</span>
                    <Badge variant="danger">{defect.cwe}</Badge>
                    <span className="text-[11px] text-[var(--ink-muted)]">({defect.occurrences} PRs)</span>
                  </div>
                  <div className="text-[11px] text-[var(--ink-muted)]">
                    Enforcement: {defect.suggestedRule}
                  </div>
                </div>

                <Button size="sm" onClick={() => navigate('/app/settings/policy')}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Create Policy Rule</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
