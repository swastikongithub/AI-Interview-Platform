-- 0004_interview_domain.sql
-- MVP Interview Domain Foundation

-- 1. Create Enums
CREATE TYPE interview_status AS ENUM ('draft', 'ready', 'in_progress', 'completed', 'cancelled', 'expired');
CREATE TYPE session_status AS ENUM ('in_progress', 'completed', 'abandoned');
CREATE TYPE evaluation_status AS ENUM ('pending', 'completed', 'failed');

-- 2. Extend Interviews Table
ALTER TABLE public.interviews 
ADD COLUMN candidate_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
ADD COLUMN interviewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Safely backfill candidate_id from applications
UPDATE public.interviews i
SET candidate_id = a.candidate_id
FROM public.applications a
WHERE i.application_id = a.id;

-- Add constraint to ensure an interview belongs to a candidate
ALTER TABLE public.interviews
ADD CONSTRAINT require_application_or_candidate CHECK (application_id IS NOT NULL OR candidate_id IS NOT NULL);

-- Safely convert status to new enum, failing explicitly on unmapped statuses
UPDATE public.interviews 
SET status = 
  CASE status
    WHEN 'scheduled' THEN 'ready'
    WHEN 'in_progress' THEN 'in_progress'
    WHEN 'completed' THEN 'completed'
  END;

-- This will throw an error if any rows were not mapped correctly (i.e. status is NULL)
ALTER TABLE public.interviews ALTER COLUMN status SET NOT NULL;

-- Drop default so it can be cast cleanly
ALTER TABLE public.interviews ALTER COLUMN status DROP DEFAULT;

-- Alter the column type to enum
ALTER TABLE public.interviews 
ALTER COLUMN status TYPE interview_status 
USING status::interview_status;

-- Set new default
ALTER TABLE public.interviews ALTER COLUMN status SET DEFAULT 'draft'::interview_status;



-- 3. Create Interview Sessions Table
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
    status session_status NOT NULL DEFAULT 'in_progress',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Partial unique index ensures only one active/completed attempt per interview
CREATE UNIQUE INDEX idx_one_active_session 
ON public.interview_sessions (interview_id) 
WHERE status IN ('in_progress', 'completed');

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;


-- 4. Rename & Transform interview_answers -> interview_responses
ALTER TABLE public.interview_answers RENAME TO interview_responses;

ALTER TABLE public.interview_responses
ADD COLUMN session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE;

ALTER TABLE public.interview_responses
RENAME COLUMN answer_text TO response_text;

ALTER TABLE public.interview_responses
RENAME COLUMN score TO ai_score;


-- 5. Rename & Transform feedback_reports -> evaluations
ALTER TABLE public.feedback_reports RENAME TO evaluations;

ALTER TABLE public.evaluations
ADD COLUMN session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
ADD COLUMN candidate_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
ADD COLUMN evaluated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN status evaluation_status NOT NULL DEFAULT 'pending';


-- 6. Atomic PL/pgSQL RPC for starting an interview session
CREATE OR REPLACE FUNCTION public.start_interview_session(p_interview_id UUID, p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_interview_record RECORD;
    v_new_session_id UUID;
BEGIN
    -- 1. Fetch and lock the interview row to prevent race conditions
    SELECT id, status, candidate_id INTO v_interview_record
    FROM public.interviews
    WHERE id = p_interview_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Interview not found';
    END IF;

    -- 2. Ensure the user calling this owns the interview
    IF v_interview_record.candidate_id != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized: Only the candidate can start this interview';
    END IF;

    -- 3. Validate state transition
    IF v_interview_record.status != 'ready' THEN
        RAISE EXCEPTION 'Interview is not in a ready state';
    END IF;

    -- 4. Attempt to insert the session (The unique index ensures no concurrent active/completed session exists)
    INSERT INTO public.interview_sessions (interview_id, status)
    VALUES (p_interview_id, 'in_progress')
    RETURNING id INTO v_new_session_id;

    -- 5. Update the interview status
    UPDATE public.interviews
    SET status = 'in_progress'
    WHERE id = p_interview_id;

    RETURN v_new_session_id;
END;
$$;


-- 7. Update RLS Policies

-- For Interviews: Candidate Insert Policy
CREATE POLICY "Candidates can insert self-owned practice interviews"
    ON public.interviews FOR INSERT
    WITH CHECK (
        candidate_id = auth.uid() AND 
        type IN ('practice', 'mock') AND 
        interviewer_id IS NULL AND 
        application_id IS NULL
    );

-- For Interview Sessions
CREATE POLICY "Candidates can view own sessions"
    ON public.interview_sessions FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.interviews WHERE id = interview_sessions.interview_id AND candidate_id = auth.uid()));

CREATE POLICY "Interviewers can view sessions for assigned interviews"
    ON public.interview_sessions FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.interviews WHERE id = interview_sessions.interview_id AND interviewer_id = auth.uid()));

CREATE POLICY "Candidates can update own sessions"
    ON public.interview_sessions FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.interviews WHERE id = interview_sessions.interview_id AND candidate_id = auth.uid()));

-- For Interview Responses
CREATE POLICY "Candidates can view own responses"
    ON public.interview_responses FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.interview_sessions s JOIN public.interviews i ON s.interview_id = i.id WHERE s.id = interview_responses.session_id AND i.candidate_id = auth.uid()));

CREATE POLICY "Interviewers can view responses for assigned interviews"
    ON public.interview_responses FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.interview_sessions s JOIN public.interviews i ON s.interview_id = i.id WHERE s.id = interview_responses.session_id AND i.interviewer_id = auth.uid()));

CREATE POLICY "Candidates can insert responses"
    ON public.interview_responses FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.interview_sessions s
        JOIN public.interviews i ON s.interview_id = i.id
        WHERE s.id = interview_responses.session_id 
        AND s.status = 'in_progress'
        AND i.candidate_id = auth.uid()
    ));

-- For Evaluations
CREATE POLICY "Candidates can view completed evaluations"
    ON public.evaluations FOR SELECT
    USING (candidate_id = auth.uid() AND status = 'completed');

CREATE POLICY "Interviewers can manage evaluations for assigned interviews"
    ON public.evaluations FOR ALL
    USING (evaluated_by = auth.uid() AND EXISTS (SELECT 1 FROM public.interviews WHERE id = evaluations.interview_id AND interviewer_id = auth.uid()))
    WITH CHECK (evaluated_by = auth.uid() AND EXISTS (SELECT 1 FROM public.interviews WHERE id = evaluations.interview_id AND interviewer_id = auth.uid()));


-- Ensure SUPABASE roles can access new tables/functions
GRANT ALL ON TABLE public.interview_sessions TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.start_interview_session TO anon, authenticated, service_role;
