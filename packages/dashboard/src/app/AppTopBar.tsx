import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  GitBranch, 
  FolderGit2, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  ChevronRight,
  LogOut,
  User as UserIcon,
  Database,
  ChevronDown
} from 'lucide-react';
import { Kbd } from '../components/ui/Kbd.js';
import { cn } from '../lib/utils.js';
import { useAuth } from '../features/auth/AuthContext.js';

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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

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

      {/* Right controls: CI Gate Pill, Command Palette Trigger & User Menu */}
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

        {/* User Profile & Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] hover:border-[var(--line-strong)] text-xs transition-colors cursor-pointer"
          >
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-5 h-5 rounded-full object-cover border border-[var(--line)]"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <span className="font-medium text-[var(--ink)] max-w-[100px] truncate hidden md:inline">
              {user?.name?.split(' ')[0] || 'Account'}
            </span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[var(--surface-sunken)] border border-[var(--line)] text-[var(--ink-muted)]">
              {user?.role || 'member'}
            </span>
            <ChevronDown className="w-3 h-3 text-[var(--ink-muted)]" />
          </button>

          {/* Dropdown Menu */}
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 rounded-[8px] border border-[var(--line)] bg-[var(--surface)] shadow-xl p-3 z-50 space-y-3 animate-fadeIn">
              <div className="space-y-1 pb-2 border-b border-[var(--line)]">
                <div className="font-semibold text-xs text-[var(--ink)] truncate">
                  {user?.name || 'Sherlock User'}
                </div>
                <div className="font-mono text-[11px] text-[var(--ink-muted)] truncate">
                  {user?.email || 'user@sherlock.dev'}
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Role: {user?.role?.toUpperCase() || 'MEMBER'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {user?.provider === 'google' ? 'Google OAuth' : 'Password'}
                  </span>
                </div>
              </div>

              {/* Database indicator */}
              <div className="p-2 rounded bg-[var(--bg-subtle)] border border-[var(--line)] space-y-1 text-[11px] font-mono text-[var(--ink-muted)]">
                <div className="flex items-center gap-1.5 text-[var(--ink)] font-medium">
                  <Database className="w-3 h-3 text-[#30A46C]" />
                  <span>SQLite Database</span>
                </div>
                <div className="text-[10px] text-[var(--ink-faint)] truncate">
                  .sherlock/sherlock.db (WAL)
                </div>
              </div>

              {/* Sign out button */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[6px] text-xs text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer font-medium"
              >
                <span>Sign out</span>
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
