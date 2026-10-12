export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type TriageStatus = 'open' | 'fixed' | 'accepted_risk' | 'false_positive';

export type AgentVerdict = 'exploitable' | 'not_exploitable' | 'uncertain';

export type ReviewLane = 'security' | 'bug' | 'quality' | 'performance' | 'tests';

export interface DataflowStep {
  role: 'source' | 'propagator' | 'sink';
  file: string;
  line: number;
  column?: number;
  snippet?: string;
  description?: string;
}

export interface FindingLocation {
  file: string;
  startLine: number;
  endLine: number;
  column?: number;
}

export interface FixSuggestion {
  description: string;
  patch: string; // Unified diff format
  validated: boolean;
  explanation?: string;
}

export interface DetectedBy {
  static_rule: string;
  agent_verdict: AgentVerdict;
  model?: string;
  triage_reason?: string;
}

export interface ExploitProof {
  status: 'proven' | 'unproven' | 'failed';
  badge: 'exploit-verified' | 'unproven' | 'simulation-passed';
  testCode: string;
  testFramework: 'jest' | 'vitest' | 'supertest' | 'node-test';
  executionOutput?: string;
  durationMs?: number;
  verifiedAt?: string;
}

export interface Finding {
  id: string;
  fingerprint: string;
  title: string;
  cwe: string[];
  owasp: string;
  severity: Severity;
  confidence: number;
  status: TriageStatus;
  triageReason?: string;
  location: FindingLocation;
  dataflow: DataflowStep[];
  explanation: string;
  evidence: string[];
  fix: FixSuggestion;
  detected_by: DetectedBy;
  introduced_in?: string;
  first_seen: string;
  last_seen: string;
  lane: ReviewLane;
  proof?: ExploitProof;
  exposure?: 'internet-facing' | 'internal' | 'authenticated';
  suppressed?: boolean;
}

export interface ScanSummary {
  repoPath: string;
  scannedFiles: number;
  totalFindings: number;
  findingsBySeverity: Record<Severity, number>;
  findingsByLane: Record<ReviewLane, number>;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  suppressedCount: number;
  durationMs: number;
  passedGate: boolean;
}

export interface ScanResult {
  summary: ScanSummary;
  findings: Finding[];
  suppressedFindings: Finding[];
}
