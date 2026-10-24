import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.js';
import { 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Database,
  Building,
  Check
} from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'Security Engineer' | 'Full-Stack Developer' | 'Engineering Lead'>('Full-Stack Developer');
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Compute password strength score (0 to 4)
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-[#30A46C]'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!agreed) {
      setError('Please accept the Terms of Service to continue');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const res = await signup(name, email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/app/overview', { replace: true });
    } else {
      setError(res.error || 'Failed to create account');
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setIsGoogleSubmitting(true);

    const res = await loginWithGoogle();
    setIsGoogleSubmitting(false);

    if (res.success) {
      navigate('/app/overview', { replace: true });
    } else {
      setError(res.error || 'Google sign-up failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F5F5F4] flex flex-col justify-between selection:bg-[#3E63DD] selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-[-10%] right-[20%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

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
            Sign Up
          </span>
        </Link>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-[#71717A] hidden sm:inline">Already have an account?</span>
          <Link
            to="/login"
            className="px-3 py-1.5 rounded-[6px] border border-[#26262A] bg-[#141416] hover:bg-[#1A1A1E] text-[#F5F5F4] font-medium transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Main Signup Form Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 my-8">
        <div className="w-full max-w-[460px] space-y-6">
          <div className="rounded-[14px] border border-[#26262A] bg-[#141416]/90 backdrop-blur-xl p-8 shadow-2xl space-y-6">
            <div className="space-y-1.5 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-[#FFFFFF]">
                Create your Sherlock account
              </h1>
              <p className="text-xs text-[#A1A1AA]">
                Start scanning repositories with verified exploit synthesis
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-[8px] bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
            )}

            {/* Google One-Click Signup */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isGoogleSubmitting}
                className="w-full h-11 px-4 rounded-[8px] bg-[#FFFFFF] hover:bg-[#F0F0EE] text-[#0A0A0A] text-xs font-semibold flex items-center justify-center gap-3 transition-colors shadow-sm disabled:opacity-70 cursor-pointer"
              >
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
                <span>{isGoogleSubmitting ? 'Connecting with Google...' : 'Sign up with Google'}</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-[#26262A]" />
                <span className="absolute bg-[#141416] px-3 font-mono text-[10px] uppercase text-[#71717A] tracking-wider">
                  Or register with email
                </span>
              </div>
            </div>

            {/* Email Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#E4E4E7]">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Saurabh Kumar"
                    className="w-full h-10 pl-9 pr-3 rounded-[8px] bg-[#0A0A0B] border border-[#26262A] focus:border-[#3E63DD] focus:ring-1 focus:ring-[#3E63DD] text-xs text-[#F5F5F4] placeholder:text-[#52525B] outline-none transition-all"
                    required
                  />
                </div>
              </div>

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
                    placeholder="saurabh@company.com"
                    className="w-full h-10 pl-9 pr-3 rounded-[8px] bg-[#0A0A0B] border border-[#26262A] focus:border-[#3E63DD] focus:ring-1 focus:ring-[#3E63DD] text-xs text-[#F5F5F4] placeholder:text-[#52525B] outline-none transition-all font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#E4E4E7]">
                  Primary Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-[8px] bg-[#0A0A0B] border border-[#26262A] focus:border-[#3E63DD] text-xs text-[#F5F5F4] outline-none transition-all cursor-pointer"
                >
                  <option value="Full-Stack Developer">Full-Stack Developer</option>
                  <option value="Security Engineer">Security Engineer</option>
                  <option value="Engineering Lead">Engineering Lead / Architect</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#E4E4E7]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
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

                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex gap-1 h-1">
                      {[0, 1, 2, 3].map((idx) => (
                        <div
                          key={idx}
                          className={`flex-1 rounded-full transition-all ${
                            idx < strength ? strengthColors[strength] : 'bg-[#26262A]'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-[#71717A]">
                      <span>Strength: {strengthLabels[strength]}</span>
                      <span>8+ chars with mix of letters & symbols</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Terms checkbox */}
              <label className="flex items-start gap-2.5 pt-1 text-xs text-[#A1A1AA] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded border-[#26262A] bg-[#0A0A0B] text-[#3E63DD] focus:ring-0 cursor-pointer"
                />
                <span className="leading-relaxed">
                  I agree to the <span className="text-[#F5F5F4] underline">Terms of Service</span> and acknowledge the <span className="text-[#F5F5F4] underline">Privacy Policy</span>.
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 rounded-[8px] bg-[#3E63DD] hover:bg-[#3451B2] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 cursor-pointer shadow-md shadow-blue-500/10"
              >
                <span>{isSubmitting ? 'Creating account...' : 'Create Account & Launch'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[#71717A]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#30A46C]" />
            <span>Dedicated SQLite database initialized in `.sherlock/sherlock.db`</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-xs font-mono text-[#52525B] border-t border-[#26262A]/40">
        Sherlock Security · Multi-Tenant Ready · Scrypt KDF · Zero-Telemetry
      </footer>
    </div>
  );
};
