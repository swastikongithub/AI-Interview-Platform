-- 0005_evaluation_feedback_fields.sql
-- Aligns public.evaluations with the evaluation contract the API already
-- declares (apps/backend/src/types Evaluation + PUT /interviews/:id/evaluation
-- Zod schema). Without these columns, any evaluation update that includes an
-- overall score or a written summary fails with a schema-cache error.
--
-- Additive and nullable: existing rows and existing RLS policies are unchanged.

ALTER TABLE public.evaluations
  ADD COLUMN IF NOT EXISTS overall_score INTEGER,
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS strengths JSONB,
  ADD COLUMN IF NOT EXISTS weaknesses JSONB;

ALTER TABLE public.evaluations
  DROP CONSTRAINT IF EXISTS evaluations_overall_score_range;

ALTER TABLE public.evaluations
  ADD CONSTRAINT evaluations_overall_score_range
  CHECK (overall_score IS NULL OR (overall_score BETWEEN 0 AND 100));

-- Refresh PostgREST's schema cache so the new columns are usable immediately.
NOTIFY pgrst, 'reload schema';
