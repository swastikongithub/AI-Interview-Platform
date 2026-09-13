import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_ACCOUNTS_LIST } from '../../config/demoAccounts';
import { DEMO_ACCOUNTS_ENABLED } from '../../config';
import { supabase } from '../../services/supabase';
import { Sparkles, User, Briefcase, Users, ShieldCheck, LogIn, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types';

import { PageTransition } from '../../motion/PageTransition';
import { ScrollProgress } from '../../motion/ScrollProgress';
import { MaskedTextReveal } from '../../motion/MaskedTextReveal';
import { Reveal } from '../../motion/Reveal';
import { Parallax } from '../../motion/Parallax';
import { StickyStory } from '../../motion/StickyStory';
import { ImageReveal } from '../../motion/ImageReveal';

import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

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

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/candidate/dashboard`,
        },
      });
      if (error) {
        throw error;
      }
    } catch (err: any) {
      setErrorMsg(err.message || `Authentication with ${provider} failed`);
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
    <PageTransition className="bg-paper min-h-screen font-sans text-ink selection:bg-accent/30 selection:text-accent">
      <ScrollProgress />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-8 md:px-16 max-w-[1400px] mx-auto border-b border-line">
        <Parallax offset={40} className="max-w-4xl">
          <span className="font-mono text-xs uppercase tracking-widest text-ink-muted mb-6 block border-b border-line inline-block pb-1">
            Antigravity Platform
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-ink tracking-tight leading-tight mb-8">
            <MaskedTextReveal text="Autonomous Technical Hiring." delay={0.1} />
          </h1>
          <Reveal delay={0.8}>
            <p className="text-xl md:text-2xl text-ink-muted max-w-2xl font-sans font-light leading-relaxed">
              A museum-grade interface for the next generation of AI-powered engineering interviews. Precision analysis, uncompromising design.
            </p>
          </Reveal>
        </Parallax>
      </section>

      {/* Narrative Section */}
      <section className="max-w-[1400px] mx-auto border-b border-line">
        <StickyStory
          content={
            <div className="max-w-sm">
              <h2 className="text-4xl font-serif text-ink mb-6">Objective Evaluation</h2>
              <p className="text-ink-muted text-lg font-sans font-light">
                The AI Interview Platform evaluates candidates against objective technical rubrics with complete neutrality. We remove the bias from the interview process while maintaining human-level code review fidelity.
              </p>
            </div>
          }
        >
          <div className="space-y-48 px-8 md:px-0">
            <div className="space-y-6">
              <span className="font-mono text-xs text-accent uppercase tracking-widest border-b border-accent/30 pb-1 inline-block">01 / Architectural Analysis</span>
              <ImageReveal 
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80" 
                alt="Code Editor Analysis" 
                className="aspect-video w-full"
              />
              <Reveal y={10}><p className="text-ink-muted font-light text-lg">Real-time resume parsing and capabilities extraction.</p></Reveal>
            </div>
            <div className="space-y-6">
              <span className="font-mono text-xs text-accent uppercase tracking-widest border-b border-accent/30 pb-1 inline-block">02 / System Scalability</span>
              <ImageReveal 
                src="https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1200&q=80" 
                alt="Server infrastructure" 
                className="aspect-[4/3] w-full"
              />
              <Reveal y={10}><p className="text-ink-muted font-light text-lg">Asynchronous queueing through BullMQ ensures reliable processing of thousands of candidate signals.</p></Reveal>
            </div>
          </div>
        </StickyStory>
      </section>

      {/* Authentication Gateway */}
      <section className="max-w-md mx-auto py-32 px-8">
        <Reveal>
          <div className="mb-12 border-b border-line pb-4 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-sm bg-paper-raised border border-line flex items-center justify-center text-accent mb-6 shadow-sm">
              <Sparkles className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-serif text-ink">Authenticate</h2>
            <p className="text-ink-muted mt-3 font-mono text-xs uppercase tracking-widest">Identity Verification Required</p>
          </div>
          
          <div className="bg-paper-raised border border-line p-8 shadow-sm">
            {errorMsg && (
              <div className="mb-8 p-4 bg-critical/5 border border-critical/20 flex items-start gap-3 text-critical text-sm font-sans">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3 mb-8">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleOAuthLogin('google')}
                className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-paper border border-line hover:border-ink/20 text-ink font-sans text-sm font-medium transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleOAuthLogin('apple')}
                className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-ink border border-ink text-paper font-sans text-sm font-medium hover:bg-ink-muted transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.05 19.34c-1.34 1.95-2.73 3.91-4.91 3.96-2.14.05-2.85-1.25-5.29-1.25-2.42 0-3.21 1.2-5.24 1.29-2.14.09-3.7-2.1-5.06-4.04C-1.07 11.2-.5 6.64 2 4.19c1.23-1.21 2.87-1.99 4.67-2.04 2.08-.05 4.02 1.38 5.11 1.38 1.07 0 3.36-1.68 5.8-1.43 1.02.04 3.92.42 5.76 3.12-1.49 1.14-2.43 2.91-2.43 4.88 0 2.5 1.77 4.54 4.09 5.36-.61 1.48-1.35 2.83-2.17 3.84L17.05 19.34M12.03 2.6c.72-.94 1.2-2.15 1.07-3.38-1.07.05-2.39.73-3.15 1.71-.66.86-1.23 2.11-1.07 3.33 1.2.09 2.42-.71 3.15-1.66z"/>
                </svg>
                Continue with Apple
              </button>
            </div>

            <div className="relative my-8 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line" />
              </div>
              <div className="relative bg-paper-raised px-4 text-[10px] font-mono text-ink-faint uppercase tracking-widest">
                Or standard credentials
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleEmailPasswordLogin}>
              <Input
                id="email"
                label="Email Address"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate.demo@antigravity.dev"
              />

              <Input
                id="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3.5 text-sm uppercase tracking-widest font-mono"
                isLoading={loading}
              >
                <LogIn className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Access
              </Button>
            </form>

            {DEMO_ACCOUNTS_ENABLED && (
              <>
                <div className="relative my-8 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-line" />
                  </div>
                  <div className="relative bg-paper-raised px-4 text-[10px] font-mono text-ink-faint uppercase tracking-widest">
                    Demo Directorates
                  </div>
                </div>

                <div>
                  <div className="grid grid-cols-2 gap-3">
                    {DEMO_ACCOUNTS_LIST.map((acc) => {
                      const Icon = roleIcons[acc.role] || User;
                      return (
                        <button
                          key={acc.role}
                          type="button"
                          disabled={loading}
                          onClick={() => handleDemoLogin(acc.role)}
                          className="flex items-center gap-3 p-3 bg-paper border border-line hover:border-accent/40 text-left transition-colors duration-200 group disabled:opacity-50"
                        >
                          <div className="w-8 h-8 bg-paper-pressed flex items-center justify-center text-ink-muted group-hover:text-accent transition-colors">
                            <Icon className="w-4 h-4" strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-[11px] font-mono font-bold text-ink uppercase tracking-wider">{acc.role}</p>
                            <p className="text-[10px] font-sans text-ink-faint truncate max-w-[80px]">
                              {acc.email.split('@')[0]}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

          </div>
        </Reveal>
      </section>
    </PageTransition>
  );
};
