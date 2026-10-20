import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  GitBranch, 
  FolderGit2, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  ChevronRight 
} from 'lucide-react';
import { Kbd } from '../components/ui/Kbd.js';
import { cn } from '../lib/utils.js';

interface AppTopBarProps {
  onOpenCommandPalette: () => void;
  criticalCount: number;
  highCount: number;
}

export const AppTopBar: React.FC<AppTopBarProps> = ({
  onOpenCommandPalette,
  criticalCount,
  highCount
}) => {
  const location = useLocation();

  const getBreadcrumb = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'Landing';
    if (parts[1]) {
      const section = parts[1];
      const name = section.charAt(0).toUpperCase() + section.slice(1);
      if (parts[2]) {
        return `${name} / ${parts[2]}`;
      }
      return name;
    }
    return 'App';
  };

  const isGateBlocking = criticalCount > 0 || highCount > 0;

  return (
    <header className="h-13 border-b border-[var(--line)] bg-[var(--surface)] px-4 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Breadcrumb & Repo/Branch switcher */}
      <div className="flex items-center gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-[var(--ink)]">
          <FolderGit2 className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
          <span className="font-mono">sherlock-monorepo</span>
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-[var(--ink-faint)]" />

        <div className="flex items-center gap-1 font-mono text-[var(--ink-muted)] bg-[var(--bg-subtle)] px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--line)]">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-[var(--ink-faint)]" />

        <span className="text-[var(--ink-muted)] font-mono">
          {getBreadcrumb()}
        </span>
      </div>

      {/* Right controls: CI Gate Pill & Command Palette Trigger */}
      <div className="flex items-center gap-3">
        {/* Compact CI Gate Pill */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] border text-xs font-mono font-medium',
            isGateBlocking
              ? 'border-[#E5484D]/40 bg-[#E5484D]/10 text-[#E5484D]'
              : 'border-[#30A46C]/40 bg-[#30A46C]/10 text-[#30A46C]'
          )}
          title={isGateBlocking ? 'CI Gate is BLOCKING merge due to unresolved findings' : 'CI Gate is PASSING'}
        >
          {isGateBlocking ? (
            <>
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Gate blocking: {criticalCount} critical, {highCount} high</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Gate passing</span>
            </>
          )}
        </div>

        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2.5 px-2.5 py-1 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] hover:border-[var(--line-strong)] text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors select-none"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search or command...</span>
          <div className="flex items-center gap-1">
            <Kbd>⌘K</Kbd>
          </div>
        </button>
      </div>
    </header>
  );
};
