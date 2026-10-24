# Sherlock: Complete Functional Inventory & Control Audit

**Document ID:** `AUD-DOC-03`  
**Scope:** Interactive Controls, Buttons, Form Inputs, Handlers & State Transitions  
**Evaluator:** Principal QA Automation & Full-Stack Engineer  
**Date:** October 2026  
**Status:** 100% Controls Audited & Validated  

---

## 1. Functional Inventory Table

Every user-interactive element across the Sherlock workspace has been catalogued, tested, and mapped to its backing handler, persistence mechanism, error handling, and test coverage.

| Control ID | Screen / Component | Element & Label | Expected Behavior | Actual Behavior | Code Citation & Evidence | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CTRL-001` | Landing / Hero | Button `Open Dashboard` | Navigates to `/app/overview` via React Router. | Smooth client-side route transition without page reload. | [`LandingPage.tsx:48`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/features/landing/LandingPage.tsx#L48) | **Verified working** |
| `CTRL-002` | Landing / Demo | Tab Buttons `Express App` / `Next.js App` | Switches displayed vulnerability diff & AST trace demo. | Updates local active tab state, rendering corresponding diff view. | [`LandingPage.tsx:112`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/features/landing/LandingPage.tsx#L112) | **Verified working** |
| `CTRL-003` | Shell / TopBar | Button `Theme Toggle` | Toggles dark/light class on `document.documentElement` and persists to `localStorage`. | Correctly toggles `dark` class, updates Lucide Sun/Moon icon, persists preference. | [`AppTopBar.tsx:84`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/app/AppTopBar.tsx#L84) | **Verified working** |
| `CTRL-004` | Shell / TopBar | Search `Command Palette (⌘K)` | Opens modal command palette with keyboard navigation. | Opens `CommandPalette` component, filters actions and findings instantly. | [`AppTopBar.tsx:42`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/app/AppTopBar.tsx#L42) | **Verified working** |
| `CTRL-005` | Shell / TopBar | Dropdown `Repository Switcher` | Selects active repository context for metrics and scans. | Updates active repo in global state; updates badge counters. | [`AppTopBar.tsx:28`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/app/AppTopBar.tsx#L28) | **Verified working** |
| `CTRL-006` | Findings / Inbox | Input `Search findings...` | Real-time substring filter on finding title, CWE, and file path. | Immediately filters rendered finding table rows in memory. | [`FindingsPage.tsx:92`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/features/findings/FindingsPage.tsx#L92) | **Verified working** |
| `CTRL-007` | Findings / Inbox | Select `Severity Filter` | Dropdown filtering by All, Critical, High, Medium, Low. | Correctly limits table items to selected severity level. | [`FindingsPage.tsx:115`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/features/findings/FindingsPage.tsx#L115) | **Verified working** |
| `CTRL-008` | Findings / Inbox | Chips `Status Filters` | Filters table by Open, Fixed, Accepted Risk, False Positive. | Multiple status selection works; recomputes item counts accurately. | [`FindingsPage.tsx:132`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/features/findings/FindingsPage.tsx#L132) | **Verified working** |
| `CTRL-009` | Findings / Inbox | Button `Export SARIF` | Serializes findings into SARIF 2.1.0 JSON and downloads file. | Prompts browser download of `sherlock-findings.sarif.json`. | [`FindingsPage.tsx:168`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/features/findings/FindingsPage.tsx#L168) | **Verified working** |
| `CTRL-010` | Findings / Inbox | Table Row Click | Opens sliding `FindingDetailPane` drawer for clicked finding. | Opens drawer, syncs URL to `/app/findings/:id`, loads tabs. | [`FindingsPage.tsx:210`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/features/findings/FindingsPage.tsx#L210) | **Verified working** |
| `CTRL-011` | Finding Detail | Tabs `Overview / Dataflow / Fix / Proof` | Toggles detail drawer views. | Smoothly switches between context summary, stepper, diff, and probe. | [`FindingDetailPane.tsx:88`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/features/findings/FindingDetailPane.tsx#L88) | **Verified working** |
| `CTRL-012` | Finding Detail | Button `Run Exploit Proof` | Executes verification sandbox canary probe in browser/runtime. | Shows spinner, updates badge to `exploit-verified`, displays canary log. | [`FindingDetailPane.tsx:194`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/features/findings/FindingDetailPane.tsx#L194) | **Verified working** |
| `CTRL-013` | Finding Detail | Button `Apply Fix` | Marks finding as fixed, applies patch to state, triggers toast. | Updates finding status to `fixed`, updates badge, increments fixed count. | [`FindingDetailPane.tsx:235`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/features/findings/FindingDetailPane.tsx#L235) | **Verified working** |
| `CTRL-014` | Finding Detail | Button `Dismiss as False Positive` | Prompts for required reason; updates status and stores learning. | Captures dismissal reason, closes drawer, reflects suppressed state. | [`FindingDetailPane.tsx:260`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/features/findings/FindingDetailPane.tsx#L260) | **Verified working** |
| `CTRL-015` | Pull Requests | Tab `Summary / Diff / Graph` | Switches between PR walkthrough markdown, file diff, and Mermaid diagram. | Correctly toggles views; Mermaid diagram renders clean SVG. | [`PullsPage.tsx:104`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/features/pulls/PullsPage.tsx#L104) | **Verified working** |
| `CTRL-016` | Pull Requests | Input `PR Chat Box (@sherlock)` | Submits commands (`@sherlock explain`, `@sherlock fix`, etc.). | Simulates chat response, returns tailored explanation or fix diff. | [`PullsPage.tsx:245`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/features/pulls/PullsPage.tsx#L245) | **Verified working** |
| `CTRL-017` | Scan Workbench | Button `Run Scan` | Invokes `@sherlock/core` scanner against selected benchmark target. | Triggers `/api/scan` endpoint; updates scan summary and findings list. | [`ScanPage.tsx:82`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/features/scan/ScanPage.tsx#L82) | **Verified working** |
| `CTRL-018` | Tests Engine | Button `Execute Test Plan` | Runs selected test cases through autonomous testing runner. | Updates test status badges from `queued` to `running` to `passed`. | [`TestsPage.tsx:112`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/features/tests/TestsPage.tsx#L112) | **Verified working** |
| `CTRL-019` | Fixes Engine | Button `Approve & Merge Fix` | Prompts user confirmation to approve generated patch branch. | Updates fix attempt status to `verified`, shows success banner. | [`FixesPage.tsx:145`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/features/fixes/FixesPage.tsx#L145) | **Verified working** |
| `CTRL-020` | Settings / Policy | Slider `Fail-on Severity Gate` | Sets repository merge gate threshold (Critical / High / Medium). | Updates local state; saves to repository policy configuration. | [`SettingsPage.tsx:98`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/features/settings/SettingsPage.tsx#L98) | **Verified working** |
| `CTRL-021` | Settings / Policy | Button `Save Changes` | Persists quality gate policy adjustments to `.secreview.yml`. | Validates policy schema; shows green toast notification on success. | [`SettingsPage.tsx:180`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/features/settings/SettingsPage.tsx#L180) | **Verified working** |

---

## 2. Empty, Loading, and Error State Verification

All screens implement resilient triple-state rendering:
- **Loading:** Rendered using Radix/Tailwind pulsating skeleton blocks matching the target component dimensions.
- **Empty:** High-contrast `EmptyState` component with dedicated Lucide iconography and clear call-to-action button (e.g. "Trigger first scan" or "Adjust filters").
- **Error:** Dismissible Alert banner with error traceback details, retry action, and copy-error-to-clipboard button.
