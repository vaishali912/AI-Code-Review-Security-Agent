import { FindingItem } from '../data/mockData.js';

export type RunStatus = 'queued' | 'running' | 'passed' | 'failed' | 'blocked' | 'verified' | 'needs_approval';

export interface Evidence {
  kind: 'code' | 'log' | 'screenshot' | 'test';
  ref: string;
  excerpt?: string;
}

export type AgentRole = 'repository' | 'review' | 'security' | 'testing' | 'debugging' | 'fix' | 'verification';

export interface AgentStep {
  id: string;
  agent: AgentRole;
  status: RunStatus;
  startedAt: string;
  durationMs: number;
  tokens?: number;
  evidence: Evidence[];
  summary?: string;
}

export interface AgentRun {
  id: string;
  prId?: string;
  steps: AgentStep[];
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  flow: string;
  risk: 'low' | 'medium' | 'high';
  status: RunStatus;
  durationMs?: number;
  retries: number;
  reason?: string;
  failingCommit?: string;
  failingLine?: string;
  log?: string[];
  screenshotBefore?: string;
  screenshotAfter?: string;
}

export interface TestRun {
  id: string;
  planId: string;
  cases: TestCase[];
  selected: number;
  total: number;
  savedMinutes?: number;
  executedAt: string;
}

export interface FixAttempt {
  id: string;
  findingId: string;
  title: string;
  branch: string;
  attempt: number;
  maxAttempts: number;
  status: RunStatus;
  diff: string;
  rootCause: string;
  reproSteps: string[];
  before: Record<string, RunStatus>;
  after: Record<string, RunStatus>;
  failureReason?: string;
}

export interface PolicyGate {
  id: string;
  condition: string;
  threshold: number;
  scope: 'new_code' | 'all';
  result: 'pass' | 'fail' | 'warn';
  currentValue?: string | number;
}

export interface TicketLink {
  provider: 'linear' | 'jira';
  key: string;
  url: string;
}

export interface RiskSummary {
  repo: string;
  score: number;
  critical: number;
  reachable: number;
  hotspots: string[];
}

export interface SecretItem {
  id: string;
  name: string;
  maskedValue: string; // First 4 chars only (e.g. ghp_••••••••••••)
  file: string;
  line: number;
  commit: string;
  validityStatus: 'active' | 'revoked' | 'unknown';
  rotationChecklist: Array<{ task: string; completed: boolean }>;
}

export interface DependencyItem {
  id: string;
  package: string;
  currentVersion: string;
  fixedVersion: string;
  advisory: string;
  cve: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  reachable: boolean;
  maliciousPackage: boolean;
  upgradeDiff: string;
}

export interface SuppressionItem {
  id: string;
  findingId?: string;
  target: string;
  reason: string;
  author: string;
  createdAt: string;
  expiresAt: string;
  daysRemaining: number;
}

export interface ReviewRule {
  id: string;
  pathGlob: string;
  instruction: string;
  severityFloor: 'critical' | 'high' | 'medium' | 'low';
  matchingFilesCount?: number;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
  status: 'success' | 'blocked';
}

export interface HotspotItem {
  directory: string;
  changeFrequency: number; // e.g. 1-100
  healthScore: number;     // 0-100 (higher is healthier)
  linesOfCode: number;
  defectsCount: number;
}

export interface RecurringDefectItem {
  id: string;
  pattern: string;
  cwe: string;
  occurrences: number;
  affectedFiles: string[];
  suggestedRule: string;
}

export type FindingSource = 'semgrep' | 'codeql' | 'secrets' | 'dependency' | 'ai';

export interface EnhancedFindingItem extends FindingItem {
  source?: FindingSource;
  riskScore?: number; // 0 - 100
  ticket?: TicketLink;
  suppression?: SuppressionItem;
}
