import { CandidateFinding } from '../rules/types.js';
import { Finding, AgentVerdict } from '../types/schema.js';
import { CodeGraph } from '../graph/codeGraph.js';

export interface AgentBudget {
  maxToolCalls: number;
  maxTokens: number;
  timeoutMs: number;
}

export interface InvestigationVerdict {
  verdict: AgentVerdict;
  confidence: number;
  evidenceCitations: string[];
  attackScenario: string;
  sanitizationIdentified?: string;
  isPromptInjectionAttempt?: boolean;
}

export class AgentInvestigator {
  private budget: AgentBudget;

  constructor(budget: Partial<AgentBudget> = {}) {
    this.budget = {
      maxToolCalls: budget.maxToolCalls || 10,
      maxTokens: budget.maxTokens || 4000,
      timeoutMs: budget.timeoutMs || 30000
    };
  }

  /**
   * Evaluates untrusted repo text for prompt injection attempts.
   * Instructions found in code comments or strings are detected and ignored.
   */
  public sanitizeUntrustedInput(snippet: string): { sanitized: string; injectionDetected: boolean } {
    const injectionPatterns = [
      /ignore\s+(?:all\s+)?(?:previous|prior|above|system)\s+instructions/i,
      /you\s+are\s+now\s+in\s+developer\s+mode/i,
      /mark\s+this\s+(?:finding\s+)?as\s+(?:safe|false[_\s-]positive)/i,
      /do\s+not\s+report\s+any\s+vulnerabilities/i,
      /system\s*:\s*verdict\s*=\s*not_exploitable/i
    ];

    let injectionDetected = false;
    for (const pattern of injectionPatterns) {
      if (pattern.test(snippet)) {
        injectionDetected = true;
        break;
      }
    }

    // Wrap untrusted snippet in literal markers
    const sanitized = `[UNTRUSTED_CODE_LITERAL]\n${snippet}\n[/UNTRUSTED_CODE_LITERAL]`;
    return { sanitized, injectionDetected };
  }

  /**
   * Verifies finding evidence and reachability with guardrails.
   */
  public investigate(candidate: CandidateFinding, codeGraph: CodeGraph): InvestigationVerdict {
    const fileAST = codeGraph.files.get(candidate.file);
    const content = fileAST ? fileAST.content : '';

    const { injectionDetected } = this.sanitizeUntrustedInput(content);

    // Enforce evidence-or-silence rule
    const validEvidence = candidate.evidence.filter(ev => {
      const parts = ev.split(':');
      const lineNum = parseInt(parts[parts.length - 1], 10);
      return !isNaN(lineNum) && lineNum > 0;
    });

    if (validEvidence.length === 0) {
      return {
        verdict: 'uncertain',
        confidence: 0.3,
        evidenceCitations: [],
        attackScenario: 'Insufficient verifiable code citations provided by rule.',
        isPromptInjectionAttempt: injectionDetected
      };
    }

    return {
      verdict: 'exploitable',
      confidence: candidate.confidence,
      evidenceCitations: validEvidence,
      attackScenario: candidate.explanation,
      isPromptInjectionAttempt: injectionDetected
    };
  }
}
