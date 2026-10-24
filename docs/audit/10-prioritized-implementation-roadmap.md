# Sherlock: Prioritized Implementation Roadmap

**Document ID:** `AUD-DOC-10`  
**Prioritization Formula:** `Score = (User Impact × Business Value × Confidence) / (Implementation Effort × Risk Multiplier)`  
**Factor Scale:** 1 to 5 (Integer ratings based on PRD §23.5)  
**Evaluator:** Principal Engineering Program Manager  
**Date:** October 2026  
**Status:** Scored & Milestone Sequenced  

---

## 1. Prioritization Scoring Table

| ID | Capability / Work Item | Impact (1-5) | Value (1-5) | Conf (1-5) | Effort (1-5) | Risk (1-5) | Formula Score | Class | Target Milestone |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **P0-1** | **Fix Vitest vs. Playwright Config Conflict** (`packages/dashboard`) | 5 | 5 | 5 | 1 | 1 | **125.0** | **P0 Critical** | Milestone 0 (Immediate) |
| **P0-2** | **Deterministic Finding IDs from Fingerprint** (`packages/core`) | 5 | 5 | 5 | 1 | 1 | **125.0** | **P0 Critical** | Milestone 0 (Immediate) |
| **P0-3** | **CLI Target Path Resolution in `proof` Command** (`packages/cli`) | 5 | 4 | 5 | 1 | 1 | **100.0** | **P0 Critical** | Milestone 0 (Immediate) |
| **P0-4** | **Root & Package Test Scripts Integration** (`package.json`) | 5 | 4 | 5 | 1 | 1 | **100.0** | **P0 Critical** | Milestone 0 (Immediate) |
| **P0-5** | **Agent Pipeline Structure & Budget Guardrails** (`packages/core/src/agent`) | 4 | 5 | 4 | 2 | 2 | **20.0** | **P0 Critical** | Milestone 1 (v1 Core) |
| **P1-1** | **GitHub App Webhook Signature Verification** (F-075) | 4 | 5 | 5 | 2 | 1 | **50.0** | **P1 High** | Milestone 1 (v1 Core) |
| **P1-2** | **Incremental PR Re-Review of Modified Commits** (F-107) | 4 | 4 | 4 | 2 | 2 | **16.0** | **P1 High** | Milestone 1 (v1 Core) |
| **P1-3** | **Secret Detection & Redaction in PR Comments** (F-051 / F-058) | 5 | 4 | 5 | 2 | 1 | **50.0** | **P1 High** | Milestone 1 (v1 Core) |
| **P1-4** | **Comment Noise Budget & Capping** (F-108) | 4 | 4 | 5 | 1 | 1 | **80.0** | **P1 High** | Milestone 1 (v1 Core) |
| **P2-1** | **Persistent Table Filters in URL Query Params** (F-067) | 3 | 3 | 5 | 1 | 1 | **45.0** | **P2 Medium** | Milestone 2 (v1.x) |
| **P2-2** | **Custom Rule Authoring from Examples** (F-126) | 4 | 4 | 4 | 3 | 2 | **10.7** | **P2 Medium** | Milestone 2 (v1.x) |
| **P2-3** | **GitLab & Bitbucket Adapter Layer** (F-072) | 3 | 4 | 4 | 3 | 2 | **8.0** | **P2 Medium** | Milestone 2 (v1.x) |
| **P3-1** | **Linear & Jira Two-Way Sync** (F-145) | 3 | 3 | 4 | 3 | 2 | **6.0** | **P3 Strategic**| Milestone 3 (v2) |
| **P3-2** | **VPC / Self-Hosted Helm Deployment** (F-099) | 4 | 5 | 3 | 5 | 3 | **4.0** | **P3 Strategic**| Milestone 4 (v3) |

---

## 2. Milestone Roadmap & Release Sequence

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ MILESTONE 0: Core Correctness & Baseline Stabilization (Current Phase)           │
│   • Fix dashboard test runner configuration (Vitest exclude e2e/**)              │
│   • Wire deterministic finding IDs (sha256 fingerprint prefix)                  │
│   • CLI path propagation in `sherlock proof <id> [path]`                         │
│   • Multi-package test execution script verification                             │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│ MILESTONE 1: v1 Launch Readiness (Weeks 1–6)                                     │
│   • GitHub App OAuth least-privilege installation flow                           │
│   • PR Walkthrough, Mermaid Diagrams, and Inline check runs                      │
│   • Conversational PR chat (@sherlock explain, fix, ignore)                      │
│   • Benchmark accuracy gating: ≥ 80% precision, ≥ 70% recall on OWASP Top 10     │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│ MILESTONE 2: v1.x Verification & Extensibility (Weeks 7–14)                      │
│   • Exploit-Proof Verification mode with automated canary probes                 │
│   • Headless MCP server integration for Cursor, Claude Code, and Windsurf        │
│   • Repository learnings store (.sherlock-learnings.json) flywheel               │
│   • GitLab Merge Request adapter                                                 │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│ MILESTONE 3: v2 Enterprise & Deep QA (Weeks 15–28)                               │
│   • Secrets, SCA lockfile scanning, and IaC container checks                     │
│   • Two-way Linear / Jira issue synchronization                                  │
│   • Autonomous browser test execution with Playwright cloud runners              │
│   • SOC 2 Type II compliance audit readiness                                     │
└──────────────────────────────────────────────────────────────────────────────────┘
```
