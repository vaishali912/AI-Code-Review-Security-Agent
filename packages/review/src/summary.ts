import { ScanResult, Finding, ReviewLane } from '@sherlock/core';
import { generateMermaidDiagram } from './diagram.js';

export interface FileChangeMeta {
  path: string;
  additions: number;
  deletions: number;
  findingsCount: number;
  risk: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
}

export interface PRReviewSummary {
  suggestedTitle: string;
  suggestedDescription: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  fileChanges: FileChangeMeta[];
  markdownWalkthrough: string;
  mermaidDiagram: string;
  laneCounts: Record<ReviewLane, number>;
}

export function generatePRReview(
  scanResult: ScanResult,
  changedFiles: { path: string; additions: number; deletions: number; patch?: string }[]
): PRReviewSummary {
  const { findings, summary } = scanResult;

  // Determine overall risk
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (summary.criticalCount > 0) riskLevel = 'CRITICAL';
  else if (summary.highCount > 0) riskLevel = 'HIGH';
  else if (summary.mediumCount > 0) riskLevel = 'MEDIUM';

  // Compute per-file metadata
  const fileChanges: FileChangeMeta[] = changedFiles.map(cf => {
    const fileFindings = findings.filter(f => f.location.file.includes(cf.path) || cf.path.includes(f.location.file));
    let fileRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (fileFindings.some(f => f.severity === 'critical')) fileRisk = 'critical';
    else if (fileFindings.some(f => f.severity === 'high')) fileRisk = 'high';
    else if (fileFindings.some(f => f.severity === 'medium')) fileRisk = 'medium';

    return {
      path: cf.path,
      additions: cf.additions,
      deletions: cf.deletions,
      findingsCount: fileFindings.length,
      risk: fileRisk,
      summary: fileFindings.length > 0 
        ? `${fileFindings.length} issue(s) flagged: ${fileFindings.map(f => f.title).join('; ')}`
        : 'Changes reviewed cleanly with verified data flow.'
    };
  });

  // Generate Mermaid diagram
  const mermaidDiagram = generateMermaidDiagram(findings, changedFiles.map(f => f.path));

  // Suggested PR Title & Description
  const suggestedTitle = fileChanges.length > 0
    ? `feat/fix: Update ${fileChanges[0].path.split('/').pop()} with security validation`
    : 'feat: Application updates';

  const riskEmoji = riskLevel === 'CRITICAL' ? '🔴' : riskLevel === 'HIGH' ? '🟠' : riskLevel === 'MEDIUM' ? '🟡' : '🟢';

  let walkthrough = `## 🔍 Sherlock AI Code Review & Risk Walkthrough\n\n`;
  walkthrough += `### 🚦 Overall Risk Assessment: ${riskEmoji} **${riskLevel} RISK**\n`;
  walkthrough += `*Automated review scanned ${summary.scannedFiles} file(s) across static taint analysis, reachability triage, and sandbox verification.*\n\n`;

  walkthrough += `### 📋 Changes by File\n\n`;
  walkthrough += `| File | +/- | Risk | Review Focus |\n`;
  walkthrough += `| :--- | :---: | :---: | :--- |\n`;

  for (const fc of fileChanges) {
    const rBadge = fc.risk === 'critical' ? '🔴 Critical' : fc.risk === 'high' ? '🟠 High' : fc.risk === 'medium' ? '🟡 Medium' : '🟢 Clean';
    walkthrough += `| \`${fc.path}\` | +${fc.additions}/-${fc.deletions} | ${rBadge} | ${fc.summary} |\n`;
  }
  walkthrough += `\n`;

  if (mermaidDiagram) {
    walkthrough += `### 📐 Architecture & Data Flow Diagram\n\n`;
    walkthrough += `\`\`\`mermaid\n${mermaidDiagram}\n\`\`\`\n\n`;
  }

  if (findings.length > 0) {
    walkthrough += `### 🛡️ Verified Security & Quality Findings (${findings.length})\n\n`;
    findings.forEach((f, idx) => {
      const icon = f.severity === 'critical' ? '🔴' : f.severity === 'high' ? '🟠' : '🟡';
      walkthrough += `<details open>\n<summary><b>${icon} [${f.severity.toUpperCase()}] ${f.title} (${f.location.file}:${f.location.startLine})</b></summary>\n\n`;
      walkthrough += `- **Lane**: \`${f.lane}\` | **Confidence**: ${Math.round(f.confidence * 100)}%\n`;
      walkthrough += `- **Attack Scenario**: ${f.explanation}\n`;
      if (f.dataflow.length > 0) {
        walkthrough += `- **Dataflow Path**:\n`;
        f.dataflow.forEach(df => {
          walkthrough += `  - \`[${df.role.toUpperCase()}]\` \`${df.file}:${df.line}\` ${df.snippet ? `(\`${df.snippet}\`)` : ''}\n`;
        });
      }
      if (f.fix.patch) {
        walkthrough += `\n**Suggested Fix**:\n\`\`\`diff\n${f.fix.patch}\n\`\`\`\n`;
      }
      walkthrough += `\n*Reply with \`@sherlock explain\`, \`@sherlock fix\`, or \`@sherlock ignore [reason]\` to interact with this finding.*\n`;
      walkthrough += `\n</details>\n\n`;
    });
  } else {
    walkthrough += `### ✨ Review Verdict\n\n`;
    walkthrough += `No exploitable security flaws, logic bugs, or access control violations detected. Safe to merge.\n\n`;
  }

  return {
    suggestedTitle,
    suggestedDescription: `### Summary of Changes\n${fileChanges.map(f => `- ${f.path}: ${f.summary}`).join('\n')}`,
    riskLevel,
    fileChanges,
    markdownWalkthrough: walkthrough,
    mermaidDiagram,
    laneCounts: summary.findingsByLane
  };
}
