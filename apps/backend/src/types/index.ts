import { Request } from 'express';

export type UserRole = 'candidate' | 'recruiter' | 'interviewer' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface EducationItem {
  institution: string;
  degree: string | null;
  year: string | null;
}

export interface ExperienceItem {
  company: string;
  role: string;
  duration: string | null;
  description: string | null;
}

export type ResumeStatus = 'none' | 'processing' | 'complete' | 'failed';

export interface ATSReport {
  version: string;
  model: string;
  generatedAt: string;
  score: number;
  missing_keywords: string[];
  grammar_notes: string[];
  improvement_suggestions: string[];
}

export interface ResumeExtractedJson {
  name?: string;
  education?: EducationItem[];
  experience?: ExperienceItem[];
  skills?: string[];
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  jd_raw_text: string;
  skills_required: string[];
  created_at: string;
}

export interface JobRecommendation extends Job {
  match_percentage: number;
  matched_skills: string[];
}

export interface CandidateProfile {
  user_id: string;
  name: string;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: string[];
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_file_url?: string;
  ats_score?: number;
  ats_report?: ATSReport | null;
  resume_status?: ResumeStatus;
  resume_hash?: string | null;
  resume_extracted_json?: ResumeExtractedJson | null;
  processing_started_at?: string | null;
  processing_completed_at?: string | null;
  processing_duration_ms?: number | null;
}

export type InterviewType = 'practice' | 'mock' | 'technical' | 'hr' | 'live';
export type InterviewMode = 'text' | 'voice' | 'video';
export type InterviewStatus = 'draft' | 'ready' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned';
export type EvaluationStatus = 'pending' | 'completed' | 'failed';

export interface Interview {
  id: string;
  application_id: string | null;
  candidate_id: string;
  interviewer_id: string | null;
  type: InterviewType;
  mode: InterviewMode;
  status: InterviewStatus;
  scheduled_at: string;
}

export interface InterviewSession {
  id: string;
  interview_id: string;
  status: SessionStatus;
  started_at: string;
  completed_at: string | null;
}

export interface InterviewQuestion {
  id: string;
  interview_id: string;
  question_text: string;
  category: string;
  difficulty: string;
  order: number;
}

export interface InterviewResponse {
  id: string;
  session_id: string;
  question_id: string;
  response_text: string;
  ai_evaluation: any | null;
  ai_score: number | null;
}

export interface Evaluation {
  id: string;
  interview_id: string;
  session_id: string | null;
  candidate_id: string;
  evaluated_by: string | null;
  status: EvaluationStatus;
  technical_score: number;
  communication_score: number;
  coding_score: number;
  confidence_score: number;
  overall_score: number | null;
  summary: string | null;
  strengths: any | null;
  weaknesses: any | null;
  roadmap: any | null;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}
