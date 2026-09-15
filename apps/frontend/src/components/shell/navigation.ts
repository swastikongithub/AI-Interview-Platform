import {
  ClipboardCheck,
  FileText,
  Gauge,
  Home,
  MessagesSquare,
  Target,
  UserRound,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '../../types';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Additional path prefixes that should mark this item active. */
  match?: string[];
  /** Exact match only (used for "home" style entries). */
  end?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * Role-aware information architecture. Visibility here is UX only — every
 * route is still wrapped in RoleGuard and every API call is authorized by
 * the backend.
 */
export const navigationByRole: Record<UserRole, NavGroup[]> = {
  candidate: [
    {
      label: 'Practice',
      items: [
        { label: 'Home', to: '/candidate/dashboard', icon: Home, end: true },
        { label: 'Interviews', to: '/candidate/interviews', icon: MessagesSquare },
      ],
    },
    {
      label: 'Your profile',
      items: [
        { label: 'Profile', to: '/candidate/profile', icon: UserRound },
        { label: 'Résumé & ATS', to: '/candidate/resume', icon: FileText },
        { label: 'Job matches', to: '/candidate/jobs', icon: Target },
      ],
    },
  ],
  recruiter: [
    {
      label: 'Hiring',
      items: [{ label: 'Pipeline', to: '/recruiter/dashboard', icon: Workflow, match: ['/recruiter/interviews'] }],
    },
  ],
  interviewer: [
    {
      label: 'Assessment',
      items: [
        { label: 'Assignments', to: '/interviewer/dashboard', icon: ClipboardCheck, match: ['/interviewer/interviews'] },
      ],
    },
  ],
  admin: [
    {
      label: 'Platform',
      items: [{ label: 'Operations', to: '/admin/dashboard', icon: Gauge }],
    },
  ],
};

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.end) return pathname === item.to;
  const prefixes = [item.to, ...(item.match ?? [])];
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function findActiveItem(role: UserRole | null, pathname: string): NavItem | undefined {
  if (!role) return undefined;
  return navigationByRole[role].flatMap((g) => g.items).find((i) => isNavItemActive(i, pathname));
}
