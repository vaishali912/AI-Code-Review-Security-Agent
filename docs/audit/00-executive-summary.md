# Sherlock: Executive Audit Summary & Platform Assessment

**Document ID:** `AUD-DOC-00`  
**Product:** Sherlock AI Code Review & Security Verification Platform  
**Target:** Startups & Small Dev Teams (Self-Serve SaaS)  
**Evaluator:** Principal Engineering & AppSec Architecture Review  
**Date:** October 2026  
**Status:** Baseline Complete · Execution Active  

---

## 1. Executive Assessment & Overall Maturity

Sherlock has established a differentiated foundation as a **security-first code reviewer** combining deterministic Abstract Syntax Tree (AST) analysis, reachability-based false-positive suppression, and an in-memory exploit verification sandbox. 

Unlike conventional SAST scanners that drown developers in syntactic alerts or generic AI reviewers that offer stylistic commentary without verifying exploitability, Sherlock's **three-engine architecture** (Review Engine, Security Engine, Verification Engine) and **headless Model Context Protocol (MCP) server** directly address the root complaints of engineering teams:
- **Low false-positive noise** via reachability analysis against external route entry points and sanitizer awareness.
- **Executable proof of exploitability** via automated synthesis of canary test probes that fail on vulnerable code and pass after fixes.
- **Developer-native integration** across CLI, CI status checks, MCP-compatible coding agents (Cursor, Claude Code, Windsurf), and an interactive web dashboard.

### Platform Maturity Scorecard

| Pillar | Score (1-5) | Assessment | Primary Gap |
| :--- | :---: | :--- | :--- |
| **Core SAST & Graph Engine** | **4.2 / 5** | Solid AST visitor with TypeScript Compiler API, call-site mapping, and route extraction for Express, Next.js, and Server Actions. | Inter-procedural taint propagation across deeper multi-file import chains. |
| **Reachability & Triage** | **4.4 / 5** | High-precision suppression of sanitized and hardcoded inputs (0 false positives on `benchmark/safe-app`). | Integration with LLM-assisted semantic verification for complex business logic. |
| **Verification Engine** | **4.0 / 5** | Synthesizes executable canary proofs and regression tests across OWASP Top 10 classes in an isolated in-memory runner. | Ephemeral containerized sandbox orchestration for full multi-service runtime environments. |
| **Review Engine & MCP** | **4.3 / 5** | Rich PR summary walkthroughs, Mermaid diagrams, conversational `@sherlock` chat, and 9 MCP tools for AI IDEs. | Webhook signature validation and GitHub Check Run direct status API publishing. |
| **Web Dashboard UI/UX** | **4.5 / 5** | 12 interactive routes, Dark/Light theme, Command Palette (`⌘K`), trace steppers, visual diff preview, and audit log. | End-to-end test runner configuration split between Playwright and Vitest. |
| **Reliability & CI/CD** | **3.8 / 5** | Working CLI with SARIF/JSON export and exit-code gating; automated monorepo build passes. | Vitest test runner configuration in `packages/dashboard` improperly evaluating Playwright spec files. |

---

## 2. Core Strengths & Architectural Moats

1. **Deterministic Reachability Triage (CP-24 / SC-5):**
   - Candidate vulnerabilities are verified against known route entry points (`router.get`, `router.post`, Next.js App Router `route.ts`, and `'use server'` server actions).
   - Local dataflow is inspected for 6 standard sanitizer patterns (`parseInt`, `DOMPurify.sanitize`, `validator.escape`, `encodeURIComponent`, `path.basename`, `zod.parse`) plus configurable custom sanitizers in `.secreview.yml`.
   - On the benchmark suite, `safe-app` achieved a **0% false-positive rate** with 100% of sanitized flows cleanly suppressed with verifiable triage reasons.

2. **Exploit-Proof Verification Engine (CP-16):**
   - High and Critical findings can be automatically transformed into executable probe tests using Node's native `assert/strict`.
   - Probes test the vulnerable condition before patch application and verify that the suggested diff neutralizes the attack vector.

3. **Developer-First Ergonomics & MCP Parity (CP-20):**
   - Native MCP stdio server exposes `review_diff`, `scan_file`, `scan_repo`, `list_findings`, `explain_finding`, `suggest_fix`, `generate_tests`, `run_proof`, and `get_report`.
   - Coding agents like Cursor and Claude Code can inspect findings and apply unified diffs directly during generation.

---

## 3. Critical Defects & Immediate Gaps Identified

During Phase 0 discovery and baseline testing, five critical items were identified for remediation:

1. **Test Runner Configuration Conflict (`packages/dashboard`):**
   - Vitest attempted to execute `e2e/smoke.spec.ts` (a Playwright test suite), causing a runner crash on `test.describe()`.
   - *Remediation:* Configure `packages/dashboard/vite.config.ts` or `vitest.config.ts` with explicit test inclusion (`src/**/*.test.ts`) and exclusion (`e2e/**`).

2. **Finding Identity Stability Across Invocations (SC-6):**
   - `generateFindingId()` generated random `crypto.randomBytes(8)` on each scan run. Running `sherlock proof <findingId>` in the CLI failed because the IDs changed across scans.
   - *Remediation:* Bind finding ID deterministically to the SHA-256 fingerprint (`fnd_${fingerprint.slice(0, 16)}`) or support lookup by fingerprint.

3. **CLI Proof Target Directory Alignment:**
   - `sherlock proof <id>` currently scans `process.cwd()` without propagating the optional target subfolder (such as `benchmark/vulnerable-app`).
   - *Remediation:* Accept target path in `sherlock proof <id> [path]` and check repository cache.

4. **Empty Agent Implementation Directory (`packages/core/src/agent`):**
   - The directory `packages/core/src/agent` is empty. The model tiering and prompt-injection-safe investigation agent pipeline described in PRD Section 8 must be formally defined.

5. **Monorepo Test Command Scripting:**
   - Root `package.json` test script failed to execute unit tests because workspaces lacked standard `npm run test` definitions.

---

## 4. Top Opportunities & Competitive Levers

1. **The "Verified Finding" Trust Wedge:**
   By attaching executable exploit proofs to High/Critical alerts in PR comments, Sherlock eliminates the "boy who cried wolf" syndrome endemic to legacy SAST tools.
2. **First-Class Next.js & Server Action Security:**
   Standard scanners lack awareness of Next.js App Router boundary leakage, server actions executed without session validation, and client-side authorization bypasses. Sherlock's CodeGraph natively parses these entry points.
3. **Repository Learnings as a Retention Flywheel (CP-4):**
   When a developer comments `@sherlock ignore <reason>`, the rationale is synthesized into a repository-scoped learning rule in `.sherlock-learnings.json`, preventing recurrence across future PRs.

---

## 5. Next Steps & Program Roadmap

1. **Phase 1-8 Documentation:** Complete detailed inventories and strategies across routes, functional controls, user journeys, APIs, security/privacy, UI/UX, and all 150 backlog items in `docs/audit/`.
2. **Phase 9 Implementation (Core Correctness & Reliability):**
   - Fix Vitest configuration in `packages/dashboard`.
   - Ensure deterministic finding IDs (`fnd_${fingerprint.slice(0, 16)}`).
   - Implement root and workspace test scripts.
   - Enhance CLI proof execution with target path resolution.
3. **Verification & Regression Testing:**
   - Run unit, integration, and benchmark tests to confirm zero regressions and verify all launch acceptance criteria.
