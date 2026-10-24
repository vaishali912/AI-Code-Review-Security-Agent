# Sherlock: Route and Screen Inventory

**Document ID:** `AUD-DOC-02`  
**Surface:** Web Dashboard & Developer Navigation  
**Framework:** React 18 / React Router DOM v7 / Vite / Tailwind CSS v4  
**Evaluator:** Principal Full-Stack & UI Architect  
**Date:** October 2026  
**Status:** Verified Complete  

---

## 1. Route Map Overview

All routes are declared in [`packages/dashboard/src/app/router.tsx`](file:///c:/Users/Saurabh%20Kumar/Documents/Projects/Sherlock/packages/dashboard/src/app/router.tsx). The dashboard application provides public landing and authenticated workspace shells with responsive top navigation and a persistent sidebar.

```
/                           -> LandingPage (Product positioning, live scanner demo, engine badges)
/app                        -> AppShell (Layout wrapper: TopBar, Sidebar, CommandPalette, ToastContainer)
  ├── /app/overview         -> OverviewPage (Risk metrics, needs-human queue, riskiest repos)
  ├── /app/pulls            -> PullsPage (PR list, PR walkthrough, stacked PRs, impact graph)
  ├── /app/pulls/:id        -> PullsPage (Selected PR detail with diff annotations & pre-merge checks)
  ├── /app/findings         -> FindingsPage (Triage inbox, search, filter chips, SARIF/JSON export)
  ├── /app/findings/:id     -> FindingsPage + FindingDetailPane (Drawer with dataflow, patch, proof runner)
  ├── /app/tests            -> TestsPage (Autonomous test execution, test plan builder, flaky quarantine)
  ├── /app/tests/:runId     -> TestsPage (Selected test run detail, DOM visual comparison)
  ├── /app/fixes            -> FixesPage (Autonomous debugging loops, before/after verification matrix)
  ├── /app/fixes/:id        -> FixesPage (Selected fix attempt detail with rollback notes)
  ├── /app/scan             -> ScanPage (Live AST runner & reachability triage inspector)
  ├── /app/insights         -> InsightsPage (Code hotspot treemap, vulnerability trends, MTTR metrics)
  └── /app/settings/:section-> SettingsPage (Policy editor, quality gates, .secreview.yml YAML editor)
```

---

## 2. Comprehensive Screen & Component Inventory

| Route | Screen / Component | Access Rules | Viewport / Mobile Behavior | States Handled | Operational Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `LandingPage.tsx` | Public | Fully responsive flex/grid; collapsed nav on mobile with hamburger toggle; sticky top action bar. | Initial render, interactive live scanner demo tab, video/trace modal. | **Verified working** |
| `/app/overview` | `OverviewPage.tsx` | Authenticated | Fluid grid: 4 metric tiles collapse to 1 column on mobile; scrollable Needs-Human queue table. | Loading skeleton, metric data display, empty queue state, error toast. | **Verified working** |
| `/app/pulls` | `PullsPage.tsx` | Authenticated | 2-column split desktop view; collapses into tabbed vertical layout on viewport < 1024px. | PR list, active review loading, verified findings checklist, empty PRs state. | **Verified working** |
| `/app/pulls/:id` | `PullsPage.tsx` | Authenticated | Responsive unified diff viewer with horizontal scroll container and expandable line comments. | Diff parsed, Mermaid sequence diagram rendered, inline suggestions visible. | **Verified working** |
| `/app/findings` | `FindingsPage.tsx` | Authenticated | Responsive filter toolbar (search, severity dropdown, status chips); table horizontal scroll on mobile. | Filtered list, multi-select active, SARIF export downloading, 0 results empty state. | **Verified working** |
| `/app/findings/:id`| `FindingDetailPane.tsx`| Authenticated | Right-side sliding Radix Sheet (640px desktop width, 100vw full-screen on mobile viewports). | 4 tabs (Overview, Dataflow, Fix & Diff, Canary Proof), execution spinner, copy patch. | **Verified working** |
| `/app/tests` | `TestsPage.tsx` | Authenticated | 3-pane layout on desktop (Runs, Plan, Visual Compare); stacked accordion on tablet/mobile. | Test running state, flaky quarantine badge, image before/after diff slider. | **Verified working** |
| `/app/tests/:runId`| `TestsPage.tsx` | Authenticated | Selected run detail with test step execution logs and duration telemetry. | Log streaming, test pass/fail state badges, retry counter. | **Verified working** |
| `/app/fixes` | `FixesPage.tsx` | Authenticated | Root Cause card, 2-column before/after test status matrix, sticky bottom Approval Bar. | Generating patch, pending approval, applying commit, verified green check. | **Verified working** |
| `/app/fixes/:id` | `FixesPage.tsx` | Authenticated | Selected attempt breakdown with branch selector (`secreview/fix-xxx`) and failure traceback. | Diff viewer active, branch copied, rollback instructions drawer. | **Verified working** |
| `/app/scan` | `ScanPage.tsx` | Authenticated | Two-column code editor / AST analysis workbench; code pane on left, live findings on right. | Target directory selector, live scan progress indicator, suppression breakdown table. | **Verified working** |
| `/app/insights` | `InsightsPage.tsx` | Authenticated | Responsive chart grid with Recharts (vulnerability trajectory, hotspot treemap, MTTR). | Timeframe selector (7d, 30d, 90d), tooltip hover active, empty analytics state. | **Verified working** |
| `/app/settings/policy` | `SettingsPage.tsx` | Admin / Member | Policy threshold sliders, severity gate toggle switch, audit log history table. | Modified policy dirty state, save button spinner, permission denied toast. | **Verified working** |
| `/app/settings/yaml` | `SettingsPage.tsx` | Admin | Monospaced `.secreview.yml` text editor with syntax validation and reset to default button. | YAML parsed valid, syntax error alert banner, saved feedback toast. | **Verified working** |

---

## 3. Global Navigation, Shell, & Command Palette Controls

1. **Top Navigation Bar (`AppTopBar.tsx`):**
   - Repository switcher dropdown (e.g. `vaishali912/AI-Code-Review-Security-Agent`).
   - Global Search input triggering Command Palette (`⌘K`).
   - Engine Status indicator badge (`All engines operational · v1.0.0`).
   - Theme toggle (Dark / Light mode with local storage persistence).
   - User profile dropdown with simulated role switcher (Admin / Developer / Auditor).

2. **Sidebar Navigation (`AppSidebar.tsx`):**
   - Active route highlighting with high-contrast indicator.
   - Badge counters on `Findings` (active high/critical count) and `Pulls` (pending reviews).
   - Collapse / Expand toggle button for sidebar width optimization.

3. **Command Palette (`CommandPalette.tsx`):**
   - Triggered via `⌘K` or `Ctrl+K`.
   - Keyboard accessible (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`).
   - Instant search across routes, active findings, recent PRs, and quick actions ("Trigger Scan", "Export SARIF", "Open Settings").
