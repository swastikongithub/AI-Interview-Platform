import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeftRight, ChevronsUpDown, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_ACCOUNTS_ENABLED } from '../../config';
import { DEMO_ACCOUNTS_LIST } from '../../config/demoAccounts';
import type { UserRole } from '../../types';
import { cn } from '../../utils/cn';
import { initials } from '../../lib/format';
import { roleHome, roleLabel } from '../../lib/status';
import { transitions } from '../../motion/tokens';
import { RouteTransition } from '../../motion/RouteTransition';
import { InsideShellContext } from '../auth/RoleGuard';
import { useFocusTrap } from '../ui/useFocusTrap';
import { IconButton } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { useToast } from '../ui/Toast';
import { BrandMark, Wordmark } from './BrandMark';
import { findActiveItem, isNavItemActive, navigationByRole } from './navigation';

/**
 * Authenticated application frame.
 * ≥1024px: a fixed dark rail holds identity, role-aware navigation and account.
 * <1024px: a slim top bar names the current location; the same rail content
 * opens as a focus-trapped drawer.
 */
export const AppShell: React.FC = () => {
  const { role } = useAuth();
  const { pathname, hash } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const active = findActiveItem(role, pathname);

  // On navigation: close the drawer and start the new page at the top
  // (unless the URL targets an in-page anchor).
  useEffect(() => {
    setDrawerOpen(false);
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return (
    <div className="min-h-dvh bg-canvas">
      <a
        href="#main"
        className="sr-only z-toast rounded-sm bg-signal px-3 py-2 text-signal-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <aside
        className="theme-night fixed inset-y-0 left-0 z-rail hidden w-[var(--rail-width)] flex-col border-r border-edge bg-canvas lg:flex"
        aria-label="Primary"
      >
        <RailContent layoutGroup="rail" />
      </aside>

      <header className="sticky top-0 z-header flex h-14 items-center gap-3 border-b border-edge bg-canvas/95 px-4 backdrop-blur-sm sm:px-6 lg:hidden">
        <IconButton
          label="Open navigation"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-controls="mobile-navigation"
          className="-ml-2"
        >
          <Menu />
        </IconButton>
        <Link to={role ? roleHome[role] : '/'} className="flex items-center gap-2 rounded-xs" aria-label="Antigravity home">
          <BrandMark className="size-7" />
        </Link>
        <span className="h-4 w-px bg-edge" aria-hidden="true" />
        <p className="min-w-0 truncate text-title-sm text-fg">{active?.label ?? 'Workspace'}</p>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="lg:pl-[var(--rail-width)]">
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-page px-4 pb-24 pt-8 outline-none sm:px-6 md:pt-10 lg:px-10 lg:pt-14">
          <InsideShellContext.Provider value={true}>
            <RouteTransition>
              <Outlet />
            </RouteTransition>
          </InsideShellContext.Provider>
        </main>
      </div>
    </div>
  );
};

const MobileDrawer: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) =>
  createPortal(
    <AnimatePresence>{open && <DrawerPanel key="drawer" onClose={onClose} />}</AnimatePresence>,
    document.body
  );

const DrawerPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useFocusTrap(ref, true, onClose);

  return (
    <div className="fixed inset-0 z-overlay lg:hidden">
      <motion.div
        className="absolute inset-0 bg-[rgb(8_10_14/0.55)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transitions.drawer}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        ref={ref}
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        tabIndex={-1}
        className="theme-night absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col bg-canvas shadow-overlay outline-none"
        initial={reduce ? { opacity: 0 } : { transform: 'translateX(-100%)' }}
        animate={reduce ? { opacity: 1 } : { transform: 'translateX(0%)' }}
        exit={reduce ? { opacity: 0 } : { transform: 'translateX(-100%)' }}
        transition={transitions.drawer}
      >
        <IconButton label="Close navigation" onClick={onClose} className="absolute right-3 top-3.5 z-10">
          <X />
        </IconButton>
        <RailContent layoutGroup="drawer" />
      </motion.div>
    </div>
  );
};

const RailContent: React.FC<{ layoutGroup: string }> = ({ layoutGroup }) => {
  const { role, user, profile } = useAuth();
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  if (!role) return null;
  const groups = navigationByRole[role];

  return (
    <>
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <Link to={roleHome[role]} className="flex items-center gap-2.5 rounded-xs">
          <BrandMark className="size-7" />
          <Wordmark />
        </Link>
      </div>

      <div className="px-5 pb-2 pt-3">
        <p className="font-mono text-micro uppercase text-fg-muted">{roleLabel[role]} workspace</p>
      </div>

      <nav className="scrollbar-none flex-1 overflow-y-auto px-3 pb-6" aria-label={`${roleLabel[role]} navigation`}>
        {groups.map((group) => (
          <div key={group.label} className="mt-4 first:mt-2">
            <p className="px-2 pb-1.5 text-meta text-fg-muted">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = isNavItemActive(item, pathname);
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'relative flex h-10 items-center gap-3 rounded-sm px-3 text-body transition-colors duration-quick ease-out',
                        isActive ? 'bg-surface text-fg' : 'text-fg-secondary hover:bg-surface/60 hover:text-fg'
                      )}
                    >
                      {isActive && (
                        // Spatial continuity: the marker travels to the newly active item.
                        <motion.span
                          layoutId={`${layoutGroup}-active-marker`}
                          className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-signal"
                          transition={reduce ? { duration: 0 } : transitions.move}
                          aria-hidden="true"
                        />
                      )}
                      <Icon className={cn('size-[1.125rem]', isActive ? 'text-signal' : 'text-fg-muted')} aria-hidden="true" />
                      {item.label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <AccountPanel
        name={profile?.name || user?.email?.split('@')[0] || 'Account'}
        email={user?.email ?? ''}
        role={role}
      />
    </>
  );
};

const AccountPanel: React.FC<{ name: string; email: string; role: UserRole }> = ({ name, email, role }) => {
  const { logout, demoSwitchRole } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<UserRole | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const menuId = React.useId();

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => menuRef.current?.querySelector<HTMLElement>('button')?.focus());
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      setSigningOut(false);
      notify({ tone: 'error', title: 'Sign out failed', description: 'Try again in a moment.' });
    }
  };

  const handleSwitch = async (target: UserRole) => {
    setSwitchingTo(target);
    try {
      await demoSwitchRole(target);
      setMenuOpen(false);
      navigate(roleHome[target], { replace: true });
    } catch (err) {
      notify({ tone: 'error', title: 'Could not switch account', description: err instanceof Error ? err.message : undefined });
    } finally {
      setSwitchingTo(null);
    }
  };

  return (
    <div className="relative shrink-0 border-t border-edge p-3">
      <AnimatePresence>
        {menuOpen && DEMO_ACCOUNTS_ENABLED && (
          <motion.div
            ref={menuRef}
            id={menuId}
            className="absolute inset-x-3 bottom-[calc(100%-0.25rem)] origin-bottom rounded-md bg-surface p-1.5 shadow-overlay"
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.95)' }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, transform: 'scale(1)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.95)' }}
            transition={transitions.popover}
          >
            <p className="px-2.5 pb-1.5 pt-1 text-meta text-fg-muted">Switch demo account</p>
            <ul>
              {DEMO_ACCOUNTS_LIST.map((acc) => {
                const current = acc.role === role;
                return (
                  <li key={acc.role}>
                    <button
                      type="button"
                      disabled={current || switchingTo !== null}
                      onClick={() => handleSwitch(acc.role)}
                      className="flex h-9 w-full items-center justify-between gap-2 rounded-sm px-2.5 text-left text-body-sm text-fg-secondary transition-colors duration-quick hover:bg-surface-hover hover:text-fg disabled:cursor-default disabled:hover:bg-transparent"
                    >
                      <span>{roleLabel[acc.role]}</span>
                      {current ? (
                        <span className="font-mono text-micro uppercase text-signal-text">Current</span>
                      ) : switchingTo === acc.role ? (
                        <Spinner className="size-3.5" />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2.5 rounded-sm p-1.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-signal font-mono text-meta font-medium text-signal-fg" aria-hidden="true">
          {initials(name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-title-sm text-fg">{name}</p>
          <p className="truncate font-mono text-micro text-fg-muted" title={email}>
            {email}
          </p>
        </div>
        {DEMO_ACCOUNTS_ENABLED && (
          <IconButton
            ref={triggerRef}
            label="Switch demo account"
            size="sm"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? menuId : undefined}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <ChevronsUpDown /> : <ArrowLeftRight />}
          </IconButton>
        )}
        <IconButton label="Sign out" size="sm" onClick={handleLogout} disabled={signingOut}>
          {signingOut ? <Spinner /> : <LogOut />}
        </IconButton>
      </div>
    </div>
  );
};
