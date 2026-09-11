export type UserRole = 'candidate' | 'recruiter' | 'interviewer' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  year: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  duration: string;
  description?: string;
}

export interface CandidateProfile {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  skills: string[];
  education: EducationItem[];
  experience: ExperienceItem[];
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  ats_score?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AtsReport {
  ats_score: number;
  missing_keywords: string[];
  grammar_format_notes: string[];
  job_compatibility_score?: number;
  summary: string;
}

export interface JobRecommendation {
  id: string;
  title: string;
  company_name: string;
  description: string;
  skills_required: string[];
  matching_percentage: number;
  matching_skills: string[];
  missing_skills: string[];
}
