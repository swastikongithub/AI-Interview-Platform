import React, { ReactNode } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { DEMO_ACCOUNTS_ENABLED } from '../../config';
import { ShieldAlert, RefreshCw, AlertTriangle } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, status, role, demoSwitchRole } = useAuth();

  if (status === 'initializing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-accent animate-spin" />
          <p className="text-text-muted text-sm font-medium">Verifying access & permissions...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !user || !role) {
    return <Navigate to="/login" replace />;
  }

  if (status === 'error') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="glass-card max-w-md w-full p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-surface-elevated border border-border rounded-2xl flex items-center justify-center mx-auto text-amber-400 shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Authentication Service Error</h3>
            <p className="text-sm text-slate-400">
              We encountered a network or server issue verifying your session.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-block w-full py-3 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-sm transition-all"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="glass-card max-w-md w-full p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-surface-elevated border border-border rounded-2xl flex items-center justify-center mx-auto text-danger shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Access Restricted (403 Forbidden)</h3>
            <p className="text-sm text-slate-400">
              This page requires one of the following roles:{' '}
              <span className="font-semibold text-accent">
                {allowedRoles.map((r) => r.toUpperCase()).join(', ')}
              </span>
              . Your current active role is{' '}
              <span className="font-semibold text-white">{role.toUpperCase()}</span>.
            </p>
          </div>

          {DEMO_ACCOUNTS_ENABLED && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-slate-400 mb-3">Quick Demo Account Switcher:</p>
              <div className="grid grid-cols-2 gap-2">
                {allowedRoles.map((targetRole) => (
                  <button
                    key={targetRole}
                    onClick={() => demoSwitchRole(targetRole)}
                    className="px-4 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-white font-semibold text-xs transition-all shadow-md hover:scale-105"
                  >
                    Switch to {targetRole}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
