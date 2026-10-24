import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.js';
import { 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Database, 
  Key, 
  Sparkles,
  UserCheck
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const destination = (location.state as any)?.from?.pathname || '/app/overview';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate(destination, { replace: true });
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleSubmitting(true);

    const res = await loginWithGoogle();
    setIsGoogleSubmitting(false);

    if (res.success) {
      navigate(destination, { replace: true });
    } else {
      setError(res.error || 'Google login failed');
    }
  };

  const handlePreset = async (preset: 'admin' | 'dev') => {
    setError(null);
    setIsSubmitting(true);

    const res = await quickLogin(preset);
    setIsSubmitting(false);

    if (res.success) {
      navigate(destination, { replace: true });
    } else {
      setError(res.error || 'Preset login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F5F5F4] flex flex-col justify-between selection:bg-[#3E63DD] selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Bar Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-[#26262A]/60 backdrop-blur-md z-10">
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <span className="w-7 h-7 rounded-[7px] bg-[#FFFFFF] text-[#0A0A0A] flex items-center justify-center font-mono font-bold text-xs shadow-md">
            S
          </span>
          <span className="font-semibold text-sm tracking-tight text-[#FFFFFF]">
            SHERLOCK
          </span>
          <span className="text-[10px] font-mono uppercase bg-[#1A1A1E] text-[#30A46C] px-2 py-0.5 rounded border border-[#30A46C]/30 ml-1">
            v1.0 SaaS
          </span>
        </Link>

        <div className="flex items-center gap-4 text-xs font-mono text-[#71717A]">
          <span className="hidden sm:inline">Database:</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1A1A1E] border border-[#26262A] text-[#A1A1AA]">
            <Database className="w-3 h-3 text-[#30A46C]" />
            <span>SQLite WAL (Persistent)</span>
          </span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 my-8">
        <div className="w-full max-w-[440px] space-y-6">
          {/* Card Frame */}
          <div className="rounded-[14px] border border-[#26262A] bg-[#141416]/90 backdrop-blur-xl p-8 shadow-2xl space-y-6">
            <div className="space-y-1.5 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-[#FFFFFF]">
                Sign in to Sherlock
              </h1>
              <p className="text-xs text-[#A1A1AA]">
                AI code review and automated security verification
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-[8px] bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
            )}

            {/* 1. Google OAuth Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleSubmitting}
                className="w-full h-11 px-4 rounded-[8px] bg-[#FFFFFF] hover:bg-[#F0F0EE] text-[#0A0A0A] text-xs font-semibold flex items-center justify-center gap-3 transition-colors shadow-sm disabled:opacity-70 cursor-pointer"
              >
                {/* Authentic Google Multi-Color SVG */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isGoogleSubmitting ? 'Authenticating with Google...' : 'Continue with Google'}</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-[#26262A]" />
                <span className="absolute bg-[#141416] px-3 font-mono text-[10px] uppercase text-[#71717A] tracking-wider">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* 2. Traditional Email & Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#E4E4E7]">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full h-10 pl-9 pr-3 rounded-[8px] bg-[#0A0A0B] border border-[#26262A] focus:border-[#3E63DD] focus:ring-1 focus:ring-[#3E63DD] text-xs text-[#F5F5F4] placeholder:text-[#52525B] outline-none transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-[#E4E4E7]">
                    Password
                  </label>
                  <span className="text-[11px] text-[#71717A] hover:text-[#A1A1AA] cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-10 pl-9 pr-10 rounded-[8px] bg-[#0A0A0B] border border-[#26262A] focus:border-[#3E63DD] focus:ring-1 focus:ring-[#3E63DD] text-xs text-[#F5F5F4] placeholder:text-[#52525B] outline-none transition-all font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#A1A1AA] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 rounded-[8px] bg-[#3E63DD] hover:bg-[#3451B2] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 cursor-pointer shadow-md shadow-blue-500/10"
              >
                <span>{isSubmitting ? 'Signing in...' : 'Sign in to workspace'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* 3. Quick Demo Presets (1-Click Login for effortless testing) */}
            <div className="pt-2 border-t border-[#26262A] space-y-2">
              <div className="text-[11px] font-mono text-[#71717A] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E5A50A]" />
                <span>1-Click Test Credentials (Stored in SQLite):</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => handlePreset('admin')}
                  disabled={isSubmitting}
                  className="p-2.5 rounded-[8px] border border-[#26262A] bg-[#0A0A0B] hover:border-[#3E63DD] hover:bg-[#1A1A1E] text-left transition-all cursor-pointer group"
                >
                  <div className="text-[11px] font-bold text-[#FFFFFF] group-hover:text-[#3E63DD] flex items-center justify-between">
                    <span>Admin Lead</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-400">Owner</span>
                  </div>
                  <div className="text-[10px] text-[#71717A] truncate">admin@sherlock.dev</div>
                </button>

                <button
                  type="button"
                  onClick={() => handlePreset('dev')}
                  disabled={isSubmitting}
                  className="p-2.5 rounded-[8px] border border-[#26262A] bg-[#0A0A0B] hover:border-[#30A46C] hover:bg-[#1A1A1E] text-left transition-all cursor-pointer group"
                >
                  <div className="text-[11px] font-bold text-[#FFFFFF] group-hover:text-[#30A46C] flex items-center justify-between">
                    <span>Alex Rivera</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400">Dev</span>
                  </div>
                  <div className="text-[10px] text-[#71717A] truncate">dev@sherlock.dev</div>
                </button>
              </div>
            </div>

            {/* 4. Link to Signup */}
            <div className="text-center text-xs text-[#71717A] pt-1">
              Don't have an account yet?{' '}
              <Link to="/signup" className="text-[#3E63DD] hover:text-[#5B82F6] font-medium transition-colors">
                Sign up free
              </Link>
            </div>
          </div>

          {/* Security Assurance Badge */}
          <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[#71717A]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#30A46C]" />
            <span>Encrypted with scrypt KDF · Sessions in SQLite WAL</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-xs font-mono text-[#52525B] border-t border-[#26262A]/40">
        Sherlock v1.0 AI Code Review & Security Platform · Confidential & Secure
      </footer>
    </div>
  );
};
