import { 
  EnhancedFindingItem, 
  AgentRun, 
  TestRun, 
  FixAttempt, 
  PolicyGate, 
  SecretItem, 
  DependencyItem, 
  SuppressionItem, 
  ReviewRule, 
  HotspotItem, 
  RecurringDefectItem, 
  AuditLogItem, 
  RiskSummary 
} from '../lib/types.js';
import { INITIAL_FINDINGS } from './mockData.js';

export const ENHANCED_FINDINGS: EnhancedFindingItem[] = INITIAL_FINDINGS.map((f, i) => {
  const sources: Array<'semgrep' | 'codeql' | 'secrets' | 'dependency' | 'ai'> = ['semgrep', 'codeql', 'ai', 'semgrep', 'codeql', 'ai'];
  const scores = [96, 98, 88, 84, 82, 79];
  const ticketLinks = [
    { provider: 'linear' as const, key: 'SEC-104', url: 'https://linear.app/sherlock/issue/SEC-104' },
    undefined,
    { provider: 'jira' as const, key: 'SEC-892', url: 'https://jira.corp.internal/browse/SEC-892' },
    undefined,
    undefined,
    undefined
  ];

  return {
    ...f,
    source: sources[i % sources.length],
    riskScore: scores[i % scores.length],
    ticket: ticketLinks[i]
  };
});

export const MOCK_AGENT_RUNS: AgentRun[] = [
  {
    id: 'run_pr_42_latest',
    prId: 'pr_42',
    steps: [
      {
        id: 'step_1',
        agent: 'repository',
        status: 'passed',
        startedAt: '10:41:02',
        durationMs: 420,
        tokens: 1240,
        summary: 'Indexed AST & built control-flow impact graph across 4 changed files and 14 dependent modules.',
        evidence: [
          { kind: 'code', ref: 'src/routes/users.ts:1-45', excerpt: 'Route handler exports registered in app.ts' },
          { kind: 'log', ref: 'indexer.log', excerpt: 'Mapped 18 downstream call sites across packages/dashboard' }
        ]
      },
      {
        id: 'step_2',
        agent: 'review',
        status: 'passed',
        startedAt: '10:41:03',
        durationMs: 650,
        tokens: 3410,
        summary: 'Analyzed logic, authorization boundaries, and concurrency guarantees in changed files.',
        evidence: [
          { kind: 'code', ref: 'src/routes/users.ts:15', excerpt: 'Missing session check on mutating DELETE endpoint' }
        ]
      },
      {
        id: 'step_3',
        agent: 'security',
        status: 'failed',
        startedAt: '10:41:04',
        durationMs: 820,
        tokens: 4120,
        summary: 'Flagged 2 Critical and 4 High vulnerabilities. Reachable unparameterized SQL sink in users.ts.',
        evidence: [
          { kind: 'code', ref: 'src/routes/users.ts:10', excerpt: 'db.query(`SELECT * FROM users WHERE id = \'${userId}\'`)' },
          { kind: 'log', ref: 'taint-tracer.log', excerpt: 'Taint confirmed from req.query.id to db.query sink' }
        ]
      },
      {
        id: 'step_4',
        agent: 'testing',
        status: 'passed',
        startedAt: '10:41:05',
        durationMs: 1140,
        tokens: 2890,
        summary: 'Synthesized 4 targeted canary unit tests. Ran 14 selected tests (saved 11 minutes).',
        evidence: [
          { kind: 'test', ref: 'tests/security/sqli.canary.test.ts', excerpt: 'Exploit probe reproduced unescaped SQL syntax payload' }
        ]
      },
      {
        id: 'step_5',
        agent: 'debugging',
        status: 'passed',
        startedAt: '10:41:06',
        durationMs: 510,
        tokens: 1800,
        summary: 'Traced failure root cause directly to commit 7c32bf1 (string interpolation in query).',
        evidence: [
          { kind: 'code', ref: 'commit 7c32bf1:src/routes/users.ts:10', excerpt: 'Replaced query builder with raw template string' }
        ]
      },
      {
        id: 'step_6',
        agent: 'fix',
        status: 'passed',
        startedAt: '10:41:07',
        durationMs: 980,
        tokens: 2200,
        summary: 'Drafted parameterized query patch in isolated branch sherlock/fix-sqli-users.',
        evidence: [
          { kind: 'code', ref: 'patch.diff', excerpt: '+ const result = await db.query(\'SELECT * FROM users WHERE id = $1\', [userId]);' }
        ]
      },
      {
        id: 'step_7',
        agent: 'verification',
        status: 'verified',
        startedAt: '10:41:08',
        durationMs: 740,
        tokens: 1400,
        summary: 'Reran canary probe against patched version in ephemeral micro-VM. All assertions passed cleanly.',
        evidence: [
          { kind: 'log', ref: 'sandbox.log', excerpt: '[PASS] Canary probe neutralized. 0 type or lint regressions.' }
        ]
      }
    ]
  }
];

export const MOCK_TEST_RUNS: TestRun[] = [
  {
    id: 'run_latest',
    planId: 'plan_pr_42',
    selected: 14,
    total: 212,
    savedMinutes: 11,
    executedAt: '10:41 AM',
    cases: [
      {
        id: 'test_sql_canary',
        title: 'SQL injection canary payload rejection in GET /users',
        description: 'Verify server handles unescaped quotes safely without executing boolean SQL injection.',
        flow: 'User input -> Query parser -> Database driver',
        risk: 'high',
        status: 'passed',
        durationMs: 48,
        retries: 0,
        reason: 'Touches changed file src/routes/users.ts and security sink',
        log: [
          'PROBE: Sending payload `1\' OR \'1\'=\'1` to GET /users?id=...',
          'ASSERTION: Checking if SQL statement parameterizes argument...',
          'RESULT: Parameterized query placeholder ($1) accepted, no syntax alteration.'
        ]
      },
      {
        id: 'test_delete_auth',
        title: 'Mutating DELETE /users/:id rejects unauthenticated request',
        description: 'Ensure session guard rejects anonymous requests with 401 Unauthorized.',
        flow: 'HTTP Request -> Auth Guard Middleware -> Route Controller',
        risk: 'high',
        status: 'failed',
        durationMs: 32,
        retries: 1,
        failingCommit: '7c32bf1',
        failingLine: 'src/routes/users.ts:15',
        reason: 'Touches changed route handler in PR #42',
        log: [
          'PROBE: DELETE /users/99 without authorization headers',
          'EXPECTED: HTTP 401 / 403',
          'RECEIVED: HTTP 200 OK (User 99 deleted)',
          'ERROR: Route handler executed without session middleware guard'
        ]
      },
      {
        id: 'test_cmd_metachar',
        title: 'Command metacharacter injection in POST /convert',
        description: 'Ensure shell metacharacters (; | & `) cannot execute arbitrary host commands.',
        flow: 'POST payload -> Exec runner -> OS subprocess',
        risk: 'high',
        status: 'passed',
        durationMs: 64,
        retries: 0,
        reason: 'Touches changed file src/routes/files.ts'
      },
      {
        id: 'test_dom_sanitization',
        title: 'DOMPurify sanitization on user profile bio HTML',
        description: 'Verify `<script>` and `onerror` inline handlers are stripped from rendered profile markup.',
        flow: 'Bio text -> DOMPurify -> React innerHTML',
        risk: 'medium',
        status: 'passed',
        durationMs: 28,
        retries: 0,
        reason: 'Touches changed file src/components/UserProfile.tsx'
      },
      {
        id: 'test_path_traversal',
        title: 'Path traversal dot-dot-slash rejection in GET /download',
        description: 'Verify path.basename prevents escaping upload folder boundary.',
        flow: 'File request -> Path resolver -> fs.readFile',
        risk: 'high',
        status: 'passed',
        durationMs: 38,
        retries: 0,
        reason: 'Touches changed file src/routes/files.ts'
      },
      {
        id: 'test_flaky_session',
        title: 'Redis session cache TTL expiry race condition',
        description: 'Simulate high-concurrency token validation with 200ms latency injected.',
        flow: 'Session middleware -> Redis cluster pool',
        risk: 'medium',
        status: 'blocked',
        durationMs: 180,
        retries: 3,
        reason: 'Previously flaky test (pass rate: 68%)'
      }
    ]
  }
];

export const MOCK_FIX_ATTEMPTS: FixAttempt[] = [
  {
    id: 'fix_sqli_01',
    findingId: 'fnd_sqli_users_01',
    title: 'Replace raw string query concatenation with parameterized $1 placeholder',
    branch: 'sherlock/fix-fnd-sqli-01',
    attempt: 2,
    maxAttempts: 3,
    status: 'verified',
    rootCause: 'Developer used ES6 template string interpolation (${userId}) instead of database query parameters array.',
    reproSteps: [
      'Send GET /users?id=1\'%20OR%20\'1\'=\'1',
      'Observe entire users table dump in response without auth check',
      'Execute canary assertion: unparameterized query accepted payload'
    ],
    diff: `--- a/src/routes/users.ts\n+++ b/src/routes/users.ts\n@@ -10,1 +10,1 @@\n-const result = await db.query(\`SELECT * FROM users WHERE id = '\${userId}'\`);\n+const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);`,
    before: {
      'TypeScript Compilation': 'passed',
      'ESLint Static Rules': 'passed',
      'SQLi Exploit Canary Probe': 'failed',
      'Regression Test Suite': 'passed'
    },
    after: {
      'TypeScript Compilation': 'passed',
      'ESLint Static Rules': 'passed',
      'SQLi Exploit Canary Probe': 'passed',
      'Regression Test Suite': 'passed'
    }
  },
  {
    id: 'fix_authz_02',
    findingId: 'fnd_authz_delete_03',
    title: 'Attach requireAuth middleware guard to DELETE /users/:id',
    branch: 'sherlock/fix-authz-delete-03',
    attempt: 1,
    maxAttempts: 3,
    status: 'needs_approval',
    rootCause: 'Route declared without middleware pipeline in Express Router chain.',
    reproSteps: [
      'Issue unauthenticated DELETE request to /users/42',
      'Verify status code is 200 rather than 401'
    ],
    diff: `--- a/src/routes/users.ts\n+++ b/src/routes/users.ts\n@@ -15,1 +15,1 @@\n-router.delete('/users/:id', async (req, res) => {\n+router.delete('/users/:id', requireAuth, async (req, res) => {`,
    before: {
      'TypeScript Compilation': 'passed',
      'Auth Check Canary Probe': 'failed'
    },
    after: {
      'TypeScript Compilation': 'passed',
      'Auth Check Canary Probe': 'passed'
    }
  }
];

export const MOCK_SECRETS: SecretItem[] = [
  {
    id: 'sec_01',
    name: 'GitHub Personal Access Token',
    maskedValue: 'ghp_••••••••••••••••••••••••••••••••••••',
    file: 'src/config/github.ts',
    line: 8,
    commit: '7c32bf1',
    validityStatus: 'active',
    rotationChecklist: [
      { task: 'Revoke compromised token on GitHub Developer Settings', completed: false },
      { task: 'Rotate secret in AWS Secrets Manager / GitHub Actions secrets', completed: false },
      { task: 'Re-run Sherlock secrets scanner to confirm commit purge', completed: false }
    ]
  },
  {
    id: 'sec_02',
    name: 'AWS S3 Access Key ID',
    maskedValue: 'AKIA••••••••••••••••',
    file: 'infra/storage.env.example',
    line: 3,
    commit: 'b94e102',
    validityStatus: 'revoked',
    rotationChecklist: [
      { task: 'Revoke AWS IAM credential', completed: true },
      { task: 'Verify CloudTrail access logs for unauthorized reads', completed: true }
    ]
  }
];

export const MOCK_DEPENDENCIES: DependencyItem[] = [
  {
    id: 'dep_01',
    package: 'axios',
    currentVersion: '0.21.1',
    fixedVersion: '1.7.4',
    advisory: 'Server-Side Request Forgery (SSRF) bypass in follow-redirects',
    cve: 'CVE-2023-45857',
    severity: 'high',
    reachable: true,
    maliciousPackage: false,
    upgradeDiff: `--- a/package.json\n+++ b/package.json\n@@ -24,1 +24,1 @@\n-    "axios": "0.21.1"\n+    "axios": "^1.7.4"`
  },
  {
    id: 'dep_02',
    package: 'lodash',
    currentVersion: '4.17.15',
    fixedVersion: '4.17.21',
    advisory: 'Prototype pollution via lodash.template and merge',
    cve: 'CVE-2021-23337',
    severity: 'critical',
    reachable: true,
    maliciousPackage: false,
    upgradeDiff: `--- a/package.json\n+++ b/package.json\n@@ -28,1 +28,1 @@\n-    "lodash": "4.17.15"\n+    "lodash": "^4.17.21"`
  },
  {
    id: 'dep_03',
    package: 'event-stream',
    currentVersion: '3.3.6',
    fixedVersion: 'Removed',
    advisory: 'Malicious flatmap-stream crypto-stealing dependency injected',
    cve: 'MAL-2018-001',
    severity: 'critical',
    reachable: false,
    maliciousPackage: true,
    upgradeDiff: `--- a/package.json\n+++ b/package.json\n@@ -32,1 +32,0 @@\n-    "event-stream": "3.3.6"`
  }
];

export const MOCK_POLICY_GATES: PolicyGate[] = [
  {
    id: 'gate_1',
    condition: 'New critical vulnerabilities == 0',
    threshold: 0,
    scope: 'new_code',
    result: 'fail',
    currentValue: '2 Critical'
  },
  {
    id: 'gate_2',
    condition: 'New code test coverage >= 80%',
    threshold: 80,
    scope: 'new_code',
    result: 'pass',
    currentValue: '86.4%'
  },
  {
    id: 'gate_3',
    condition: 'Unreviewed hardcoded secrets == 0',
    threshold: 0,
    scope: 'all',
    result: 'fail',
    currentValue: '1 Active Secret'
  },
  {
    id: 'gate_4',
    condition: 'Direct reachable supply-chain vulnerabilities == 0',
    threshold: 0,
    scope: 'all',
    result: 'fail',
    currentValue: '2 Reachable'
  }
];

export const MOCK_SUPPRESSIONS: SuppressionItem[] = [
  {
    id: 'sup_01',
    findingId: 'fnd_xss_userbio_04',
    target: 'src/components/UserProfile.tsx',
    reason: 'Upstream gateway sanitizes HTML before forwarding to API layer',
    author: 'saurabh@sherlock.dev',
    createdAt: '2026-10-18',
    expiresAt: '2026-11-18',
    daysRemaining: 27
  },
  {
    id: 'sup_02',
    target: 'benchmark/vulnerable-app/**',
    reason: 'Intentional synthetic test fixtures for SAST evaluation',
    author: 'security-lead@sherlock.dev',
    createdAt: '2026-09-10',
    expiresAt: '2026-10-25',
    daysRemaining: 3
  }
];

export const MOCK_REVIEW_RULES: ReviewRule[] = [
  {
    id: 'rule_01',
    pathGlob: 'src/routes/**',
    instruction: 'All mutating routes (POST/PUT/DELETE) must declare requireAuth middleware.',
    severityFloor: 'high',
    matchingFilesCount: 8
  },
  {
    id: 'rule_02',
    pathGlob: 'src/db/**',
    instruction: 'Direct string interpolation in SQL queries is forbidden; use parameter arrays ($1, $2).',
    severityFloor: 'critical',
    matchingFilesCount: 4
  },
  {
    id: 'rule_03',
    pathGlob: 'src/components/**',
    instruction: 'Usage of dangerouslySetInnerHTML requires accompanying DOMPurify.sanitize call.',
    severityFloor: 'medium',
    matchingFilesCount: 12
  }
];

export const MOCK_HOTSPOTS: HotspotItem[] = [
  { directory: 'src/routes', changeFrequency: 92, healthScore: 48, linesOfCode: 1420, defectsCount: 14 },
  { directory: 'src/auth', changeFrequency: 76, healthScore: 62, linesOfCode: 890, defectsCount: 6 },
  { directory: 'src/db', changeFrequency: 68, healthScore: 54, linesOfCode: 640, defectsCount: 8 },
  { directory: 'src/components', changeFrequency: 84, healthScore: 82, linesOfCode: 3200, defectsCount: 4 },
  { directory: 'src/utils', changeFrequency: 34, healthScore: 94, linesOfCode: 520, defectsCount: 1 },
  { directory: 'src/config', changeFrequency: 42, healthScore: 78, linesOfCode: 340, defectsCount: 2 }
];

export const MOCK_RECURRING_DEFECTS: RecurringDefectItem[] = [
  {
    id: 'rec_01',
    pattern: 'Unparameterized template query in database adapter',
    cwe: 'CWE-89',
    occurrences: 5,
    affectedFiles: ['src/routes/users.ts', 'src/routes/orders.ts', 'src/routes/search.ts'],
    suggestedRule: 'Enforce pg-promise parameterized queries across all *.ts route handlers'
  },
  {
    id: 'rec_02',
    pattern: 'Unescaped child_process shell execution',
    cwe: 'CWE-78',
    occurrences: 3,
    affectedFiles: ['src/routes/files.ts', 'src/utils/converter.ts'],
    suggestedRule: 'Disallow child_process.exec; require execFile with argument arrays'
  }
];

export const MOCK_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'aud_01',
    timestamp: '2026-10-22 10:41:20',
    actor: 'sherlock-agent (ai-review)',
    action: 'Ran sandbox exploit proof on fnd_sqli_users_01',
    target: 'src/routes/users.ts:10',
    ip: '10.0.4.12',
    status: 'success'
  },
  {
    id: 'aud_02',
    timestamp: '2026-10-22 10:39:14',
    actor: 'saurabh@sherlock.dev',
    action: 'Updated policy gate: gate_1',
    target: '.secreview.yml',
    ip: '192.168.1.28',
    status: 'success'
  },
  {
    id: 'aud_03',
    timestamp: '2026-10-22 09:12:05',
    actor: 'github-bot',
    action: 'CI Gate status evaluated: BLOCKING',
    target: 'PR #42',
    ip: '140.82.112.4',
    status: 'blocked'
  }
];

export const MOCK_RISK_REPOS: RiskSummary[] = [
  { repo: 'sherlock-monorepo', score: 86, critical: 2, reachable: 6, hotspots: ['src/routes', 'src/db'] },
  { repo: 'customer-portal-api', score: 72, critical: 1, reachable: 3, hotspots: ['controllers/auth'] },
  { repo: 'payment-gateway-service', score: 28, critical: 0, reachable: 0, hotspots: ['lib/vault'] }
];
