import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router.js';
import { ThemeProvider } from './lib/theme.js';
import { TooltipProvider } from './components/ui/Tooltip.js';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={150}>
        <RouterProvider router={router} />
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
