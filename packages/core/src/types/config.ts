import { Severity, ReviewLane } from './schema.js';

export interface CustomSanitizer {
  name: string;
  cwe: string[];
  sanitizes: ('string' | 'number' | 'object' | 'all')[];
}

export interface CustomRule {
  id: string;
  name: string;
  description: string;
  cwe?: string;
  severity: Severity;
  lane?: ReviewLane;
  prompt?: string;
  pattern?: string;
  goodExample?: string;
  badExample?: string;
}

export interface GatePolicy {
  failOnSeverity?: Severity;
  blockOnNewOnly?: boolean;
  maxFindings?: number;
}

export interface SecReviewConfig {
  version?: string;
  ignorePaths?: string[];
  severityOverrides?: Record<string, Severity>;
  customSanitizers?: CustomSanitizer[];
  customRules?: CustomRule[];
  gate?: GatePolicy;
  review?: {
    commentCap?: number;
    showMermaidDiagrams?: boolean;
    enabledLanes?: ReviewLane[];
    suppressLowConfidence?: boolean;
  };
  verification?: {
    exploitProofEnabled?: boolean;
    sandboxTimeoutSeconds?: number;
  };
}
