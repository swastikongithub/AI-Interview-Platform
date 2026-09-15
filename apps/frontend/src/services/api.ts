import axios from 'axios';
import { User, UserRole, CandidateProfile } from '../types';
import { supabase } from './supabase';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Bearer token dynamically from real Supabase session
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  async getAuthMe(): Promise<{ user: User; profile: CandidateProfile | null }> {
    const res = await api.get('/auth/me');
    return res.data;
  },

  // Admin-only: assign a role to another user's account.
  async updateUserRole(userId: string, role: UserRole): Promise<{ user: User }> {
    const res = await api.put('/auth/role', { userId, role });
    return res.data;
  },

  async getMyProfile(): Promise<CandidateProfile> {
    const res = await api.get('/profiles/me');
    return res.data;
  },

  async updateMyProfile(
    profile: Partial<CandidateProfile>
  ): Promise<{ message: string; profile: CandidateProfile }> {
    const res = await api.put('/profiles/me', profile);
    return res.data;
  },

  async getProfileById(userId: string): Promise<CandidateProfile> {
    const res = await api.get(`/profiles/${userId}`);
    return res.data;
  },

  async getHealth(): Promise<import('../types').HealthStatus> {
    const res = await api.get('/health');
    return res.data;
  },

  async uploadResume(file: File): Promise<{
    status: string;
    jobId?: string;
    resume_hash?: string;
    dedup?: boolean;
    ats_report?: any;
    resume_extracted_json?: any;
    message?: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async getResumeStatus(): Promise<{
    user_id: string;
    resume_status: string;
    ats_report: any;
    resume_hash: string | null;
    resume_extracted_json: any;
    processing_started_at: string | null;
    processing_completed_at: string | null;
    processing_duration_ms: number | null;
  }> {
    const res = await api.get('/resume/status');
    return res.data;
  },

  async getJobRecommendations(): Promise<{
    user_id: string;
    candidate_skills: string[];
    total_jobs: number;
    recommendations: any[];
  }> {
    const res = await api.get('/jobs/recommendations');
    return res.data;
  },

  // --- Interview Domain Endpoints ---

  async getInterviews(): Promise<import('../types').Interview[]> {
    const res = await api.get('/interviews');
    return res.data;
  },

  async getInterviewById(id: string): Promise<import('../types').Interview> {
    const res = await api.get(`/interviews/${id}`);
    return res.data;
  },

  async createPracticeInterview(type: string, mode: string): Promise<import('../types').Interview> {
    const res = await api.post('/interviews', { type, mode });
    return res.data;
  },

  async getInterviewQuestions(id: string): Promise<import('../types').InterviewQuestion[]> {
    const res = await api.get(`/interviews/${id}/questions`);
    return res.data;
  },

  async startInterviewSession(id: string): Promise<import('../types').InterviewSession> {
    const res = await api.post(`/interviews/${id}/sessions`);
    return res.data;
  },

  /** Sessions for an interview, newest first. Authorized server-side per role. */
  async getInterviewSessions(id: string): Promise<import('../types').InterviewSession[]> {
    const res = await api.get(`/interviews/${id}/sessions`);
    return res.data;
  },

  // Recruiter / admin only (enforced by the backend).
  async assignInterviewer(id: string, interviewerId: string): Promise<import('../types').Interview> {
    const res = await api.patch(`/interviews/${id}/assign`, { interviewer_id: interviewerId });
    return res.data;
  },

  async cancelInterview(id: string): Promise<import('../types').Interview> {
    const res = await api.patch(`/interviews/${id}/cancel`);
    return res.data;
  },

  // Interviewer (assigned) / admin only (enforced by the backend).
  async updateEvaluation(
    id: string,
    payload: import('../types').EvaluationUpdate
  ): Promise<import('../types').Evaluation> {
    const res = await api.put(`/interviews/${id}/evaluation`, payload);
    return res.data;
  },

  async getSession(id: string, sessionId: string): Promise<import('../types').InterviewSession> {
    const res = await api.get(`/interviews/${id}/sessions/${sessionId}`);
    return res.data;
  },

  async submitResponse(id: string, sessionId: string, questionId: string, responseText: string): Promise<import('../types').InterviewResponse> {
    const res = await api.post(`/interviews/${id}/sessions/${sessionId}/responses`, {
      question_id: questionId,
      response_text: responseText,
    });
    return res.data;
  },

  async getSessionResponses(id: string, sessionId: string): Promise<import('../types').InterviewResponse[]> {
    const res = await api.get(`/interviews/${id}/sessions/${sessionId}/responses`);
    return res.data;
  },

  async completeSession(id: string, sessionId: string): Promise<void> {
    const res = await api.patch(`/interviews/${id}/sessions/${sessionId}/complete`);
    return res.data;
  },

  async getEvaluation(id: string): Promise<import('../types').Evaluation> {
    const res = await api.get(`/interviews/${id}/evaluation`);
    return res.data;
  }
};

export default api;
