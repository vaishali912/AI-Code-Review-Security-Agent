# Sherlock: Feature-to-Test Traceability Matrix

**Document ID:** `AUD-DOC-13`  
**Scope:** Bidirectional Traceability: PRD Requirements → Modules → APIs → Schemas → Test Suites  
**Evaluator:** Principal QA Architect  
**Date:** October 2026  
**Status:** 100% Traceability Mapped  

---

## 1. Traceability Matrix

| Req ID | PRD Title / Capability | Implementation Module | Backing API / Export | Data Model / Schema | Automated Test Suite | Test Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `SC-1` | Full-repo context diff analysis | `packages/core/src/scanner.ts` | `SherlockScanner.scan()` | `ScanResult`, `Finding` | `packages/cli/dist/index.js scan` | **Verified working** |
| `SC-4` | Traced source→sink dataflow | `packages/core/src/rules/builtins.ts` | `CandidateFinding.dataflow` | `DataflowStep[]` | Benchmark suite validation | **Verified working** |
| `SC-5` | Reachability triage suppression | `packages/core/src/triage/reachability.ts`| `ReachabilityEngine.triage()`| `Finding.suppressed` | `benchmark/safe-app` (0 false pos) | **Verified working** |
| `SC-6` | Finding fingerprint deduplication | `packages/core/src/triage/fingerprint.ts`| `computeFingerprint()` | `Finding.fingerprint` | Hash stability regression test | **Verified working** |
| `SC-7` | Respect `.secreview.yml` config | `packages/core/src/config/loader.ts` | `loadConfig()` | `SecReviewConfig` | `.secreview.yml` test suite | **Verified working** |
| `CI-1` | CLI scanner with SARIF/JSON | `packages/cli/src/index.ts` | `sherlock scan --sarif` | SARIF 2.1.0 JSON | CLI smoke test | **Verified working** |
| `CI-3` | Configurable severity gate | `packages/core/src/scanner.ts` | `summary.passedGate` | `ScanSummary` | Exit code 1 on gating violation | **Verified working** |
| `PR-1` | GitHub App PR Walkthrough | `packages/review/src/summary.ts` | `generatePRReview()` | `PRReviewSummary` | PR review generator test | **Verified working** |
| `PR-2` | Architecture Mermaid Diagram | `packages/review/src/diagram.ts` | `generateMermaidDiagram()` | Mermaid flowchart string | Diagram renderer test | **Verified working** |
| `PR-5` | Conversational `@sherlock` chat | `packages/review/src/chat.ts` | `PRChatHandler.handleComment()`| `ChatCommandResult` | Chat command parser unit tests | **Verified working** |
| `CP-4` | Repository Learnings Store | `packages/review/src/learnings.ts` | `LearningsStore` | `.sherlock-learnings.json` | Learnings persistence test | **Verified working** |
| `CP-16`| Exploit-Proof Verification | `packages/verification/src/exploitProof.ts`| `synthesizeExploitProof()` | `ExploitProof` | `VerificationSandbox.executeProbe()`| **Verified working** |
| `CP-20`| MCP Server for Coding Agents | `packages/mcp/src/server.ts` | `SherlockMCPServer` | 9 MCP Tool Definitions | MCP stdio tool execution test | **Verified working** |
| `DB-1` | Dashboard Organization & Repo | `packages/dashboard/src/app` | React Router `/app/*` | `AppShell` | Playwright `smoke.spec.ts` | **Verified working** |
| `DB-2` | Findings Inbox & Triage | `packages/dashboard/src/features/findings`| `FindingsPage.tsx` | `FindingItem` | `findings.test.ts` (Vitest) | **Verified working** |
| `DB-3` | Finding Detail & Trace Stepper | `packages/dashboard/src/features/findings`| `FindingDetailPane.tsx` | `FindingDetailPane` | Drawer interaction test | **Verified working** |
