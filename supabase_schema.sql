-- CIST CodeQuest Supabase Database Schema
-- Run this in the Supabase SQL Editor to initialize your database structure.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- TABLES CREATION
-- =========================================================================

-- 1. profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE, -- Nullable to allow manual creation before Auth user signup
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
    grade TEXT,
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    xp INTEGER NOT NULL DEFAULT 0,
    coins INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    rank_title TEXT NOT NULL DEFAULT 'Rookie Coder',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. students table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_code TEXT UNIQUE NOT NULL,
    grade TEXT NOT NULL,
    classroom TEXT NOT NULL,
    date_of_birth DATE,
    parent_contact TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. missions table
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Python', 'Algorithms', 'Robotics', 'Web', 'AI', 'Logic')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    xp_reward INTEGER NOT NULL DEFAULT 100,
    coin_reward INTEGER NOT NULL DEFAULT 50,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- Supports markdown
    video_url TEXT,
    code_example TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT NOT NULL,
    starter_code TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    xp_reward INTEGER NOT NULL DEFAULT 75,
    coin_reward INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. student_progress table
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    score INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Prevent duplicate rows for the same combination of student and activity
    CONSTRAINT unique_student_activity UNIQUE (student_id, mission_id, lesson_id, challenge_id)
);

-- 7. projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    video_url TEXT,
    project_url TEXT,
    github_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    votes_count INTEGER NOT NULL DEFAULT 0,
    teacher_score INTEGER DEFAULT 0,
    xp_awarded INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. community_posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    type TEXT NOT NULL CHECK (type IN ('question', 'project', 'achievement', 'idea')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'hidden')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. project_votes table
CREATE TABLE IF NOT EXISTS public.project_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_project_student_vote UNIQUE (project_id, student_id)
);

-- 10a. post_likes table
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT post_likes_post_student_unique UNIQUE (post_id, student_id)
);

-- 11. badges table
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT NOT NULL,
    requirement_type TEXT NOT NULL, -- 'xp', 'mission', 'challenge', 'project', 'manual'
    requirement_value INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. student_badges table
CREATE TABLE IF NOT EXISTS public.student_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_student_badge UNIQUE (student_id, badge_id)
);

-- 13. leaderboard_requests table
CREATE TABLE IF NOT EXISTS public.leaderboard_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 14. notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'system', 'badge', 'comment', 'xp', 'project', 'post'
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Dynamic functions to determine role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile basic info" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- Trigger to prevent students from modifying restricted profile columns
CREATE OR REPLACE FUNCTION public.check_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If the editor is admin, let them change anything
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Verify update permissions for students
  IF OLD.role <> NEW.role OR
     OLD.status <> NEW.status THEN
    RAISE EXCEPTION 'Restricted fields (role, status) can only be updated by admins.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER tr_check_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_update();

-- 1.1 Auth User Sync Trigger
-- Automatically maps/creates profile when a user registers in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  existing_profile_id UUID;
BEGIN
  -- Check if a profile with the same email already exists
  SELECT id INTO existing_profile_id 
  FROM public.profiles 
  WHERE email = NEW.email;

  IF existing_profile_id IS NOT NULL THEN
    -- Update existing profile to link it to the auth user
    UPDATE public.profiles
    SET user_id = NEW.id,
        updated_at = now()
    WHERE id = existing_profile_id;
  ELSE
    -- Create a new profile for the new auth user
    INSERT INTO public.profiles (user_id, full_name, email, role, level, rank_title, xp, coins)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
      1,
      'Rookie Coder',
      0,
      0
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (public.is_admin());

-- 2. Students Policies
CREATE POLICY "Students list viewable by authenticated users" ON public.students
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access on students" ON public.students
    FOR ALL USING (public.is_admin());

-- 3. Missions Policies
CREATE POLICY "Published missions viewable by everyone" ON public.missions
    FOR SELECT USING (is_published = true OR public.is_admin());

CREATE POLICY "Admins have full access on missions" ON public.missions
    FOR ALL USING (public.is_admin());

-- 4. Lessons Policies
CREATE POLICY "Lessons viewable if mission is published" ON public.lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.missions 
            WHERE id = mission_id AND (is_published = true OR public.is_admin())
        )
    );

CREATE POLICY "Admins have full access on lessons" ON public.lessons
    FOR ALL USING (public.is_admin());

-- 5. Challenges Policies
CREATE POLICY "Challenges viewable if mission is published" ON public.challenges
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.missions 
            WHERE id = mission_id AND (is_published = true OR public.is_admin())
        )
    );

CREATE POLICY "Admins have full access on challenges" ON public.challenges
    FOR ALL USING (public.is_admin());

-- 6. Student Progress Policies
CREATE POLICY "Students can view and manage their own progress" ON public.student_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students 
            WHERE id = student_id AND profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        ) OR public.is_admin()
    );

CREATE POLICY "Students can insert their own progress" ON public.student_progress
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.students 
            WHERE id = student_id AND profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Students can update their own progress" ON public.student_progress
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.students 
            WHERE id = student_id AND profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Admins have full access on progress" ON public.student_progress
    FOR ALL USING (public.is_admin());

-- 7. Projects Policies
CREATE POLICY "Approved projects viewable by everyone; all by admin" ON public.projects
    FOR SELECT USING (status = 'approved' OR public.is_admin() OR 
        EXISTS (
            SELECT 1 FROM public.students 
            WHERE id = student_id AND profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Students can submit their own projects" ON public.projects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.students 
            WHERE id = student_id AND profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        ) AND status = 'pending'
    );

CREATE POLICY "Students can update their own projects before moderation" ON public.projects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.students 
            WHERE id = student_id AND profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        ) AND status = 'pending'
    ) WITH CHECK (
        status = 'pending' -- Students cannot set to approved
    );

CREATE POLICY "Admins have full access on projects" ON public.projects
    FOR ALL USING (public.is_admin());

-- 8. Community Posts Policies
CREATE POLICY "Approved posts viewable by everyone; all by admin/owner" ON public.community_posts
    FOR SELECT USING (status = 'approved' OR public.is_admin() OR 
        EXISTS (
            SELECT 1 FROM public.students 
            WHERE id = student_id AND profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Students can create community posts" ON public.community_posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.students 
            WHERE id = student_id AND profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        ) AND status = 'approved' -- Post starts as approved for instant community visibility
    );

CREATE POLICY "Admins have full access on community posts" ON public.community_posts
    FOR ALL USING (public.is_admin());

-- 9. Comments Policies
CREATE POLICY "Approved comments viewable by everyone" ON public.comments
    FOR SELECT USING (status = 'approved' OR public.is_admin());

CREATE POLICY "Students can write comments" ON public.comments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.students 
            WHERE id = student_id AND profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Admins have full access on comments" ON public.comments
    FOR ALL USING (public.is_admin());

-- 10. Project Votes Policies
CREATE POLICY "Votes are viewable by everyone" ON public.project_votes
    FOR SELECT USING (true);

CREATE POLICY "Students can vote" ON public.project_votes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.students 
            WHERE id = student_id AND profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Students can retract vote" ON public.project_votes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.students 
            WHERE id = student_id AND profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Admins have full access on votes" ON public.project_votes
    FOR ALL USING (public.is_admin());

-- 10a. post_likes policies
CREATE POLICY "Likes are viewable by everyone" ON public.post_likes
    FOR SELECT USING (true);

CREATE POLICY "Students can like" ON public.post_likes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.students 
            WHERE id = student_id AND profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Students can unlike" ON public.post_likes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.students 
            WHERE id = student_id AND profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Admins have full access on likes" ON public.post_likes
    FOR ALL USING (public.is_admin());

-- 11. Badges Policies
CREATE POLICY "Badges are viewable by everyone" ON public.badges
    FOR SELECT USING (true);

CREATE POLICY "Admins have full access on badges" ON public.badges
    FOR ALL USING (public.is_admin());

-- 12. Student Badges Policies
CREATE POLICY "Student badges viewable by everyone" ON public.student_badges
    FOR SELECT USING (true);

CREATE POLICY "Admins have full access on student badges" ON public.student_badges
    FOR ALL USING (public.is_admin());

-- 13. Leaderboard Requests Policies
CREATE POLICY "Students can view and create their own leaderboard requests" ON public.leaderboard_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students 
            WHERE id = student_id AND profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        ) OR public.is_admin()
    );

CREATE POLICY "Students can create request" ON public.leaderboard_requests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.students 
            WHERE id = student_id AND profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        ) AND status = 'pending'
    );

CREATE POLICY "Admins have full access on leaderboard requests" ON public.leaderboard_requests
    FOR ALL USING (public.is_admin());

-- 14. Notifications Policies
CREATE POLICY "Users can view and edit their own notifications" ON public.notifications
    FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update read status on their own notifications" ON public.notifications
    FOR UPDATE USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
    WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own notifications" ON public.notifications
    FOR INSERT TO authenticated
    WITH CHECK (
        user_id IN (
            SELECT id FROM public.profiles WHERE user_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "Admins have full access on notifications" ON public.notifications
    FOR ALL USING (public.is_admin());


-- =========================================================================
-- SEED DATA
-- =========================================================================

-- Insert Admin Profile
INSERT INTO public.profiles (id, full_name, email, role, level, rank_title, xp, coins)
VALUES (
    'a1111111-1111-1111-1111-111111111111', 
    'Mr. Harrison Finch', 
    'admin@cist.edu', 
    'admin', 
    10, 
    'CIST Tech Hero', 
    15000, 
    1200
) ON CONFLICT DO NOTHING;

-- Insert Student Profiles
INSERT INTO public.profiles (id, full_name, email, role, level, rank_title, xp, coins, grade)
VALUES 
('01111111-1111-1111-1111-111111111111', 'Adam Belghiti', 'adam.b@cist.edu', 'student', 4, 'Bug Hunter', 1250, 240, 'Grade 10'),
('02222222-2222-2222-2222-222222222222', 'Sofia Mansouri', 'sofia.m@cist.edu', 'student', 5, 'Logic Builder', 2400, 310, 'Grade 9'),
('03333333-3333-3333-3333-333333333333', 'Ryan Benjelloun', 'ryan.b@cist.edu', 'student', 2, 'Rookie Coder', 320, 90, 'Grade 11'),
('04444444-4444-4444-4444-444444444444', 'Yasmine Tazi', 'yasmine.t@cist.edu', 'student', 6, 'Algorithm Master', 3800, 420, 'Grade 10'),
('05555555-5555-5555-5555-555555555555', 'Nabil El Fassi', 'nabil.f@cist.edu', 'student', 3, 'Code Explorer', 780, 150, 'Grade 12')
ON CONFLICT DO NOTHING;

-- Insert Student Specific Information
INSERT INTO public.students (id, profile_id, student_code, grade, classroom, date_of_birth, parent_contact)
VALUES 
('d1111111-1111-1111-1111-111111111111', '01111111-1111-1111-1111-111111111111', 'CIST-10-0982', 'Grade 10', 'Room 204', '2010-04-12', '+212-661-234567'),
('d2222222-2222-2222-2222-222222222222', '02222222-2222-2222-2222-222222222222', 'CIST-09-0821', 'Grade 9', 'Room 102', '2011-09-18', '+212-661-876543'),
('d3333333-3333-3333-3333-333333333333', '03333333-3333-3333-3333-333333333333', 'CIST-11-0422', 'Grade 11', 'Room 301', '2009-01-30', '+212-662-112233'),
('d4444444-4444-4444-4444-444444444444', '04444444-4444-4444-4444-444444444444', 'CIST-10-0382', 'Grade 10', 'Room 204', '2010-11-05', '+212-661-998877'),
('d5555555-5555-5555-5555-555555555555', '05555555-5555-5555-5555-555555555555', 'CIST-12-0199', 'Grade 12', 'Room 312', '2008-07-22', '+212-663-445566')
ON CONFLICT DO NOTHING;

-- Insert Missions
INSERT INTO public.missions (id, title, description, category, difficulty, xp_reward, coin_reward, order_index, is_published)
VALUES 
('e1111111-1111-1111-1111-111111111111', 'Python Basics', 'Start your journey into coding. Learn syntax, indentation, and console output.', 'Python', 'beginner', 100, 50, 1, true),
('e2222222-2222-2222-2222-222222222222', 'Variables Village', 'Master data storage! Learn text strings, integers, floats, and variable naming.', 'Python', 'beginner', 100, 50, 2, true),
('e3333333-3333-3333-3333-333333333333', 'Loops Dungeon', 'Unlock repeat power! Dive into While loops, For loops, and loop control counters.', 'Algorithms', 'intermediate', 150, 75, 3, true),
('e4444444-4444-4444-4444-444444444444', 'Robot Maze Solver', 'Guide the CIST virtual robot to navigate pathways using algorithms and sensor logs.', 'Robotics', 'intermediate', 200, 100, 4, true),
('e5555555-5555-5555-5555-555555555555', 'AI Explorer & Neural Nets', 'An introduction to neural networks, training models, and artificial intelligence ethics.', 'AI', 'advanced', 300, 150, 5, true)
ON CONFLICT DO NOTHING;

-- Insert Lessons
INSERT INTO public.lessons (id, mission_id, title, content, code_example, order_index)
VALUES 
(
    '91111111-1111-1111-1111-111111111111', 
    'e1111111-1111-1111-1111-111111111111', 
    'Introduction to Python & printing', 
    'Python is a friendly programming language used by developers, researchers, and creators at CIST. To output information to the console, we use the `print()` function. Text must be wrapped in matching single or double quotes.', 
    '# Hello CIST CodeQuest!
print("Welcome to CIST CodeQuest!")', 
    1
),
(
    '91111112-1111-1111-1111-111111111112', 
    'e1111111-1111-1111-1111-111111111111', 
    'Comments in Python', 
    'Comments are notes in the code written for human developers, which Python ignores during execution. In Python, single-line comments begin with a hash character `#`. Use comments to describe complex algorithms or document code.', 
    '# This is a comment. Python won''t run it.
print("Hello Tangier!") # Inline comments too!', 
    2
),
(
    '92222221-2222-2222-2222-222222222221', 
    'e2222222-2222-2222-2222-222222222222', 
    'Declaring Variables', 
    'Variables are containers that hold data values. You create a variable the moment you assign a value to it using the `=` assignment operator. Python has dynamic typing: no need to declare type.', 
    'student_name = "Sofia"
level = 5
has_badge = True
print(student_name)', 
    1
),
(
    '93333331-3333-3333-3333-333333333331', 
    'e3333333-3333-3333-3333-333333333333', 
    'Understanding For Loops', 
    'A For loop is used to iterate over a sequence (list, dictionary, tuple, set, string, or range). It executes a block of statements once for each item in the sequence, making loops ideal for repeated actions.', 
    '# Repeat 5 times
for i in range(5):
    print("CodeQuest Step", i)', 
    1
)
ON CONFLICT DO NOTHING;

-- Insert Challenges
INSERT INTO public.challenges (id, mission_id, title, description, instructions, starter_code, expected_output, difficulty, xp_reward, coin_reward)
VALUES 
(
    'c1111111-1111-1111-1111-111111111111', 
    'e1111111-1111-1111-1111-111111111111', 
    'The First Print Quest', 
    'Show your code explorer credentials. Print a customized school greeting to the console.', 
    'Write a print statement that outputs exactly: Hello CIST CodeQuest!', 
    '# Complete the print statement below
print("...")', 
    'Hello CIST CodeQuest!', 
    'beginner', 
    75, 
    30
),
(
    'c2222221-2222-2222-2222-222222222221', 
    'e2222222-2222-2222-2222-222222222222', 
    'Variable Swapper', 
    'Practice setting variables. Fix the code to swap the values of two variables correctly so the printer output matches what is expected.', 
    'Change the variable assignment to output "Tangier" instead of "Canada".', 
    'school_city = "Canada"
# Update the value here:
school_city = "..."
print(school_city)', 
    'Tangier', 
    'beginner', 
    75, 
    30
)
ON CONFLICT DO NOTHING;

-- Insert Badges
INSERT INTO public.badges (id, name, description, icon_url, requirement_type, requirement_value)
VALUES 
('b1111111-1111-1111-1111-111111111111', 'Python Starter', 'Unlocked by completing the Python Basics introductory mission.', '🏆', 'mission', 1),
('b2222222-2222-2222-2222-222222222222', 'Loop Master', 'Demonstrate loops expertise by completing 3 loops exercises.', '➰', 'challenge', 3),
('b3333333-3333-3333-3333-333333333333', 'Bug Hunter', 'Squash bugs in the Code Lab arena.', '🐜', 'challenge', 5),
('b4444444-4444-4444-4444-444444444444', 'Robotics Builder', 'Complete the virtual robot maze logic mission.', '🤖', 'mission', 1),
('b5555555-5555-5555-5555-555555555555', 'Project Creator', 'Submit a custom software project and receive teacher approval.', '🎨', 'project', 1),
('b6666666-6666-6666-6666-666666666666', 'CIST Tech Hero', 'Reach CIST elite levels by gaining over 5,000 total XP.', '⚡', 'xp', 5000)
ON CONFLICT DO NOTHING;

-- Award Badges to Students
INSERT INTO public.student_badges (student_id, badge_id, awarded_at)
VALUES 
('d1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', now() - interval '5 days'),
('d1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333', now() - interval '2 days'),
('d2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', now() - interval '10 days'),
('d2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', now() - interval '4 days'),
('d4444444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111', now() - interval '3 days'),
('d4444444-4444-4444-4444-444444444444', 'b5555555-5555-5555-5555-555555555555', now() - interval '1 days')
ON CONFLICT DO NOTHING;

-- Insert Student Approved Projects
INSERT INTO public.projects (id, student_id, title, description, category, image_url, votes_count, teacher_score, xp_awarded, status)
VALUES 
(
    '71111111-1111-1111-1111-111111111111', 
    'd1111111-1111-1111-1111-111111111111', 
    'Tangier Tour Guide App', 
    'An interactive Python script that suggests local landmarks (Cape Spartel, Hercules Caves) based on student inputs.', 
    'Python', 
    'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=400&q=80', 
    12, 
    95, 
    200, 
    'approved'
),
(
    '72222222-2222-2222-2222-222222222222', 
    'd2222222-2222-2222-2222-222222222222', 
    'Lego EV3 Robot Line Follower', 
    'Program code designed for the CIST robotics lab sensors to enable visual track alignment and automated turning.', 
    'Robotics', 
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80', 
    18, 
    98, 
    250, 
    'approved'
),
(
    '73333333-3333-3333-3333-733333333333', 
    'd4444444-4444-4444-4444-444444444444', 
    'School Lunch AI Predictor', 
    'A neural network algorithm prototype analyzing past student lunch orders to minimize kitchen ingredient waste.', 
    'AI', 
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80', 
    22, 
    99, 
    300, 
    'approved'
)
ON CONFLICT DO NOTHING;

-- Insert Community Posts
INSERT INTO public.community_posts (id, student_id, title, content, type, likes_count, comments_count, status)
VALUES 
(
    'f1111111-1111-1111-1111-111111111111', 
    'd1111111-1111-1111-1111-111111111111', 
    'Stuck on Python indentations logic', 
    'Hey guys, does anyone know why my Python for-loop is throwing an IndentationError? I put 4 spaces but it still highlights red.', 
    'question', 
    4, 
    2, 
    'approved'
),
(
    'f2222222-2222-2222-2222-222222222222', 
    'd2222222-2222-2222-2222-222222222222', 
    'Completed variables village quest!', 
    'So happy I unlocked the Loop Master badge. On to the Loops Dungeon next. See you in the rankings!', 
    'achievement', 
    12, 
    3, 
    'approved'
),
(
    'f3333333-3333-3333-3333-333333333333', 
    'd4444444-4444-4444-4444-444444444444', 
    'Idea: CIST Game Jam during winter', 
    'What if we ask Mr Harrison if we can organize a weekend school game jam using HTML/CSS? We can team up in groups.', 
    'idea', 
    16, 
    1, 
    'approved'
)
ON CONFLICT DO NOTHING;

-- Insert Comments
INSERT INTO public.comments (id, post_id, student_id, content, status)
VALUES 
('81111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', 'Check if you mixed tabs and spaces! Python does not allow both in the same file.', 'approved'),
('82222222-2222-2222-2222-222222222222', 'f1111111-1111-1111-1111-111111111111', 'd4444444-4444-4444-4444-444444444444', 'Agree with Sofia, try running the auto-formatter shortcut in the Code Lab.', 'approved'),
('83333333-3333-3333-3333-333333333333', 'f3333333-3333-3333-3333-333333333333', 'd1111111-1111-1111-1111-111111111111', 'Count me in for this! I can do the design assets.', 'approved')
ON CONFLICT DO NOTHING;

-- Insert Leaderboard Requests
INSERT INTO public.leaderboard_requests (student_id, status, message, reviewed_at)
VALUES 
('d1111111-1111-1111-1111-111111111111', 'approved', 'I want to compete in the main CIST rankings.', now() - interval '3 days'),
('d2222222-2222-2222-2222-222222222222', 'approved', 'Active student ready to code!', now() - interval '2 days'),
('d4444444-4444-4444-4444-444444444444', 'approved', 'Show my AI projects to the community.', now() - interval '2 days'),
('d5555555-5555-5555-5555-555555555555', 'pending', 'Hope to join Sofia on the top spots.', null)
ON CONFLICT DO NOTHING;


-- =========================================================================
-- STORAGE BUCKETS CONFIGURATION
-- =========================================================================

-- Create a storage bucket for student projects, avatars, and attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'cist-assets', 
    'cist-assets', 
    true, 
    5242880, -- 5MB limit
    ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to assets
CREATE POLICY "Allow Public Access" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'cist-assets');

-- Allow authenticated users to upload files (profile avatars, project screenshots, community uploads)
CREATE POLICY "Allow Authenticated Uploads" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (
        bucket_id = 'cist-assets' AND
        (owner_id = auth.uid()::text OR public.is_admin())
    );

-- Allow users to manage (select, update, delete) their own uploaded files
CREATE POLICY "Allow Users to Update Own Assets" ON storage.objects
    FOR UPDATE TO authenticated USING (
        bucket_id = 'cist-assets' AND
        (owner_id = auth.uid()::text OR public.is_admin())
    ) WITH CHECK (
        bucket_id = 'cist-assets' AND
        (owner_id = auth.uid()::text OR public.is_admin())
    );

CREATE POLICY "Allow Users to Delete Own Assets" ON storage.objects
    FOR DELETE TO authenticated USING (
        bucket_id = 'cist-assets' AND
        (owner_id = auth.uid()::text OR public.is_admin())
    );
