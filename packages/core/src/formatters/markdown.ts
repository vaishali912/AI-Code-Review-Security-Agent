import { ScanResult, Finding, Severity } from '../types/schema.js';

export function toMarkdownSummary(scanResult: ScanResult): string {
  const { summary, findings } = scanResult;
  const statusEmoji = summary.passedGate ? '✅' : '🔴';

  let md = `## ${statusEmoji} Sherlock Security Review\n\n`;
  md += `**Gate Status**: ${summary.passedGate ? '**PASSED**' : '**FAILED (Action Required)**'}\n`;
  md += `**Scanned Files**: ${summary.scannedFiles} | **Total Findings**: ${summary.totalFindings} | **Suppressed (False Positives/Sanitized)**: ${summary.suppressedCount}\n\n`;

  md += `| Severity | Count | Gate Limit |\n`;
  md += `| :--- | :--- | :--- |\n`;
  md += `| 🔴 Critical | ${summary.criticalCount} | 0 |\n`;
  md += `| 🟠 High | ${summary.highCount} | 0 |\n`;
  md += `| 🟡 Medium | ${summary.mediumCount} | Advisory |\n`;
  md += `| 🔵 Low | ${summary.lowCount} | Advisory |\n\n`;

  if (findings.length === 0) {
    md += `✨ **No security vulnerabilities found.** All dataflows verified safe.\n`;
    return md;
  }

  md += `### High-Priority Findings\n\n`;

  findings.forEach((f, index) => {
    const sevBadge = f.severity === 'critical' ? '🔴 Critical' : f.severity === 'high' ? '🟠 High' : '🟡 Medium';
    md += `#### ${index + 1}. ${f.title}\n`;
    md += `- **Severity**: ${sevBadge} | **Confidence**: ${Math.round(f.confidence * 100)}%\n`;
    md += `- **Classification**: ${f.cwe.join(', ')} (${f.owasp})\n`;
    md += `- **Location**: \`${f.location.file}:${f.location.startLine}\`\n\n`;
    md += `**Attack Scenario & Evidence**:\n${f.explanation}\n\n`;

    if (f.dataflow.length > 0) {
      md += `**Traced Data Flow**:\n`;
      f.dataflow.forEach(df => {
        md += `1. \`[${df.role.toUpperCase()}]\` \`${df.file}:${df.line}\` ${df.snippet ? `— \`${df.snippet}\`` : ''}\n`;
      });
      md += `\n`;
    }

    if (f.fix.patch) {
      md += `**Suggested Fix**:\n${f.fix.description}\n\n`;
      md += `\`\`\`diff\n${f.fix.patch}\n\`\`\`\n\n`;
    }

    md += `---\n\n`;
  });

  return md;
}
