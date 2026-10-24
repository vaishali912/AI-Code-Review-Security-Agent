import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router.js';
import { ThemeProvider } from './lib/theme.js';
import { TooltipProvider } from './components/ui/Tooltip.js';
import { AuthProvider } from './features/auth/AuthContext.js';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={150}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
