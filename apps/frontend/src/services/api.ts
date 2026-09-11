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

  async updateUserRole(role: UserRole): Promise<{ user: User }> {
    const res = await api.put('/auth/role', { role });
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

  async getHealth(): Promise<any> {
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
};

export default api;
