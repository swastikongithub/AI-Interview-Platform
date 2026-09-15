import React, { ReactNode, createContext, useContext, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { DEMO_ACCOUNTS_ENABLED } from '../../config';
import { roleHome, roleLabel } from '../../lib/status';
import { Button, ButtonLink } from '../ui/Button';
import { StateBlock } from '../ui/States';
import { BrandMark } from '../shell/BrandMark';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

/**
 * Client-side route gate. This is UX only: identity comes exclusively from
 * the backend's /auth/me response and every API endpoint re-authorizes.
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, status, role } = useAuth();
  const location = useLocation();

  if (status === 'initializing') {
    return <GuardFrame><VerifyingAccess /></GuardFrame>;
  }

  if (status === 'error') {
    return (
      <GuardFrame>
        <AuthServiceError />
      </GuardFrame>
    );
  }

  if (status === 'unauthenticated' || !user || !role) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(role)) {
    return (
      <GuardFrame>
        <Forbidden role={role} allowedRoles={allowedRoles} />
      </GuardFrame>
    );
  }

  return <>{children}</>;
};

/** True when rendered inside the authenticated AppShell, which already provides a frame. */
export const InsideShellContext = createContext(false);

const GuardFrame: React.FC<{ children: ReactNode }> = ({ children }) => {
  const insideShell = useContext(InsideShellContext);
  if (insideShell) return <div className="max-w-2xl">{children}</div>;
  return (
    <div className="flex min-h-dvh flex-col bg-canvas px-4 sm:px-8">
      <div className="flex h-16 items-center">
        <BrandMark className="size-7" />
      </div>
      <div className="mx-auto flex w-full max-w-2xl flex-1 items-center">{children}</div>
    </div>
  );
};

const VerifyingAccess: React.FC = () => (
  <div role="status" aria-live="polite" className="w-full space-y-4">
    <p className="font-mono text-meta uppercase tracking-[0.08em] text-fg-muted">Checking access</p>
    <div className="activity-bar h-0.5 w-full max-w-sm rounded-full bg-edge" aria-hidden="true" />
    <p className="text-body text-fg-secondary">Confirming your session and role with the server…</p>
  </div>
);

const AuthServiceError: React.FC = () => {
  const queryClient = useQueryClient();
  const [retrying, setRetrying] = useState(false);
  return (
    <StateBlock
      kind="network"
      size="page"
      title="We couldn’t confirm your session"
      description="The authentication service didn’t respond as expected. Your data is safe — nothing was changed. Retry, or sign in again."
      actions={
        <>
          <Button
            leadingIcon={<RefreshCw />}
            loading={retrying}
            onClick={async () => {
              setRetrying(true);
              await queryClient.invalidateQueries({ queryKey: ['authMe'] });
              setRetrying(false);
            }}
          >
            Retry
          </Button>
          <ButtonLink to="/login" variant="secondary">
            Go to sign in
          </ButtonLink>
        </>
      }
    />
  );
};

const Forbidden: React.FC<{ role: UserRole; allowedRoles: UserRole[] }> = ({ role, allowedRoles }) => {
  const { demoSwitchRole } = useAuth();
  const [switching, setSwitching] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="w-full">
      <StateBlock
        kind="forbidden"
        size="page"
        title="This area belongs to another role"
        description={
          <>
            <p>
              This page is available to{' '}
              <strong className="font-medium text-fg">{allowedRoles.map((r) => roleLabel[r]).join(' or ')}</strong> accounts.
              You’re signed in as a <strong className="font-medium text-fg">{roleLabel[role]}</strong>.
            </p>
            {error && (
              <p role="alert" className="mt-3 text-body-sm text-negative">
                {error}
              </p>
            )}
          </>
        }
        actions={
          <>
            <ButtonLink to={roleHome[role]}>Go to your {roleLabel[role].toLowerCase()} workspace</ButtonLink>
            {DEMO_ACCOUNTS_ENABLED &&
              allowedRoles.map((target) => (
                <Button
                  key={target}
                  variant="secondary"
                  loading={switching === target}
                  disabled={switching !== null}
                  onClick={async () => {
                    setSwitching(target);
                    setError(null);
                    try {
                      await demoSwitchRole(target);
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Could not switch demo account.');
                    } finally {
                      setSwitching(null);
                    }
                  }}
                >
                  Use demo {roleLabel[target].toLowerCase()}
                </Button>
              ))}
          </>
        }
      />
    </div>
  );
};
