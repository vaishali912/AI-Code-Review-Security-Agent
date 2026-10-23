import React, { useState } from 'react';
import { cn } from '../../lib/utils.js';
import { Sliders, Layers, Eye } from 'lucide-react';

interface ScreenshotCompareProps {
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export const ScreenshotCompare: React.FC<ScreenshotCompareProps> = ({
  beforeLabel = 'Baseline DOM (Vulnerable)',
  afterLabel = 'Patched DOM (Sanitized)',
  className
}) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [highlightDiff, setHighlightDiff] = useState(false);

  return (
    <div className={cn('rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-4 space-y-3', className)}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-mono font-semibold text-[var(--ink)]">
            Visual DOM Comparison
          </h4>
          <p className="text-[11px] text-[var(--ink-muted)]">
            Drag the slider to compare DOM execution before and after patch application.
          </p>
        </div>

        <button
          onClick={() => setHighlightDiff(!highlightDiff)}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] border text-xs font-mono transition-colors',
            highlightDiff
              ? 'border-[var(--ink)] bg-[var(--ink)] text-[var(--bg)] font-semibold'
              : 'border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink-muted)] hover:text-[var(--ink)]'
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Highlight Diff</span>
        </button>
      </div>

      {/* Visual Canvas with Split Slider */}
      <div className="relative h-64 rounded-[var(--radius-sm)] border border-[var(--line)] overflow-hidden select-none bg-[#0A0A0B]">
        {/* Baseline View */}
        <div className="absolute inset-0 p-5 font-mono text-xs text-[#F5F5F4] flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-[#E5484D] px-1.5 py-0.5 rounded border border-[#E5484D]/40 bg-[#E5484D]/10">
              {beforeLabel}
            </span>
            <div className="p-3 rounded border border-[#E5484D]/40 bg-[#E5484D]/5 space-y-1">
              <div className="text-[#FDA4AF] font-bold">&lt;div class="user-bio"&gt;</div>
              <div className="pl-4 text-[#E5484D] underline">
                &lt;img src="x" onerror="alert('XSS Exploit')" /&gt;
              </div>
              <div className="text-[#FDA4AF] font-bold">&lt;/div&gt;</div>
            </div>
            <div className="text-[11px] text-[#A1A1AA]">
              Status: Script executed directly in rendered browser viewport.
            </div>
          </div>
          <div className="text-[10px] text-[#71717A]">Target: /users/profile</div>
        </div>

        {/* Patched View (clipped by slider) */}
        <div
          className="absolute inset-y-0 right-0 bg-[#141416] p-5 font-mono text-xs text-[#F5F5F4] flex flex-col justify-between border-l border-[#30A46C]"
          style={{ width: `${100 - sliderPos}%` }}
        >
          <div className="space-y-2 overflow-hidden whitespace-nowrap">
            <span className="text-[10px] uppercase font-bold text-[#30A46C] px-1.5 py-0.5 rounded border border-[#30A46C]/40 bg-[#30A46C]/10">
              {afterLabel}
            </span>
            <div className={cn(
              'p-3 rounded border border-[#30A46C]/40 bg-[#30A46C]/5 space-y-1',
              highlightDiff && 'ring-2 ring-[#30A46C]'
            )}>
              <div className="text-[#6EE7B7] font-bold">&lt;div class="user-bio"&gt;</div>
              <div className="pl-4 text-[#30A46C]">
                &lt;img src="x" /&gt; (onerror attribute sanitized)
              </div>
              <div className="text-[#6EE7B7] font-bold">&lt;/div&gt;</div>
            </div>
            <div className="text-[11px] text-[#A1A1AA]">
              Status: Payload neutralized via DOMPurify sandbox.
            </div>
          </div>
          <div className="text-[10px] text-[#71717A]">Target: /users/profile</div>
        </div>

        {/* Vertical divider line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-[#FFFFFF] shadow-lg pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#FFFFFF] text-[#0A0A0B] flex items-center justify-center text-[10px] font-bold shadow-md">
            ↔
          </div>
        </div>

        {/* Range Input for Scrubbing */}
        <input
          type="range"
          min="5"
          max="95"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
        />
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-[var(--ink-muted)]">
        <span>← Before: Failing Baseline</span>
        <span>Drag slider to scrub</span>
        <span>After: Neutralized Patch →</span>
      </div>
    </div>
  );
};
