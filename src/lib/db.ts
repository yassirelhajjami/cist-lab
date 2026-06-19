// src/lib/db.ts
import { createClient } from '@supabase/supabase-js';

// Detect Supabase keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = supabaseUrl !== '' && supabaseAnonKey !== '';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// =========================================================================
// MOCK DATABASE & LOCALSTORAGE FALLBACK
// =========================================================================

// Levels configuration
export const XP_LEVELS = [
  { level: 1, xp: 0, rank: 'Rookie Coder' },
  { level: 2, xp: 250, rank: 'Code Explorer' },
  { level: 3, xp: 500, rank: 'Logic Builder' },
  { level: 4, xp: 1000, rank: 'Bug Hunter' },
  { level: 5, xp: 2000, rank: 'Algorithm Master' },
  { level: 6, xp: 3500, rank: 'Robotics Engineer' },
  { level: 7, xp: 5000, rank: 'Project Creator' },
  { level: 8, xp: 7500, rank: 'CIST Tech Hero' },
  { level: 9, xp: 10000, rank: 'CIST Tech Hero' },
  { level: 10, xp: 15000, rank: 'CIST Tech Hero' }
];

export function getRankAndLevelForXP(xp: number): { level: number; rank: string } {
  let activeLevel = 1;
  let activeRank = 'Rookie Coder';
  for (const item of XP_LEVELS) {
    if (xp >= item.xp) {
      activeLevel = item.level;
      activeRank = item.rank;
    } else {
      break;
    }
  }
  return { level: activeLevel, rank: activeRank };
}

// Initial Mock Seed Data
const INITIAL_PROFILES = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    user_id: 'auth-admin-id',
    full_name: 'Mr. Harrison Finch',
    email: 'admin@cist.edu',
    role: 'admin',
    grade: '',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'active',
    xp: 15000,
    coins: 1200,
    level: 10,
    rank_title: 'CIST Tech Hero',
    created_at: new Date('2026-06-01').toISOString(),
    updated_at: new Date('2026-06-15').toISOString(),
    password: 'password'
  },
  {
    id: '01111111-1111-1111-1111-111111111111',
    user_id: 'auth-adam-id',
    full_name: 'Adam Belghiti',
    email: 'adam.b@cist.edu',
    role: 'student',
    grade: 'Grade 10',
    avatar_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=adam',
    status: 'active',
    xp: 1250,
    coins: 240,
    level: 4,
    rank_title: 'Bug Hunter',
    created_at: new Date('2026-06-02').toISOString(),
    updated_at: new Date('2026-06-15').toISOString(),
    password: 'password'
  },
  {
    id: '02222222-2222-2222-2222-222222222222',
    user_id: 'auth-sofia-id',
    full_name: 'Sofia Mansouri',
    email: 'sofia.m@cist.edu',
    role: 'student',
    grade: 'Grade 9',
    avatar_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=sofia',
    status: 'active',
    xp: 2400,
    coins: 310,
    level: 5,
    rank_title: 'Algorithm Master',
    created_at: new Date('2026-06-03').toISOString(),
    updated_at: new Date('2026-06-15').toISOString(),
    password: 'password'
  },
  {
    id: '03333333-3333-3333-3333-333333333333',
    user_id: 'auth-ryan-id',
    full_name: 'Ryan Benjelloun',
    email: 'ryan.b@cist.edu',
    role: 'student',
    grade: 'Grade 11',
    avatar_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ryan',
    status: 'active',
    xp: 320,
    coins: 90,
    level: 2,
    rank_title: 'Code Explorer',
    created_at: new Date('2026-06-04').toISOString(),
    updated_at: new Date('2026-06-15').toISOString(),
    password: 'password'
  },
  {
    id: '04444444-4444-4444-4444-444444444444',
    user_id: 'auth-yasmine-id',
    full_name: 'Yasmine Tazi',
    email: 'yasmine.t@cist.edu',
    role: 'student',
    grade: 'Grade 10',
    avatar_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=yasmine',
    status: 'active',
    xp: 3800,
    coins: 420,
    level: 6,
    rank_title: 'Robotics Engineer',
    created_at: new Date('2026-06-05').toISOString(),
    updated_at: new Date('2026-06-15').toISOString(),
    password: 'password'
  },
  {
    id: '05555555-5555-5555-5555-555555555555',
    user_id: 'auth-nabil-id',
    full_name: 'Nabil El Fassi',
    email: 'nabil.f@cist.edu',
    role: 'student',
    grade: 'Grade 12',
    avatar_url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=nabil',
    status: 'active',
    xp: 780,
    coins: 150,
    level: 3,
    rank_title: 'Logic Builder',
    created_at: new Date('2026-06-06').toISOString(),
    updated_at: new Date('2026-06-15').toISOString(),
    password: 'password'
  }
];

const INITIAL_STUDENTS = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    profile_id: '01111111-1111-1111-1111-111111111111',
    student_code: 'CIST-10-0982',
    grade: 'Grade 10',
    classroom: 'Room 204',
    date_of_birth: '2010-04-12',
    parent_contact: '+212-661-234567',
    notes: 'Enjoys game design and microcontrollers.',
    status: 'active',
    created_at: new Date('2026-06-02').toISOString()
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    profile_id: '02222222-2222-2222-2222-222222222222',
    student_code: 'CIST-09-0821',
    grade: 'Grade 9',
    classroom: 'Room 102',
    date_of_birth: '2011-09-18',
    parent_contact: '+212-661-876543',
    notes: 'Exhibits fast analytical and debugging skills.',
    status: 'active',
    created_at: new Date('2026-06-03').toISOString()
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    profile_id: '03333333-3333-3333-3333-333333333333',
    student_code: 'CIST-11-0422',
    grade: 'Grade 11',
    classroom: 'Room 301',
    date_of_birth: '2009-01-30',
    parent_contact: '+212-662-112233',
    notes: 'Very creative with UI concepts.',
    status: 'active',
    created_at: new Date('2026-06-04').toISOString()
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    profile_id: '04444444-4444-4444-4444-444444444444',
    student_code: 'CIST-10-0382',
    grade: 'Grade 10',
    classroom: 'Room 204',
    date_of_birth: '2010-11-05',
    parent_contact: '+212-661-998877',
    notes: 'Focused on AI research and computer vision models.',
    status: 'active',
    created_at: new Date('2026-06-05').toISOString()
  },
  {
    id: 'd5555555-5555-5555-5555-555555555555',
    profile_id: '05555555-5555-5555-5555-555555555555',
    student_code: 'CIST-12-0199',
    grade: 'Grade 12',
    classroom: 'Room 312',
    date_of_birth: '2008-07-22',
    parent_contact: '+212-663-445566',
    notes: 'Learning Python scripting, preparing for university CS.',
    status: 'active',
    created_at: new Date('2026-06-06').toISOString()
  }
];

const INITIAL_MISSIONS = [
  {
    id: 'e1111111-1111-1111-1111-111111111111',
    course_id: 'c0000000-0000-0000-0000-000000000001',
    prerequisite_mission_id: null,
    title: 'Python Basics',
    description: 'Start your journey into coding. Learn syntax, indentation, and console output.',
    category: 'Python',
    difficulty: 'beginner',
    xp_reward: 100,
    coin_reward: 50,
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'e2222222-2222-2222-2222-222222222222',
    course_id: 'c0000000-0000-0000-0000-000000000001',
    prerequisite_mission_id: 'e1111111-1111-1111-1111-111111111111',
    title: 'Variables Village',
    description: 'Master data storage! Learn text strings, integers, floats, and variable naming.',
    category: 'Python',
    difficulty: 'beginner',
    xp_reward: 100,
    coin_reward: 50,
    order_index: 2,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'e3333333-3333-3333-3333-333333333333',
    course_id: 'c0000000-0000-0000-0000-000000000001',
    prerequisite_mission_id: 'e2222222-2222-2222-2222-222222222222',
    title: 'Loops Dungeon',
    description: 'Unlock repeat power! Dive into While loops, For loops, and loop control counters.',
    category: 'Algorithms',
    difficulty: 'intermediate',
    xp_reward: 150,
    coin_reward: 75,
    order_index: 3,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'e4444444-4444-4444-4444-444444444444',
    course_id: 'c0000000-0000-0000-0000-000000000001',
    prerequisite_mission_id: 'e3333333-3333-3333-3333-333333333333',
    title: 'Robot Maze Solver',
    description: 'Guide the CIST virtual robot to navigate pathways using algorithms and sensor logs.',
    category: 'Robotics',
    difficulty: 'intermediate',
    xp_reward: 200,
    coin_reward: 100,
    order_index: 4,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'e5555555-5555-5555-5555-555555555555',
    course_id: 'c0000000-0000-0000-0000-000000000001',
    prerequisite_mission_id: 'e4444444-4444-4444-4444-444444444444',
    title: 'AI Explorer & Neural Nets',
    description: 'An introduction to neural networks, training models, and artificial intelligence ethics.',
    category: 'AI',
    difficulty: 'advanced',
    xp_reward: 300,
    coin_reward: 150,
    order_index: 5,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  }
];

const INITIAL_LESSONS = [
  {
    id: '91111111-1111-1111-1111-111111111111',
    mission_id: 'e1111111-1111-1111-1111-111111111111',
    title: 'Introduction to Python & printing',
    content: 'Python is a friendly programming language used by developers, researchers, and creators at CIST. To output information to the console, we use the `print()` function. Text must be wrapped in matching single or double quotes.',
    video_url: 'https://www.youtube.com/embed/kqtD5dpnC8U',
    code_example: '# Hello CIST CodeQuest!\nprint("Welcome to CIST CodeQuest!")',
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: '91111112-1111-1111-1111-111111111112',
    mission_id: 'e1111111-1111-1111-1111-111111111111',
    title: 'Comments in Python',
    content: 'Comments are notes in the code written for human developers, which Python ignores during execution. In Python, single-line comments begin with a hash character `#`. Use comments to describe complex algorithms or document code.',
    video_url: '',
    code_example: '# This is a comment. Python won\'t run it.\nprint("Hello Tangier!") # Inline comments too!',
    order_index: 2,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: '92222221-2222-2222-2222-922222222221',
    mission_id: 'e2222222-2222-2222-2222-e22222222222',
    title: 'Declaring Variables',
    content: 'Variables are containers that hold data values. You create a variable the moment you assign a value to it using the `=` assignment operator. Python has dynamic typing: no need to declare type.',
    video_url: '',
    code_example: 'student_name = "Sofia"\nlevel = 5\nhas_badge = True\nprint(student_name)',
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: '93333331-3333-3333-3333-933333333331',
    mission_id: 'e3333333-3333-3333-3333-e33333333333',
    title: 'Understanding For Loops',
    content: 'A For loop is used to iterate over a sequence (list, dictionary, tuple, set, string, or range). It executes a block of statements once for each item in the sequence, making loops ideal for repeated actions.',
    video_url: '',
    code_example: '# Repeat 5 times\nfor i in range(5):\n    print("CodeQuest Step", i)',
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  }
];

const INITIAL_CHALLENGES = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    mission_id: 'e1111111-1111-1111-1111-111111111111',
    title: 'The First Print Quest',
    description: 'Show your code explorer credentials. Print a customized school greeting to the console.',
    instructions: 'Write a print statement that outputs exactly: Hello CIST CodeQuest!',
    starter_code: '# Complete the print statement below\nprint("...")',
    test_cases: [
      {
        input: null,
        expected: 'Hello CIST CodeQuest!\n',
        description: 'Basic output check',
        is_hidden: false
      }
    ],
    is_published: true,
    difficulty: 'beginner',
    xp_reward: 75,
    coin_reward: 30,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'c2222221-2222-2222-2222-222222222221',
    mission_id: 'e2222222-2222-2222-2222-222222222222',
    title: 'Variable Swapper',
    description: 'Practice setting variables. Fix the code to swap the values of two variables correctly so the printer output matches what is expected.',
    instructions: 'Change the variable assignment to output "Tangier" instead of "Canada".',
    starter_code: 'school_city = "Canada"\n# Update the value here:\nschool_city = "..."\nprint(school_city)',
    test_cases: [
      {
        input: null,
        expected: 'Tangier\n',
        description: 'Basic output check',
        is_hidden: false
      }
    ],
    is_published: true,
    difficulty: 'beginner',
    xp_reward: 75,
    coin_reward: 30,
    created_at: new Date('2026-06-01').toISOString()
  }
];

const INITIAL_BADGES = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    name: 'Python Starter',
    description: 'Unlocked by completing the Python Basics introductory mission.',
    icon_url: 'Trophy',
    requirement_type: 'mission',
    requirement_value: 1,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    name: 'Loop Master',
    description: 'Demonstrate loops expertise by completing 3 loops exercises.',
    icon_url: 'Infinity',
    requirement_type: 'challenge',
    requirement_value: 3,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'b3333333-3333-3333-3333-333333333333',
    name: 'Bug Hunter',
    description: 'Squash bugs in the Code Lab arena.',
    icon_url: 'Bug',
    requirement_type: 'challenge',
    requirement_value: 5,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'b4444444-4444-4444-4444-444444444444',
    name: 'Robotics Builder',
    description: 'Complete the virtual robot maze logic mission.',
    icon_url: 'Bot',
    requirement_type: 'mission',
    requirement_value: 1,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'b5555555-5555-5555-5555-555555555555',
    name: 'Project Creator',
    description: 'Submit a custom software project and receive teacher approval.',
    icon_url: 'Palette',
    requirement_type: 'project',
    requirement_value: 1,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'b6666666-6666-6666-6666-666666666666',
    name: 'CIST Tech Hero',
    description: 'Reach CIST elite levels by gaining over 5,000 total XP.',
    icon_url: 'Zap',
    requirement_type: 'xp',
    requirement_value: 5000,
    created_at: new Date('2026-06-01').toISOString()
  }
];

const INITIAL_STUDENT_BADGES = [
  {
    id: 'sb1',
    student_id: 'd1111111-1111-1111-1111-111111111111',
    badge_id: 'b1111111-1111-1111-1111-111111111111',
    awarded_at: new Date('2026-06-10').toISOString()
  },
  {
    id: 'sb2',
    student_id: 'd1111111-1111-1111-1111-111111111111',
    badge_id: 'b3333333-3333-3333-3333-333333333333',
    awarded_at: new Date('2026-06-13').toISOString()
  },
  {
    id: 'sb3',
    student_id: 'd2222222-2222-2222-2222-222222222222',
    badge_id: 'b1111111-1111-1111-1111-111111111111',
    awarded_at: new Date('2026-06-05').toISOString()
  },
  {
    id: 'sb4',
    student_id: 'd2222222-2222-2222-2222-222222222222',
    badge_id: 'b2222222-2222-2222-2222-222222222222',
    awarded_at: new Date('2026-06-11').toISOString()
  },
  {
    id: 'sb5',
    student_id: 'd4444444-4444-4444-4444-444444444444',
    badge_id: 'b1111111-1111-1111-1111-111111111111',
    awarded_at: new Date('2026-06-12').toISOString()
  },
  {
    id: 'sb6',
    student_id: 'd4444444-4444-4444-4444-444444444444',
    badge_id: 'b5555555-5555-5555-5555-555555555555',
    awarded_at: new Date('2026-06-14').toISOString()
  }
];

const INITIAL_PROJECTS = [
  {
    id: '71111111-1111-1111-1111-111111111111',
    student_id: 'd1111111-1111-1111-1111-111111111111',
    title: 'Tangier Tour Guide App',
    description: 'An interactive Python script that suggests local landmarks (Cape Spartel, Hercules Caves) based on student inputs.',
    category: 'Python',
    image_url: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=400&q=80',
    video_url: '',
    project_url: '',
    github_url: 'https://github.com/adam-cist/tangier-tour',
    status: 'approved',
    votes_count: 12,
    teacher_score: 95,
    xp_awarded: 200,
    created_at: new Date('2026-06-10').toISOString()
  },
  {
    id: '72222222-2222-2222-2222-722222222222',
    student_id: 'd2222222-2222-2222-2222-222222222222',
    title: 'Lego EV3 Robot Line Follower',
    description: 'Program code designed for the CIST robotics lab sensors to enable visual track alignment and automated turning.',
    category: 'Robotics',
    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80',
    video_url: '',
    project_url: '',
    github_url: '',
    status: 'approved',
    votes_count: 18,
    teacher_score: 98,
    xp_awarded: 250,
    created_at: new Date('2026-06-11').toISOString()
  },
  {
    id: '73333333-3333-3333-3333-733333333333',
    student_id: 'd4444444-4444-4444-4444-444444444444',
    title: 'School Lunch AI Predictor',
    description: 'A neural network algorithm prototype analyzing past student lunch orders to minimize kitchen ingredient waste.',
    category: 'AI',
    image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
    video_url: '',
    project_url: '',
    github_url: 'https://github.com/yasmine-cist/lunch-ai',
    status: 'approved',
    votes_count: 22,
    teacher_score: 99,
    xp_awarded: 300,
    created_at: new Date('2026-06-14').toISOString()
  }
];

const INITIAL_COMMUNITY_POSTS = [
  {
    id: 'f1111111-1111-1111-1111-111111111111',
    student_id: 'd1111111-1111-1111-1111-111111111111',
    title: 'Stuck on Python indentations logic',
    content: 'Hey guys, does anyone know why my Python for-loop is throwing an IndentationError? I put 4 spaces but it still highlights red.',
    image_url: '',
    type: 'question',
    status: 'approved',
    likes_count: 4,
    comments_count: 2,
    created_at: new Date('2026-06-10').toISOString()
  },
  {
    id: 'f2222222-2222-2222-2222-222222222222',
    student_id: 'd2222222-2222-2222-2222-222222222222',
    title: 'Completed variables village quest!',
    content: 'So happy I unlocked the Loop Master badge. On to the Loops Dungeon next. See you in the rankings!',
    image_url: '',
    type: 'achievement',
    status: 'approved',
    likes_count: 12,
    comments_count: 0,
    created_at: new Date('2026-06-12').toISOString()
  },
  {
    id: 'f3333333-3333-3333-3333-333333333333',
    student_id: 'd4444444-4444-4444-4444-444444444444',
    title: 'Idea: CIST Game Jam during winter',
    content: 'What if we ask Mr Harrison if we can organize a weekend school game jam using HTML/CSS? We can team up in groups.',
    image_url: '',
    type: 'idea',
    status: 'approved',
    likes_count: 16,
    comments_count: 1,
    created_at: new Date('2026-06-14').toISOString()
  }
];

const INITIAL_COMMENTS = [
  {
    id: '81111111-1111-1111-1111-811111111111',
    post_id: 'f1111111-1111-1111-1111-111111111111',
    student_id: 'd2222222-2222-2222-2222-222222222222',
    content: 'Check if you mixed tabs and spaces! Python does not allow both in the same file.',
    status: 'approved',
    created_at: new Date('2026-06-10T12:00:00Z').toISOString()
  },
  {
    id: '82222222-2222-2222-2222-822222222222',
    post_id: 'f1111111-1111-1111-1111-111111111111',
    student_id: 'd4444444-4444-4444-4444-444444444444',
    content: 'Agree with Sofia, try running the auto-formatter shortcut in the Code Lab.',
    status: 'approved',
    created_at: new Date('2026-06-10T13:30:00Z').toISOString()
  },
  {
    id: '83333333-3333-3333-3333-833333333333',
    post_id: 'f3333333-3333-3333-3333-333333333333',
    student_id: 'd1111111-1111-1111-1111-111111111111',
    content: 'Count me in for this! I can do the design assets.',
    status: 'approved',
    created_at: new Date('2026-06-14T18:00:00Z').toISOString()
  }
];

const INITIAL_LEADERBOARD_REQUESTS = [
  {
    id: 'lr1',
    student_id: 'd1111111-1111-1111-1111-111111111111',
    status: 'approved',
    message: 'I want to compete in the main CIST rankings.',
    created_at: new Date('2026-06-12').toISOString(),
    reviewed_at: new Date('2026-06-12').toISOString()
  },
  {
    id: 'lr2',
    student_id: 'd2222222-2222-2222-2222-222222222222',
    status: 'approved',
    message: 'Active student ready to code!',
    created_at: new Date('2026-06-13').toISOString(),
    reviewed_at: new Date('2026-06-13').toISOString()
  },
  {
    id: 'lr3',
    student_id: 'd4444444-4444-4444-4444-444444444444',
    status: 'approved',
    message: 'Show my AI projects to the community.',
    created_at: new Date('2026-06-13').toISOString(),
    reviewed_at: new Date('2026-06-13').toISOString()
  },
  {
    id: 'lr4',
    student_id: 'd5555555-5555-5555-5555-555555555555',
    status: 'pending',
    message: 'Hope to join Sofia on the top spots.',
    created_at: new Date('2026-06-14').toISOString(),
    reviewed_at: null
  }
];

const INITIAL_PROGRESS = [
  {
    id: 'pgr1',
    student_id: 'd1111111-1111-1111-1111-111111111111',
    mission_id: 'e1111111-1111-1111-1111-111111111111',
    lesson_id: '91111111-1111-1111-1111-111111111111',
    challenge_id: null,
    status: 'completed',
    score: 100,
    time_spent: 320,
    attempts_count: 1,
    completed_at: new Date('2026-06-10').toISOString(),
    created_at: new Date('2026-06-10').toISOString()
  },
  {
    id: 'pgr2',
    student_id: 'd1111111-1111-1111-1111-111111111111',
    mission_id: 'e1111111-1111-1111-1111-111111111111',
    lesson_id: '91111112-1111-1111-1111-111111111112',
    challenge_id: null,
    status: 'completed',
    score: 100,
    time_spent: 180,
    attempts_count: 1,
    completed_at: new Date('2026-06-11').toISOString(),
    created_at: new Date('2026-06-10').toISOString()
  },
  {
    id: 'pgr3',
    student_id: 'd1111111-1111-1111-1111-111111111111',
    mission_id: 'e1111111-1111-1111-1111-111111111111',
    lesson_id: null,
    challenge_id: 'c1111111-1111-1111-1111-111111111111',
    status: 'completed',
    score: 100,
    time_spent: 450,
    attempts_count: 2,
    completed_at: new Date('2026-06-12').toISOString(),
    created_at: new Date('2026-06-10').toISOString()
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    user_id: '01111111-1111-1111-1111-111111111111',
    title: 'Welcome to CIST CodeQuest!',
    message: 'Start learning Python and Algorithms to earn your first badges.',
    type: 'system',
    is_read: false,
    created_at: new Date('2026-06-14').toISOString()
  },
  {
    id: 'n2',
    user_id: '01111111-1111-1111-1111-111111111111',
    title: 'Badge Awarded!',
    message: 'You have been awarded the Python Starter badge.',
    type: 'badge',
    is_read: false,
    created_at: new Date('2026-06-15').toISOString()
  }
];

const INITIAL_COURSES = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    title: 'CIST Computer Science Fundamentals',
    description: 'The core CS curriculum for CIST students.',
    icon_url: 'Award',
    color_theme: 'navy',
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  }
];

// Helper to load/save mock DB from localStorage
class LocalDB {
  private get(key: string, initial: any) {
    if (typeof window === 'undefined') return initial;
    const val = localStorage.getItem(`cist_cq_${key}`);
    if (!val) {
      localStorage.setItem(`cist_cq_${key}`, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(val);
  }

  private set(key: string, val: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`cist_cq_${key}`, JSON.stringify(val));
    }
  }

  get courses() { return this.get('courses', INITIAL_COURSES); }
  set courses(val) { this.set('courses', val); }

  get profiles() { return this.get('profiles', INITIAL_PROFILES); }
  set profiles(val) { this.set('profiles', val); }

  get students() { return this.get('students', INITIAL_STUDENTS); }
  set students(val) { this.set('students', val); }

  get missions() { return this.get('missions', INITIAL_MISSIONS); }
  set missions(val) { this.set('missions', val); }

  get lessons() { return this.get('lessons', INITIAL_LESSONS); }
  set lessons(val) { this.set('lessons', val); }

  get challenges() { return this.get('challenges', INITIAL_CHALLENGES); }
  set challenges(val) { this.set('challenges', val); }

  get progress() { return this.get('progress', INITIAL_PROGRESS); }
  set progress(val) { this.set('progress', val); }

  get projects() { return this.get('projects', INITIAL_PROJECTS); }
  set projects(val) { this.set('projects', val); }

  get posts() { return this.get('posts', INITIAL_COMMUNITY_POSTS); }
  set posts(val) { this.set('posts', val); }

  get comments() { return this.get('comments', INITIAL_COMMENTS); }
  set comments(val) { this.set('comments', val); }

  get badges() { return this.get('badges', INITIAL_BADGES); }
  set badges(val) { this.set('badges', val); }

  get studentBadges() { return this.get('studentBadges', INITIAL_STUDENT_BADGES); }
  set studentBadges(val) { this.set('studentBadges', val); }

  get leaderboardRequests() { return this.get('leaderboardRequests', INITIAL_LEADERBOARD_REQUESTS); }
  set leaderboardRequests(val) { this.set('leaderboardRequests', val); }

  get notifications() { return this.get('notifications', INITIAL_NOTIFICATIONS); }
  set notifications(val) { this.set('notifications', val); }
}

export const localDB = new LocalDB();

// =========================================================================
// DATA ACCESS SERVICE INTERFACE
// =========================================================================
export const dbService = {
  // --- AUTH SERVICES ---
  async login(email: string, password?: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
      if (error) throw error;
      // Get role
      const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', data.user?.id).single();
      let student = null;
      if (profile && profile.role === 'student') {
        const { data: s } = await supabase.from('students').select('*').eq('profile_id', profile.id).single();
        student = s;
      }
      return { user: data.user, profile, student };
    } else {
      // Mock login check
      const profile = localDB.profiles.find((p: any) => p.email.toLowerCase() === email.toLowerCase());
      if (!profile) throw new Error('CIST Student or Admin account not found.');
      if (password && password.length < 4) throw new Error('Password must be at least 4 characters.');
      
      const expectedPassword = profile.password || 'password';
      if (password && password !== expectedPassword) {
        throw new Error('Invalid login credentials');
      }
      
      // Store mock user in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cist_cq_session', JSON.stringify({ userId: profile.id, role: profile.role }));
      }
      const student = localDB.students.find((s: any) => s.profile_id === profile.id) || null;
      return { user: { id: profile.id, email: profile.email }, profile, student };
    }
  },

  async logout() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cist_cq_session');
      }
    }
  },

  async getCurrentUser() {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      let student = null;
      if (profile && profile.role === 'student') {
        const { data: s } = await supabase.from('students').select('*').eq('profile_id', profile.id).single();
        student = s;
      }
      return { user, profile, student };
    } else {
      if (typeof window === 'undefined') return null;
      const sessionStr = localStorage.getItem('cist_cq_session');
      if (!sessionStr) return null;
      const session = JSON.parse(sessionStr);
      const profile = localDB.profiles.find((p: any) => p.id === session.userId);
      if (!profile) return null;
      const student = localDB.students.find((s: any) => s.profile_id === profile.id) || null;
      return { user: { id: profile.id, email: profile.email }, profile, student };
    }
  },

  // --- PROFILES & STUDENTS SERVICES ---
  async getStudents() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('profiles').select('*, students(*)').eq('role', 'student');
      if (error) throw error;
      
      return data.map((item: any) => {
        let studentObj = null;
        if (Array.isArray(item.students)) {
          studentObj = item.students[0] || null;
        } else {
          studentObj = item.students || null;
        }

        // Synthesize fallback student details if the profile is missing a student row
        if (!studentObj) {
          studentObj = {
            id: item.id, // Using profile's valid UUID to prevent database query crashes
            profile_id: item.id,
            student_code: 'NO-CODE',
            grade: item.grade || 'Unassigned',
            classroom: 'Unassigned',
            notes: 'System fallback: Profile is missing corresponding student record.',
            status: 'active'
          };
        }

        return {
          ...item,
          students: studentObj
        };
      });
    } else {
      const students = localDB.students;
      const profiles = localDB.profiles.filter((p: any) => p.role === 'student');
      return students.map((s: any) => {
        const p = profiles.find((prof: any) => prof.id === s.profile_id);
        return { ...p, students: s };
      });
    }
  },

  async createStudent(input: any) {
    const { fullName, email, password, grade, classroom, studentCode, notes, userId } = input;
    if (isSupabaseConfigured && supabase) {
      // Check if profile already exists for this email
      let profile;
      const { data: existingProfile } = await supabase.from('profiles').select().eq('email', email).maybeSingle();
      
      if (existingProfile) {
        // If it exists, update it to ensure correct details (grade, name, avatar, status)
        const { data: updatedProfile, error: pErr } = await supabase.from('profiles').update({
          full_name: fullName,
          grade,
          avatar_url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${fullName.replace(/\s+/g, '')}`,
          status: 'active',
          user_id: userId || existingProfile.user_id || null
        }).eq('id', existingProfile.id).select().single();
        if (pErr) throw pErr;
        profile = updatedProfile;
      } else {
        // Otherwise, insert new profile
        const { data: newProfile, error: pErr } = await supabase.from('profiles').insert({
          full_name: fullName,
          email,
          role: 'student',
          grade,
          avatar_url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${fullName.replace(/\s+/g, '')}`,
          status: 'active',
          user_id: userId || null
        }).select().single();
        if (pErr) throw pErr;
        profile = newProfile;
      }

      // Check if student record already exists for this profile
      let student;
      const { data: existingStudent } = await supabase.from('students').select().eq('profile_id', profile.id).maybeSingle();
      
      if (existingStudent) {
        const { data: updatedStudent, error: sErr } = await supabase.from('students').update({
          student_code: studentCode,
          grade,
          classroom,
          notes,
          status: 'active'
        }).eq('id', existingStudent.id).select().single();
        if (sErr) throw sErr;
        student = updatedStudent;
      } else {
        const { data: newStudent, error: sErr } = await supabase.from('students').insert({
          profile_id: profile.id,
          student_code: studentCode,
          grade,
          classroom,
          notes,
          status: 'active'
        }).select().single();
        if (sErr) throw sErr;
        student = newStudent;
      }
      
      return { profile, student };
    } else {
      const profileId = `s-gen-${Math.random().toString(36).substr(2, 9)}`;
      const studentId = `d-gen-${Math.random().toString(36).substr(2, 9)}`;
      
      const newProfile = {
        id: profileId,
        user_id: `auth-${profileId}`,
        full_name: fullName,
        email,
        role: 'student',
        grade,
        avatar_url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${fullName.replace(/\s+/g, '')}`,
        status: 'active',
        xp: 0,
        coins: 0,
        level: 1,
        rank_title: 'Rookie Coder',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        password: password || 'password'
      };

      const newStudent = {
        id: studentId,
        profile_id: profileId,
        student_code: studentCode,
        grade,
        classroom,
        notes: notes || '',
        status: 'active',
        created_at: new Date().toISOString()
      };

      const profiles = localDB.profiles;
      profiles.push(newProfile);
      localDB.profiles = profiles;

      const students = localDB.students;
      students.push(newStudent);
      localDB.students = students;

      // Send a welcome notification
      await this.createNotification(profileId, 'Welcome to CIST CodeQuest!', 'Your account has been set up. Start your first mission to earn XP and level up!', 'system');

      return { profile: newProfile, student: newStudent };
    }
  },

  async updateStudent(profileId: string, profileUpdates: any, studentUpdates: any, password?: string) {
    if (isSupabaseConfigured && supabase) {
      const { error: pErr } = await supabase.from('profiles').update(profileUpdates).eq('id', profileId);
      if (pErr) throw pErr;
      const { error: sErr } = await supabase.from('students').update(studentUpdates).eq('profile_id', profileId);
      if (sErr) throw sErr;
      return true;
    } else {
      const profiles = localDB.profiles.map((p: any) => {
        if (p.id === profileId) {
          const updated = { ...p, ...profileUpdates, updated_at: new Date().toISOString() };
          if (password) {
            updated.password = password;
          }
          // Recalculate level/rank if XP is manually updated by admin
          if (profileUpdates.xp !== undefined) {
            const { level, rank } = getRankAndLevelForXP(profileUpdates.xp);
            updated.level = level;
            updated.rank_title = rank;
          }
          return updated;
        }
        return p;
      });
      localDB.profiles = profiles;

      const students = localDB.students.map((s: any) => {
        if (s.profile_id === profileId) {
          return { ...s, ...studentUpdates };
        }
        return s;
      });
      localDB.students = students;
      return true;
    }
  },

  async deleteStudent(profileId: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('profiles').delete().eq('id', profileId);
      if (error) throw error;
      return true;
    } else {
      localDB.profiles = localDB.profiles.filter((p: any) => p.id !== profileId);
      localDB.students = localDB.students.filter((s: any) => s.profile_id !== profileId);
      return true;
    }
  },

  async updateXPAndCoins(profileId: string, xpDelta: number, coinsDelta: number, reason: string) {
    if (isSupabaseConfigured && supabase) {
      // Direct SQL call or rpc would be better, but we do standard fetch-then-save
      const { data: profile } = await supabase.from('profiles').select('xp, coins, level').eq('id', profileId).single();
      if (profile) {
        const newXp = Math.max(0, profile.xp + xpDelta);
        const newCoins = Math.max(0, profile.coins + coinsDelta);
        const { level, rank } = getRankAndLevelForXP(newXp);
        
        await supabase.from('profiles').update({
          xp: newXp,
          coins: newCoins,
          level,
          rank_title: rank
        }).eq('id', profileId);

        if (level > profile.level) {
          await this.createNotification(profileId, 'Level Up!', `Congratulations! You reached Level ${level} (${rank})!`, 'xp');
        }
      }
    } else {
      const profiles = localDB.profiles.map((p: any) => {
        if (p.id === profileId) {
          const oldLevel = p.level;
          const newXp = Math.max(0, p.xp + xpDelta);
          const newCoins = Math.max(0, p.coins + coinsDelta);
          const { level, rank } = getRankAndLevelForXP(newXp);
          const updated = {
            ...p,
            xp: newXp,
            coins: newCoins,
            level,
            rank_title: rank,
            updated_at: new Date().toISOString()
          };
          if (level > oldLevel) {
            // Trigger background alert/notification
            setTimeout(() => {
              this.createNotification(profileId, 'Level Up!', `Incredible work! You are now Level ${level} - ${rank}!`, 'xp');
            }, 100);
          }
          return updated;
        }
        return p;
      });
      localDB.profiles = profiles;
    }
  },

  // --- COURSES SERVICES ---
  async getCourses() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('courses').select('*').order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      return [...localDB.courses].sort((a, b) => a.order_index - b.order_index);
    }
  },

  async createCourse(course: any) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('courses').insert(course).select().single();
      if (error) throw error;
      return data;
    } else {
      const id = `c-gen-${Math.random().toString(36).substr(2, 9)}`;
      const newCourse = {
        id,
        ...course,
        created_at: new Date().toISOString()
      };
      const courses = localDB.courses;
      courses.push(newCourse);
      localDB.courses = courses;
      return newCourse;
    }
  },

  async updateCourse(id: string, updates: any) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const courses = localDB.courses.map((c: any) => (c.id === id ? { ...c, ...updates } : c));
      localDB.courses = courses;
      return courses.find((c: any) => c.id === id);
    }
  },

  // --- MISSIONS, LESSONS, CHALLENGES ---
  async getMissions() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('missions').select('*').order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      return [...localDB.missions].sort((a, b) => a.order_index - b.order_index);
    }
  },

  async createMission(mission: any) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('missions').insert(mission).select().single();
      if (error) throw error;
      return data;
    } else {
      const id = `m-gen-${Math.random().toString(36).substr(2, 9)}`;
      const newMission = {
        id,
        ...mission,
        created_at: new Date().toISOString()
      };
      const missions = localDB.missions;
      missions.push(newMission);
      localDB.missions = missions;
      return newMission;
    }
  },

  async updateMission(id: string, updates: any) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('missions').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const missions = localDB.missions.map((m: any) => (m.id === id ? { ...m, ...updates } : m));
      localDB.missions = missions;
      return missions.find((m: any) => m.id === id);
    }
  },

  async deleteMission(id: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('missions').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      localDB.missions = localDB.missions.filter((m: any) => m.id !== id);
      localDB.lessons = localDB.lessons.filter((l: any) => l.mission_id !== id);
      localDB.challenges = localDB.challenges.filter((c: any) => c.mission_id !== id);
      return true;
    }
  },

  async getLessons(missionId?: string) {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('lessons').select('*');
      if (missionId) query = query.eq('mission_id', missionId);
      const { data, error } = await query.order('order_index', { ascending: true });
      if (error) throw error;
      return data;
    } else {
      let lessons = localDB.lessons;
      if (missionId) lessons = lessons.filter((l: any) => l.mission_id === missionId);
      return [...lessons].sort((a, b) => a.order_index - b.order_index);
    }
  },

  async createLesson(lesson: any) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('lessons').insert(lesson).select().single();
      if (error) throw error;
      return data;
    } else {
      const id = `l-gen-${Math.random().toString(36).substr(2, 9)}`;
      const newLesson = {
        id,
        ...lesson,
        created_at: new Date().toISOString()
      };
      const lessons = localDB.lessons;
      lessons.push(newLesson);
      localDB.lessons = lessons;
      return newLesson;
    }
  },

  async updateLesson(id: string, updates: any) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('lessons').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const lessons = localDB.lessons.map((l: any) => (l.id === id ? { ...l, ...updates } : l));
      localDB.lessons = lessons;
      return lessons.find((l: any) => l.id === id);
    }
  },

  async deleteLesson(id: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('lessons').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      localDB.lessons = localDB.lessons.filter((l: any) => l.id !== id);
      return true;
    }
  },

  async getChallenges(missionId?: string) {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('challenges').select('*');
      if (missionId) query = query.eq('mission_id', missionId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } else {
      if (missionId) {
        return localDB.challenges.filter((c: any) => c.mission_id === missionId);
      }
      return localDB.challenges;
    }
  },

  async createChallenge(challenge: any) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('challenges').insert(challenge).select().single();
      if (error) throw error;
      return data;
    } else {
      const id = `c-gen-${Math.random().toString(36).substr(2, 9)}`;
      const newChallenge = {
        id,
        ...challenge,
        created_at: new Date().toISOString()
      };
      const challenges = localDB.challenges;
      challenges.push(newChallenge);
      localDB.challenges = challenges;
      return newChallenge;
    }
  },

  async updateChallenge(id: string, updates: any) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('challenges').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const challenges = localDB.challenges.map((c: any) => (c.id === id ? { ...c, ...updates } : c));
      localDB.challenges = challenges;
      return challenges.find((c: any) => c.id === id);
    }
  },

  async deleteChallenge(id: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('challenges').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      localDB.challenges = localDB.challenges.filter((c: any) => c.id !== id);
      return true;
    }
  },

  // --- PROGRESS TRACKING ---
  async getStudentProgress(studentId: string) {
    if (isSupabaseConfigured && supabase) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!studentId || !uuidRegex.test(studentId)) return [];

      const { data, error } = await supabase.from('student_progress').select('*').eq('student_id', studentId);
      if (error) throw error;
      return data;
    } else {
      return localDB.progress.filter((p: any) => p.student_id === studentId);
    }
  },

  async completeLesson(studentId: string, profileId: string, missionId: string, lessonId: string) {
    // Complete lesson gives +25 XP
    if (isSupabaseConfigured && supabase) {
      // Check if already exists first
      const { data: exists } = await supabase.from('student_progress')
        .select('*')
        .eq('student_id', studentId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (exists) return exists;

      const { data, error } = await supabase.from('student_progress').insert({
        student_id: studentId,
        mission_id: missionId,
        lesson_id: lessonId,
        status: 'completed',
        score: 100,
        completed_at: new Date().toISOString()
      }).select().single();
      
      if (error) throw error;
      
      // Award XP
      await this.updateXPAndCoins(profileId, 25, 5, 'Completed Lesson');
      return data;
    } else {
      const progress = localDB.progress;
      const exists = progress.find((p: any) => p.student_id === studentId && p.lesson_id === lessonId);
      
      if (!exists) {
        const newProgress = {
          id: `pgr-gen-${Math.random().toString(36).substr(2, 9)}`,
          student_id: studentId,
          mission_id: missionId,
          lesson_id: lessonId,
          challenge_id: null,
          status: 'completed',
          score: 100,
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        progress.push(newProgress);
        localDB.progress = progress;
        
        // Award XP
        await this.updateXPAndCoins(profileId, 25, 5, 'Completed Lesson');
        return newProgress;
      }
      return exists;
    }
  },

  async completeChallenge(
    studentId: string,
    profileId: string,
    missionId: string,
    challengeId: string,
    xpReward = 75,
    coinReward = 30,
    score = 100,
    timeSpent = 0,
    attemptsCount = 1
  ) {
    // Complete challenge gives reward (default +75 XP, +30 coins)
    if (isSupabaseConfigured && supabase) {
      // Check if already exists first
      const { data: exists } = await supabase.from('student_progress')
        .select('*')
        .eq('student_id', studentId)
        .eq('challenge_id', challengeId)
        .maybeSingle();

      if (exists) {
        if (exists.status === 'completed') return exists;
        
        // If it exists but was not completed, we update it
        const { data, error } = await supabase.from('student_progress').update({
          status: 'completed',
          score,
          time_spent: timeSpent,
          attempts_count: attemptsCount,
          completed_at: new Date().toISOString()
        }).eq('id', exists.id).select().single();
        
        if (error) throw error;
        await this.updateXPAndCoins(profileId, xpReward, coinReward, 'Completed Challenge');
        return data;
      }

      const { data, error } = await supabase.from('student_progress').insert({
        student_id: studentId,
        mission_id: missionId,
        challenge_id: challengeId,
        status: 'completed',
        score,
        time_spent: timeSpent,
        attempts_count: attemptsCount,
        completed_at: new Date().toISOString()
      }).select().single();
      
      if (error) throw error;
      
      await this.updateXPAndCoins(profileId, xpReward, coinReward, 'Completed Challenge');
      return data;
    } else {
      const progress = localDB.progress;
      const existsIdx = progress.findIndex((p: any) => p.student_id === studentId && p.challenge_id === challengeId);
      
      if (existsIdx === -1) {
        const newProgress = {
          id: `pgr-gen-${Math.random().toString(36).substr(2, 9)}`,
          student_id: studentId,
          mission_id: missionId,
          lesson_id: null,
          challenge_id: challengeId,
          status: 'completed',
          score,
          time_spent: timeSpent,
          attempts_count: attemptsCount,
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
        progress.push(newProgress);
        localDB.progress = progress;
        
        await this.updateXPAndCoins(profileId, xpReward, coinReward, 'Completed Challenge');
        return newProgress;
      } else {
        const exists = progress[existsIdx];
        if (exists.status === 'completed') return exists;
        
        const updatedProgress = {
          ...exists,
          status: 'completed',
          score,
          time_spent: timeSpent,
          attempts_count: attemptsCount,
          completed_at: new Date().toISOString()
        };
        progress[existsIdx] = updatedProgress;
        localDB.progress = progress;
        
        await this.updateXPAndCoins(profileId, xpReward, coinReward, 'Completed Challenge');
        return updatedProgress;
      }
    }
  },

  // Check if mission is complete (all lessons and challenges for mission completed)
  async checkAndCompleteMission(studentId: string, profileId: string, missionId: string) {
    const lessons = await this.getLessons(missionId);
    const challenges = await this.getChallenges(missionId);
    const progress = await this.getStudentProgress(studentId);

    const completedLessons = progress.filter((p: any) => p.mission_id === missionId && p.lesson_id && p.status === 'completed');
    const completedChallenges = progress.filter((p: any) => p.mission_id === missionId && p.challenge_id && p.status === 'completed');

    if (completedLessons.length === lessons.length && completedChallenges.length === challenges.length) {
      // Award mission reward (+100 XP, +50 Coins)
      const mission = (await this.getMissions()).find((m: any) => m.id === missionId);
      const xp = mission ? mission.xp_reward : 100;
      const coins = mission ? mission.coin_reward : 50;

      // Check if mission-wide record already created
      const missionProgressExists = progress.find((p: any) => p.mission_id === missionId && !p.lesson_id && !p.challenge_id && p.status === 'completed');
      if (!missionProgressExists) {
        if (isSupabaseConfigured && supabase) {
          await supabase.from('student_progress').insert({
            student_id: studentId,
            mission_id: missionId,
            status: 'completed',
            score: 100,
            completed_at: new Date().toISOString()
          });
        } else {
          const newProgress = {
            id: `pgr-gen-${Math.random().toString(36).substr(2, 9)}`,
            student_id: studentId,
            mission_id: missionId,
            lesson_id: null,
            challenge_id: null,
            status: 'completed',
            score: 100,
            completed_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          };
          const allProgress = localDB.progress;
          allProgress.push(newProgress);
          localDB.progress = allProgress;
        }

        await this.updateXPAndCoins(profileId, xp, coins, `Completed Mission: ${mission?.title}`);
        await this.createNotification(profileId, '🎉 Mission Completed!', `You completed "${mission?.title}" and earned ${xp} XP and ${coins} Coins!`, 'system');

        // Check auto-badge awards (e.g. badge b1111111-1111-1111-1111-111111111111 for Python Basics mission)
        if (missionId === 'e1111111-1111-1111-1111-111111111111') {
          await this.awardBadge(studentId, 'b1111111-1111-1111-1111-111111111111');
        }
        if (missionId === 'e4444444-4444-4444-4444-444444444444') {
          await this.awardBadge(studentId, 'b4444444-4444-4444-4444-444444444444');
        }
        return true;
      }
    }
    return false;
  },

  // --- PROJECTS SHOWCASE ---
  async getProjects(status?: string) {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('projects').select('*, students(*, profiles(*))');
      if (status) query = query.eq('status', status);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      let projects = localDB.projects;
      if (status) projects = projects.filter((p: any) => p.status === status);
      const students = localDB.students;
      const profiles = localDB.profiles;

      return projects.map((p: any) => {
        const s = students.find((st: any) => st.id === p.student_id);
        const prof = s ? profiles.find((pr: any) => pr.id === s.profile_id) : null;
        return {
          ...p,
          students: s ? { ...s, profiles: prof } : null
        };
      }).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  async submitProject(studentId: string, project: any) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('projects').insert({
        student_id: studentId,
        ...project,
        status: 'pending',
        votes_count: 0,
        teacher_score: null,
        xp_awarded: 0
      }).select().single();
      if (error) throw error;
      return data;
    } else {
      const id = `p-gen-${Math.random().toString(36).substr(2, 9)}`;
      const newProject = {
        id,
        student_id: studentId,
        ...project,
        status: 'pending',
        votes_count: 0,
        teacher_score: null,
        xp_awarded: 0,
        created_at: new Date().toISOString()
      };
      const projects = localDB.projects;
      projects.push(newProject);
      localDB.projects = projects;
      return newProject;
    }
  },

  async moderateProject(projectId: string, status: 'approved' | 'rejected', score: number, feedback: string, xp: number) {
    if (isSupabaseConfigured && supabase) {
      const { data: project } = await supabase.from('projects').select('student_id').eq('id', projectId).single();
      const { error } = await supabase.from('projects').update({
        status,
        teacher_score: score,
        xp_awarded: xp
      }).eq('id', projectId);
      if (error) throw error;

      if (project && status === 'approved') {
        const { data: student } = await supabase.from('students').select('profile_id').eq('id', project.student_id).single();
        if (student) {
          // Complete project award (+200 XP, +50 Coins)
          await this.updateXPAndCoins(student.profile_id, xp + 200, 50, `Project Approved: ${feedback}`);
          await this.createNotification(student.profile_id, '🎨 Project Approved!', `Your project was approved by teacher! You got a score of ${score}/100 and earned ${xp + 200} XP!`, 'project');
          
          // Check auto badge award for projects
          await this.awardBadge(project.student_id, 'b5555555-5555-5555-5555-555555555555');
        }
      }
      return true;
    } else {
      const projects = localDB.projects.map((p: any) => {
        if (p.id === projectId) {
          return {
            ...p,
            status,
            teacher_score: score,
            xp_awarded: xp
          };
        }
        return p;
      });
      localDB.projects = projects;

      const project = localDB.projects.find((p: any) => p.id === projectId);
      if (project && status === 'approved') {
        const student = localDB.students.find((s: any) => s.id === project.student_id);
        if (student) {
          await this.updateXPAndCoins(student.profile_id, xp + 200, 50, `Project Approved: ${feedback}`);
          await this.createNotification(student.profile_id, '🎨 Project Approved!', `Your project "${project.title}" was approved! Score: ${score}/100 (+${xp + 200} XP)`, 'project');
          
          await this.awardBadge(project.student_id, 'b5555555-5555-5555-5555-555555555555');
        }
      }
      return true;
    }
  },

  async voteProject(projectId: string, studentId: string) {
    if (isSupabaseConfigured && supabase) {
      // In supabase we verify RLS unique constraint
      const { error } = await supabase.from('project_votes').insert({ project_id: projectId, student_id: studentId });
      if (error) throw error;
      // Increment count
      const { data: project } = await supabase.from('projects').select('votes_count').eq('id', projectId).single();
      if (project) {
        await supabase.from('projects').update({ votes_count: project.votes_count + 1 }).eq('id', projectId);
      }
      return true;
    } else {
      // Check if already voted
      if (typeof window !== 'undefined') {
        const voteKey = `cist_cq_vote_${projectId}_${studentId}`;
        const hasVoted = localStorage.getItem(voteKey);
        if (hasVoted) throw new Error('You have already voted for this project.');
        localStorage.setItem(voteKey, 'true');
      }

      const projects = localDB.projects.map((p: any) => {
        if (p.id === projectId) {
          return { ...p, votes_count: p.votes_count + 1 };
        }
        return p;
      });
      localDB.projects = projects;
      return true;
    }
  },

  // --- COMMUNITY FORUM ---
  async getPosts(status?: string) {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('community_posts').select('*, students(*, profiles(*))');
      if (status) query = query.eq('status', status);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      let posts = localDB.posts;
      if (status) posts = posts.filter((p: any) => p.status === status);
      const students = localDB.students;
      const profiles = localDB.profiles;

      return posts.map((p: any) => {
        const s = students.find((st: any) => st.id === p.student_id);
        const prof = s ? profiles.find((pr: any) => pr.id === s.profile_id) : null;
        return {
          ...p,
          students: s ? { ...s, profiles: prof } : null
        };
      }).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  async createPost(studentId: string, post: any) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('community_posts').insert({
        student_id: studentId,
        ...post,
        status: 'approved', // Approved by default for instant visibility
        likes_count: 0,
        comments_count: 0
      }).select().single();
      if (error) throw error;
      return data;
    } else {
      const id = `o-gen-${Math.random().toString(36).substr(2, 9)}`;
      const newPost = {
        id,
        student_id: studentId,
        ...post,
        status: 'approved',
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString()
      };
      const posts = localDB.posts;
      posts.push(newPost);
      localDB.posts = posts;
      return newPost;
    }
  },

  async moderatePost(postId: string, status: 'approved' | 'rejected') {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('community_posts').update({ status }).eq('id', postId);
      if (error) throw error;
      return true;
    } else {
      const posts = localDB.posts.map((p: any) => (p.id === postId ? { ...p, status } : p));
      localDB.posts = posts;
      return true;
    }
  },

  async getComments(postId?: string) {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('comments').select('*, students(*, profiles(*))').eq('status', 'approved');
      if (postId) query = query.eq('post_id', postId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } else {
      let comments = localDB.comments;
      if (postId) {
        comments = comments.filter((c: any) => c.post_id === postId && c.status === 'approved');
      } else {
        comments = comments.filter((c: any) => c.status === 'approved');
      }
      const students = localDB.students;
      const profiles = localDB.profiles;

      return comments.map((c: any) => {
        const s = students.find((st: any) => st.id === c.student_id);
        const prof = s ? profiles.find((pr: any) => pr.id === s.profile_id) : null;
        return {
          ...c,
          students: s ? { ...s, profiles: prof } : null
        };
      });
    }
  },

  async addComment(postId: string, studentId: string, content: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('comments').insert({
        post_id: postId,
        student_id: studentId,
        content,
        status: 'approved'
      }).select().single();
      if (error) throw error;
      return data;
    } else {
      const id = `k-gen-${Math.random().toString(36).substr(2, 9)}`;
      const newComment = {
        id,
        post_id: postId,
        student_id: studentId,
        content,
        status: 'approved',
        created_at: new Date().toISOString()
      };
      const comments = localDB.comments;
      comments.push(newComment);
      localDB.comments = comments;

      // Update post comments count
      const posts = localDB.posts.map((p: any) => {
        if (p.id === postId) {
          return { ...p, comments_count: p.comments_count + 1 };
        }
        return p;
      });
      localDB.posts = posts;

      return newComment;
    }
  },

  async hideComment(commentId: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('comments').update({ status: 'hidden' }).eq('id', commentId);
      if (error) throw error;
      return true;
    } else {
      const comments = localDB.comments.map((c: any) => (c.id === commentId ? { ...c, status: 'hidden' } : c));
      localDB.comments = comments;
      return true;
    }
  },

  async likePost(postId: string) {
    if (isSupabaseConfigured && supabase) {
      const { data: post } = await supabase.from('community_posts').select('likes_count').eq('id', postId).single();
      if (post) {
        await supabase.from('community_posts').update({ likes_count: post.likes_count + 1 }).eq('id', postId);
      }
      return true;
    } else {
      const posts = localDB.posts.map((p: any) => {
        if (p.id === postId) {
          return { ...p, likes_count: p.likes_count + 1 };
        }
        return p;
      });
      localDB.posts = posts;
      return true;
    }
  },

  // --- BADGES SERVICES ---
  async getBadges() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('badges').select('*');
      if (error) throw error;
      return data;
    } else {
      return localDB.badges;
    }
  },

  async createBadge(badge: any) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('badges').insert(badge).select().single();
      if (error) throw error;
      return data;
    } else {
      const id = `b-gen-${Math.random().toString(36).substr(2, 9)}`;
      const newBadge = {
        id,
        ...badge,
        created_at: new Date().toISOString()
      };
      const badges = localDB.badges;
      badges.push(newBadge);
      localDB.badges = badges;
      return newBadge;
    }
  },

  async getStudentBadges(studentId?: string) {
    if (isSupabaseConfigured && supabase) {
      if (studentId) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(studentId)) return [];
        const { data, error } = await supabase.from('student_badges').select('*, badges(*)').eq('student_id', studentId);
        if (error) throw error;
        return data.map((sb: any) => sb.badges);
      } else {
        const { data, error } = await supabase.from('student_badges').select('*, badges(*)');
        if (error) throw error;
        return data;
      }
    } else {
      if (studentId) {
        const studentBadges = localDB.studentBadges.filter((sb: any) => sb.student_id === studentId);
        const badges = localDB.badges;
        return studentBadges.map((sb: any) => badges.find((b: any) => b.id === sb.badge_id)).filter(Boolean);
      } else {
        const badges = localDB.badges;
        return localDB.studentBadges.map((sb: any) => ({
          ...sb,
          badges: badges.find((b: any) => b.id === sb.badge_id)
        })).filter((sb: any) => sb.badges);
      }
    }
  },

  async awardBadge(studentId: string, badgeId: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('student_badges').insert({ student_id: studentId, badge_id: badgeId }).select().single();
      // Notify student
      const { data: student } = await supabase.from('students').select('profile_id').eq('id', studentId).single();
      const { data: badge } = await supabase.from('badges').select('name').eq('id', badgeId).single();
      if (student && badge) {
        await this.createNotification(student.profile_id, '🏆 Badge Unlocked!', `You have earned the "${badge.name}" badge!`, 'badge');
      }
      return data;
    } else {
      const studentBadges = localDB.studentBadges;
      const exists = studentBadges.find((sb: any) => sb.student_id === studentId && sb.badge_id === badgeId);
      
      if (!exists) {
        const newAward = {
          id: `sb-gen-${Math.random().toString(36).substr(2, 9)}`,
          student_id: studentId,
          badge_id: badgeId,
          awarded_at: new Date().toISOString()
        };
        studentBadges.push(newAward);
        localDB.studentBadges = studentBadges;

        // Trigger Notification
        const student = localDB.students.find((s: any) => s.id === studentId);
        const badge = localDB.badges.find((b: any) => b.id === badgeId);
        if (student && badge) {
          await this.createNotification(student.profile_id, '🏆 Badge Unlocked!', `You have earned the "${badge.name}" badge!`, 'badge');
        }
        return newAward;
      }
      return exists;
    }
  },

  async removeBadge(studentId: string, badgeId: string) {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('student_badges').delete().eq('student_id', studentId).eq('badge_id', badgeId);
      return true;
    } else {
      localDB.studentBadges = localDB.studentBadges.filter((sb: any) => !(sb.student_id === studentId && sb.badge_id === badgeId));
      return true;
    }
  },

  // --- LEADERBOARD & ACCESS REQUESTS ---
  async getLeaderboardRequests() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('leaderboard_requests').select('*, students(*, profiles(*))');
      if (error) throw error;
      return data;
    } else {
      const requests = localDB.leaderboardRequests;
      const students = localDB.students;
      const profiles = localDB.profiles;

      return requests.map((r: any) => {
        const s = students.find((st: any) => st.id === r.student_id);
        const prof = s ? profiles.find((p: any) => p.id === s.profile_id) : null;
        return {
          ...r,
          students: s ? { ...s, profiles: prof } : null
        };
      });
    }
  },

  async submitLeaderboardRequest(studentId: string, message: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('leaderboard_requests').insert({
        student_id: studentId,
        message,
        status: 'pending'
      }).select().single();
      if (error) throw error;
      return data;
    } else {
      const id = `lr-gen-${Math.random().toString(36).substr(2, 9)}`;
      const newRequest = {
        id,
        student_id: studentId,
        status: 'pending',
        message,
        created_at: new Date().toISOString(),
        reviewed_at: null
      };
      const requests = localDB.leaderboardRequests;
      requests.push(newRequest);
      localDB.leaderboardRequests = requests;
      return newRequest;
    }
  },

  async moderateLeaderboardRequest(requestId: string, status: 'approved' | 'rejected') {
    if (isSupabaseConfigured && supabase) {
      const { data: request } = await supabase.from('leaderboard_requests').select('student_id').eq('id', requestId).single();
      const { error } = await supabase.from('leaderboard_requests').update({
        status,
        reviewed_at: new Date().toISOString()
      }).eq('id', requestId);
      if (error) throw error;

      if (request) {
        const { data: student } = await supabase.from('students').select('profile_id').eq('id', request.student_id).single();
        if (student) {
          const title = status === 'approved' ? 'Leaderboard Access Approved!' : 'Leaderboard Access Declined';
          const msg = status === 'approved' 
            ? 'Congratulations! You are now competing on the official CIST CodeQuest Leaderboard!'
            : 'Your leaderboard request was reviewed and declined. Contact your teacher for details.';
          await this.createNotification(student.profile_id, title, msg, 'system');
        }
      }
      return true;
    } else {
      const requests = localDB.leaderboardRequests.map((r: any) => {
        if (r.id === requestId) {
          return {
            ...r,
            status,
            reviewed_at: new Date().toISOString()
          };
        }
        return r;
      });
      localDB.leaderboardRequests = requests;

      const request = localDB.leaderboardRequests.find((r: any) => r.id === requestId);
      if (request) {
        const student = localDB.students.find((s: any) => s.id === request.student_id);
        if (student) {
          const title = status === 'approved' ? '🏆 Leaderboard Access Approved!' : 'Leaderboard Access Declined';
          const msg = status === 'approved' 
            ? 'Awesome! You are now ranked on the CIST CodeQuest leaderboard.'
            : 'Your request to join the leaderboard was declined. Keep practicing and resubmit later.';
          await this.createNotification(student.profile_id, title, msg, 'system');
        }
      }
      return true;
    }
  },

  // Get ranked leaderboard data
  async getLeaderboard() {
    // Only show students who have an approved leaderboard request
    const studentsList = await this.getStudents();
    const requests = await this.getLeaderboardRequests();
    const approvedStudentIds = requests
      .filter((r: any) => r.status === 'approved')
      .map((r: any) => r.student_id);

    let allApprovedProjects = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('projects').select('*').eq('status', 'approved');
      if (!error && data) {
        allApprovedProjects = data;
      }
    } else {
      allApprovedProjects = localDB.projects.filter((p: any) => p.status === 'approved');
    }

    const leaderboard = studentsList
      .filter((s: any) => approvedStudentIds.includes(s.students.id) && s.status === 'active')
      .map((s: any) => {
        // Score calculation formula:
        // XP Score + (Project votes * 10) + (Teacher average score * 5)
        const studentProjects = allApprovedProjects.filter((p: any) => p.student_id === s.students.id);
        const votesWeight = studentProjects.reduce((sum: number, p: any) => sum + p.votes_count, 0) * 10;
        const scoreWeight = studentProjects.length > 0
          ? (studentProjects.reduce((sum: number, p: any) => sum + (p.teacher_score || 0), 0) / studentProjects.length) * 5
          : 0;
        
        const totalScore = Math.round(s.xp + votesWeight + scoreWeight);
        return {
          id: s.students.id,
          name: s.full_name,
          avatar_url: s.avatar_url,
          grade: s.grade,
          level: s.level,
          rank_title: s.rank_title,
          xp: s.xp,
          score: totalScore
        };
      });

    // Sort descending
    return leaderboard.sort((a: any, b: any) => b.score - a.score);
  },

  // --- NOTIFICATIONS ---
  async getNotifications(profileId: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('notifications').select('*').eq('user_id', profileId).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      return localDB.notifications
        .filter((n: any) => n.user_id === profileId)
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  },

  async createNotification(profileId: string, title: string, message: string, type = 'system') {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('notifications').insert({
        user_id: profileId,
        title,
        message,
        type,
        is_read: false
      }).select().single();
      if (error) throw error;
      return data;
    } else {
      const newNotification = {
        id: `n-gen-${Math.random().toString(36).substr(2, 9)}`,
        user_id: profileId,
        title,
        message,
        type,
        is_read: false,
        created_at: new Date().toISOString()
      };
      const notifications = localDB.notifications;
      notifications.push(newNotification);
      localDB.notifications = notifications;
      return newNotification;
    }
  },

  async markNotificationRead(id: string) {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      return true;
    } else {
      const notifications = localDB.notifications.map((n: any) => (n.id === id ? { ...n, is_read: true } : n));
      localDB.notifications = notifications;
      return true;
    }
  }
};
