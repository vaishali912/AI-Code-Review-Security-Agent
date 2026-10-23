import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LandingPage } from '../features/landing/LandingPage.js';
import { AppShell } from './AppShell.js';
import { OverviewPage } from '../features/overview/OverviewPage.js';
import { FindingsPage } from '../features/findings/FindingsPage.js';
import { PullsPage } from '../features/pulls/PullsPage.js';
import { TestsPage } from '../features/tests/TestsPage.js';
import { FixesPage } from '../features/fixes/FixesPage.js';
import { ScanPage } from '../features/scan/ScanPage.js';
import { InsightsPage } from '../features/insights/InsightsPage.js';
import { SettingsPage } from '../features/settings/SettingsPage.js';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/app/overview" replace />
      },
      {
        path: 'overview',
        element: <OverviewPage />
      },
      {
        path: 'pulls',
        element: <PullsPage />
      },
      {
        path: 'pulls/:id',
        element: <PullsPage />
      },
      {
        path: 'findings',
        element: <FindingsPage />
      },
      {
        path: 'findings/:id',
        element: <FindingsPage />
      },
      {
        path: 'tests',
        element: <TestsPage />
      },
      {
        path: 'tests/:runId',
        element: <TestsPage />
      },
      {
        path: 'fixes',
        element: <FixesPage />
      },
      {
        path: 'fixes/:id',
        element: <FixesPage />
      },
      {
        path: 'scan',
        element: <ScanPage />
      },
      {
        path: 'insights',
        element: <InsightsPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      },
      {
        path: 'settings/:section',
        element: <SettingsPage />
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
