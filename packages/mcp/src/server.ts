import * as readline from 'readline';
import * as path from 'path';
import * as fs from 'fs';
import { SherlockScanner, Finding, ScanResult, toSarif, toMarkdownSummary } from '@sherlock/core';
import { generatePRReview, PRChatHandler, LearningsStore } from '@sherlock/review';
import { VerificationSandbox, generateRegressionUnitTest } from '@sherlock/verification';

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: object;
}

export const SHERLOCK_MCP_TOOLS: MCPToolDefinition[] = [
  {
    name: 'review_diff',
    description: 'Review a Git diff or changed files for security vulnerabilities, reachability flaws, and quality lanes.',
    inputSchema: {
      type: 'object',
      properties: {
        diff: { type: 'string', description: 'Unified diff content or commit patch' },
        rootDir: { type: 'string', description: 'Root directory of the repository (optional)' }
      },
      required: ['diff']
    }
  },
  {
    name: 'scan_file',
    description: 'Perform an in-depth AST and data-flow security scan on a single file.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: { type: 'string', description: 'Absolute or relative path to the file to scan' },
        rootDir: { type: 'string', description: 'Root repository directory' }
      },
      required: ['filePath']
    }
  },
  {
    name: 'scan_repo',
    description: 'Execute a full repository baseline scan across all JS/TS files with reachability triage.',
    inputSchema: {
      type: 'object',
      properties: {
        rootDir: { type: 'string', description: 'Root path of the repository to scan' }
      },
      required: ['rootDir']
    }
  },
  {
    name: 'list_findings',
    description: 'List active findings filtered by severity, status, or file path.',
    inputSchema: {
      type: 'object',
      properties: {
        severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'info'] },
        status: { type: 'string', enum: ['open', 'fixed', 'accepted_risk', 'false_positive'] },
        filePath: { type: 'string' }
      }
    }
  },
  {
    name: 'explain_finding',
    description: 'Get an in-depth explanation, attack scenario, and traced dataflow evidence for a specific finding ID.',
    inputSchema: {
      type: 'object',
      properties: {
        findingId: { type: 'string', description: 'The unique finding identifier (e.g. fnd_...)' }
      },
      required: ['findingId']
    }
  },
  {
    name: 'suggest_fix',
    description: 'Generate or retrieve a validated unified diff patch and explanation for a finding.',
    inputSchema: {
      type: 'object',
      properties: {
        findingId: { type: 'string', description: 'The finding identifier to fix' }
      },
      required: ['findingId']
    }
  },
  {
    name: 'generate_tests',
    description: 'Synthesize automated regression tests to verify that a vulnerability cannot be exploited.',
    inputSchema: {
      type: 'object',
      properties: {
        findingId: { type: 'string', description: 'The finding identifier' }
      },
      required: ['findingId']
    }
  },
  {
    name: 'run_proof',
    description: 'Execute an exploit-proof probe in the isolated verification sandbox to verify exploitability.',
    inputSchema: {
      type: 'object',
      properties: {
        findingId: { type: 'string', description: 'The finding identifier' }
      },
      required: ['findingId']
    }
  },
  {
    name: 'get_report',
    description: 'Export scan results in SARIF, JSON, or Markdown summary format.',
    inputSchema: {
      type: 'object',
      properties: {
        format: { type: 'string', enum: ['sarif', 'json', 'markdown'], default: 'markdown' }
      }
    }
  }
];

export class SherlockMCPServer {
  private lastScanResult?: ScanResult;
  private learningsStore: LearningsStore;
  private sandbox: VerificationSandbox;
  private rootDir: string;

  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
    this.learningsStore = new LearningsStore(rootDir);
    this.sandbox = new VerificationSandbox();
  }

  public async executeTool(name: string, args: any): Promise<any> {
    switch (name) {
      case 'scan_repo': {
        const targetDir = args.rootDir || this.rootDir;
        const scanner = SherlockScanner.create(targetDir);
        this.lastScanResult = scanner.scan(targetDir);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                summary: this.lastScanResult.summary,
                findingsCount: this.lastScanResult.findings.length,
                topFindings: this.lastScanResult.findings.slice(0, 5)
              }, null, 2)
            }
          ]
        };
      }

      case 'scan_file': {
        const filePath = path.resolve(args.rootDir || this.rootDir, args.filePath);
        const scanner = SherlockScanner.create(path.dirname(filePath));
        const res = scanner.scan(path.dirname(filePath), filePath);
        this.lastScanResult = res;
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                scannedFile: filePath,
                findings: res.findings,
                suppressed: res.suppressedFindings.length
              }, null, 2)
            }
          ]
        };
      }

      case 'review_diff': {
        const diffText = args.diff || '';
        // Extract modified files from diff
        const matches = [...diffText.matchAll(/diff --git a\/(.*?) b\/(.*?)\n/g)];
        const changedFiles = matches.map(m => ({
          path: m[2],
          additions: 10,
          deletions: 2,
          patch: diffText
        }));

        const scanner = SherlockScanner.create(this.rootDir);
        const scanRes = this.lastScanResult || scanner.scan(this.rootDir);
        this.lastScanResult = scanRes;

        const review = generatePRReview(scanRes, changedFiles);
        return {
          content: [
            {
              type: 'text',
              text: review.markdownWalkthrough
            }
          ]
        };
      }

      case 'list_findings': {
        if (!this.lastScanResult) {
          const scanner = SherlockScanner.create(this.rootDir);
          this.lastScanResult = scanner.scan(this.rootDir);
        }
        let items = this.lastScanResult.findings;
        if (args.severity) items = items.filter(f => f.severity === args.severity);
        if (args.status) items = items.filter(f => f.status === args.status);
        if (args.filePath) items = items.filter(f => f.location.file.includes(args.filePath));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(items, null, 2)
            }
          ]
        };
      }

      case 'explain_finding': {
        const finding = this.findFinding(args.findingId);
        if (!finding) return { isError: true, content: [{ type: 'text', text: `Finding ${args.findingId} not found.` }] };

        return {
          content: [
            {
              type: 'text',
              text: `### ${finding.title}\n` +
                `- **Severity**: ${finding.severity.toUpperCase()} (Confidence: ${Math.round(finding.confidence * 100)}%)\n` +
                `- **CWE / OWASP**: ${finding.cwe.join(', ')} (${finding.owasp})\n` +
                `- **Attack Scenario**: ${finding.explanation}\n\n` +
                `**Data Flow Path**:\n` +
                finding.dataflow.map(df => `- [${df.role.toUpperCase()}] ${df.file}:${df.line} (${df.snippet || ''})`).join('\n')
            }
          ]
        };
      }

      case 'suggest_fix': {
        const finding = this.findFinding(args.findingId);
        if (!finding) return { isError: true, content: [{ type: 'text', text: `Finding ${args.findingId} not found.` }] };

        return {
          content: [
            {
              type: 'text',
              text: `### Suggested Fix for ${finding.title}\n\n` +
                `${finding.fix.description}\n\n` +
                `\`\`\`diff\n${finding.fix.patch}\n\`\`\``
            }
          ]
        };
      }

      case 'generate_tests': {
        const finding = this.findFinding(args.findingId);
        if (!finding) return { isError: true, content: [{ type: 'text', text: `Finding ${args.findingId} not found.` }] };

        const test = generateRegressionUnitTest(finding);
        return {
          content: [
            {
              type: 'text',
              text: `### Generated Regression Test (${test.testFilePath})\n\n\`\`\`typescript\n${test.testCode}\n\`\`\``
            }
          ]
        };
      }

      case 'run_proof': {
        const finding = this.findFinding(args.findingId);
        if (!finding) return { isError: true, content: [{ type: 'text', text: `Finding ${args.findingId} not found.` }] };

        const result = await this.sandbox.runProof(finding);
        return {
          content: [
            {
              type: 'text',
              text: `### Exploit Proof Sandbox Result: ${result.badge.toUpperCase()}\n\n` +
                `\`\`\`\n${result.executionLogs.join('\n')}\n\`\`\``
            }
          ]
        };
      }

      case 'get_report': {
        if (!this.lastScanResult) {
          const scanner = SherlockScanner.create(this.rootDir);
          this.lastScanResult = scanner.scan(this.rootDir);
        }

        const format = args.format || 'markdown';
        if (format === 'sarif') {
          return { content: [{ type: 'text', text: JSON.stringify(toSarif(this.lastScanResult), null, 2) }] };
        } else if (format === 'json') {
          return { content: [{ type: 'text', text: JSON.stringify(this.lastScanResult, null, 2) }] };
        } else {
          return { content: [{ type: 'text', text: toMarkdownSummary(this.lastScanResult) }] };
        }
      }

      default:
        return { isError: true, content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
    }
  }

  private findFinding(id: string): Finding | undefined {
    if (!this.lastScanResult) {
      const scanner = SherlockScanner.create(this.rootDir);
      this.lastScanResult = scanner.scan(this.rootDir);
    }
    return this.lastScanResult?.findings.find(f => f.id === id || f.fingerprint === id);
  }

  public startStdioServer(): void {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    rl.on('line', async (line) => {
      if (!line.trim()) return;
      try {
        const msg = JSON.parse(line);
        await this.handleJsonRpc(msg);
      } catch (err) {
        console.error('[Sherlock MCP] Error parsing message:', err);
      }
    });
  }

  private async handleJsonRpc(msg: any): Promise<void> {
    const { id, method, params } = msg;

    if (method === 'initialize') {
      this.sendResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'sherlock-security-mcp', version: '1.0.0' }
      });
      return;
    }

    if (method === 'tools/list') {
      this.sendResponse(id, { tools: SHERLOCK_MCP_TOOLS });
      return;
    }

    if (method === 'tools/call') {
      const { name, arguments: toolArgs } = params;
      const res = await this.executeTool(name, toolArgs);
      this.sendResponse(id, res);
      return;
    }

    if (method === 'ping') {
      this.sendResponse(id, {});
      return;
    }

    this.sendResponse(id, { error: { code: -32601, message: `Method not found: ${method}` } });
  }

  private sendResponse(id: any, result: any): void {
    const response = { jsonrpc: '2.0', id, ...result };
    process.stdout.write(JSON.stringify(response) + '\n');
  }
}
