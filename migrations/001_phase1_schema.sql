-- CIST CodeQuest Migration: Phase 1 Schema Evolution
BEGIN;

-- =========================================================================
-- 1. Courses Table & Hierarchy
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    color_theme TEXT DEFAULT 'navy',
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Select policy: viewable if published OR user is admin
CREATE POLICY "Published courses viewable by everyone" ON public.courses
    FOR SELECT USING (is_published = true OR public.is_admin());

-- Admin full control policy
CREATE POLICY "Admins have full access on courses" ON public.courses
    FOR ALL USING (public.is_admin());

-- Seed default course
INSERT INTO public.courses (id, title, description, order_index, is_published)
VALUES ('c0000000-0000-0000-0000-000000000001', 'CIST Computer Science Fundamentals',
        'The core CS curriculum for CIST students.', 1, true)
ON CONFLICT (id) DO NOTHING;

-- Add course_id relation to missions
ALTER TABLE public.missions
    ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL;

-- Associate existing missions to the default course
UPDATE public.missions SET course_id = 'c0000000-0000-0000-0000-000000000001'
WHERE course_id IS NULL;


-- =========================================================================
-- 2. Prerequisite Missions Gate
-- =========================================================================
ALTER TABLE public.missions
    ADD COLUMN IF NOT EXISTS prerequisite_mission_id UUID REFERENCES public.missions(id) ON DELETE SET NULL;


-- =========================================================================
-- 3. JSONB Test Cases in Challenges
-- =========================================================================
-- Add test_cases JSONB column (defaults to empty array)
ALTER TABLE public.challenges
    ADD COLUMN IF NOT EXISTS test_cases JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Migrate existing single-string expected_output values into structured JSONB test cases array
UPDATE public.challenges
SET test_cases = jsonb_build_array(
    jsonb_build_object(
        'input', null,
        'expected', expected_output || E'\n',
        'description', 'Basic output check',
        'is_hidden', false
    )
)
WHERE test_cases = '[]'::jsonb AND expected_output IS NOT NULL;

-- NOTE: expected_output column removal is skipped inside this migration transaction for safety.
-- It can be safely removed later via: ALTER TABLE public.challenges DROP COLUMN expected_output;


-- =========================================================================
-- 4. Learning Metrics on Student Progress
-- =========================================================================
ALTER TABLE public.student_progress
    ADD COLUMN IF NOT EXISTS time_spent INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS attempts_count INTEGER NOT NULL DEFAULT 0;


-- =========================================================================
-- 5. Individual Item draft toggles (lessons & challenges)
-- =========================================================================
ALTER TABLE public.lessons
    ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.challenges
    ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;

COMMIT;
