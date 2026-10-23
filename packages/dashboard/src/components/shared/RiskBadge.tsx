import React from 'react';
import { cn } from '../../lib/utils.js';

interface RiskBadgeProps {
  score: number; // 0 to 100
  showLabel?: boolean;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ score, showLabel = true, className }) => {
  const getRiskLevel = (s: number) => {
    if (s >= 85) return { label: 'Critical Risk', color: 'border-[#E5484D]/40 bg-[#E5484D]/10 text-[#E5484D]' };
    if (s >= 65) return { label: 'High Risk', color: 'border-[#F76B15]/40 bg-[#F76B15]/10 text-[#F76B15]' };
    if (s >= 40) return { label: 'Medium Risk', color: 'border-[#E5A50A]/40 bg-[#E5A50A]/10 text-[#E5A50A]' };
    return { label: 'Low Risk', color: 'border-[#8B8D98]/40 bg-[#8B8D98]/10 text-[#8B8D98]' };
  };

  const level = getRiskLevel(score);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-sm)] border font-mono text-[11px] font-semibold select-none',
        level.color,
        className
      )}
      title={`Combined Risk Score: ${score}/100`}
    >
      <span>{score}</span>
      {showLabel && <span className="opacity-80">· {level.label}</span>}
    </span>
  );
};
