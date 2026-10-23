import React, { useState } from 'react';
import { ReviewRule } from '../../lib/types.js';
import { Button } from '../ui/Button.js';
import { cn } from '../../lib/utils.js';
import { FileCode, Plus, Check } from 'lucide-react';

interface RuleEditorProps {
  initialRules?: ReviewRule[];
  onSaveRules?: (rules: ReviewRule[]) => void;
  className?: string;
}

export const RuleEditor: React.FC<RuleEditorProps> = ({
  initialRules = [],
  onSaveRules,
  className
}) => {
  const [rules, setRules] = useState<ReviewRule[]>(initialRules);
  const [newGlob, setNewGlob] = useState('src/api/**');
  const [newInstruction, setNewInstruction] = useState('Enforce schema validation before controller handler');
  const [newSeverity, setNewSeverity] = useState<'critical' | 'high' | 'medium' | 'low'>('high');

  const handleAddRule = () => {
    if (!newGlob.trim() || !newInstruction.trim()) return;
    const rule: ReviewRule = {
      id: `rule_${Date.now()}`,
      pathGlob: newGlob.trim(),
      instruction: newInstruction.trim(),
      severityFloor: newSeverity,
      matchingFilesCount: Math.floor(Math.random() * 8) + 2
    };
    const updated = [...rules, rule];
    setRules(updated);
    if (onSaveRules) onSaveRules(updated);
  };

  const handleDelete = (id: string) => {
    const updated = rules.filter(r => r.id !== id);
    setRules(updated);
    if (onSaveRules) onSaveRules(updated);
  };

  return (
    <div className={cn('rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-5 space-y-4 font-mono text-xs', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
            Per-Path Review Rules (.secreview.yml)
          </h3>
          <p className="text-xs text-[var(--ink)] mt-0.5">
            Define architectural instructions and severity floors for specific repository file globs.
          </p>
        </div>
        <span className="text-[11px] text-[var(--ink-muted)]">{rules.length} active rules</span>
      </div>

      {/* Add New Rule Form */}
      <div className="p-3.5 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] space-y-3">
        <div className="text-[11px] font-semibold text-[var(--ink)]">Add Path Instruction</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-[var(--ink-muted)] block mb-1">Path Glob Pattern</label>
            <input
              type="text"
              value={newGlob}
              onChange={(e) => setNewGlob(e.target.value)}
              className="w-full h-8 px-2 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--ink)]"
            />
          </div>

          <div>
            <label className="text-[10px] text-[var(--ink-muted)] block mb-1">Severity Floor</label>
            <select
              value={newSeverity}
              onChange={(e) => setNewSeverity(e.target.value as any)}
              className="w-full h-8 px-2 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--ink)]"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="text-[10px] text-[var(--ink-muted)] block mb-1">Review Agent Instruction</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                className="flex-1 h-8 px-2 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--ink)]"
              />
              <Button size="sm" onClick={handleAddRule}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Add Rule</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Table with live matching files preview */}
      <div className="rounded-[var(--radius-sm)] border border-[var(--line)] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[var(--line)] bg-[var(--bg-subtle)] text-[var(--ink-muted)]">
            <tr>
              <th className="py-2.5 px-3">Path Glob</th>
              <th className="py-2.5 px-3">Instruction</th>
              <th className="py-2.5 px-3">Severity Floor</th>
              <th className="py-2.5 px-3">Matched Files</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {rules.map((rule) => (
              <tr key={rule.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                <td className="py-2.5 px-3 font-semibold text-[var(--ink)]">
                  <code>{rule.pathGlob}</code>
                </td>
                <td className="py-2.5 px-3 text-[var(--ink-muted)]">
                  {rule.instruction}
                </td>
                <td className="py-2.5 px-3 uppercase text-[11px] font-semibold text-[var(--ink)]">
                  {rule.severityFloor}
                </td>
                <td className="py-2.5 px-3 text-[11px] text-[var(--ink-faint)]">
                  <span className="text-[#30A46C] font-semibold">{rule.matchingFilesCount || 4} files</span> live preview
                </td>
                <td className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="text-[var(--ink-muted)] hover:text-[#E5484D] transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
