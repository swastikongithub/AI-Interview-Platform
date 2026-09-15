import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type {
  CandidateProfile,
  Evaluation,
  HealthStatus,
  Interview,
  InterviewQuestion,
  InterviewResponse,
  InterviewSession,
} from '../types';

/** Central query keys — shared with mutations that invalidate them. */
export const queryKeys = {
  interviews: ['interviews'] as const,
  interview: (id: string) => ['interview', id] as const,
  sessions: (id: string) => ['sessions', id] as const,
  session: (sessionId: string) => ['session', sessionId] as const,
  questions: (id: string) => ['questions', id] as const,
  responses: (sessionId: string) => ['responses', sessionId] as const,
  evaluation: (id: string) => ['evaluation', id] as const,
  resumeStatus: ['resumeStatus'] as const,
  jobRecommendations: ['jobRecommendations'] as const,
  profile: (userId: string) => ['profile', userId] as const,
  health: ['health'] as const,
};

const is404 = (error: unknown) => axios.isAxiosError(error) && error.response?.status === 404;

/** Don't retry client errors (401/403/404/400) — they won't change on retry. */
const retryServerErrorsOnce = (failureCount: number, error: unknown) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status && status >= 400 && status < 500) return false;
  }
  return failureCount < 1;
};

export function useInterviews() {
  return useQuery<Interview[]>({
    queryKey: queryKeys.interviews,
    queryFn: () => apiService.getInterviews(),
    retry: retryServerErrorsOnce,
  });
}

export function useInterview(id: string | undefined) {
  return useQuery<Interview>({
    queryKey: queryKeys.interview(id ?? ''),
    queryFn: () => apiService.getInterviewById(id!),
    enabled: Boolean(id),
    retry: retryServerErrorsOnce,
  });
}

export function useInterviewSessions(id: string | undefined, enabled = true) {
  return useQuery<InterviewSession[]>({
    queryKey: queryKeys.sessions(id ?? ''),
    queryFn: () => apiService.getInterviewSessions(id!),
    enabled: Boolean(id) && enabled,
    retry: retryServerErrorsOnce,
  });
}

export function useSession(id: string | undefined, sessionId: string | undefined) {
  return useQuery<InterviewSession>({
    queryKey: queryKeys.session(sessionId ?? ''),
    queryFn: () => apiService.getSession(id!, sessionId!),
    enabled: Boolean(id && sessionId),
    retry: retryServerErrorsOnce,
  });
}

export function useQuestions(id: string | undefined, enabled = true) {
  return useQuery<InterviewQuestion[]>({
    queryKey: queryKeys.questions(id ?? ''),
    queryFn: async () => {
      const questions = await apiService.getInterviewQuestions(id!);
      return [...questions].sort((a, b) => a.order - b.order);
    },
    enabled: Boolean(id) && enabled,
    retry: retryServerErrorsOnce,
  });
}

export function useResponses(id: string | undefined, sessionId: string | undefined) {
  return useQuery<InterviewResponse[]>({
    queryKey: queryKeys.responses(sessionId ?? ''),
    queryFn: () => apiService.getSessionResponses(id!, sessionId!),
    enabled: Boolean(id && sessionId),
    retry: retryServerErrorsOnce,
  });
}

/**
 * Evaluation lookup. The API answers 404 both when no evaluation exists and
 * when one exists but isn't released to this role — so `null` means
 * "not available yet", never "zero score".
 */
export function useEvaluation(id: string | undefined, enabled = true) {
  return useQuery<Evaluation | null>({
    queryKey: queryKeys.evaluation(id ?? ''),
    queryFn: async () => {
      try {
        return await apiService.getEvaluation(id!);
      } catch (error) {
        if (is404(error)) return null;
        throw error;
      }
    },
    enabled: Boolean(id) && enabled,
    retry: retryServerErrorsOnce,
  });
}

export function useResumeStatus() {
  return useQuery({
    queryKey: queryKeys.resumeStatus,
    queryFn: () => apiService.getResumeStatus(),
    // Poll only while AI work is pending; stop as soon as it settles.
    refetchInterval: (query) => (query.state.data?.resume_status === 'processing' ? 2500 : false),
    retry: retryServerErrorsOnce,
  });
}

export function useJobRecommendations() {
  return useQuery({
    queryKey: queryKeys.jobRecommendations,
    queryFn: () => apiService.getJobRecommendations(),
    retry: retryServerErrorsOnce,
  });
}

/** Another user's profile (recruiter / interviewer / admin). `null` = no profile yet. */
export function useProfileById(userId: string | undefined | null) {
  return useQuery<CandidateProfile | null>({
    queryKey: queryKeys.profile(userId ?? ''),
    queryFn: async () => {
      try {
        return await apiService.getProfileById(userId!);
      } catch (error) {
        if (is404(error)) return null;
        throw error;
      }
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    retry: retryServerErrorsOnce,
  });
}

export function useHealth() {
  return useQuery<HealthStatus>({
    queryKey: queryKeys.health,
    queryFn: () => apiService.getHealth(),
    retry: false,
  });
}

/** Picks the attempt that matters: the open one if any, otherwise the most recent. */
export function pickActiveSession(sessions: InterviewSession[] | undefined): InterviewSession | undefined {
  if (!sessions || sessions.length === 0) return undefined;
  return sessions.find((s) => s.status === 'in_progress') ?? sessions.find((s) => s.status === 'completed') ?? sessions[0];
}

export const interviewTitle = (interview: Pick<Interview, 'type'>) => {
  const names: Record<string, string> = {
    practice: 'Practice interview',
    mock: 'Mock interview',
    technical: 'Technical interview',
    hr: 'HR interview',
    live: 'Live interview',
  };
  return names[interview.type] ?? 'Interview';
};
