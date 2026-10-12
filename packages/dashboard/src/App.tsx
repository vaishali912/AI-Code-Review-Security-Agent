import React, { useState } from 'react';
import { Header } from './components/Header.js';
import { Navigation, TabKey } from './components/Navigation.js';
import { FindingsInbox } from './components/FindingsInbox.js';
import { FindingDetailModal } from './components/FindingDetailModal.js';
import { PRWalkthroughView } from './components/PRWalkthroughView.js';
import { LiveScannerView } from './components/LiveScannerView.js';
import { AnalyticsView } from './components/AnalyticsView.js';
import { SettingsView } from './components/SettingsView.js';
import { INITIAL_FINDINGS, FindingItem } from './data/mockData.js';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('inbox');
  const [findings, setFindings] = useState<FindingItem[]>(INITIAL_FINDINGS);
  const [selectedFinding, setSelectedFinding] = useState<FindingItem | null>(null);

  const openFindingsCount = findings.filter(f => f.status === 'open').length;
  const criticalCount = findings.filter(f => f.severity === 'critical' && f.status === 'open').length;
  const highCount = findings.filter(f => f.severity === 'high' && f.status === 'open').length;

  const handleUpdateStatus = (findingId: string, status: FindingItem['status'], reason?: string) => {
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        return { ...f, status, triageReason: reason || f.triageReason };
      }
      return f;
    }));
    if (selectedFinding?.id === findingId) {
      setSelectedFinding(prev => prev ? { ...prev, status, triageReason: reason || prev.triageReason } : null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header criticalCount={criticalCount} highCount={highCount} />
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        openFindingsCount={openFindingsCount}
      />

      <main style={{ flex: 1 }}>
        {activeTab === 'inbox' && (
          <FindingsInbox
            findings={findings}
            onSelectFinding={setSelectedFinding}
          />
        )}

        {activeTab === 'review' && (
          <PRWalkthroughView findings={findings} />
        )}

        {activeTab === 'sandbox' && (
          <div style={{ padding: '32px', maxWidth: '1440px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '28px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                🧪 Active Verification Sandboxes
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Each scan executes in an isolated micro-VM sandbox pool. Select any High or Critical finding below to run executable canary tests.
              </p>
              <FindingsInbox findings={findings} onSelectFinding={setSelectedFinding} />
            </div>
          </div>
        )}

        {activeTab === 'scanner' && (
          <LiveScannerView />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView />
        )}

        {activeTab === 'settings' && (
          <SettingsView />
        )}
      </main>

      <FindingDetailModal
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default App;
