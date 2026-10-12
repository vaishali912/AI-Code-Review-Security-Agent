import React, { useState } from 'react';
import { FindingItem } from '../data/mockData.js';
import { ShieldAlert, ShieldCheck, Search, Filter, CheckCircle2, AlertTriangle, ArrowRight, FlaskConical } from 'lucide-react';

interface FindingsInboxProps {
  findings: FindingItem[];
  onSelectFinding: (finding: FindingItem) => void;
}

export const FindingsInbox: React.FC<FindingsInboxProps> = ({ findings, onSelectFinding }) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = findings.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.location.file.toLowerCase().includes(search.toLowerCase()) ||
      f.cwe.some(c => c.toLowerCase().includes(search.toLowerCase()));
    
    const matchesSev = severityFilter === 'all' || f.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;

    return matchesSearch && matchesSev && matchesStatus;
  });

  const criticalCount = findings.filter(f => f.severity === 'critical' && f.status === 'open').length;
  const highCount = findings.filter(f => f.severity === 'high' && f.status === 'open').length;
  const provenCount = findings.filter(f => f.proof?.status === 'proven').length;

  return (
    <div style={{ padding: '32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Critical Blockers</span>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-rose)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fda4af', marginTop: '8px' }}>
            {criticalCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Requires remediation before merge</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>High Severity</span>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-amber)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fde68a', marginTop: '8px' }}>
            {highCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Tainted source-to-sink reachability verified</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified Exploit Proofs</span>
            <FlaskConical size={16} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#6ee7b7', marginTop: '8px' }}>
            {provenCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Reproduced in sandbox test runner</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>False Positives Suppressed</span>
            <ShieldCheck size={16} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#a5f3fc', marginTop: '8px' }}>
            14
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Auto-filtered via reachability & sanitizers</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '280px' }}>
          <Search size={18} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="Search by title, file path, CWE or rule..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: 'var(--text-main)',
              fontSize: '0.85rem'
            }}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>

          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.03)', padding: '3px', borderRadius: '8px' }}>
            {['all', 'open', 'fixed', 'false_positive'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  color: statusFilter === st ? 'var(--text-main)' : 'var(--text-dim)',
                  background: statusFilter === st ? 'rgba(255, 255, 255, 0.08)' : 'transparent'
                }}
              >
                {st === 'false_positive' ? 'False Positives' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Findings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map(f => {
          const isCritical = f.severity === 'critical';
          const isHigh = f.severity === 'high';

          return (
            <div
              key={f.id}
              onClick={() => onSelectFinding(f)}
              className="glass-panel"
              style={{
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderLeft: isCritical ? '4px solid var(--accent-rose)' : isHigh ? '4px solid var(--accent-amber)' : '4px solid var(--accent-cyan)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '80%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`badge badge-${f.severity}`}>
                    {f.severity}
                  </span>

                  {f.proof?.status === 'proven' && (
                    <span className="badge badge-verified" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FlaskConical size={11} />
                      EXPLOT-PROVEN
                    </span>
                  )}

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {f.cwe.join(', ')} · {f.owasp}
                  </span>

                  <span style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    color: 'var(--text-muted)'
                  }}>
                    Confidence: {Math.round(f.confidence * 100)}%
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {f.title}
                </h3>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {f.explanation}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  <span>📍 <code style={{ color: 'var(--accent-cyan)' }}>{f.location.file}:{f.location.startLine}</code></span>
                  <span>🔍 Rule: <code>{f.detected_by.static_rule}</code></span>
                  <span>🌐 Exposure: <strong style={{ color: 'var(--text-muted)' }}>{f.exposure || 'internet-facing'}</strong></span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'rgba(6, 182, 212, 0.1)',
                    color: 'var(--accent-cyan)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  <span>Inspect</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
