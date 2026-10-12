import { Finding } from '@sherlock/core';

export function generateMermaidDiagram(findings: Finding[], changedFiles: string[]): string {
  if (findings.length === 0 && changedFiles.length < 2) {
    return `graph TD
    Client["Client / User"] --> App["Application Server"]
    App --> Storage["Database / Storage"]`;
  }

  // If there are findings with dataflows, generate a sequence or data-flow graph
  const nodes = new Set<string>();
  const edges: string[] = [];

  findings.forEach((f, fIdx) => {
    if (f.dataflow.length > 0) {
      let prevNode = '';
      f.dataflow.forEach((step, sIdx) => {
        const fileBase = step.file.split(/[\\/]/).pop() || step.file;
        const nodeId = `N_${fIdx}_${sIdx}`;
        const nodeLabel = `"${step.role.toUpperCase()}: ${fileBase}:${step.line}"`;
        nodes.add(`${nodeId}[${nodeLabel}]`);

        if (prevNode) {
          edges.push(`${prevNode} -->|"${step.snippet ? step.snippet.slice(0, 20) : 'tainted data'}"| ${nodeId}`);
        }
        prevNode = nodeId;
      });
    }
  });

  if (edges.length === 0) {
    // Generate module flow from changed files
    const fileBases = changedFiles.map(f => f.split(/[\\/]/).pop() || f);
    return `graph LR
    Client["Client Request"] --> Endpoint["${fileBases[0] || 'API Endpoint'}"]
    ${fileBases.slice(1).map(fb => `Endpoint --> ${fb.replace(/[^a-zA-Z0-9]/g, '_')}["${fb}"]`).join('\n    ')}`;
  }

  return `graph TD
    ${Array.from(nodes).join('\n    ')}
    ${edges.join('\n    ')}`;
}
