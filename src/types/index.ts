export interface Course {
  id: string;
  title: string;
  description: string;
  icon_url?: string;
  color_theme?: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

export interface Mission {
  id: string;
  course_id?: string;
  prerequisite_mission_id?: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xp_reward: number;
  coin_reward: number;
  is_published: boolean;
  order_index: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  mission_id: string;
  title: string;
  content: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

export interface TestCase {
  input: string | null;
  expected: string;
  description: string;
  is_hidden: boolean;
}

export interface Challenge {
  id: string;
  mission_id: string;
  title: string;
  description: string;
  instructions: string;
  starter_code: string;
  test_cases: TestCase[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xp_reward: number;
  coin_reward: number;
  is_published: boolean;
  order_index: number;
  created_at: string;
}

export interface StudentProgress {
  id: string;
  student_id: string;
  mission_id: string;
  lesson_id?: string;
  challenge_id?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;
  time_spent: number; // in seconds
  attempts_count: number;
  completed_at?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'student';
  grade?: string;
  avatar_url?: string;
  status: 'active' | 'inactive';
  xp: number;
  coins: number;
  level: number;
  rank_title: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  profile_id: string;
  student_code: string;
  grade: string;
  classroom: string;
  notes?: string;
  status: 'active' | 'inactive';
  created_at: string;
}
