import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  provider: 'local' | 'google' | 'github';
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (simulatedUser?: { email: string; name: string; avatarUrl?: string }) => Promise<{ success: boolean; error?: string }>;
  quickLogin: (preset: 'admin' | 'dev') => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('sherlock_token') : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate active session on mount
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const storedToken = localStorage.getItem('sherlock_token');
      if (!storedToken) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (mounted && data.user) {
            setUser(data.user);
            setToken(storedToken);
          }
        } else {
          // Token expired or invalid
          localStorage.removeItem('sherlock_token');
          if (mounted) {
            setUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        console.warn('[AUTH] Session verification error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    checkSession();
    return () => { mounted = false; };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to sign in' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('sherlock_token', data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to create account' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('sherlock_token', data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during signup' };
    }
  };

  const loginWithGoogle = async (simulatedUser?: { email: string; name: string; avatarUrl?: string }) => {
    try {
      const payload = simulatedUser || {
        email: 'developer.google@sherlock.dev',
        name: 'Google Verified Developer',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser',
        googleId: 'goog_' + Date.now()
      };

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Google sign-in failed' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('sherlock_token', data.token);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Google OAuth error' };
    }
  };

  const quickLogin = async (preset: 'admin' | 'dev') => {
    const creds = preset === 'admin'
      ? { email: 'admin@sherlock.dev', password: 'AdminPassword123!' }
      : { email: 'dev@sherlock.dev', password: 'DevPassword123!' };
    return login(creds.email, creds.password);
  };

  const logout = async () => {
    const activeToken = token || localStorage.getItem('sherlock_token');
    if (activeToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${activeToken}` }
        });
      } catch (e) {}
    }
    localStorage.removeItem('sherlock_token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        loginWithGoogle,
        quickLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
