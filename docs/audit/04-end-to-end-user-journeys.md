# Sherlock: End-to-End User Journeys & Workflow Specifications

**Document ID:** `AUD-DOC-04`  
**Scope:** Core Developer & Security Champion Journeys  
**Evaluator:** Principal Product & UX Systems Architect  
**Date:** October 2026  
**Status:** All 12 User Journeys Mapped & Validated  

---

## Journey 1: First Visit, Landing, and Onboarding

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer / Tech Lead
    participant Web as Landing Page (/)
    participant Router as React Router
    participant App as AppShell (/app/overview)
    participant Conf as .secreview.yml Generator

    Dev->>Web: Navigate to https://sherlock.app
    Web->>Web: Render hero, live scanner interactive demo, engine badges
    Dev->>Web: Click "Connect GitHub / Get Started"
    Web->>Router: Route to /app/overview
    Router->>App: Mount AppShell with Onboarding Checklist
    App->>Dev: Prompt: Choose preset policy (Strict Startup vs. Progressive Adoption)
    Dev->>App: Select "Strict Startup (Fail on High/Critical)"
    App->>Conf: Generate recommended .secreview.yml config
    Conf-->>App: Saved locally / committed to repository
    App->>Dev: Onboarding completed in < 3 minutes
```

---

## Journey 2 & 3: Login, Session Management, and Safe Logout

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant UI as Dashboard Shell
    participant Auth as Auth / Session Controller
    participant Storage as localStorage / Cookie

    Dev->>UI: Click Sign In (OAuth / Token)
    UI->>Auth: Exchange credentials for short-lived session token
    Auth->>Storage: Store session token (encrypted in-flight)
    UI-->>Dev: Access granted; redirect to /app/findings
    Note over UI,Auth: Periodic session validity check (every 5 min)
    alt Session Near Expiry
        Auth-->>UI: Trigger Session-Expiry Warning modal
        Dev->>UI: Click "Extend Session" -> Refreshed token
    else User Logs Out
        Dev->>UI: Click "Log Out" from User Menu
        UI->>Auth: Revoke active session token
        Auth->>Storage: Purge cached tokens and workspace state
        UI->>Dev: Redirect safely to Landing Page (/)
    end
```

---

## Journey 4: Repository Connection & Baseline Scanning

```mermaid
sequenceDiagram
    autonumber
    actor Champion as Security Champion / Lead
    participant UI as Settings / Repositories
    participant Git as GitHub App / Provider Adapter
    participant Core as Sherlock Core Scanner
    participant Inbox as Findings Inbox

    Champion->>UI: Click "Add Repository"
    UI->>Git: Request repository permissions (read contents, write PR comments)
    Git-->>UI: OAuth callback with installation ID
    UI->>Core: Trigger Full-Repo Baseline Scan
    Core->>Core: Parse AST, extract route table, run 10 security rules
    Core->>Core: Reachability triage (suppress sanitized candidates)
    Core-->>UI: Scan complete (e.g. 7 findings, 2 suppressed)
    UI->>Inbox: Populate Findings Inbox with deterministic fingerprints
```

---

## Journey 5 & 6: PR Submission, Agent Orchestration & Review

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant GH as GitHub PR Webhook
    participant Orch as Review Orchestrator
    participant Core as Security Engine
    participant Rev as Review Engine
    participant Verif as Verification Engine
    participant Bot as GitHub PR Bot

    Dev->>GH: Open Pull Request #42 (feature branch)
    GH->>Orch: Webhook: pull_request.opened
    Orch->>Core: Scan incremental changeset + dependent modules
    Core-->>Orch: Emits 1 High finding (SQL Injection at line 10)
    Orch->>Verif: Synthesize & execute exploit probe in sandbox
    Verif-->>Orch: Exploit probe verified (status: proven)
    Orch->>Rev: Generate PR Walkthrough, Risk Table & Mermaid Diagram
    Rev-->>Orch: Markdown walkthrough with unified diff patch
    Orch->>Bot: Post inline comment on line 10 + single summary comment
    Bot-->>GH: Renders High Risk warning with suggested commit block
    Bot->>GH: Publish GitHub Check Run: FAILED (High Severity Gate)
```

---

## Journey 7 & 8: PR Conversational Chat, Tool Approval & Fix Merge

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant GH as GitHub PR Comments
    participant Chat as PRChatHandler
    participant Learn as LearningsStore
    participant Git as Git Provider Adapter

    Dev->>GH: Comment: "@sherlock explain"
    GH->>Chat: handleComment("@sherlock explain", finding)
    Chat-->>GH: Post detailed attack scenario and traced dataflow path
    alt Developer agrees with finding
        Dev->>GH: Comment: "@sherlock fix"
        GH->>Chat: handleComment("@sherlock fix", finding)
        Chat-->>GH: Provide one-click commit suggestion block
        Dev->>GH: Accept suggested commit
        GH->>Git: Apply commit directly to PR branch
    else Developer disputes as false positive
        Dev->>GH: Comment: "@sherlock ignore sanitized in database gateway"
        GH->>Chat: handleComment("@sherlock ignore ...", finding)
        Chat->>Learn: recordFeedback("sanitized in gateway", file, ruleId)
        Learn-->>Chat: Stored in .sherlock-learnings.json
        Chat-->>GH: Confirm finding suppressed; rule memory updated
    end
```

---

## Journey 9 & 10: Coding Agent MCP Invocation (Cursor / Claude Code)

```mermaid
sequenceDiagram
    autonumber
    actor Agent as Coding Agent (Cursor / Claude Code)
    participant MCP as Sherlock MCP Server
    participant Core as Sherlock Core Scanner
    participant Verif as Verification Sandbox

    Agent->>Agent: Generate code changes in workspace
    Agent->>MCP: Call tool: review_diff({ diff: patchText })
    MCP->>Core: Scan modified buffers against AST rules
    Core-->>MCP: Candidate findings with reachability verdicts
    MCP-->>Agent: Structured JSON with file, line, evidence, suggestedPatch
    Agent->>Agent: Automatically adjust generated code to use parameterized queries
    Agent->>MCP: Call tool: run_proof({ findingId: "fnd_sqli..." })
    MCP->>Verif: Execute canary probe on patched code
    Verif-->>MCP: Assertions passed cleanly (exploit mitigated)
    MCP-->>Agent: Return "simulation-passed"
```

---

## Journey 11 & 12: CI/CD Quality Gating & Settings Governance

```mermaid
sequenceDiagram
    autonumber
    actor CI as GitHub Actions / CI Runner
    participant CLI as sherlock CLI
    participant Conf as .secreview.yml
    participant SARIF as GitHub Code Scanning

    CI->>CLI: Run `sherlock scan . --fail-on high --sarif`
    CLI->>Conf: Load gate thresholds and ignore paths
    CLI->>CLI: Execute AST scan & reachability analysis
    CLI->>SARIF: Write results to `sherlock.sarif.json`
    alt Gating Violations Found (>= High)
        CLI->>CI: Exit Code 1 (CI Gate Blocked)
        CI-->>CI: Mark pull request status check as failed
    else No Gating Violations
        CLI->>CI: Exit Code 0 (CI Gate Passed)
        CI-->>CI: Merge allowed
    end
```
