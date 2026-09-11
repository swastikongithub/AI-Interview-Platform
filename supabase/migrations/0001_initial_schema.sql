-- AI Interview Platform — 0001_initial_schema.sql
-- All 14 locked tables + Row Level Security (RLS) policies

-- Create Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table & Role Enum
CREATE TYPE user_role AS ENUM ('candidate', 'recruiter', 'interviewer', 'admin');

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'candidate',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    education JSONB NOT NULL DEFAULT '[]'::JSONB,
    experience JSONB NOT NULL DEFAULT '[]'::JSONB,
    skills TEXT[] NOT NULL DEFAULT '{}',
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    resume_file_url TEXT,
    ats_score INTEGER
);

-- 3. Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    jd_raw_text TEXT NOT NULL,
    skills_required TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Applications Table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'applied',
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Interviews Table
CREATE TYPE interview_type AS ENUM ('practice', 'mock', 'technical', 'hr', 'live');
CREATE TYPE interview_mode AS ENUM ('text', 'voice', 'video');

CREATE TABLE IF NOT EXISTS public.interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    type interview_type NOT NULL DEFAULT 'practice',
    mode interview_mode NOT NULL DEFAULT 'text',
    status TEXT NOT NULL DEFAULT 'scheduled',
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Interview Questions Table
CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    difficulty TEXT NOT NULL DEFAULT 'medium',
    "order" INTEGER NOT NULL DEFAULT 1
);

-- 8. Interview Answers Table
CREATE TABLE IF NOT EXISTS public.interview_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES public.interview_questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    ai_evaluation JSONB DEFAULT '{}'::JSONB,
    score INTEGER DEFAULT 0
);

-- 9. Coding Problems Table
CREATE TABLE IF NOT EXISTS public.coding_problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'Medium',
    tags TEXT[] NOT NULL DEFAULT '{}'
);

-- 10. Test Cases Table
CREATE TABLE IF NOT EXISTS public.test_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID REFERENCES public.coding_problems(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE
);

-- 11. Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID REFERENCES public.coding_problems(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'javascript',
    execution_result JSONB DEFAULT '{}'::JSONB,
    ai_review JSONB DEFAULT '{}'::JSONB,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Feedback Reports Table
CREATE TABLE IF NOT EXISTS public.feedback_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE,
    technical_score INTEGER DEFAULT 0,
    communication_score INTEGER DEFAULT 0,
    coding_score INTEGER DEFAULT 0,
    confidence_score INTEGER DEFAULT 0,
    roadmap JSONB DEFAULT '{}'::JSONB
);

-- 13. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::JSONB,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Badges / XP Log Table (both supported for compatibility)
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    badge_type TEXT NOT NULL,
    xp_amount INTEGER DEFAULT 0,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.xp_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    xp_amount INTEGER NOT NULL DEFAULT 0,
    reason TEXT,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_log ENABLE ROW LEVEL SECURITY;

-- Helper function to prevent RLS infinite recursion when querying current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- USERS POLICIES
CREATE POLICY "Users can view own row"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own row"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins have full access to users"
    ON public.users FOR ALL
    USING (public.get_current_user_role() = 'admin');

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Recruiters and Interviewers can view candidate profiles"
    ON public.profiles FOR SELECT
    USING (public.get_current_user_role() IN ('recruiter', 'interviewer', 'admin'));

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- COMPANIES & JOBS POLICIES
CREATE POLICY "Anyone can view companies and jobs"
    ON public.companies FOR SELECT
    USING (true);

CREATE POLICY "Recruiters can manage own companies"
    ON public.companies FOR ALL
    USING (owner_user_id = auth.uid());

CREATE POLICY "Anyone can view jobs"
    ON public.jobs FOR SELECT
    USING (true);

CREATE POLICY "Recruiters can manage jobs for their companies"
    ON public.jobs FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.companies WHERE id = jobs.company_id AND owner_user_id = auth.uid()
    ));

-- APPLICATIONS POLICIES
CREATE POLICY "Candidates can view own applications"
    ON public.applications FOR SELECT
    USING (candidate_id = auth.uid());

CREATE POLICY "Candidates can insert own applications"
    ON public.applications FOR INSERT
    WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "Recruiters can view applications for their jobs"
    ON public.applications FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.jobs
        JOIN public.companies ON jobs.company_id = companies.id
        WHERE jobs.id = applications.job_id AND companies.owner_user_id = auth.uid()
    ));

-- CODING PROBLEMS POLICIES
CREATE POLICY "Anyone can view coding problems"
    ON public.coding_problems FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage coding problems"
    ON public.coding_problems FOR ALL
    USING (public.get_current_user_role() = 'admin');

-- SUBMISSIONS POLICIES
CREATE POLICY "Candidates can manage own submissions"
    ON public.submissions FOR ALL
    USING (candidate_id = auth.uid());

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can access own notifications"
    ON public.notifications FOR ALL
    USING (user_id = auth.uid());

-- BADGES / XP LOG POLICIES
CREATE POLICY "Users can view own badges and xp"
    ON public.badges FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can view own xp log"
    ON public.xp_log FOR SELECT
    USING (user_id = auth.uid());

-- GRANT SCHEMA AND TABLE PRIVILEGES TO SUPABASE ROLES
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
