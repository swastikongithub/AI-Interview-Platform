import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roleHome, roleLabel } from '../lib/status';
import { ButtonLink } from '../components/ui/Button';
import { StateBlock } from '../components/ui/States';

export const NotFoundPage: React.FC = () => {
  const { role } = useAuth();
  const { pathname } = useLocation();
  return (
    <StateBlock
      kind="not_found"
      size="page"
      title="This page doesn’t exist"
      description={
        <>
          Nothing lives at <span className="break-all font-mono text-body-sm text-fg">{pathname}</span>. The link may be
          outdated, or the address mistyped.
        </>
      }
      actions={role ? <ButtonLink to={roleHome[role]}>Back to your {roleLabel[role].toLowerCase()} workspace</ButtonLink> : <ButtonLink to="/login">Sign in</ButtonLink>}
    />
  );
};
