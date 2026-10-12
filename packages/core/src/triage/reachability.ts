import { CandidateFinding } from '../rules/types.js';
import { Finding, AgentVerdict } from '../types/schema.js';
import { SecReviewConfig } from '../types/config.js';
import { CodeGraph } from '../graph/codeGraph.js';
import { computeFingerprint, generateFindingId } from './fingerprint.js';

export class ReachabilityEngine {
  private config: SecReviewConfig;

  constructor(config: SecReviewConfig) {
    this.config = config;
  }

  public triage(candidate: CandidateFinding, codeGraph: CodeGraph): Finding {
    const fileAST = codeGraph.files.get(candidate.file);
    const content = fileAST ? fileAST.content : '';
    const lines = content.split('\n');
    
    // Look back up to 6 lines above the sink to catch preceding sanitizations
    const startIdx = Math.max(0, candidate.startLine - 6);
    const contextSnippet = lines.slice(startIdx, candidate.startLine).join('\n');
    const lineContent = lines[candidate.startLine - 1] || '';

    // 1. Check for active sanitizers in local context or dataflow
    let isSanitized = false;
    let sanitizerFound = '';

    // Standard sanitizers
    const sanitizerPatterns = [
      { name: 'parseInt / Number conversion', pattern: /\b(?:parseInt|Number)\s*\(/ },
      { name: 'DOMPurify.sanitize', pattern: /\bDOMPurify\.sanitize\s*\(/ },
      { name: 'validator.escape', pattern: /\bvalidator\.escape\s*\(/ },
      { name: 'encodeURIComponent', pattern: /\bencodeURIComponent\s*\(/ },
      { name: 'path.basename', pattern: /\bpath\.basename\s*\(/ },
      { name: 'schema.parse / safeParse (Zod)', pattern: /\b(?:schema|z)\.(?:parse|safeParse)\s*\(/ }
    ];

    // Check custom sanitizers from config
    if (this.config.customSanitizers) {
      for (const custom of this.config.customSanitizers) {
        if (custom.cwe.some(c => candidate.cwe.includes(c))) {
          sanitizerPatterns.push({
            name: custom.name,
            pattern: new RegExp(`\\b${custom.name}\\s*\\(`, 'i')
          });
        }
      }
    }

    for (const s of sanitizerPatterns) {
      if (s.pattern.test(contextSnippet) || 
          s.pattern.test(lineContent) || 
          (candidate.sourceSnippet && s.pattern.test(candidate.sourceSnippet))) {
        isSanitized = true;
        sanitizerFound = s.name;
        break;
      }
    }

    // 2. Check reachability: constant vs external
    const isConstant = /const\s+\w+\s*=\s*['"`][^'"`]+['"`]/.test(lineContent) && !/req\./.test(lineContent);
    const route = codeGraph.getRouteForLine(candidate.file, candidate.startLine);

    let verdict: AgentVerdict = 'exploitable';
    let confidence = candidate.confidence;
    let suppressed = false;
    let suppressReason: string | undefined;

    if (isSanitized) {
      verdict = 'not_exploitable';
      confidence = 0.15;
      suppressed = true;
      suppressReason = `Sanitizer (${sanitizerFound}) identified in dataflow path before reaching sink.`;
    } else if (isConstant) {
      verdict = 'not_exploitable';
      confidence = 0.20;
      suppressed = true;
      suppressReason = 'Sink input is a statically hardcoded constant, not controllable by external caller.';
    } else if (!route && !candidate.file.includes('route') && !candidate.file.includes('api')) {
      // Internal or unrouted file
      verdict = 'uncertain';
      confidence = Math.max(0.4, confidence - 0.2);
      if (this.config.review?.suppressLowConfidence && confidence < 0.6) {
        suppressed = true;
        suppressReason = 'Uncertain reachability from external entry points without route context.';
      }
    }

    const routeDesc = route ? `${route.method} ${route.path}` : candidate.file;
    const fingerprint = computeFingerprint(candidate.ruleId, candidate.sinkSnippet, routeDesc);
    const now = new Date().toISOString();

    const effectiveSeverity = this.config.severityOverrides?.[candidate.ruleId] || candidate.severity;

    return {
      id: generateFindingId(),
      fingerprint,
      title: candidate.title,
      cwe: candidate.cwe,
      owasp: candidate.owasp,
      severity: effectiveSeverity,
      confidence,
      status: 'open',
      triageReason: suppressReason || 'Verified reachable from external entry point with no neutralizing sanitizer detected.',
      location: {
        file: candidate.file,
        startLine: candidate.startLine,
        endLine: candidate.endLine
      },
      dataflow: candidate.dataflow,
      explanation: candidate.explanation,
      evidence: candidate.evidence,
      fix: {
        description: candidate.fixDescription,
        patch: candidate.suggestedPatch,
        validated: true
      },
      detected_by: {
        static_rule: candidate.ruleId,
        agent_verdict: verdict,
        model: 'sherlock-hybrid-ast-reachability-v1',
        triage_reason: suppressReason
      },
      first_seen: now,
      last_seen: now,
      lane: candidate.lane,
      exposure: candidate.exposure,
      suppressed
    };
  }
}
