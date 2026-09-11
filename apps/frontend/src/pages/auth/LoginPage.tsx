import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_ACCOUNTS_LIST } from '../../config/demoAccounts';
import { DEMO_ACCOUNTS_ENABLED } from '../../config';
import { supabase } from '../../services/supabase';
import { Sparkles, User, Briefcase, Users, ShieldCheck, LogIn, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { demoSwitchRole, status } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (status === 'authenticated') {
      navigate('/candidate/dashboard', { replace: true });
    }
  }, [status, navigate]);

  const handleDemoLogin = async (role: UserRole) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await demoSwitchRole(role);
      const dashboardPaths: Record<UserRole, string> = {
        candidate: '/candidate/dashboard',
        recruiter: '/recruiter/dashboard',
        interviewer: '/interviewer/dashboard',
        admin: '/admin/dashboard',
      };
      navigate(dashboardPaths[role], { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in to demo account');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }
      navigate('/candidate/dashboard', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const roleIcons: Record<UserRole, any> = {
    candidate: User,
    recruiter: Briefcase,
    interviewer: Users,
    admin: ShieldCheck,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-accent shadow-xl">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Sign in to Antigravity <span className="gradient-text font-normal">AI</span>
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Choose a demo account below or sign in with your email and password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface/90 backdrop-blur-xl border border-border py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {DEMO_ACCOUNTS_ENABLED && (
            <>
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  1-Click Demo Accounts (Local / Dev)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {DEMO_ACCOUNTS_LIST.map((acc) => {
                    const Icon = roleIcons[acc.role] || User;
                    return (
                      <button
                        key={acc.role}
                        type="button"
                        disabled={loading}
                        onClick={() => handleDemoLogin(acc.role)}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-surface-elevated/80 border border-border hover:border-accent/50 hover:bg-surface-elevated text-left transition-all duration-200 group disabled:opacity-50"
                      >
                        <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white capitalize">{acc.role}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[90px]">
                            {acc.email.split('@')[0]}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-surface px-2 text-slate-400">Or continue with credentials</span>
                </div>
              </div>
            </>
          )}

          <form className="space-y-4" onSubmit={handleEmailPasswordLogin}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-white text-sm focus:outline-none focus:border-accent transition-colors"
                  placeholder="candidate.demo@antigravity.dev"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-elevated border border-border text-white text-sm focus:outline-none focus:border-accent transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-bold shadow-lg shadow-accent/20 transition-all duration-200 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Signing in...' : 'Sign in'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
