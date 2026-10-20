import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../lib/theme.js';
import { INITIAL_FINDINGS } from '../../data/mockData.js';
import { 
  Search, 
  ShieldAlert, 
  GitPullRequest, 
  Terminal as TerminalIcon, 
  BarChart3, 
  Settings, 
  Sun, 
  Moon, 
  Play
} from 'lucide-react';
import { Kbd } from './Kbd.js';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useTheme();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName))) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  if (!open) return null;

  const handleSelect = (callback: () => void) => {
    callback();
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="fixed inset-0" 
        onClick={() => onOpenChange(false)} 
        aria-hidden="true" 
      />
      
      <div className="relative w-full max-w-xl rounded-[var(--radius-md)] border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink)] shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
        <Command label="Global Command Menu" className="w-full">
          <div className="flex items-center px-3.5 border-b border-[var(--line)]">
            <Search className="w-4 h-4 text-[var(--ink-muted)] shrink-0 mr-2" />
            <Command.Input
              placeholder="Search findings, navigate screens, or run commands..."
              className="w-full h-11 bg-transparent text-sm placeholder:text-[var(--ink-muted)] focus:outline-none text-[var(--ink)]"
              autoFocus
            />
            <Kbd>ESC</Kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 text-xs">
            <Command.Empty className="p-6 text-center text-xs text-[var(--ink-muted)]">
              No matching findings or actions found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="px-2 py-1.5 text-[11px] font-mono text-[var(--ink-faint)] uppercase tracking-wider">
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/app/findings'))}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-sm)] cursor-pointer text-[var(--ink)] hover:bg-[var(--bg-subtle)] aria-selected:bg-[var(--bg-subtle)]"
              >
                <ShieldAlert className="w-4 h-4 text-[var(--ink-muted)]" />
                <span className="flex-1">Findings Inbox</span>
                <span className="text-[11px] font-mono text-[var(--ink-muted)]">/app/findings</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelect(() => navigate('/app/pulls'))}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-sm)] cursor-pointer text-[var(--ink)] hover:bg-[var(--bg-subtle)] aria-selected:bg-[var(--bg-subtle)]"
              >
                <GitPullRequest className="w-4 h-4 text-[var(--ink-muted)]" />
                <span className="flex-1">Pull Request Review</span>
                <span className="text-[11px] font-mono text-[var(--ink-muted)]">/app/pulls</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelect(() => navigate('/app/scan'))}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-sm)] cursor-pointer text-[var(--ink)] hover:bg-[var(--bg-subtle)] aria-selected:bg-[var(--bg-subtle)]"
              >
                <TerminalIcon className="w-4 h-4 text-[var(--ink-muted)]" />
                <span className="flex-1">Live Scanner</span>
                <span className="text-[11px] font-mono text-[var(--ink-muted)]">/app/scan</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelect(() => navigate('/app/insights'))}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-sm)] cursor-pointer text-[var(--ink)] hover:bg-[var(--bg-subtle)] aria-selected:bg-[var(--bg-subtle)]"
              >
                <BarChart3 className="w-4 h-4 text-[var(--ink-muted)]" />
                <span className="flex-1">Security Insights</span>
                <span className="text-[11px] font-mono text-[var(--ink-muted)]">/app/insights</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelect(() => navigate('/app/settings'))}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-sm)] cursor-pointer text-[var(--ink)] hover:bg-[var(--bg-subtle)] aria-selected:bg-[var(--bg-subtle)]"
              >
                <Settings className="w-4 h-4 text-[var(--ink-muted)]" />
                <span className="flex-1">Settings & Policy</span>
                <span className="text-[11px] font-mono text-[var(--ink-muted)]">/app/settings</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Findings" className="px-2 py-1.5 text-[11px] font-mono text-[var(--ink-faint)] uppercase tracking-wider mt-2 border-t border-[var(--line)]">
              {INITIAL_FINDINGS.map(f => (
                <Command.Item
                  key={f.id}
                  onSelect={() => handleSelect(() => navigate(`/app/findings/${f.id}`))}
                  className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-[var(--radius-sm)] cursor-pointer text-[var(--ink)] hover:bg-[var(--bg-subtle)] aria-selected:bg-[var(--bg-subtle)]"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={f.severity === 'critical' ? 'w-2 h-2 rounded-full bg-[#E5484D]' : 'w-2 h-2 rounded-full bg-[#F76B15]'} />
                    <span className="truncate">{f.title}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--ink-muted)] shrink-0">{f.location.file}:{f.location.startLine}</span>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Actions" className="px-2 py-1.5 text-[11px] font-mono text-[var(--ink-faint)] uppercase tracking-wider mt-2 border-t border-[var(--line)]">
              <Command.Item
                onSelect={() => handleSelect(() => navigate('/app/scan'))}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-sm)] cursor-pointer text-[var(--ink)] hover:bg-[var(--bg-subtle)] aria-selected:bg-[var(--bg-subtle)]"
              >
                <Play className="w-4 h-4 text-[#30A46C]" />
                <span className="flex-1">Trigger repository AST scan</span>
                <Kbd>R</Kbd>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelect(toggleTheme)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-[var(--radius-sm)] cursor-pointer text-[var(--ink)] hover:bg-[var(--bg-subtle)] aria-selected:bg-[var(--bg-subtle)]"
              >
                {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span className="flex-1">Toggle light/dark theme</span>
                <span className="text-[11px] font-mono text-[var(--ink-muted)]">Current: {resolvedTheme}</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between px-3.5 py-2 border-t border-[var(--line)] bg-[var(--bg-subtle)] text-[11px] font-mono text-[var(--ink-muted)]">
            <div className="flex items-center gap-3">
              <span>Use <Kbd>↑</Kbd> <Kbd>↓</Kbd> to navigate</span>
              <span><Kbd>↵</Kbd> to select</span>
            </div>
            <span>Sherlock v1.0.0</span>
          </div>
        </Command>
      </div>
    </div>
  );
};
