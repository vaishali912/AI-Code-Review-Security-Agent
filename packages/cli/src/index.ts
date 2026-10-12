#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { parseArgs } from 'node:util';
import { SherlockScanner, toSarif, toMarkdownSummary, Severity } from '@sherlock/core';
import { generatePRReview, PRChatHandler, LearningsStore } from '@sherlock/review';
import { VerificationSandbox, generateRegressionUnitTest } from '@sherlock/verification';
import { SherlockMCPServer } from '@sherlock/mcp';

// ANSI colors
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m\x1b[37m',
  bgGreen: '\x1b[42m\x1b[30m',
  bgYellow: '\x1b[43m\x1b[30m',
  bgBlue: '\x1b[44m\x1b[37m'
};

function banner() {
  console.log(`${c.cyan}${c.bold}
   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   ┃   SHERLOCK · AI Code Review & Security Verification    ┃
   ┃   "A security engineer on every pull request"          ┃
   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${c.reset}\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'scan';

  if (command === 'mcp') {
    const server = new SherlockMCPServer(process.cwd());
    server.startStdioServer();
    return;
  }

  if (command === 'init') {
    banner();
    const configPath = path.join(process.cwd(), '.secreview.yml');
    if (fs.existsSync(configPath)) {
      console.log(`${c.yellow}⚠️ .secreview.yml already exists at ${configPath}${c.reset}`);
      return;
    }
    const sampleConfig = `version: "1.0"
ignorePaths:
  - "**/node_modules/**"
  - "**/dist/**"
  - "**/.next/**"
  - "**/*.test.ts"
  - "**/*.spec.ts"

gate:
  failOnSeverity: "high" # fail build if >= high severity findings exist
  blockOnNewOnly: true
  maxFindings: 10

review:
  commentCap: 10
  showMermaidDiagrams: true
  enabledLanes:
    - "security"
    - "bug"
    - "quality"
    - "performance"
    - "tests"
  suppressLowConfidence: true

verification:
  exploitProofEnabled: true
  sandboxTimeoutSeconds: 120

customSanitizers:
  - name: "safeQueryParam"
    cwe: ["CWE-89"]
    sanitizes: ["string"]
`;
    fs.writeFileSync(configPath, sampleConfig, 'utf-8');
    console.log(`${c.green}✅ Created .secreview.yml with recommended security policies!${c.reset}\n`);
    return;
  }

  if (command === 'proof') {
    banner();
    const findingId = args[1];
    if (!findingId) {
      console.error(`${c.red}Error: Please specify finding ID: sherlock proof <finding-id>${c.reset}`);
      process.exit(1);
    }

    const scanner = SherlockScanner.create(process.cwd());
    const res = scanner.scan(process.cwd());
    const finding = res.findings.find(f => f.id === findingId || f.fingerprint === findingId);

    if (!finding) {
      console.error(`${c.red}Finding '${findingId}' not found in active codebase.${c.reset}`);
      process.exit(1);
    }

    console.log(`${c.bold}🧪 Running Verification Sandbox for: ${c.cyan}${finding.title}${c.reset}\n`);
    const sandbox = new VerificationSandbox();
    const execResult = await sandbox.runProof(finding);

    console.log(execResult.executionLogs.join('\n'));
    console.log(`\n${c.green}${c.bold}Verdict: ${execResult.badge.toUpperCase()} (Execution duration: ${execResult.durationMs}ms)${c.reset}\n`);
    return;
  }

  if (command === 'review') {
    banner();
    const targetDir = process.cwd();
    const scanner = SherlockScanner.create(targetDir);
    const scanResult = scanner.scan(targetDir);

    const changedFiles = [
      { path: 'src/routes/users.ts', additions: 14, deletions: 3 },
      { path: 'src/services/auth.ts', additions: 8, deletions: 1 }
    ];

    const review = generatePRReview(scanResult, changedFiles);
    console.log(review.markdownWalkthrough);
    return;
  }

  // Default: scan command
  banner();
  let targetPath = process.cwd();
  let format: 'human' | 'json' | 'sarif' = 'human';
  let failOn: Severity = 'high';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--format' && args[i + 1]) {
      format = args[i + 1] as any;
      i++;
    } else if (args[i] === '--fail-on' && args[i + 1]) {
      failOn = args[i + 1] as any;
      i++;
    } else if (args[i] !== 'scan' && !args[i].startsWith('-')) {
      targetPath = path.resolve(process.cwd(), args[i]);
    }
  }

  const scanner = SherlockScanner.create(process.cwd());
  const result = scanner.scan(process.cwd(), targetPath);

  if (format === 'sarif') {
    console.log(JSON.stringify(toSarif(result), null, 2));
    if (!result.summary.passedGate) process.exit(1);
    return;
  }

  if (format === 'json') {
    console.log(JSON.stringify(result, null, 2));
    if (!result.summary.passedGate) process.exit(1);
    return;
  }

  // Human-readable terminal output
  console.log(`${c.dim}Target:${c.reset} ${targetPath}`);
  console.log(`${c.dim}Scanned Files:${c.reset} ${result.summary.scannedFiles} files (${result.summary.durationMs}ms)`);
  console.log(`${c.dim}Suppressed via Reachability & Sanitizers:${c.reset} ${result.summary.suppressedCount}\n`);

  if (result.findings.length === 0) {
    console.log(`${c.bgGreen} PASSED ${c.reset} ${c.green}${c.bold}No security vulnerabilities found.${c.reset}`);
    process.exit(0);
  }

  console.log(`${c.bold}Found ${result.findings.length} findings:${c.reset}\n`);

  result.findings.forEach((f, idx) => {
    const sevBadge = f.severity === 'critical' 
      ? `${c.bgRed} CRITICAL ${c.reset}` 
      : f.severity === 'high' 
        ? `${c.red}${c.bold}[HIGH]${c.reset}` 
        : `${c.yellow}[MEDIUM]${c.reset}`;

    console.log(`${c.bold}${idx + 1}. ${sevBadge} ${c.bold}${f.title}${c.reset}`);
    console.log(`   ${c.dim}Location:${c.reset}   ${c.cyan}${f.location.file}:${f.location.startLine}${c.reset}`);
    console.log(`   ${c.dim}Rule / CWE:${c.reset} ${f.detected_by.static_rule} (${f.cwe.join(', ')} · ${f.owasp})`);
    console.log(`   ${c.dim}Confidence:${c.reset} ${Math.round(f.confidence * 100)}% | ${c.dim}ID:${c.reset} ${f.id}`);
    console.log(`   ${c.dim}Attack Path:${c.reset}`);
    console.log(`   ${f.explanation}`);

    if (f.dataflow.length > 0) {
      console.log(`   ${c.dim}Traced Dataflow:${c.reset}`);
      f.dataflow.forEach(df => {
        console.log(`     → [${df.role.toUpperCase()}] ${df.file}:${df.line} ${df.snippet ? `(${c.yellow}${df.snippet}${c.reset})` : ''}`);
      });
    }

    if (f.fix.patch) {
      console.log(`   ${c.green}${c.bold}Suggested Patch:${c.reset}`);
      f.fix.patch.split('\n').forEach(line => {
        if (line.startsWith('+')) console.log(`     ${c.green}${line}${c.reset}`);
        else if (line.startsWith('-')) console.log(`     ${c.red}${line}${c.reset}`);
        else console.log(`     ${c.dim}${line}${c.reset}`);
      });
    }
    console.log('');
  });

  // Summary box
  console.log(`─────────────────────────────────────────────────────────────`);
  if (!result.summary.passedGate) {
    console.log(`${c.bgRed} CI GATE FAILED ${c.reset} Found ${result.summary.criticalCount} Critical, ${result.summary.highCount} High vulnerabilities exceeding policy limit.`);
    process.exit(1);
  } else {
    console.log(`${c.bgGreen} CI GATE PASSED ${c.reset} All findings within acceptable policy tolerance.`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error(`${c.red}Fatal error: ${err.message}${c.reset}`);
  process.exit(1);
});
