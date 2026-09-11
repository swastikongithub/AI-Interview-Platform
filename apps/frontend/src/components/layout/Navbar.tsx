import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Sparkles,
  User,
  LayoutDashboard,
  Briefcase,
  Users,
  ShieldCheck,
  ChevronDown,
  LogOut,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, role, demoSwitchRole, logout } = useAuth();
  const location = useLocation();
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const roles: { id: UserRole; label: string; icon: any; color: string }[] = [
    { id: 'candidate', label: 'Candidate', icon: User, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
    { id: 'recruiter', label: 'Recruiter', icon: Briefcase, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
    { id: 'interviewer', label: 'Interviewer', icon: Users, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    { id: 'admin', label: 'Admin', icon: ShieldCheck, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
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

  return (
    <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
      <div className="h-16 px-6 bg-surface/90 backdrop-blur-xl border border-border rounded-full shadow-2xl flex items-center justify-between transition-all duration-200">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-accent shadow-inner group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Antigravity <span className="gradient-text font-normal">AI</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium -mt-1 tracking-wider uppercase">
                Interview Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-accent text-white border border-accent/40 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-surface-elevated'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side: Role Switcher & User info */}
        <div className="flex items-center gap-4">
          {/* Demo Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface-elevated text-xs font-semibold text-white hover:border-accent/60 transition-all shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>Role: {currentRoleConfig.label}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-3 w-60 rounded-3xl bg-surface border border-border p-3 z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
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
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-colors ${
                          isCurrent
                            ? 'bg-accent/20 text-accent border border-accent/40 font-semibold'
                            : 'text-slate-300 hover:bg-surface-elevated hover:text-white'
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

          {/* User badge */}
          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-border">
            <div className="text-right">
              <p className="text-xs font-semibold text-white">
                {profile?.name || user?.email?.split('@')[0] || 'Demo User'}
              </p>
              <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                {user?.email}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-accent font-bold text-xs shadow-inner">
              {(profile?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

