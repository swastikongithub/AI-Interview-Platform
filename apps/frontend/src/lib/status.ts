import {
  CircleDashed,
  CircleDot,
  CircleCheck,
  CircleSlash,
  Clock3,
  Loader,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import type { EvaluationStatus, InterviewStatus, ResumeStatus, SessionStatus, UserRole } from '../types';

export type Tone = 'neutral' | 'signal' | 'positive' | 'caution' | 'negative' | 'info';

export interface StatusMeta {
  label: string;
  tone: Tone;
  icon: LucideIcon;
}

export const interviewStatusMeta: Record<InterviewStatus, StatusMeta> = {
  draft: { label: 'Draft', tone: 'neutral', icon: CircleDashed },
  ready: { label: 'Ready', tone: 'info', icon: CircleDot },
  in_progress: { label: 'In progress', tone: 'caution', icon: Loader },
  completed: { label: 'Completed', tone: 'positive', icon: CircleCheck },
  cancelled: { label: 'Cancelled', tone: 'neutral', icon: CircleSlash },
  expired: { label: 'Expired', tone: 'neutral', icon: Clock3 },
};

export const sessionStatusMeta: Record<SessionStatus, StatusMeta> = {
  in_progress: { label: 'Session open', tone: 'caution', icon: Loader },
  completed: { label: 'Session closed', tone: 'positive', icon: CircleCheck },
  abandoned: { label: 'Abandoned', tone: 'neutral', icon: CircleSlash },
};

export const evaluationStatusMeta: Record<EvaluationStatus, StatusMeta> = {
  pending: { label: 'Evaluation pending', tone: 'caution', icon: Clock3 },
  completed: { label: 'Evaluated', tone: 'positive', icon: CircleCheck },
  failed: { label: 'Evaluation failed', tone: 'negative', icon: AlertTriangle },
};

export const resumeStatusMeta: Record<ResumeStatus, StatusMeta> = {
  none: { label: 'No résumé', tone: 'neutral', icon: CircleDashed },
  processing: { label: 'Analyzing', tone: 'caution', icon: Loader },
  complete: { label: 'Analyzed', tone: 'positive', icon: CircleCheck },
  failed: { label: 'Analysis failed', tone: 'negative', icon: AlertTriangle },
};

export const roleLabel: Record<UserRole, string> = {
  candidate: 'Candidate',
  recruiter: 'Recruiter',
  interviewer: 'Interviewer',
  admin: 'Administrator',
};

export const roleHome: Record<UserRole, string> = {
  candidate: '/candidate/dashboard',
  recruiter: '/recruiter/dashboard',
  interviewer: '/interviewer/dashboard',
  admin: '/admin/dashboard',
};
