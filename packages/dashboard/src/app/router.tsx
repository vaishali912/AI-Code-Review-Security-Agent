import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LandingPage } from '../features/landing/LandingPage.js';
import { AppShell } from './AppShell.js';
import { FindingsPage } from '../features/findings/FindingsPage.js';
import { PullsPage } from '../features/pulls/PullsPage.js';
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
        element: <Navigate to="/app/findings" replace />
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
        path: 'pulls',
        element: <PullsPage />
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
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
