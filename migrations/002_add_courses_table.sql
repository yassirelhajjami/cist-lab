-- Migration: Add Courses Table (labeled Grade 1 to 12) and Link to Missions
-- Run this in your Supabase SQL Editor to update your remote database schema.

-- 1. Create the courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT NOT NULL,
    color_theme TEXT NOT NULL,
    grade TEXT NOT NULL DEFAULT 'Grade 10',
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Policies for courses
DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;
CREATE POLICY "Courses are viewable by everyone" ON public.courses 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins have full access on courses" ON public.courses;
CREATE POLICY "Admins have full access on courses" ON public.courses 
    FOR ALL USING (public.is_admin());

-- 2. Link missions table to courses
ALTER TABLE public.missions ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL;

-- 3. Seed Course Data (Grades 1 to 12)
INSERT INTO public.courses (id, title, description, icon_url, color_theme, grade, order_index, is_published)
VALUES 
('c0000000-0000-0000-0000-000000000001', 'Grade 1 Creative Logic', 'Introduction to sequential instructions and logic concepts.', 'Gamepad2', 'emerald', 'Grade 1', 1, true),
('c0000000-0000-0000-0000-000000000002', 'Grade 2 Pattern Matching', 'Explore logic loops, repetitive directions, and visual puzzles.', 'BookOpen', 'emerald', 'Grade 2', 2, true),
('c0000000-0000-0000-0000-000000000003', 'Grade 3 Coding Patterns', 'Solve code sequencing and conditional logic gates.', 'Award', 'emerald', 'Grade 3', 3, true),
('c0000000-0000-0000-0000-000000000004', 'Grade 4 Visual Loops', 'Master repeating actions, repeat blocks, and nest sequences.', 'Gamepad2', 'amber', 'Grade 4', 4, true),
('c0000000-0000-0000-0000-000000000005', 'Grade 5 Robotic Control', 'Introduction to visual motor coordinates and sensor logic.', 'BookOpen', 'amber', 'Grade 5', 5, true),
('c0000000-0000-0000-0000-000000000006', 'Grade 6 Web Foundations', 'Discover the basic skeleton of web structures using HTML tags.', 'Award', 'amber', 'Grade 6', 6, true),
('c0000000-0000-0000-0000-000000000007', 'Grade 7 Custom CSS Styling', 'Implement layout formatting, text styling, and custom web margins.', 'Gamepad2', 'navy', 'Grade 7', 7, true),
('c0000000-0000-0000-0000-000000000008', 'Grade 8 Console Operations', 'Develop simple block algorithms using variable arrays and text.', 'BookOpen', 'navy', 'Grade 8', 8, true),
('c0000000-0000-0000-0000-000000000009', 'Grade 9 Web Designing', 'Build fully responsive custom websites with advanced CSS styles.', 'Award', 'navy', 'Grade 9', 9, true),
('c0000000-0000-0000-0000-000000000010', 'Grade 10 Python & Algorithms', 'Master advanced Python scripting, loops, variables, and logic controls.', 'Gamepad2', 'navy', 'Grade 10', 10, true),
('c0000000-0000-0000-0000-000000000011', 'Grade 11 Custom Scripting', 'Solve mathematical challenges using recursive operations and custom scripts.', 'BookOpen', 'navy', 'Grade 11', 11, true),
('c0000000-0000-0000-0000-000000000012', 'Grade 12 Neural Networks & AI', 'Train mathematical models, evaluate synapses weights, and understand AI functions.', 'Award', 'navy', 'Grade 12', 12, true)
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon_url = EXCLUDED.icon_url,
  color_theme = EXCLUDED.color_theme,
  grade = EXCLUDED.grade,
  order_index = EXCLUDED.order_index;

-- 4. Map existing missions to courses based on categories
UPDATE public.missions SET course_id = 'c0000000-0000-0000-0000-000000000010' WHERE title IN ('Logic & Puzzle Blocks', 'Python Syntax & Logic');
UPDATE public.missions SET course_id = 'c0000000-0000-0000-0000-000000000009' WHERE title = 'HTML Web Pages';
UPDATE public.missions SET course_id = 'c0000000-0000-0000-0000-000000000011' WHERE title = 'CSS Custom Styling';
UPDATE public.missions SET course_id = 'c0000000-0000-0000-0000-000000000012' WHERE title = 'Neural Nets & AI models';
