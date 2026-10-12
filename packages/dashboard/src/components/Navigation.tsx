import React from 'react';
import { Shield, GitPullRequest, FlaskConical, BarChart3, Settings, PlaySquare } from 'lucide-react';

export type TabKey = 'inbox' | 'review' | 'sandbox' | 'analytics' | 'scanner' | 'settings';

interface NavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  openFindingsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, openFindingsCount }) => {
  const tabs = [
    { key: 'inbox', label: 'Findings Inbox', icon: Shield, badge: openFindingsCount },
    { key: 'review', label: 'PR Review & Walkthrough', icon: GitPullRequest },
    { key: 'sandbox', label: 'Exploit Verification Sandbox', icon: FlaskConical },
    { key: 'scanner', label: 'Live AST Code Scanner', icon: PlaySquare },
    { key: 'analytics', label: 'Analytics & MTTR Trends', icon: BarChart3 },
    { key: 'settings', label: 'Policy & Learnings Memory', icon: Settings },
  ];

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 32px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(15, 23, 42, 0.4)'
    }}>
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key as TabKey)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
              background: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
              border: isActive ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid transparent',
              boxShadow: isActive ? '0 0 12px rgba(6, 182, 212, 0.15)' : 'none'
            }}
          >
            <Icon size={16} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '999px',
                background: 'var(--accent-rose)',
                color: '#fff'
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
