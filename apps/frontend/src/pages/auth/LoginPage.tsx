import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, type Location } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_ACCOUNTS_LIST } from '../../config/demoAccounts';
import { DEMO_ACCOUNTS_ENABLED } from '../../config';
import { supabase } from '../../services/supabase';
import type { UserRole } from '../../types';
import { roleHome, roleLabel } from '../../lib/status';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/Field';
import { Spinner } from '../../components/ui/Spinner';
import { BrandMark, Wordmark } from '../../components/shell/BrandMark';
import { TextReveal } from '../../motion/TextReveal';

type Busy = null | 'password' | 'google' | 'apple' | UserRole;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendlyAuthError(message: string | undefined): string {
  if (!message) return 'Sign in failed. Try again.';
  if (/invalid login credentials/i.test(message)) return 'That email and password don’t match an account.';
  if (/email not confirmed/i.test(message)) return 'Confirm your email address before signing in.';
  if (/fetch|network/i.test(message)) return 'The sign-in service could not be reached. Check your connection.';
  return message;
}

const capabilities = [
  {
    title: 'Structured interviews',
    body: 'Answer one question at a time. Every response is saved to the server the moment you submit it.',
  },
  {
    title: 'Résumé analysis',
    body: 'Upload a PDF to extract your experience and get ATS feedback on missing keywords and structure.',
  },
  {
    title: 'Evaluation workflow',
    body: 'Interviewers score responses against criteria; candidates see results only once they are released.',
  },
];

export const LoginPage: React.FC = () => {
  const { status, role, demoSwitchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location } | null)?.from;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [awaitingProfile, setAwaitingProfile] = useState(false);

  // Once the backend confirms identity, continue to where the user was going.
  useEffect(() => {
    if (status === 'authenticated' && role) {
      const target = from && from.pathname !== '/login' ? `${from.pathname}${from.search}` : roleHome[role];
      navigate(target, { replace: true });
    } else if (awaitingProfile && status === 'error') {
      setAwaitingProfile(false);
      setBusy(null);
      setFormError('You signed in, but your account details couldn’t be loaded. Try again shortly.');
    }
  }, [status, role, from, navigate, awaitingProfile]);

  const isBusy = busy !== null || (awaitingProfile && status === 'initializing');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof fieldErrors = {};
    if (!email.trim()) errors.email = 'Enter your email address.';
    else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email address, like name@company.com.';
    if (!password) errors.password = 'Enter your password.';
    setFieldErrors(errors);
    setFormError(null);
    if (errors.email || errors.password) return;

    setBusy('password');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setFormError(friendlyAuthError(error.message));
      setBusy(null);
      return;
    }
    setAwaitingProfile(true);
    setBusy(null);
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setBusy(provider);
    setFormError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/candidate/dashboard` },
    });
    // On success the browser leaves for the provider; only failures return here.
    if (error) {
      setFormError(friendlyAuthError(error.message) || `Sign in with ${provider} failed.`);
      setBusy(null);
    }
  };

  const handleDemo = async (target: UserRole) => {
    setBusy(target);
    setFormError(null);
    try {
      await demoSwitchRole(target);
      setAwaitingProfile(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not sign in to the demo account.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid grid-cols-1 min-h-dvh bg-canvas lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* Editorial panel */}
      <section className="theme-night relative flex flex-col overflow-hidden bg-canvas px-5 pb-8 pt-5 text-fg sm:px-10 lg:min-h-dvh lg:px-14 lg:pb-14 lg:pt-10">
        <div className="flex items-center gap-2.5">
          <BrandMark className="size-8" />
          <Wordmark />
        </div>

        <div className="mt-8 max-w-xl lg:mt-auto">
          <p className="font-mono text-meta uppercase tracking-[0.08em] text-signal-text">AI interview platform</p>
          <TextReveal as="h1" className="mt-4 font-display text-display-lg text-fg lg:text-display-xl" delay={0.05}>
            Interviews that hold up to scrutiny.
          </TextReveal>
          <p className="mt-5 hidden max-w-md text-body-lg text-fg-secondary sm:block">
            Practice with structured questions, understand how your résumé reads to screening software, and get
            evaluated on the answers you actually gave.
          </p>
        </div>

        <ol className="stagger mt-12 hidden gap-px overflow-hidden rounded-md bg-edge lg:grid lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <li key={c.title} className="flex flex-col gap-3 bg-canvas p-5">
              <span className="font-mono text-meta text-fg-muted">0{i + 1}</span>
              <p className="text-title-sm text-fg">{c.title}</p>
              <p className="text-body-sm text-fg-muted">{c.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Sign-in panel */}
      <section className="flex items-start justify-center px-5 py-10 sm:px-10 lg:items-center lg:py-14">
        <div className="w-full max-w-[25rem]">
          <h2 className="font-display text-display-md text-fg">Sign in</h2>
          <p className="mt-2 text-body text-fg-secondary">
            New here? Continue with Google or Apple — a candidate account is created for you.
          </p>

          {formError && (
            <div role="alert" className="mt-6 flex items-start gap-2.5 rounded-sm bg-negative-soft px-3.5 py-3 text-body-sm text-negative">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{formError}</span>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-2.5">
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={isBusy}
              loading={busy === 'google'}
              loadingLabel="Redirecting to Google…"
              onClick={() => handleOAuth('google')}
              leadingIcon={<GoogleIcon />}
            >
              Continue with Google
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isBusy}
              loading={busy === 'apple'}
              loadingLabel="Redirecting to Apple…"
              onClick={() => handleOAuth('apple')}
              leadingIcon={<AppleIcon />}
            >
              Continue with Apple
            </Button>
          </div>

          <div className="my-7 flex items-center gap-3 text-meta text-fg-muted" role="separator">
            <span className="h-px flex-1 bg-edge" />
            or with email
            <span className="h-px flex-1 bg-edge" />
          </div>

          <form className="grid grid-cols-1 gap-4" onSubmit={handlePasswordLogin} noValidate>
            <TextField
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              disabled={isBusy}
            />
            <TextField
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              disabled={isBusy}
            />
            <Button
              type="submit"
              size="lg"
              variant="signal"
              className="mt-2 w-full"
              loading={busy === 'password' || (awaitingProfile && status === 'initializing')}
              loadingLabel="Signing in…"
              disabled={isBusy}
              trailingIcon={<ArrowRight />}
            >
              Sign in
            </Button>
          </form>

          {DEMO_ACCOUNTS_ENABLED && (
            <div className="mt-10">
              <div className="flex items-baseline justify-between">
                <p className="text-label text-fg">Demo accounts</p>
                <p className="font-mono text-micro uppercase text-fg-muted">Development only</p>
              </div>
              <ul className="mt-3 divide-y divide-edge overflow-hidden rounded-md bg-surface shadow-hairline">
                {DEMO_ACCOUNTS_LIST.map((acc) => (
                  <li key={acc.role}>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDemo(acc.role)}
                      className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-quick hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="min-w-0">
                        <span className="block text-title-sm text-fg">{roleLabel[acc.role]}</span>
                        <span className="block truncate font-mono text-meta text-fg-muted">{acc.email}</span>
                      </span>
                      {busy === acc.role ? (
                        <Spinner className="text-fg-muted" />
                      ) : (
                        <ArrowRight
                          className="size-4 text-fg-muted transition-transform duration-quick ease-out group-hover:translate-x-0.5 group-hover:text-fg"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
    <path d="M16.37 12.63c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.84.86-3.6 2.18-1.54 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.24 2.73 2.2 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.4 1.2-2.47-.03-.01-2.3-.88-2.28-3.52zM14.2 6.17c.6-.73 1.01-1.74.9-2.75-.87.04-1.92.58-2.54 1.3-.56.64-1.05 1.67-.92 2.66.97.08 1.96-.49 2.56-1.21z" />
  </svg>
);
