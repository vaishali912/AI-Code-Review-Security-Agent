# Sherlock: API Contracts, Database Schema & Integration Audit

**Document ID:** `AUD-DOC-05`  
**Scope:** HTTP APIs, Middleware Endpoints, State Stores, Integration Interfaces  
**Evaluator:** Principal Backend & Infrastructure Architect  
**Date:** October 2026  
**Status:** Architecture Audited & Validated  

---

## 1. API Catalogue & Endpoint Mapping

The web dashboard and CLI interface with the following backend and embedded API endpoints:

| Endpoint | Method | Caller | Handler | Payload / Contract | Error Handling | Status |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| `/api/status` | `GET` | Dashboard `AppTopBar.tsx` | `vite.config.ts:21` (Vite middleware) | Returns `{ status: 'online', version: '1.0.0', engines: [...], activePort: 3000 }` | Fallback to offline status badge on network timeout | **Verified working** |
| `/api/scan` | `GET` / `POST` | Dashboard `ScanPage.tsx` | `vite.config.ts:32` (Vite middleware) | Query: `{ target?: string }`. Dynamic import of `@sherlock/core/dist/index.js`, invokes `scanner.scan()`. Returns `ScanResult`. | Returns HTTP 500 `{ error: err.message }` | **Verified working** |
| `stdio://mcp` | `JSON-RPC` | Coding Agents (Cursor, Claude Code) | `packages/mcp/src/server.ts:130` | 9 MCP Tools: `review_diff`, `scan_file`, `scan_repo`, `list_findings`, `explain_finding`, `suggest_fix`, `generate_tests`, `run_proof`, `get_report`. | Returns JSON-RPC standard error objects with code -32603 | **Verified working** |
| CLI commands | CLI stdin/out | Developers, CI Pipelines | `packages/cli/src/index.ts:36` | Commands: `scan [dir]`, `proof <id>`, `test [dir]`, `review [dir]`, `mcp`, `init`. | Standard exit codes (0 = pass, 1 = gate fail/error) | **Verified working** |

---

## 2. Persistence Model & Schema Audit

Sherlock persists data across two tiers: local configuration/learnings stores and high-concurrency relational models designed for PostgreSQL:

### 2.1 File-Based Repository State (v1 / v1.x)

1. **`.secreview.yml` (Repository Security Policy):**
   ```yaml
   version: "1.0"
   ignorePaths: [ "**/node_modules/**", "**/dist/**", "**/.next/**", "**/*.test.ts" ]
   gate:
     failOnSeverity: "high"
     blockOnNewOnly: true
     maxFindings: 10
   review:
     commentCap: 10
     showMermaidDiagrams: true
     enabledLanes: ["security", "bug", "quality", "performance", "tests"]
     suppressLowConfidence: true
   verification:
     exploitProofEnabled: true
     sandboxTimeoutSeconds: 120
   customSanitizers:
     - name: "safeQueryParam"
       cwe: ["CWE-89"]
   ```

2. **`.sherlock-learnings.json` (Learnings & False-Positive Memory Store):**
   ```json
   [
     {
       "id": "lrn_m1k72a",
       "scope": "repo",
       "targetPath": "src/routes/users.ts",
       "feedbackText": "sanitized in database gateway",
       "synthesizedRule": "Learned constraint: developer clarified that sanitized in database gateway",
       "associatedRuleId": "sherlock.sqli.unparameterized",
       "createdAt": "2026-10-24T10:14:02.000Z",
       "author": "lead-dev"
     }
   ]
   ```

### 2.2 Relational Production Schema (PostgreSQL SaaS Specification)

```sql
-- Organizations & Tenancy
CREATE TABLE organizations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'team',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connected Repositories
CREATE TABLE repositories (
    id VARCHAR(36) PRIMARY KEY,
    org_id VARCHAR(36) REFERENCES organizations(id) ON DELETE CASCADE,
    github_repo_id BIGINT UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    default_branch VARCHAR(100) DEFAULT 'main',
    policy_config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_repos_org_id ON repositories(org_id);

-- Finding Fingerprints & Identities (Deduplication across runs)
CREATE TABLE findings (
    id VARCHAR(36) PRIMARY KEY,
    repo_id VARCHAR(36) REFERENCES repositories(id) ON DELETE CASCADE,
    fingerprint CHAR(32) NOT NULL, -- SHA-256(ruleId + normalized_sink + route)
    rule_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    cwe TEXT[] NOT NULL,
    owasp VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'open',
    confidence NUMERIC(3,2) NOT NULL,
    location JSONB NOT NULL,
    dataflow JSONB NOT NULL,
    fix JSONB NOT NULL,
    proof JSONB,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(repo_id, fingerprint)
);
CREATE INDEX idx_findings_repo_status ON findings(repo_id, status);
CREATE INDEX idx_findings_fingerprint ON findings(fingerprint);

-- Triage Audit & Feedback Log
CREATE TABLE triage_actions (
    id VARCHAR(36) PRIMARY KEY,
    finding_id VARCHAR(36) REFERENCES findings(id) ON DELETE CASCADE,
    actor VARCHAR(255) NOT NULL,
    previous_status VARCHAR(30) NOT NULL,
    new_status VARCHAR(30) NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 3. Reliability, Idempotency & Failure Handling

1. **Scan Idempotency:**
   Scanning the identical commit SHA produces identical finding fingerprints, ensuring status check consistency and zero comment spam across re-runs.
2. **Fail-Open Default:**
   If a network partition or LLM gateway timeout occurs during PR review, the check run emits a `neutral` status notice rather than arbitrarily blocking developer merges unless the repository explicitly opted into hard-blocking mode.
3. **Sandbox Timeouts & Resource Caps:**
   Canary exploit probes are capped at 120 seconds execution time and restricted to in-memory evaluation with child process execution disabled for untrusted input.
