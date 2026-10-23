import React, { useState } from 'react';
import { cn } from '../../lib/utils.js';
import { Network, AlertCircle, FileCode } from 'lucide-react';

interface ImpactNode {
  id: string;
  label: string;
  type: 'changed' | 'dependent' | 'test' | 'route';
  risk: 'critical' | 'high' | 'medium' | 'low';
  x: number;
  y: number;
  radius: number;
}

interface ImpactEdge {
  from: string;
  to: string;
  isTainted?: boolean;
}

interface ImpactGraphProps {
  onSelectNode?: (file: string) => void;
  className?: string;
}

const NODES: ImpactNode[] = [
  { id: 'users.ts', label: 'src/routes/users.ts', type: 'changed', risk: 'critical', x: 180, y: 70, radius: 24 },
  { id: 'files.ts', label: 'src/routes/files.ts', type: 'changed', risk: 'critical', x: 180, y: 170, radius: 22 },
  { id: 'userProfile.tsx', label: 'src/components/UserProfile.tsx', type: 'changed', risk: 'high', x: 180, y: 260, radius: 18 },
  { id: 'proxy.ts', label: 'src/routes/proxy.ts', type: 'changed', risk: 'high', x: 180, y: 340, radius: 18 },

  // Downstream dependent call sites
  { id: 'app.ts', label: 'src/app.ts', type: 'dependent', risk: 'high', x: 400, y: 110, radius: 20 },
  { id: 'db.ts', label: 'src/db/connection.ts', type: 'dependent', risk: 'critical', x: 400, y: 200, radius: 22 },
  { id: 'auth.ts', label: 'src/auth/session.ts', type: 'dependent', risk: 'medium', x: 400, y: 290, radius: 16 },

  // Tests & Entry points
  { id: 'users.test.ts', label: 'tests/users.spec.ts', type: 'test', risk: 'low', x: 620, y: 110, radius: 16 },
  { id: 'api.e2e.ts', label: 'tests/e2e/api.test.ts', type: 'test', risk: 'low', x: 620, y: 200, radius: 16 }
];

const EDGES: ImpactEdge[] = [
  { from: 'users.ts', to: 'app.ts', isTainted: true },
  { from: 'users.ts', to: 'db.ts', isTainted: true },
  { from: 'users.ts', to: 'users.test.ts' },
  { from: 'files.ts', to: 'app.ts' },
  { id: 'e5', from: 'files.ts', to: 'db.ts' } as any,
  { from: 'userProfile.tsx', to: 'app.ts' },
  { from: 'proxy.ts', to: 'auth.ts' },
  { from: 'app.ts', to: 'api.e2e.ts' }
];

export const ImpactGraph: React.FC<ImpactGraphProps> = ({ onSelectNode, className }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const blastRadius = {
    changedFiles: 4,
    dependentModules: 7,
    routesTouched: 6,
    testsImpacted: 14
  };

  const getNodeColor = (risk: ImpactNode['risk']) => {
    switch (risk) {
      case 'critical': return '#E5484D';
      case 'high': return '#F76B15';
      case 'medium': return '#E5A50A';
      default: return '#8B8D98';
    }
  };

  const handleNodeClick = (node: ImpactNode) => {
    setSelectedNode(node.label);
    if (onSelectNode) {
      onSelectNode(node.label);
    }
  };

  return (
    <div className={cn('rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-5 space-y-4', className)}>
      {/* Blast Radius Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-[var(--line)] pb-4">
        <div>
          <h3 className="text-xs font-mono font-semibold text-[var(--ink-muted)] uppercase tracking-wider">
            Blast Radius & Cross-File Impact Graph
          </h3>
          <p className="text-xs text-[var(--ink)] mt-0.5">
            Forward control-flow dependencies calculated from changed PR diff.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-2.5 py-1 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)]">
            <span className="text-[var(--ink-muted)]">Changed: </span>
            <span className="font-bold text-[var(--ink)]">{blastRadius.changedFiles}</span>
          </div>
          <div className="px-2.5 py-1 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)]">
            <span className="text-[var(--ink-muted)]">Dependents: </span>
            <span className="font-bold text-[#E5484D]">{blastRadius.dependentModules}</span>
          </div>
          <div className="px-2.5 py-1 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)]">
            <span className="text-[var(--ink-muted)]">Tests Impacted: </span>
            <span className="font-bold text-[#30A46C]">{blastRadius.testsImpacted}</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <div className="p-4 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--bg-subtle)] overflow-x-auto">
        <svg viewBox="0 0 740 400" className="w-full min-w-[700px] h-[340px] select-none font-mono">
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="var(--line-strong)" />
            </marker>
            <marker id="arrowhead-taint" markerWidth="6" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#E5484D" />
            </marker>
          </defs>

          {/* Edges */}
          {EDGES.map((edge, i) => {
            const fromNode = NODES.find(n => n.id === edge.from)!;
            const toNode = NODES.find(n => n.id === edge.to)!;
            if (!fromNode || !toNode) return null;

            return (
              <line
                key={i}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={edge.isTainted ? '#E5484D' : 'var(--line-strong)'}
                strokeWidth={edge.isTainted ? 2 : 1.5}
                strokeDasharray={edge.isTainted ? 'none' : '4 4'}
                markerEnd={edge.isTainted ? 'url(#arrowhead-taint)' : 'url(#arrowhead)'}
              />
            );
          })}

          {/* Nodes */}
          {NODES.map(node => {
            const isSelected = selectedNode === node.label;
            const color = getNodeColor(node.risk);

            return (
              <g
                key={node.id}
                onClick={() => handleNodeClick(node)}
                className="cursor-pointer transition-transform hover:scale-105"
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius}
                  fill="var(--surface)"
                  stroke={isSelected ? 'var(--ink)' : color}
                  strokeWidth={isSelected ? 3 : 2}
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={4}
                  fill={color}
                />
                <text
                  x={node.x}
                  y={node.y + node.radius + 14}
                  textAnchor="middle"
                  fill="var(--ink)"
                  fontSize="10"
                  fontWeight={node.type === 'changed' ? '600' : '400'}
                >
                  {node.label.split('/').pop()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-[var(--ink-muted)]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#E5484D]" /> Critical risk</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F76B15]" /> High risk</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#8B8D98]" /> Low/Test</span>
        </div>
        <span>Click any node to filter findings or view file dependents</span>
      </div>
    </div>
  );
};
