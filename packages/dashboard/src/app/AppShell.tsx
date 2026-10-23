import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppSidebar } from './AppSidebar.js';
import { AppTopBar } from './AppTopBar.js';
import { CommandPalette } from '../components/ui/CommandPalette.js';
import { ENHANCED_FINDINGS } from '../data/marketMockData.js';
import { EnhancedFindingItem } from '../lib/types.js';

export const AppShell: React.FC = () => {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [findings, setFindings] = useState<EnhancedFindingItem[]>(ENHANCED_FINDINGS);
  const navigate = useNavigate();

  const openFindingsCount = findings.filter(f => f.status === 'open').length;
  const criticalCount = findings.filter(f => f.severity === 'critical' && f.status === 'open').length;
  const highCount = findings.filter(f => f.severity === 'high' && f.status === 'open').length;

  const handleUpdateStatus = (findingId: string, status: EnhancedFindingItem['status'], reason?: string) => {
    setFindings(prev => prev.map(f => {
      if (f.id === findingId) {
        return { ...f, status, triageReason: reason || f.triageReason };
      }
      return f;
    }));
  };

  // Global "g then key" sequence navigation: g then o, p, f, t, x, i, s
  useEffect(() => {
    let gPressed = false;
    let timer: any = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && ['INPUT', 'TEXTAREA'].includes(activeEl.tagName)) return;

      if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
        gPressed = true;
        clearTimeout(timer);
        timer = setTimeout(() => { gPressed = false; }, 1000);
        return;
      }

      if (gPressed) {
        gPressed = false;
        clearTimeout(timer);
        switch (e.key.toLowerCase()) {
          case 'o': e.preventDefault(); navigate('/app/overview'); break;
          case 'p': e.preventDefault(); navigate('/app/pulls'); break;
          case 'f': e.preventDefault(); navigate('/app/findings'); break;
          case 't': e.preventDefault(); navigate('/app/tests'); break;
          case 'x': e.preventDefault(); navigate('/app/fixes'); break;
          case 'i': e.preventDefault(); navigate('/app/insights'); break;
          case 's': e.preventDefault(); navigate('/app/settings'); break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

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
