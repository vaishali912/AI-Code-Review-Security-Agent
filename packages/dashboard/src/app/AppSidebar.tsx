import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard,
  GitPullRequest, 
  ShieldAlert, 
  FlaskConical, 
  Wrench, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon
} from 'lucide-react';
import { cn } from '../lib/utils.js';
import { useTheme } from '../lib/theme.js';
import { Tooltip } from '../components/ui/Tooltip.js';

interface AppSidebarProps {
  openFindingsCount: number;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ openFindingsCount }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();

  const navItems = [
    { to: '/app/overview', label: 'Overview', icon: LayoutDashboard },
    { to: '/app/pulls', label: 'Pull requests', icon: GitPullRequest },
    { to: '/app/findings', label: 'Findings', icon: ShieldAlert, badge: openFindingsCount },
    { to: '/app/tests', label: 'Tests', icon: FlaskConical },
    { to: '/app/fixes', label: 'Fixes', icon: Wrench, badge: 2 },
    { to: '/app/insights', label: 'Insights', icon: BarChart3 },
    { to: '/app/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 shrink-0 border-r border-[var(--line)] bg-[var(--surface)] flex flex-col justify-between transition-all duration-200 z-30 select-none',
        collapsed ? 'w-16' : 'w-[232px]'
      )}
    >
      {/* Brand & Wordmark */}
      <div>
        <div className="h-13 border-b border-[var(--line)] px-4 flex items-center justify-between">
          {!collapsed ? (
            <NavLink to="/" className="flex items-center gap-2 text-inherit no-underline">
              <span className="w-6 h-6 rounded-[var(--radius-sm)] border border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] flex items-center justify-center font-mono font-bold text-xs">
                S
              </span>
              <span className="font-semibold text-sm tracking-tight text-[var(--ink)]">
                SHERLOCK
              </span>
            </NavLink>
          ) : (
            <NavLink to="/" className="mx-auto text-inherit no-underline">
              <span className="w-7 h-7 rounded-[var(--radius-sm)] border border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] flex items-center justify-center font-mono font-bold text-xs">
                S
              </span>
            </NavLink>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-[var(--radius-sm)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--bg-subtle)] transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Seven Navigation items */}
        <nav className="p-2 space-y-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const linkContent = (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }: { isActive: boolean }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] text-xs font-medium transition-colors select-none',
                    isActive
                      ? 'bg-[var(--bg-subtle)] text-[var(--ink)] font-semibold border border-[var(--line)]'
                      : 'text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--bg-subtle)]'
                  )
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.to} side="right" content={item.label}>
                  {linkContent}
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>
      </div>

      {/* Footer controls: theme toggle & profile */}
      <div className="p-2 border-t border-[var(--line)] space-y-1">
        <button
          onClick={toggleTheme}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--bg-subtle)] transition-colors',
            collapsed && 'justify-center'
          )}
          title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          {!collapsed && (
            <span className="capitalize text-[11px] font-mono">
              Theme: {resolvedTheme}
            </span>
          )}
        </button>

        <div
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-xs text-[var(--ink)]',
            collapsed && 'justify-center px-1'
          )}
        >
          <div className="w-6 h-6 rounded-full bg-[var(--line-strong)] text-[var(--ink)] flex items-center justify-center shrink-0 text-[11px] font-mono font-semibold">
            SK
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[var(--ink)] truncate">saurabh</p>
              <p className="text-[10px] font-mono text-[var(--ink-muted)] truncate">pro-org</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
