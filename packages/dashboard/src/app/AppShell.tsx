import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar.js';
import { AppTopBar } from './AppTopBar.js';
import { CommandPalette } from '../components/ui/CommandPalette.js';
import { INITIAL_FINDINGS, FindingItem } from '../data/mockData.js';

export const AppShell: React.FC = () => {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [findings, setFindings] = useState<FindingItem[]>(INITIAL_FINDINGS);

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
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex">
      <AppSidebar openFindingsCount={openFindingsCount} />

      <div className="flex-1 flex flex-col min-w-0">
        <AppTopBar
          onOpenCommandPalette={() => setCmdOpen(true)}
          criticalCount={criticalCount}
          highCount={highCount}
        />

        <main className="flex-1 overflow-auto">
          <Outlet context={{ findings, onUpdateStatus: handleUpdateStatus }} />
        </main>
      </div>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  );
};
