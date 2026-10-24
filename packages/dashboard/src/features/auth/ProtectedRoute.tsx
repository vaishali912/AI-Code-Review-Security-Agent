import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.js';
import { Shield } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-[#F5F5F4] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#3E63DD] to-[#30A46C] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-1 text-center">
            <h3 className="text-sm font-semibold text-[#F5F5F4] tracking-wide">
              SHERLOCK SECURITY
            </h3>
            <p className="text-xs text-[#71717A] font-mono">
              Verifying session token with SQLite database...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
