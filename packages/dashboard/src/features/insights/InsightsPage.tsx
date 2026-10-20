import React from 'react';
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
import { Clock, ShieldCheck, TrendingUp, Activity } from 'lucide-react';
import { Card } from '../../components/ui/Card.js';

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
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-base font-semibold text-[var(--ink)]">
          Engineering Security Insights & Metrics
        </h1>
        <p className="text-xs text-[var(--ink-muted)]">
          Triage precision, remediation velocity, and vulnerability suppression trends. <span className="font-mono text-[10px] text-[var(--ink-faint)]">(sample data)</span>
        </p>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] font-mono">
            <span>MTTR</span>
            <Clock className="w-4 h-4 text-[var(--ink-muted)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--ink)]">
            2.4 days
          </div>
          <div className="text-[11px] font-mono text-[#30A46C]">
            ↓ 42% faster than 14d industry benchmark
          </div>
        </div>

        <div className="p-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] font-mono">
            <span>True Positive Precision</span>
            <ShieldCheck className="w-4 h-4 text-[#30A46C]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--ink)]">
            94.2%
          </div>
          <div className="text-[11px] font-mono text-[var(--ink-muted)]">
            Target: ≥ 80% on High/Critical
          </div>
        </div>

        <div className="p-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] font-mono">
            <span>Pre-Merge Fix Rate</span>
            <TrendingUp className="w-4 h-4 text-[var(--ink-muted)]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--ink)]">
            87.5%
          </div>
          <div className="text-[11px] font-mono text-[var(--ink-muted)]">
            Resolved before PR merge
          </div>
        </div>

        <div className="p-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--ink-muted)] font-mono">
            <span>Escaped Criticals</span>
            <Activity className="w-4 h-4 text-[#30A46C]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#30A46C]">
            0
          </div>
          <div className="text-[11px] font-mono text-[var(--ink-muted)]">
            Zero critical escapes to production
          </div>
        </div>
      </div>

      {/* 2 Charts Only: Thin lines, Token Colors, No Gradients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Introduced vs Fixed Over Time */}
        <div className="p-5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] space-y-4">
          <div>
            <h2 className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
              Findings Introduced vs. Fixed Over Time
            </h2>
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
            <h2 className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
              Open Findings by Severity
            </h2>
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
    </div>
  );
};
