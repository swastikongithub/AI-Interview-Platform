-- AI Interview Platform — 0002_phase1_resume_ats.sql
-- Phase 1 Additive Migration: Resume upload, AI-extracted JSON, ATS report, and job recommendations

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ats_report JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS resume_status TEXT
  CHECK (resume_status IN ('none','processing','complete','failed'))
  DEFAULT 'none';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS resume_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS resume_extracted_json JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS processing_completed_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS processing_duration_ms INTEGER;

-- Configure storage bucket 'resumes' as private (in Supabase Storage schema if available)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('resumes', 'resumes', false)
        ON CONFLICT (id) DO UPDATE SET public = false;
    END IF;
END $$;

-- Storage bucket RLS policies: Users can only read/write their own resume files
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
        DROP POLICY IF EXISTS "Users can upload own resume" ON storage.objects;
        CREATE POLICY "Users can upload own resume"
            ON storage.objects FOR INSERT
            WITH CHECK (
                bucket_id = 'resumes' AND
                auth.uid() = owner
            );

        DROP POLICY IF EXISTS "Users can view own resume" ON storage.objects;
        CREATE POLICY "Users can view own resume"
            ON storage.objects FOR SELECT
            USING (
                bucket_id = 'resumes' AND
                auth.uid() = owner
            );

        DROP POLICY IF EXISTS "Users can update own resume" ON storage.objects;
        CREATE POLICY "Users can update own resume"
            ON storage.objects FOR UPDATE
            USING (
                bucket_id = 'resumes' AND
                auth.uid() = owner
            );

        GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
        GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon, authenticated, service_role;
    END IF;
END $$;
