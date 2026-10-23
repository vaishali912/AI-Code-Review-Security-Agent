import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3002';

test.describe('Sherlock Part 2 Full Route Smoke Tests', () => {
  test('Landing Page (/) renders headline, trace line, and nav', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await expect(page).toHaveTitle(/Sherlock/);
    await expect(page.locator('h1')).toContainText('Every pull request, security-reviewed');
    await expect(page.locator('text=All systems operational')).toBeVisible();
  });

  test('Overview Dashboard (/app/overview) renders metric tiles & needs-human queue', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/overview`);
    await expect(page.locator('h1')).toContainText('Security & Code Review Overview');
    await expect(page.locator('text=PRs Reviewed')).toBeVisible();
    await expect(page.locator('text=Needs-Human Queue')).toBeVisible();
    await expect(page.locator('text=Riskiest Repositories')).toBeVisible();
  });

  test('Pull Requests View (/app/pulls) renders tabs, stacked PRs & impact graph', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/pulls`);
    await expect(page.locator('h1')).toContainText('Pull Request Review');
    await expect(page.locator('text=PR #42: Feature/User-Management-API')).toBeVisible();
    await expect(page.locator('text=Stacked PRs:')).toBeVisible();
    await expect(page.locator('text=Automated Pre-Merge Review Checklist')).toBeVisible();
  });

  test('Findings Inbox (/app/findings) renders secrets, deps, and SARIF export', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/findings`);
    await expect(page.getByText('Blocking:', { exact: true })).toBeVisible();
    await expect(page.getByText('Proven:', { exact: true })).toBeVisible();
    await expect(page.locator('text=Code Vulnerabilities')).toBeVisible();
    await expect(page.locator('button:has-text("Secrets")')).toBeVisible();
    await expect(page.locator('button:has-text("SARIF")')).toBeVisible();
  });

  test('Finding Detail (/app/findings/fnd_sqli_users_01) renders trace stepper & proof', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/findings/fnd_sqli_users_01`);
    await expect(page.locator('h2')).toContainText('SQL injection via unparameterized query');
    await expect(page.locator('button:has-text("Apply Fix")')).toBeVisible();
    await expect(page.locator('button:has-text("Run Proof")')).toBeVisible();
  });

  test('Autonomous Tests (/app/tests) renders runs, plan builder & flaky tracker', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/tests`);
    await expect(page.locator('h1')).toContainText('Autonomous Testing Engine');
    await expect(page.locator('text=Ran 14 of 212 tests, saved about 11 min')).toBeVisible();
    await expect(page.locator('text=Visual DOM Comparison')).toBeVisible();
  });

  test('Debugging & Fixes (/app/fixes) renders attempts, before-after & approval bar', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/fixes`);
    await expect(page.locator('h1')).toContainText('Autonomous Debugging & Fix Loops');
    await expect(page.locator('text=Root Cause Analysis')).toBeVisible();
    await expect(page.locator('text=Before vs. After Verification Matrix')).toBeVisible();
    await expect(page.locator('button:has-text("Approve & Merge Fix")')).toBeVisible();
  });

  test('Live Scanner View (/app/scan) renders two-column AST runner', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/scan`);
    await expect(page.locator('text=Live Scanner & Taint Reachability Engine')).toBeVisible();
    await expect(page.locator('button:has-text("Run Scan")')).toBeVisible();
  });

  test('Insights View (/app/insights) renders directory hotspot treemap & charts', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/insights`);
    await expect(page.locator('h1')).toContainText('Code Health & Architectural Trends');
    await expect(page.locator('text=Directory Hotspot Map')).toBeVisible();
    await expect(page.locator('text=Findings Introduced vs. Fixed Over Time')).toBeVisible();
  });

  test('Settings View (/app/settings/policy) renders quality gates & YAML editor', async ({ page }) => {
    await page.goto(`${BASE_URL}/app/settings/policy`);
    await expect(page.locator('h1')).toContainText('Settings & Repository Governance');
    await expect(page.locator('text=Quality Gates & Severity Floor')).toBeVisible();
    await expect(page.locator('text=Configured Quality Gate Rules')).toBeVisible();
  });
});
