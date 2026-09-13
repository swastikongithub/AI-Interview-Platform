import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { DEMO_ACCOUNTS_ENABLED } from '../../config';
import { useReducedMotionPreference } from '../../motion/hooks';
import {
  Sparkles,
  User,
  LayoutDashboard,
  Briefcase,
  Users,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, role, demoSwitchRole, logout } = useAuth();
  const location = useLocation();
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  const reduceMotion = useReducedMotionPreference();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 20);
  });

  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Body scroll lock and Focus Trap for mobile menu
  useEffect(() => {
    let focusableElements: HTMLElement[] = [];
    let firstElement: HTMLElement | null = null;
    let lastElement: HTMLElement | null = null;

    if (isMobileMenuOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      
      // Setup focus trap
      if (mobileMenuRef.current) {
        focusableElements = Array.from(
          mobileMenuRef.current.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])'
          )
        ) as HTMLElement[];
        
        if (focusableElements.length > 0) {
          firstElement = focusableElements[0];
          lastElement = focusableElements[focusableElements.length - 1];
          firstElement.focus();
        }
      }
    } else {
      document.body.style.overflow = 'unset';
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
        if (isRoleMenuOpen) setIsRoleMenuOpen(false);
      }
      
      // Focus Trap Logic
      if (isMobileMenuOpen && e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen, isRoleMenuOpen]);

  const roles: { id: UserRole; label: string; icon: any; color: string }[] = [
    { id: 'candidate', label: 'Candidate', icon: User, color: '' },
    { id: 'recruiter', label: 'Recruiter', icon: Briefcase, color: '' },
    { id: 'interviewer', label: 'Interviewer', icon: Users, color: '' },
    { id: 'admin', label: 'Admin', icon: ShieldCheck, color: '' },
  ];

  const currentRoleConfig = roles.find((r) => r.id === role) || roles[0];

  const navLinks = [
    ...(role === 'candidate'
      ? [
          { name: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
          { name: 'My Profile', path: '/candidate/profile', icon: User },
        ]
      : []),
    ...(role === 'recruiter'
      ? [{ name: 'Recruiter Portal', path: '/recruiter/dashboard', icon: Briefcase }]
      : []),
    ...(role === 'interviewer'
      ? [{ name: 'Interviews', path: '/interviewer/dashboard', icon: Users }]
      : []),
    ...(role === 'admin'
      ? [{ name: 'Admin Console', path: '/admin/dashboard', icon: ShieldCheck }]
      : []),
  ];

  const renderMobileMenu = () => {
    return (
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: reduceMotion ? 0.2 : 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[1000] bg-paper flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            <div className="flex items-center justify-between h-16 px-6 border-b border-line bg-paper shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-lg font-serif tracking-tight text-ink">
                  Antigravity <span className="italic">AI</span>
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-ink hover:text-accent transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-12 flex flex-col justify-between bg-paper">
              <nav className="space-y-6">
                {navLinks.map((item, index) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div
                      key={item.path}
                      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
                      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                      transition={{ delay: reduceMotion ? 0 : 0.1 + index * 0.05 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block text-3xl font-serif tracking-tight transition-colors ${
                          isActive ? 'text-accent' : 'text-ink hover:text-ink-muted'
                        }`}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="mt-12 space-y-8 shrink-0">
                {DEMO_ACCOUNTS_ENABLED && (
                  <motion.div
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: reduceMotion ? 0 : 0.3 }}
                    className="space-y-4"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint border-b border-line pb-2 block">
                      Active Role
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {roles.map((r) => {
                        const Icon = r.icon;
                        const isCurrent = role === r.id;
                        return (
                          <button
                            key={r.id}
                            onClick={() => {
                              demoSwitchRole(r.id);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`flex items-center gap-2 p-3 rounded-lg text-xs font-medium transition-all ${
                              isCurrent
                                ? 'bg-accent/10 text-accent border border-accent/30 shadow-sm'
                                : 'bg-paper-raised text-ink-muted border border-line hover:border-ink-faint'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {r.label}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: reduceMotion ? 0 : 0.4 }}
                  className="flex items-center justify-between pt-6 border-t border-line"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-paper-raised border border-line flex items-center justify-center text-accent font-bold text-sm shadow-sm">
                      {(profile?.name || user?.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {profile?.name || user?.email?.split('@')[0] || 'Demo User'}
                      </p>
                      <p className="text-[10px] font-mono text-ink-muted">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-2.5 px-4 rounded-full bg-paper-raised border border-line text-ink hover:text-critical transition-all shadow-sm flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-xs font-semibold">Sign out</span>
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-colors duration-300 border-b border-line ${
          scrolled ? 'bg-paper-raised shadow-sm' : 'bg-paper'
        }`}
      >
        <div className="flex items-stretch h-16 w-full">
          {/* Column 1: Brand (Narrower) */}
          <div className="flex-shrink-0 flex items-center px-6 md:px-8 border-r border-line md:w-64 lg:w-72">
            <Link to="/" className="flex items-center gap-2 group">
              <Sparkles className="w-4 h-4 text-accent" />
              <div className="flex flex-col">
                <span className="text-lg font-serif tracking-tight text-ink group-hover:text-accent transition-colors">
                  Antigravity <span className="italic">AI</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Column 2: Primary Navigation (Wider) */}
          <nav className="flex-1 hidden md:flex items-center px-8 relative">
            <div className="flex items-center gap-8 h-full">
              {navLinks.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center h-full text-sm font-sans tracking-wide transition-colors ${
                      isActive ? 'text-ink font-semibold' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    {reduceMotion ? (
                      <span>{item.name}</span>
                    ) : (
                      <motion.span 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.1 + index * 0.05 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent"
                        initial={false}
                        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Column 3: Context / Account (Narrower) */}
          <div className="hidden md:flex flex-shrink-0 items-stretch border-l border-line min-w-[320px]">
            {/* Role Switcher */}
            {DEMO_ACCOUNTS_ENABLED && (
              <div className="relative flex items-center border-r border-line px-4" ref={roleMenuRef}>
                <button
                  onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                  className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-line/20 transition-colors group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint group-hover:text-ink transition-colors">
                    {currentRoleConfig.label}
                  </span>
                  <ChevronDown className="w-3 h-3 text-ink-muted" />
                </button>

                {isRoleMenuOpen && (
                  <div className="absolute top-14 right-4 w-60 rounded-sm bg-paper border border-line p-3 z-50 shadow-sm animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-ink-faint font-mono">
                      Switch Demo Role (1-Click)
                    </div>
                    <div className="space-y-1">
                      {roles.map((r) => {
                        const Icon = r.icon;
                        const isCurrent = role === r.id;
                        return (
                          <button
                            key={r.id}
                            onClick={() => {
                              demoSwitchRole(r.id);
                              setIsRoleMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-sm text-xs font-medium transition-colors ${
                              isCurrent
                                ? 'bg-accent/10 text-accent border border-accent/30 font-semibold'
                                : 'text-ink-muted hover:bg-paper-raised hover:text-ink'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-3.5 h-3.5" />
                              <span>{r.label}</span>
                            </div>
                            {isCurrent && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/30 text-accent font-bold">
                                Active
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Account Info & Logout */}
            <div className="flex-1 flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-paper border border-line flex items-center justify-center text-accent font-bold text-xs shadow-sm">
                  {(profile?.name || user?.email || 'U')[0].toUpperCase()}
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-semibold text-ink leading-tight">
                    {profile?.name || user?.email?.split('@')[0] || 'Demo User'}
                  </span>
                  <span className="text-[10px] text-ink-faint font-mono leading-tight truncate max-w-[80px]">
                    {user?.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-critical/10 text-ink-muted hover:text-critical transition-all"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center px-4 md:hidden ml-auto border-l border-line">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-ink hover:text-accent transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Cinematic Mobile Menu Overlay via Portal to guarantee stacking on top */}
      {typeof document !== 'undefined' && createPortal(renderMobileMenu(), document.body)}
    </>
  );
};
