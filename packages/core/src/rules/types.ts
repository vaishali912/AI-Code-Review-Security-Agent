import * as ts from 'typescript';
import { Severity, ReviewLane, DataflowStep } from '../types/schema.js';
import { FileAST, CodeGraph } from '../graph/codeGraph.js';

export interface CandidateFinding {
  ruleId: string;
  title: string;
  cwe: string[];
  owasp: string;
  severity: Severity;
  lane: ReviewLane;
  file: string;
  startLine: number;
  endLine: number;
  dataflow: DataflowStep[];
  sinkSnippet: string;
  sourceSnippet?: string;
  explanation: string;
  evidence: string[];
  suggestedPatch: string;
  fixDescription: string;
  exposure: 'internet-facing' | 'internal' | 'authenticated';
  confidence: number;
  sanitizerDetected?: string;
}

export interface SecurityRule {
  id: string;
  title: string;
  cwe: string[];
  owasp: string;
  defaultSeverity?: Severity;
  severity?: Severity;
  lane: ReviewLane;
  description: string;
  check: (fileAST: FileAST, codeGraph: CodeGraph) => CandidateFinding[];
}
