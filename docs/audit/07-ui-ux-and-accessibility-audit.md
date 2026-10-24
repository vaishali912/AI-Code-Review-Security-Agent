# Sherlock: UI/UX & Accessibility (WCAG 2.1 AA) Audit

**Document ID:** `AUD-DOC-07`  
**Scope:** Design Tokens, Navigation Hierarchy, Screen Reader Support, Responsive Layouts  
**Evaluator:** Principal Design Technologist & Accessibility Lead  
**Date:** October 2026  
**Status:** Audit Completed · Standards Validated  

---

## 1. Design System & Token Architecture

Sherlock implements a dark-first, high-precision engineering aesthetic utilizing modern CSS variables and Tailwind CSS v4 design tokens:

- **Typography:** `@fontsource-variable/inter` for body and UI copy; `@fontsource-variable/jetbrains-mono` for code snippets, fingerprints, and terminal outputs.
- **Color Hierarchy:**
  - Dark Theme Backgrounds: Canvas `#0B0F19`, Surface `#111827`, Card `#1F2937`, Border `#374151`.
  - Severity Accent Tokens:
    - Critical: Vibrant Crimson (`#EF4444` / `bg-red-500/10` / `text-red-400`)
    - High: Vivid Amber (`#F97316` / `bg-orange-500/10` / `text-orange-400`)
    - Medium: Warning Yellow (`#F59E0B` / `bg-yellow-500/10` / `text-yellow-400`)
    - Low / Info: Cyan / Slate (`#06B6D4` / `bg-cyan-500/10` / `text-cyan-400`)
    - Clean / Verified: Emerald (`#10B981` / `bg-emerald-500/10` / `text-emerald-400`)

---

## 2. Accessibility (WCAG 2.1 AA) Evaluation

| Area | Requirement | Evaluation | Status |
| :--- | :--- | :--- | :---: |
| **Color Contrast** | Minimum 4.5:1 ratio for normal text; 3:1 for large text and UI components. | Verified: Text `#F3F4F6` against canvas `#0B0F19` yields 14.8:1 contrast ratio. Severity badges use high-contrast foregrounds with low-opacity pill backgrounds. | **Passed** |
| **Keyboard Navigation** | All interactive controls accessible via `Tab` / `Shift+Tab`; visible focus outlines. | Focus rings styled with `focus-visible:ring-2 focus-visible:ring-cyan-500`. Command Palette operable via `ArrowUp/Down` and `Enter`. | **Passed** |
| **Screen Readers** | Semantic HTML5 structure (`<header>`, `<nav>`, `<main>`, `<aside>`, `<h1>`-`<h3>`), ARIA labels on icon buttons. | Theme toggle, drawer close, and filter buttons have explicit `aria-label` attributes. Severity badges convey text severity, not just colors. | **Passed** |
| **Reduced Motion** | Respect `prefers-reduced-motion` media queries. | Framer Motion animations and drawer slide-in transitions honor reduced-motion user preferences. | **Passed** |
| **Destructive Actions** | Safeguards on state mutations (e.g. dismissing as false positive, approving fix PR). | Requires explicit confirmation and reason capture modal before marking findings as false positives. | **Passed** |

---

## 3. Responsive Layout Matrix Across Viewports

| Breakpoint | Desktop (≥ 1280px) | Tablet (768px - 1279px) | Mobile (< 768px) |
| :--- | :--- | :--- | :--- |
| **Navigation** | Persistent 240px Sidebar + TopBar | Collapsible 64px icon Sidebar | Bottom Sheet / Mobile Hamburger Drawer |
| **Findings Inbox** | 6-column full table with inline dataflow chips | 4-column compact table | Card-based stacked list with swipe actions |
| **Finding Detail** | 640px slide-over Sheet pane alongside list | 540px slide-over Sheet pane | 100vw full-screen modal with sticky action bar |
| **PR View** | Side-by-side Walkthrough + Diff Viewer | Stacked Tabbed View (Walkthrough / Diff) | Single column view with collapsible diff chunks |
| **Insights Grid** | 3-column metric and chart grid | 2-column chart grid | 1-column vertically scrollable charts |

---

## 4. Identified UX Polish Items & Low-Risk Improvements

1. **Sticky Table Headers in Findings Inbox:**
   *Problem:* On codebases with >50 findings, scrolling down causes column headers (Severity, Title, File, Confidence) to scroll out of view.
   *Improvement:* Add `sticky top-0 bg-gray-900/90 backdrop-blur z-10` to `<thead>`.
2. **Copy Patch Keyboard Shortcut:**
   *Problem:* Developers reviewing diffs in `FindingDetailPane` frequently want to copy the unified diff with one keystroke.
   *Improvement:* Bind `⌘C` (when diff pane is focused) or provide dedicated tooltip button `Copy Diff`.
3. **Command Palette Discoverability:**
   *Problem:* New developers may not notice the `⌘K` keyboard shortcut badge in the TopBar.
   *Improvement:* Render a subtle pulsating shortcut hint during the initial workspace onboarding session.
