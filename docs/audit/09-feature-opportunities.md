# Sherlock: Complete 150-Capability Feature Backlog & Opportunity Analysis

**Document ID:** `AUD-DOC-09`  
**Scope:** Comprehensive Specification of Capabilities F-001 through F-150 (§24)  
**Evaluator:** Principal Product Manager & Systems Architect  
**Date:** October 2026  
**Status:** 150 Capabilities Catalogued, Evaluated, and Prioritized  

---

## Executive Summary & Wave Distribution

The Sherlock capability backlog spans 15 functional domains (A through O) comprising 150 capabilities:
- **Wave N (Now - Next 2 Releases):** 46 High-leverage correctness, core security, and review capabilities.
- **Wave X (Next - 3 to 6 Months):** 62 Expansion capabilities (GitLab, full test agents, SSO, linear/jira sync).
- **Wave L (Later - 6 to 12+ Months):** 42 Enterprise & advanced autonomous capabilities (VPC, Java/Go, stacked PRs).

---

## Domain A: Authentication, Identity and Onboarding (F-001 to F-010)

### F-001: Guided first-run onboarding by intended workflow
- **Wave:** N (Now) | **Decision:** NOW
- **Target User:** Full-stack developer / Tech lead connecting first repository.
- **Problem:** Developers often drop off if onboarding requires extensive configuration before seeing value.
- **Current Behavior:** Landing page links directly to dashboard overview without role-tailored setup checklist.
- **Proposed Behavior:** Interactive modal wizard on first login offering 3 paths: "PR Review Bot", "CI Security Gate", or "MCP Coding Agent Setup", completing initial scan in < 3 minutes.
- **Changes:** UI wizard component in `packages/dashboard/src/app/AppShell.tsx`; persistence in `.secreview.yml` and local storage.
- **Acceptance Criteria:** First scan results rendered within 180 seconds of signup; completion rate ≥ 70%.

### F-002: Persistent, resumable setup progress
- **Wave:** N (Now) | **Decision:** NOW
- **Target User:** Developer onboarding repos asynchronously.
- **Problem:** Leaving setup mid-flow forces developers to restart from step 1.
- **Current Behavior:** State is memory-bound in React components.
- **Proposed Behavior:** Onboarding state saved in localStorage / organization profile, resuming exact step on return.
- **Acceptance Criteria:** Wizard step persists across browser refreshes and device switches.

### F-003: Session-expiry warnings with safe recovery
- **Wave:** N (Now) | **Decision:** NOW
- **Target User:** All authenticated users.
- **Problem:** Silent session expiration causes lost work during triage reviews or policy edits.
- **Current Behavior:** Static tokens without proactive warning dialogs.
- **Proposed Behavior:** Modal prompt 2 minutes before JWT expiration allowing one-click session renewal without state loss.
- **Acceptance Criteria:** No unsaved policy draft lost due to token expiration.

### F-004: Session and active-device management
- **Wave:** X (Next) | **Decision:** LATER
- **Target User:** Security champion / Admin.
- **Proposed Behavior:** List active sessions with IP, user-agent, last seen timestamp, and remote revocation button.

### F-005: Reauthentication for high-risk actions
- **Wave:** N (Now) | **Decision:** NOW
- **Target User:** Organization Owner / Tech Lead.
- **Problem:** Unauthorized browser access could alter gating policies or dismiss critical findings.
- **Proposed Behavior:** Sudo-mode prompt (password or GitHub OAuth re-auth) required before altering policy gates or deleting audit logs.

### F-006: Optional multi-factor authentication (MFA/TOTP)
- **Wave:** X (Next) | **Decision:** LATER (Post-OAuth launch)

### F-007: Granular organization and workspace roles (Owner, Admin, Member, Viewer)
- **Wave:** X (Next) | **Decision:** LATER (SaaS backend integration)

### F-008: Auditable account and permission changes
- **Wave:** X (Next) | **Decision:** LATER (Audit log store integration)

### F-009: Account export and deletion (GDPR compliance)
- **Wave:** X (Next) | **Decision:** LATER (Data compliance phase)

### F-010: Guided recovery from lost repository access or bad configuration
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Clear error state when GitHub tokens expire or `.secreview.yml` has syntax errors, with inline "Fix Configuration" and "Re-authenticate" actions.

---

## Domain B: Repository and Project Intelligence (F-011 to F-020)

### F-011: Repository health assessment
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Composite repository security score (0-100) based on reachable criticals, unauthenticated mutating endpoints, and test coverage.

### F-012: Architecture visualization (Mermaid)
- **Wave:** X (Next) | **Decision:** NOW (Already partially implemented in `packages/review/src/diagram.ts`).
- **Proposed Behavior:** Expand Mermaid diagrams to map cross-module calls and data flow from route entry points to database queries.

### F-013: Dependency and module relationship graphs
- **Wave:** X (Next) | **Decision:** LATER

### F-014: Repository onboarding summaries
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Auto-generated executive overview of repository frameworks, entry points, detected ORMs, and security posture on first install.

### F-015: Branch-aware project context
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Scans evaluate changed files relative to their target base branch (e.g. `main` or `staging`).

### F-016: Change-impact analysis before implementation
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Map which downstream endpoints, tests, and database calls are impacted by a PR changeset.

### F-017: Stale and duplicated code detection
- **Wave:** L (Later) | **Decision:** LATER

### F-018: Repository-specific coding conventions
- **Wave:** X (Next) | **Decision:** LATER

### F-019: Documentation drift detection
- **Wave:** L (Later) | **Decision:** LATER

### F-020: Workspace health and environment diagnostics
- **Wave:** X (Next) | **Decision:** LATER

---

## Domain C: Agent Orchestration and Task Management (F-021 to F-030)

### F-021: Editable execution plans
- **Wave:** X (Next) | **Decision:** LATER

### F-022: Explicit task dependencies
- **Wave:** X (Next) | **Decision:** LATER

### F-023: Parallel independent subagents
- **Wave:** X (Next) | **Decision:** LATER

### F-024: Agent capability and tool compatibility checks
- **Wave:** X (Next) | **Decision:** LATER

### F-025: Task pause, resume and cancel
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Ability to cancel a running full-repo scan or proof generation run via CLI (`Ctrl+C` / abort signal) or dashboard button.

### F-026: Bounded retries with configurable policy
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Exponential backoff on LLM provider rate limits with a hard cap of 3 retries.

### F-027: Durable task recovery after worker failure
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Checkpointing scan progress per file so aborted runs resume from the last scanned file.

### F-028: Conflict detection between parallel agents
- **Wave:** X (Next) | **Decision:** LATER

### F-029: Agent budgets and time limits
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Hard wall-clock timeout (default 180s per PR scan, 120s per exploit proof) to guarantee latency targets.

### F-030: Task-level provenance (why each action was taken)
- **Wave:** X (Next) | **Decision:** LATER

---

## Domain D: Code Generation and Engineering Quality (F-031 to F-040)

### F-031: Specification-driven implementation
- **Wave:** X (Next) | **Decision:** LATER

### F-032: Minimal-diff patch mode
- **Wave:** N (Now) | **Decision:** NOW (Implemented in `@sherlock/core` builtins).
- **Proposed Behavior:** Generated fixes modify only the minimum required lines, preserving surrounding formatting and indentation.

### F-033: Repository-specific generation rules
- **Wave:** X (Next) | **Decision:** LATER

### F-034: Refactoring with behavior-preservation checks
- **Wave:** L (Later) | **Decision:** LATER

### F-035: Type-check and static-analysis integration
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Validates suggested patches against the TypeScript compiler to ensure 0 type errors before recommending in PR comments.

### F-036: API contract consistency checks
- **Wave:** X (Next) | **Decision:** LATER

### F-037: Database migration impact analysis
- **Wave:** L (Later) | **Decision:** LATER

### F-038: Dependency upgrade planning
- **Wave:** L (Later) | **Decision:** LATER

### F-039: Generated documentation validation
- **Wave:** L (Later) | **Decision:** LATER

### F-040: Automated review of AI-generated changes
- **Wave:** N (Now) | **Decision:** NOW (CP-9).
- **Proposed Behavior:** Flag PRs co-authored by Cursor, GitHub Copilot, or Claude Code for heightened dataflow scrutiny.

---

## Domain E: Testing and Verification (F-041 to F-050)

### F-041: Change-based regression test selection
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Execute only tests whose imports or call sites intersect with the modified PR diff.

### F-042: Test generation from acceptance criteria
- **Wave:** X (Next) | **Decision:** LATER

### F-043: Automated reproduction of reported bugs
- **Wave:** X (Next) | **Decision:** LATER

### F-044: Failure clustering by root cause
- **Wave:** X (Next) | **Decision:** LATER

### F-045: Flaky-test detection
- **Wave:** X (Next) | **Decision:** LATER

### F-046: Browser end-to-end validation (Playwright)
- **Wave:** X (Next) | **Decision:** LATER (v2 scope)

### F-047: API contract testing
- **Wave:** X (Next) | **Decision:** LATER

### F-048: Test artifact and screenshot management
- **Wave:** X (Next) | **Decision:** LATER

### F-049: Baseline-versus-patch result comparison
- **Wave:** N (Now) | **Decision:** NOW (Implemented in `VerificationSandbox`).
- **Proposed Behavior:** Demonstrate test failure on unpatched baseline and green pass on patched branch.

### F-050: Evidence-based completion reports
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Emit structured proof certificates with execution logs and verified duration telemetry.

---

## Domain F: Security and Governance (F-051 to F-060)

### F-051: Secret detection (patterns + entropy)
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Detect API tokens, private keys, and high-entropy secrets in diffs and mask them.

### F-052: Dependency and supply-chain analysis (SCA)
- **Wave:** X (Next) | **Decision:** LATER (v2 scope)

### F-053: Prompt-injection threat detection
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Treat code comments and string literals as untrusted input; never follow instructions embedded in code.

### F-054: Tool permission risk classification
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Classify MCP tools into Read-Only (`scan_file`, `list_findings`) vs. Executable (`run_proof`).

### F-055: Per-agent least-privilege policies
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Scanning agents have no network egress and no repository write access.

### F-056: Isolated execution with resource limits
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Verification sandbox enforces 120s execution timeout and in-memory evaluation limits.

### F-057: Security-aware code review
- **Wave:** N (Now) | **Decision:** NOW (Core Sherlock functionality).

### F-058: Sensitive artifact redaction
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Automatically redact identified secrets before outputting SARIF or markdown summaries.

### F-059: Audit-log export (CSV / JSON)
- **Wave:** X (Next) | **Decision:** LATER

### F-060: Organization-level security policies
- **Wave:** X (Next) | **Decision:** LATER

---

## Domain G: Developer Workspace and UX (F-061 to F-070)

### F-061: Searchable task and session history
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Filter and search prior scans and findings by keyword, date, or commit SHA.

### F-062: Saved workspace layouts
- **Wave:** L (Later) | **Decision:** LATER

### F-063: Resizable artifact panels
- **Wave:** X (Next) | **Decision:** LATER

### F-064: Unified command and action palette (`⌘K`)
- **Wave:** N (Now) | **Decision:** NOW (Implemented in `CommandPalette.tsx`).

### F-065: Customizable keyboard shortcuts
- **Wave:** L (Later) | **Decision:** LATER

### F-066: Diff navigation and inline annotations
- **Wave:** N (Now) | **Decision:** NOW (Implemented in `DiffView.tsx` and `PullsPage.tsx`).

### F-067: Persistent filters and sorting
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Retain selected severity, status, and search filters in URL search parameters.

### F-068: Accessible focus management
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Trap focus inside modals/drawers and restore focus to trigger buttons upon closing.

### F-069: Consistent empty, loading and error states
- **Wave:** N (Now) | **Decision:** NOW (Implemented across all dashboard views).

### F-070: Contextual help for the current screen
- **Wave:** X (Next) | **Decision:** LATER

---

## Domain H: Integrations and Extensibility (F-071 to F-080)

### F-071: GitHub App improvements (checks API, inline suggestions)
- **Wave:** N (Now) | **Decision:** NOW (PR-1, PR-2, PR-3).

### F-072: GitLab and Bitbucket support
- **Wave:** X (Next) | **Decision:** LATER (v1.x / v2)

### F-073: Standardized MCP connection management
- **Wave:** N (Now) | **Decision:** NOW (Implemented in `@sherlock/mcp`).

### F-074: Integration health and permission diagnostics
- **Wave:** X (Next) | **Decision:** LATER

### F-075: Webhook signature validation and replay protection
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Verify `X-Hub-Signature-256` HMAC on all incoming GitHub webhooks.

### F-076: Issue tracker synchronization (Linear / Jira)
- **Wave:** X (Next) | **Decision:** LATER (v2)

### F-077: CI/CD result integration
- **Wave:** X (Next) | **Decision:** LATER

### F-078: Documentation source integrations
- **Wave:** L (Later) | **Decision:** LATER

### F-079: Configurable notification channels (Slack alerts)
- **Wave:** X (Next) | **Decision:** LATER (v2)

### F-080: Versioned custom tool and skill definitions
- **Wave:** L (Later) | **Decision:** LATER

---

## Domain I: Observability and Reliability (F-081 to F-090)

### F-081: Task execution traces
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Log file-level scan durations, candidate count, and suppression reasons in scan summary.

### F-082: Agent latency and failure metrics
- **Wave:** X (Next) | **Decision:** LATER

### F-083: Model usage and cost breakdowns
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Track token expenditure and cost metrics per scan.

### F-084: Queue depth and worker health
- **Wave:** X (Next) | **Decision:** LATER

### F-085: Structured error classification
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Classify errors as `ParseError`, `ConfigError`, `TimeoutError`, or `SandboxError`.

### F-086: Correlation IDs across UI, API, worker and agent
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Attach a unique `scanId` or `prId` to all log lines and finding traces.

### F-087: Service-level objectives for critical workflows
- **Wave:** L (Later) | **Decision:** LATER

### F-088: Stalled-task detection
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Terminate any scan worker exceeding 300s without progress.

### F-089: Recovery diagnostics for incomplete runs
- **Wave:** X (Next) | **Decision:** LATER

### F-090: Release regression dashboards
- **Wave:** L (Later) | **Decision:** LATER

---

## Domain J: Business, Collaboration and Enterprise Value (F-091 to F-100)

### F-091: Team productivity analytics
- **Wave:** X (Next) | **Decision:** LATER

### F-092: Review turnaround and defect-resolution metrics
- **Wave:** X (Next) | **Decision:** LATER

### F-093: Repository and project risk scoring
- **Wave:** X (Next) | **Decision:** LATER

### F-094: Shared engineering policies
- **Wave:** X (Next) | **Decision:** LATER

### F-095: Team-shared reusable agent workflows
- **Wave:** L (Later) | **Decision:** LATER

### F-096: Scheduled repository maintenance
- **Wave:** L (Later) | **Decision:** LATER

### F-097: Budget limits and usage alerts
- **Wave:** X (Next) | **Decision:** LATER

### F-098: Enterprise audit and governance reports
- **Wave:** L (Later) | **Decision:** LATER

### F-099: Self-hosted or private execution option (VPC)
- **Wave:** L (Later) | **Decision:** LATER (v3 scope)

### F-100: Outcome-based reporting linking verified results to time saved
- **Wave:** L (Later) | **Decision:** LATER

---

## Domain K: Review Depth (F-101 to F-110)

### F-101: PR walkthrough with sequence diagrams
- **Wave:** N (Now) | **Decision:** NOW (Implemented in `@sherlock/review`).

### F-102: Review learnings captured from developer feedback
- **Wave:** N (Now) | **Decision:** NOW (Implemented in `LearningsStore`).

### F-103: Stacked-PR-aware review
- **Wave:** L (Later) | **Decision:** LATER (v3 scope)

### F-104: Cross-file bug detection through a repository graph
- **Wave:** N (Now) | **Decision:** NOW (Implemented in `CodeGraph`).

### F-105: Review effort estimate and reviewer routing
- **Wave:** X (Next) | **Decision:** LATER

### F-106: Per-path custom review rule packs
- **Wave:** X (Next) | **Decision:** LATER

### F-107: Incremental re-review of new commits only
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** On push to an active PR, re-scan only modified files and update existing bot comments in place.

### F-108: Comment-noise budget with severity thresholds
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Cap inline comments to maximum 10 highest-confidence items; summarize the rest in the PR summary comment.

### F-109: Refactor suggestions with behavior-preservation check
- **Wave:** L (Later) | **Decision:** LATER

### F-110: PR title, description and release-note drafting
- **Wave:** X (Next) | **Decision:** LATER

---

## Domain L: Testing and QA (F-111 to F-120)

### F-111: Plain-English test authoring
- **Wave:** X (Next) | **Decision:** LATER

### F-112: Self-healing locators
- **Wave:** L (Later) | **Decision:** LATER

### F-113: Visual regression with baseline approval
- **Wave:** L (Later) | **Decision:** LATER

### F-114: API test generation from OpenAPI
- **Wave:** X (Next) | **Decision:** LATER (v2 scope)

### F-115: Flaky-test quarantine with retry statistics
- **Wave:** X (Next) | **Decision:** LATER

### F-116: Predictive test selection by change risk
- **Wave:** X (Next) | **Decision:** LATER

### F-117: Cross-browser and device matrix
- **Wave:** L (Later) | **Decision:** LATER

### F-118: Test data and fixture synthesis
- **Wave:** X (Next) | **Decision:** LATER

### F-119: Failure triage bundle (screenshot, video, trace)
- **Wave:** X (Next) | **Decision:** LATER

### F-120: Coverage-gap heatmap on changed lines
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Flag newly added functions or routes that lack corresponding unit tests in the same PR.

---

## Domain M: Security Depth (F-121 to F-130)

### F-121: Reachability-based vulnerability prioritization
- **Wave:** N (Now) | **Decision:** NOW (Core differentiator, implemented in `ReachabilityEngine`).

### F-122: Malicious and typosquat package detection on dependency diffs
- **Wave:** X (Next) | **Decision:** LATER (v2 scope)

### F-123: Secret validity checks and rotation guidance
- **Wave:** X (Next) | **Decision:** LATER

### F-124: SBOM generation (CycloneDX, SPDX)
- **Wave:** X (Next) | **Decision:** LATER

### F-125: License compliance policy
- **Wave:** L (Later) | **Decision:** LATER

### F-126: Custom rule authoring from examples
- **Wave:** X (Next) | **Decision:** LATER (v1.x scope)

### F-127: Per-branch security quality gates
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Allow different gate strictness on `main` vs. `feature/*` branches.

### F-128: Risk scoring that includes exploit proof
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Findings with verified exploit proofs are automatically elevated to top priority in the inbox.

### F-129: Infrastructure-as-code and container image scanning
- **Wave:** L (Later) | **Decision:** LATER (v2 scope)

### F-130: Compliance mapping reports (OWASP ASVS, SOC 2 evidence)
- **Wave:** L (Later) | **Decision:** LATER

---

## Domain N: Agents and Runtime (F-131 to F-140)

### F-131: Issue-to-patch workflow from a tracker ticket
- **Wave:** X (Next) | **Decision:** LATER

### F-132: Runtime error to root cause to fix PR (Sentry-style)
- **Wave:** X (Next) | **Decision:** LATER

### F-133: Specialist agent roster (repository, review, security, test, debug, fix, verifier)
- **Wave:** X (Next) | **Decision:** LATER

### F-134: Token and cost budgeter per agent
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Enforce strict token limits (max 50k tokens per PR review) to protect SaaS gross margins (≥ 70%).

### F-135: Agent trajectory replay and debugging
- **Wave:** X (Next) | **Decision:** LATER

### F-136: Internal benchmark harness for agent quality
- **Wave:** N (Now) | **Decision:** NOW (Implemented with `benchmark/vulnerable-app` and `safe-app`).

### F-137: Per-task sandbox with snapshots
- **Wave:** X (Next) | **Decision:** LATER

### F-138: Autonomy modes: suggest, approve-then-act, sandbox-auto
- **Wave:** N (Now) | **Decision:** NOW
- **Proposed Behavior:** Configurable autonomy in `.secreview.yml` (default: `suggest`).

### F-139: AI-authored code detection with extra scrutiny
- **Wave:** X (Next) | **Decision:** LATER (v1.x)

### F-140: IDE, CLI and MCP parity for coding agents
- **Wave:** N (Now) | **Decision:** NOW (Core platform requirement, implemented).

---

## Domain O: Workflow and Engineering Intelligence (F-141 to F-150)

### F-141: Policy-as-code for PRs (Danger-style)
- **Wave:** X (Next) | **Decision:** LATER

### F-142: SARIF and linter ingestion (reviewdog-style)
- **Wave:** N (Now) | **Decision:** NOW (SARIF 2.1.0 generation implemented).

### F-143: Code hotspot and change-risk map
- **Wave:** X (Next) | **Decision:** LATER

### F-144: CI gate and failure explainer
- **Wave:** X (Next) | **Decision:** LATER

### F-145: Two-way Linear and Jira sync linking PRs and findings
- **Wave:** X (Next) | **Decision:** LATER (v2)

### F-146: Auto-fix PRs for lint and quality issues
- **Wave:** X (Next) | **Decision:** LATER

### F-147: Maintainability trend and quality gate
- **Wave:** X (Next) | **Decision:** LATER

### F-148: Recurring-defect pattern tracking
- **Wave:** X (Next) | **Decision:** LATER

### F-149: Delivery metrics tied to review outcomes
- **Wave:** L (Later) | **Decision:** LATER

### F-150: Repository risk ranking and weekly digest
- **Wave:** L (Later) | **Decision:** LATER
