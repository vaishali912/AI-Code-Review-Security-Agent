import React from 'react';
import { ShieldAlert, ShieldCheck, Cpu, Terminal, GitPullRequest } from 'lucide-react';

interface HeaderProps {
  criticalCount: number;
  highCount: number;
}

export const Header: React.FC<HeaderProps> = ({ criticalCount, highCount }) => {
  const isBlocking = criticalCount > 0 || highCount > 0;

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(8, 12, 20, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
        }}>
          🔍
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg, #f8fafc, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              SHERLOCK
            </h1>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(6, 182, 212, 0.3)'
            }}>
              v1.0.0
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            AI Code Review & Security Verification Platform
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Repo badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '0.85rem'
        }}>
          <GitPullRequest size={15} color="var(--accent-cyan)" />
          <span style={{ color: 'var(--text-muted)' }}>repo:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>sherlock-monorepo</span>
          <span style={{ color: 'var(--text-dim)' }}>#PR-42</span>
        </div>

        {/* Gate status badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: isBlocking ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.12)',
          border: isBlocking ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
          padding: '6px 14px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: isBlocking ? '#fda4af' : '#6ee7b7'
        }}>
          {isBlocking ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
          <span>{isBlocking ? `CI GATE: BLOCKING (${criticalCount} Critical, ${highCount} High)` : 'CI GATE: PASSED'}</span>
        </div>

        {/* Surfaces online pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <div title="MCP Server connected" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 8px',
            borderRadius: '6px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            fontSize: '0.75rem',
            color: 'var(--accent-emerald)'
          }}>
            <Cpu size={12} />
            <span>MCP ACTIVE</span>
          </div>

          <div title="Sandbox runner ready" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 8px',
            borderRadius: '6px',
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            fontSize: '0.75rem',
            color: 'var(--accent-cyan)'
          }}>
            <Terminal size={12} />
            <span>SANDBOX POOL: 4 RUNNERS</span>
          </div>
        </div>
      </div>
    </header>
  );
};
