import { Finding } from '@sherlock/core';
import { LearningsStore } from './learnings.js';

export interface ChatCommandResult {
  reply: string;
  actionTaken?: 'explained' | 'fixed' | 'ignored' | 'rechecked' | 'tests_generated' | 'unknown';
  patch?: string;
  suppressed?: boolean;
}

export class PRChatHandler {
  private learningsStore: LearningsStore;

  constructor(learningsStore: LearningsStore) {
    this.learningsStore = learningsStore;
  }

  public handleComment(
    commentText: string,
    finding?: Finding,
    author: string = 'developer'
  ): ChatCommandResult {
    const trimmed = commentText.trim();

    // Check for @sherlock or @bot command
    const botMention = /@(?:sherlock|bot)\s+(\w+)(?:\s+(.*))?/i.exec(trimmed);
    if (!botMention) {
      return {
        reply: `Hello @${author}! You can interact with me using commands like:\n- \`@sherlock explain\`: In-depth breakdown of attack scenario and reachability\n- \`@sherlock fix\`: Apply or generate a verified fix\n- \`@sherlock ignore <reason>\`: Suppress this finding with plain-language feedback\n- \`@sherlock recheck\`: Re-analyze the current code state`,
        actionTaken: 'unknown'
      };
    }

    const command = botMention[1].toLowerCase();
    const args = botMention[2] || '';

    switch (command) {
      case 'explain':
        if (!finding) {
          return { reply: 'Please mention me on a specific finding thread to explain.', actionTaken: 'unknown' };
        }
        return {
          reply: `### 🛡️ Sherlock Finding Explanation: ${finding.title}\n\n` +
            `**Why this is vulnerable:**\n${finding.explanation}\n\n` +
            `**Evidence & Reachability Trace:**\n` +
            finding.dataflow.map(df => `- \`[${df.role.toUpperCase()}]\` \`${df.file}:${df.line}\` ${df.snippet ? `(\`${df.snippet}\`)` : ''}`).join('\n') +
            `\n\n**Impact & Exploitability:** Classified under **${finding.cwe.join(', ')}** (${finding.owasp}) with a confidence of **${Math.round(finding.confidence * 100)}%**.\n\n` +
            `To suppress, reply \`@sherlock ignore <reason>\`. To apply fix, reply \`@sherlock fix\`.`,
          actionTaken: 'explained'
        };

      case 'fix':
        if (!finding) {
          return { reply: 'Please mention me on a specific finding thread to request a fix.', actionTaken: 'unknown' };
        }
        return {
          reply: `### 🔧 Suggested Fix for ${finding.title}\n\n` +
            `${finding.fix.description}\n\n` +
            `\`\`\`diff\n${finding.fix.patch}\n\`\`\`\n\n` +
            `*You can apply this change directly via your editor or git patch.*`,
          actionTaken: 'fixed',
          patch: finding.fix.patch
        };

      case 'ignore':
        if (!args.trim()) {
          return {
            reply: `⚠️ Please provide a reason when ignoring a finding, for example:\n\`@sherlock ignore sanitized in database gateway\``,
            actionTaken: 'unknown'
          };
        }
        if (finding) {
          this.learningsStore.recordFeedback(
            args.trim(),
            finding.location.file,
            finding.detected_by.static_rule,
            author
          );
        }
        return {
          reply: `✅ **Finding suppressed.** Reason recorded in repository learnings: *"${args.trim()}"*.\nThis rule memory will automatically suppress similar false positives across future reviews.`,
          actionTaken: 'ignored',
          suppressed: true
        };

      case 'recheck':
        return {
          reply: `🔄 Initiating full incremental recheck of changed files and dependents. Checking code graph and reachability...`,
          actionTaken: 'rechecked'
        };

      case 'generate-tests':
      case 'test':
        return {
          reply: `🧪 Generating regression unit tests to verify boundary conditions...`,
          actionTaken: 'tests_generated'
        };

      default:
        return {
          reply: `Unknown command \`${command}\`. Available commands: \`explain\`, \`fix\`, \`ignore <reason>\`, \`recheck\`, \`test\`.`,
          actionTaken: 'unknown'
        };
    }
  }
}
