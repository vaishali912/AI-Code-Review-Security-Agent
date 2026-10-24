# Sherlock: Implementation & Verification Log

**Document ID:** `AUD-DOC-11`  
**Scope:** Chronological Audit of Code Modifications, Regressions, and Verification Checks  
**Evaluator:** Principal Release Engineer  
**Date:** October 2026  
**Status:** Active Execution Tracking  

---

## 1. Change Log Registry

| Change ID | Target Files | Objective / Rationale | Before State | After State | Test Strategy & Result | Rollback Plan |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CHG-001` | `packages/dashboard/vite.config.ts`, `packages/dashboard/package.json` | Fix Vitest test runner crashing on Playwright `e2e/smoke.spec.ts`. | `vitest run` scanned all `*.spec.ts` files, crashing on `test.describe()`. | Configured Vitest `test: { include: ['src/**/*.{test,spec}.{ts,tsx}'], exclude: ['e2e/**'] }`. Added `"test": "vitest run"` to package scripts. | Ran `npm run test` in `packages/dashboard`. 5 tests passed cleanly in 7ms. | Revert `vite.config.ts` edit. |
| `CHG-002` | `packages/core/src/triage/fingerprint.ts`, `packages/core/src/triage/reachability.ts` | Make finding ID deterministic based on SHA-256 fingerprint (SC-6). | `generateFindingId()` used `crypto.randomBytes(8)`, generating distinct IDs per scan run. | `generateFindingId(fingerprint)` uses `fnd_${fingerprint.slice(0, 16)}`, stabilizing finding IDs across runs. | Verified with CLI scan on `benchmark/vulnerable-app`: IDs remain identical across multiple scans. | Restore random generation in `fingerprint.ts`. |
| `CHG-003` | `packages/cli/src/index.ts` | Propagate target path and fallback search in `sherlock proof <id> [path]`. | `sherlock proof <id>` failed to find findings outside monorepo root. | Accepts optional `[targetDir]` parameter and scans target repository to resolve finding by ID or fingerprint. | Executed `node packages/cli/dist/index.js proof fnd_... benchmark/vulnerable-app`. Proof executed successfully. | Revert argument parsing in `cli/src/index.ts`. |
| `CHG-004` | `package.json`, `packages/*/package.json` | Ensure monorepo root `npm test` executes all unit tests across workspaces. | Monorepo root `npm test` exited immediately with 0 tests run. | Added `"test": "vitest run"` / `"tsc --noEmit"` across workspace scripts. | Running `npm test` at monorepo root executes workspace tests. | Revert root `package.json`. |
| `CHG-005` | `packages/core/src/agent/investigation.ts`, `packages/core/src/agent/index.ts` | Implement core agent investigation interface with budget and prompt injection defenses (§8). | `packages/core/src/agent` directory was empty. | Created typed `AgentInvestigator` with tool-call budgets, citation checks, and untrusted-input sanitization. | Unit tested against simulated prompt injection strings; verified malicious comments ignored. | Remove `packages/core/src/agent/` files. |

---

## 2. Verification History & Test Runs

```
[RUN #1 - BASELINE SCAN]
  Command: node packages/cli/dist/index.js scan benchmark/vulnerable-app
  Output: 7 Findings (2 Critical, 5 High)
  Gate: FAILED (Exit Code 1) as intended by policy

[RUN #2 - SAFE APP SCAN]
  Command: node packages/cli/dist/index.js scan benchmark/safe-app
  Output: 0 Findings (2 suppressed via reachability)
  Gate: PASSED (Exit Code 0) as intended

[RUN #3 - VITEST DASHBOARD TEST SUITE]
  Command: npx vitest run
  Output: 5/5 unit tests passed
  Status: PASSED
```
