import { UserRole } from '../types';

export interface DemoAccountConfig {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  label: string;
}

export const DEMO_ACCOUNTS: Record<UserRole, DemoAccountConfig> = {
  candidate: {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'candidate.demo@antigravity.dev',
    password: 'password123',
    role: 'candidate',
    label: 'Candidate (Alex)',
  },
  recruiter: {
    id: '22222222-2222-4222-8222-222222222222',
    email: 'recruiter.demo@antigravity.dev',
    password: 'password123',
    role: 'recruiter',
    label: 'Recruiter (Sarah)',
  },
  interviewer: {
    id: '33333333-3333-4333-8333-333333333333',
    email: 'interviewer.demo@antigravity.dev',
    password: 'password123',
    role: 'interviewer',
    label: 'Interviewer (David)',
  },
  admin: {
    id: '44444444-4444-4444-8444-444444444444',
    email: 'admin.demo@antigravity.dev',
    password: 'password123',
    role: 'admin',
    label: 'Admin (Elena)',
  },
};

export const DEMO_ACCOUNTS_LIST: DemoAccountConfig[] = Object.values(DEMO_ACCOUNTS);
