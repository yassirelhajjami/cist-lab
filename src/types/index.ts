// src/types/index.ts

export interface Course {
  id: string;
  title: string;
  description: string;
  icon_url: string;
  color_theme: string;
  grade: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id?: string | null;
  full_name: string;
  email: string;
  role: 'admin' | 'student';
  grade?: string | null;
  avatar_url?: string | null;
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
  date_of_birth?: string | null;
  parent_contact?: string | null;
  notes?: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  profiles?: Profile;
}

export interface Mission {
  id: string;
  course_id?: string | null;
  prerequisite_mission_id?: string | null;
  title: string;
  description: string;
  category: 'Python' | 'Algorithms' | 'Robotics' | 'Web' | 'AI' | 'Logic';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xp_reward: number;
  coin_reward: number;
  order_index: number;
  is_published: boolean;
  created_at: string;
}

export interface Lesson {
  id: string;
  mission_id: string;
  title: string;
  content: string;
  video_url?: string | null;
  code_example?: string | null;
  order_index: number;
  created_at: string;
}

export interface Challenge {
  id: string;
  mission_id: string;
  title: string;
  description: string;
  instructions: string;
  starter_code: string;
  expected_output: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xp_reward: number;
  coin_reward: number;
  created_at: string;
}

export interface StudentProgress {
  id: string;
  student_id: string;
  mission_id: string;
  lesson_id?: string | null;
  challenge_id?: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number;
  time_spent?: number | null;
  attempts_count?: number | null;
  completed_at?: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  student_id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  video_url?: string | null;
  project_url?: string | null;
  github_url?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  votes_count: number;
  teacher_score?: number | null;
  xp_awarded: number;
  created_at: string;
  students?: Student;
}

export interface CommunityPost {
  id: string;
  student_id: string;
  title: string;
  content: string;
  image_url?: string | null;
  type: 'question' | 'project' | 'achievement' | 'idea';
  status: 'pending' | 'approved' | 'rejected';
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  student_id: string;
  content: string;
  status: 'approved' | 'hidden';
  created_at: string;
}

export interface ProjectVote {
  id: string;
  project_id: string;
  student_id: string;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  requirement_type: string;
  requirement_value: number;
  created_at: string;
}

export interface StudentBadge {
  id: string;
  student_id: string;
  badge_id: string;
  awarded_at: string;
}

export interface LeaderboardRequest {
  id: string;
  student_id: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string | null;
  created_at: string;
  reviewed_at?: string | null;
  students?: Student;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}
