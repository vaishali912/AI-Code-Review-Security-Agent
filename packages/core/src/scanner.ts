import * as fs from 'fs';
import * as path from 'path';
import { Finding, ScanResult, ScanSummary, Severity, ReviewLane } from './types/schema.js';
import { SecReviewConfig } from './types/config.js';
import { loadConfig } from './config/loader.js';
import { CodeGraph } from './graph/codeGraph.js';
import { BUILTIN_RULES } from './rules/builtins.js';
import { CandidateFinding, SecurityRule } from './rules/types.js';
import { ReachabilityEngine } from './triage/reachability.js';

export interface ScanOptions {
  rootDir: string;
  targetPath?: string;
  configPath?: string;
  configOverride?: Partial<SecReviewConfig>;
  failOnSeverity?: Severity;
  customRules?: SecurityRule[];
}

export class SherlockScanner {
  private config: SecReviewConfig;
  private reachability: ReachabilityEngine;

  constructor(config: SecReviewConfig) {
    this.config = config;
    this.reachability = new ReachabilityEngine(config);
  }

  public static create(rootDir: string, configPath?: string): SherlockScanner {
    const config = loadConfig(rootDir, configPath);
    return new SherlockScanner(config);
  }

  public scan(rootDir: string, targetPath?: string): ScanResult {
    const startTime = Date.now();
    const scanDir = targetPath ? path.resolve(rootDir, targetPath) : rootDir;
    const codeGraph = new CodeGraph(rootDir);

    // 1. Collect files
    const filePaths = this.collectFiles(scanDir);
    for (const fp of filePaths) {
      try {
        const content = fs.readFileSync(fp, 'utf-8');
        codeGraph.addFile(fp, content);
      } catch (err) {
        // ignore unreadable files
      }
    }

    // 2. Run rules
    const allCandidates: CandidateFinding[] = [];
    const rules = [...BUILTIN_RULES];

    // Add any custom regex/pattern rules from config
    if (this.config.customRules) {
      for (const cr of this.config.customRules) {
        if (cr.pattern) {
          rules.push({
            id: cr.id,
            title: cr.name,
            cwe: cr.cwe ? [cr.cwe] : ['CWE-16'],
            owasp: 'A04:2021',
            defaultSeverity: cr.severity,
            lane: cr.lane || 'security',
            description: cr.description,
            check: (fileAST) => {
              const matches: CandidateFinding[] = [];
              const regex = new RegExp(cr.pattern!, 'g');
              const lines = fileAST.content.split('\n');
              lines.forEach((l, idx) => {
                if (regex.test(l)) {
                  matches.push({
                    ruleId: cr.id,
                    title: cr.name,
                    cwe: cr.cwe ? [cr.cwe] : ['CWE-16'],
                    owasp: 'A04:2021',
                    severity: cr.severity,
                    lane: cr.lane || 'security',
                    file: fileAST.filePath,
                    startLine: idx + 1,
                    endLine: idx + 1,
                    dataflow: [{ role: 'sink', file: fileAST.filePath, line: idx + 1, snippet: l.trim() }],
                    sinkSnippet: l.trim(),
                    explanation: cr.description,
                    evidence: [`${fileAST.filePath}:${idx + 1}`],
                    suggestedPatch: '',
                    fixDescription: 'Resolve custom rule constraint.',
                    exposure: 'internal',
                    confidence: 0.90
                  });
                }
              });
              return matches;
            }
          });
        }
      }
    }

    for (const [filePath, fileAST] of codeGraph.files) {
      for (const rule of rules) {
        try {
          const candidates = rule.check(fileAST, codeGraph);
          allCandidates.push(...candidates);
        } catch (err) {
          console.error(`[Sherlock] Error executing rule ${rule.id} on ${filePath}:`, err);
        }
      }
    }

    // 3. Triage & Reachability analysis
    const findings: Finding[] = [];
    const suppressedFindings: Finding[] = [];

    for (const candidate of allCandidates) {
      const finding = this.reachability.triage(candidate, codeGraph);
      if (finding.suppressed) {
        suppressedFindings.push(finding);
      } else {
        findings.push(finding);
      }
    }

    // 4. Summarize
    const durationMs = Date.now() - startTime;
    const summary = this.buildSummary(rootDir, filePaths.length, findings, suppressedFindings, durationMs);

    return {
      summary,
      findings,
      suppressedFindings
    };
  }

  private collectFiles(dir: string): string[] {
    const results: string[] = [];

    if (!fs.existsSync(dir)) return results;
    const stat = fs.statSync(dir);
    if (!stat.isDirectory()) {
      return [dir];
    }

    const walk = (current: string) => {
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(current, entry.name);
        const relPath = path.relative(this.config.version ? '.' : dir, fullPath).replace(/\\/g, '/');

        // Check if ignored
        if (this.isIgnored(relPath, entry.name)) continue;

        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'].includes(ext)) {
            results.push(fullPath);
          }
        }
      }
    };

    walk(dir);
    return results;
  }

  private isIgnored(relPath: string, basename: string): boolean {
    if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(basename)) {
      return true;
    }
    const ignoreList = this.config.ignorePaths || [];
    for (const pattern of ignoreList) {
      const cleanPattern = pattern.replace(/\*\*\//g, '').replace(/\/\*\*/g, '').replace(/\*/g, '');
      if (cleanPattern && relPath.includes(cleanPattern)) {
        return true;
      }
    }
    return false;
  }

  private buildSummary(
    repoPath: string,
    scannedFiles: number,
    findings: Finding[],
    suppressed: Finding[],
    durationMs: number
  ): ScanSummary {
    const findingsBySeverity: Record<Severity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };

    const findingsByLane: Record<ReviewLane, number> = {
      security: 0,
      bug: 0,
      quality: 0,
      performance: 0,
      tests: 0
    };

    for (const f of findings) {
      findingsBySeverity[f.severity] = (findingsBySeverity[f.severity] || 0) + 1;
      findingsByLane[f.lane] = (findingsByLane[f.lane] || 0) + 1;
    }

    const gateSev = this.config.gate?.failOnSeverity || 'high';
    const failLevels: Severity[] = gateSev === 'critical' 
      ? ['critical'] 
      : gateSev === 'high' 
        ? ['critical', 'high'] 
        : ['critical', 'high', 'medium'];

    const gatingViolations = findings.filter(f => failLevels.includes(f.severity)).length;
    const passedGate = gatingViolations === 0;

    return {
      repoPath,
      scannedFiles,
      totalFindings: findings.length,
      findingsBySeverity,
      findingsByLane,
      criticalCount: findingsBySeverity.critical,
      highCount: findingsBySeverity.high,
      mediumCount: findingsBySeverity.medium,
      lowCount: findingsBySeverity.low,
      suppressedCount: suppressed.length,
      durationMs,
      passedGate
    };
  }
}
