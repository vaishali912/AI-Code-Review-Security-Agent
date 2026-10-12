import React from 'react';
import { BarChart3, TrendingUp, CheckCircle, Clock, ShieldCheck, Activity } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  return (
    <div style={{ padding: '32px', maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
          Engineering Security Analytics & Health Trends
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Tracking finding resolution velocity, false-positive rates, and OWASP Top 10 exposure over time.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px'
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem' }}>Mean Time to Remediate (MTTR)</span>
            <Clock size={16} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)', marginTop: '8px' }}>
            2.4 days
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>↓ 42% faster than industry benchmark (14 days)</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem' }}>True Positive Precision Rate</span>
            <ShieldCheck size={16} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent-emerald)', marginTop: '8px' }}>
            94.2%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Target: ≥ 80% on High/Critical (§4 PRD)</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem' }}>Pre-Merge Fix Rate</span>
            <TrendingUp size={16} color="var(--accent-violet)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent-violet)', marginTop: '8px' }}>
            87.5%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Findings resolved before merge</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem' }}>Escaped Vulnerabilities</span>
            <Activity size={16} color="#6ee7b7" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#6ee7b7', marginTop: '8px' }}>
            0
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Zero critical escapes into production branches</span>
        </div>
      </div>

      {/* Breakdown by OWASP / CWE */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '20px' }}>
          Top Vulnerability Classes (JS/TS Web Stack)
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { label: 'A03:2021 — Injection (SQL, Command, NoSQL)', count: 18, pct: 38, color: '#f43f5e' },
            { label: 'A01:2021 — Broken Access Control & IDOR', count: 12, pct: 25, color: '#f59e0b' },
            { label: 'A03:2021 — Cross-Site Scripting (XSS / DOM sinks)', count: 9, pct: 19, color: '#06b6d4' },
            { label: 'A10:2021 — Server-Side Request Forgery (SSRF)', count: 5, pct: 10, color: '#8b5cf6' },
            { label: 'A01:2021 — Path Traversal & Unsafe File Handling', count: 4, pct: 8, color: '#10b981' },
          ].map((item, idx) => (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{item.label}</span>
                <span style={{ color: 'var(--text-muted)' }}>{item.count} findings ({item.pct}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${item.pct}%`, height: '100%', background: item.color, borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
