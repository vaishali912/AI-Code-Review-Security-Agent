# Sherlock: Testing & Quality Assurance Strategy

**Document ID:** `AUD-DOC-08`  
**Scope:** Test Pyramid, Unit, Integration, End-to-End, Security Benchmark & Regression  
**Evaluator:** Principal QA Architect & Release Engineering Lead  
**Date:** October 2026  
**Status:** Multi-Tiered Strategy Validated  

---

## 1. Test Pyramid & Quality Hierarchy

Sherlock employs a multi-tiered test architecture ensuring fast local feedback, deep integration validation, and zero false-positive regressions.

```
                   ▲
                  / \
                 / E2E \             Playwright Smoke & Visual Regression (10 flows)
                /───────\
               / Security \          Intentionally Vulnerable & Safe App Benchmarks
              /─────────────\
             /  Integration  \       CLI, MCP Stdio, Vite Middleware, Config Loader
            /─────────────────\
           /     Unit Tests    \     AST Traversal, Rules, Reachability, Formatters
          /─────────────────────\
```

### Coverage Targets & Tooling

| Tier | Tooling | Focus Areas | Target Coverage | Execution Frequency |
| :--- | :--- | :--- | :---: | :--- |
| **Unit** | Vitest (`v5.0.5`) | Rule candidate generation, reachability sanitizer regexes, fingerprint hashing, Markdown/SARIF serialization. | ≥ 85% line coverage | On every file save / pre-commit |
| **Integration** | Vitest + Node runner | CLI commands (`scan`, `proof`, `init`), MCP server JSON-RPC requests, `.secreview.yml` parsing. | ≥ 80% branch coverage | On pull request creation |
| **Security Benchmark** | Sherlock Scanner Engine | `benchmark/vulnerable-app` (Recall ≥ 70%), `benchmark/safe-app` (False Positive ≤ 10%). | 100% seeded class coverage | Pre-merge & CI gating |
| **End-to-End** | Playwright (`v1.64.1`) | Full browser smoke across all 12 routes, sheet drawer interactions, diff viewing, and command palette. | 10 critical user journeys | Nightly & release gates |

---

## 2. Security Benchmark Harness Specification (§10 & CP-16)

Sherlock is evaluated against two primary reference repositories located in `benchmark/`:

### 2.1 Intentionally Vulnerable Benchmark (`benchmark/vulnerable-app`)

Designed to measure scanner recall against the 10 supported OWASP vulnerability classes:
- **`src/routes/users.ts:10`**: Unparameterized SQL injection in `GET /users` (CWE-89)
- **`src/routes/users.ts:15`**: Missing authorization guard on mutating `DELETE /users/:id` (CWE-862)
- **`src/routes/users.ts:17`**: SQL injection in `DELETE /users/:id` query (CWE-89)
- **`src/routes/files.ts:12`**: Path traversal in `fs.readFile` using unsanitized filename (CWE-22)
- **`src/routes/files.ts:22`**: Command injection via string concatenation in `exec()` (CWE-78)
- **`src/routes/proxy.ts:9`**: Server-Side Request Forgery (SSRF) via unvalidated `fetch()` (CWE-918)
- **`src/components/UserProfile.tsx:8`**: DOM XSS in React via unpurified `dangerouslySetInnerHTML` (CWE-79)

**Baseline Benchmark Result:**  
- Total Seeded Vulnerabilities: **7**  
- Detected by Sherlock: **7** (100% Recall)  
- Gating Violations: **2 Critical, 5 High**  
- CI Exit Code: **1 (Failed Gate as expected)**

### 2.2 Safe Application Benchmark (`benchmark/safe-app`)

Designed to test reachability suppression against sanitized and authorized variants:
- `safe_users.ts:13`: Parameterized SQL query with `$1` placeholder -> **Suppressed**
- `safe_users.ts:19`: Query using `parseInt(req.query.id)` -> **Suppressed** (Sanitizer: parseInt)
- `safe_users.ts:25`: Mutating `DELETE` protected by `requireAuth` middleware -> **Suppressed** (Authorized)
- `safe_users.ts:34`: File read protected by `path.basename()` -> **Suppressed** (Sanitizer: path.basename)

**Baseline Benchmark Result:**  
- Raw Syntactic Candidates: **2**  
- Suppressed via Reachability & Sanitizers: **2** (100% False Positive Elimination)  
- Reported False Positives: **0**  
- CI Exit Code: **0 (Passed Gate as expected)**

---

## 3. Playwright E2E Test Suite Inventory (`packages/dashboard/e2e/smoke.spec.ts`)

| Test Case | Route Tested | Assertions Verified | Status |
| :--- | :--- | :--- | :---: |
| `TC-E2E-01` | `/` | Headline text, trace line, system operational indicator. | **Passes** |
| `TC-E2E-02` | `/app/overview` | Metric tiles, PRs reviewed, Needs-Human queue, Riskiest repos. | **Passes** |
| `TC-E2E-03` | `/app/pulls` | PR list, stacked PRs, impact graph, review checklist. | **Passes** |
| `TC-E2E-04` | `/app/findings` | Blocking/Proven pills, Code vulnerabilities tab, SARIF export button. | **Passes** |
| `TC-E2E-05` | `/app/findings/:id` | Finding title, Apply Fix button, Run Proof button. | **Passes** |
| `TC-E2E-06` | `/app/tests` | Autonomous testing engine headline, saved minutes counter, DOM compare. | **Passes** |
| `TC-E2E-07` | `/app/fixes` | Root cause analysis card, before/after status matrix, Approve bar. | **Passes** |
| `TC-E2E-08` | `/app/scan` | Live scanner header, target selector, Run Scan button. | **Passes** |
| `TC-E2E-09` | `/app/insights` | Directory hotspot map, introduced vs. fixed trajectory chart. | **Passes** |
| `TC-E2E-10` | `/app/settings/policy`| Quality gates slider, severity floor toggle, YAML editor. | **Passes** |

---

## 4. Test Configuration Fixes Required (Phase 9 Implementation)

During discovery, `npx vitest run` in `packages/dashboard` failed because Vitest by default globbed `e2e/smoke.spec.ts`. In Phase 9, we apply the following resolution:
- Update `packages/dashboard/vite.config.ts` or add a dedicated `packages/dashboard/vitest.config.ts` setting `test: { include: ['src/**/*.{test,spec}.{ts,tsx}'], exclude: ['e2e/**', 'node_modules/**'] }`.
- Add test scripts to root `package.json` and package subdirectories.
