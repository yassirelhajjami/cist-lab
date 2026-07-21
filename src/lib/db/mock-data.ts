// src/lib/db/mock-data.ts

export const INITIAL_PROFILES = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    user_id: 'auth-admin-id',
    full_name: 'Mr. Yassir El hajjami',
    email: 'admin@cist.edu',
    password: 'mock-password-admin',
    role: 'admin',
    grade: '',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'active',
    xp: 15000,
    coins: 1200,
    level: 10,
    rank_title: 'CIST Tech Hero',
    created_at: new Date('2026-06-01').toISOString(),
    updated_at: new Date('2026-06-15').toISOString()
  }
];

export const INITIAL_STUDENTS: any[] = [];

export const INITIAL_MISSIONS = [
  {
    id: 'e0111111-1111-1111-1111-111111111111',
    course_id: 'c0000000-0000-0000-0000-000000000001',
    prerequisite_mission_id: null,
    title: 'Logic Play',
    description: 'Solve your first logical sequence blocks.',
    category: 'Logic',
    difficulty: 'beginner',
    xp_reward: 50,
    coin_reward: 15,
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'e0222222-2222-2222-2222-222222222222',
    course_id: 'c0000000-0000-0000-0000-000000000002',
    prerequisite_mission_id: null,
    title: 'Pattern Finding',
    description: 'Recognize visual repeat layouts and coding shapes.',
    category: 'Logic',
    difficulty: 'beginner',
    xp_reward: 60,
    coin_reward: 20,
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'e0333333-3333-3333-3333-333333333333',
    course_id: 'c0000000-0000-0000-0000-000000000003',
    prerequisite_mission_id: null,
    title: 'Sequence Setup',
    description: 'Assemble logical puzzle chains in order.',
    category: 'Logic',
    difficulty: 'beginner',
    xp_reward: 70,
    coin_reward: 25,
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'e0444444-4444-4444-4444-444444444444',
    course_id: 'c0000000-0000-0000-0000-000000000004',
    prerequisite_mission_id: null,
    title: 'Repeat Moves',
    description: 'Harness loop repeats to travel shorter blocks.',
    category: 'Logic',
    difficulty: 'beginner',
    xp_reward: 80,
    coin_reward: 30,
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'e0555555-5555-5555-5555-555555555555',
    course_id: 'c0000000-0000-0000-0000-000000000005',
    prerequisite_mission_id: null,
    title: 'Robot Sensor',
    description: 'Write conditional scripts adjusting robot tracks.',
    category: 'Logic',
    difficulty: 'beginner',
    xp_reward: 90,
    coin_reward: 35,
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'e0666666-6666-6666-6666-666666666666',
    course_id: 'c0000000-0000-0000-0000-000000000006',
    prerequisite_mission_id: null,
    title: 'Simple HTML Page',
    description: 'Draft static pages with structural tags.',
    category: 'Web',
    difficulty: 'beginner',
    xp_reward: 100,
    coin_reward: 40,
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'e0777777-7777-7777-7777-777777777777',
    course_id: 'c0000000-0000-0000-0000-000000000007',
    prerequisite_mission_id: null,
    title: 'Margin Rules',
    description: 'Define paragraph spacing layouts with CSS.',
    category: 'Web',
    difficulty: 'beginner',
    xp_reward: 110,
    coin_reward: 45,
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'e0888888-8888-8888-8888-888888888888',
    course_id: 'c0000000-0000-0000-0000-000000000008',
    prerequisite_mission_id: null,
    title: 'Console Print',
    description: 'Verify dynamic output messages with scripts.',
    category: 'Logic',
    difficulty: 'beginner',
    xp_reward: 120,
    coin_reward: 50,
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'e2222222-2222-2222-2222-222222222222',
    course_id: 'c0000000-0000-0000-0000-000000000009',
    prerequisite_mission_id: null,
    title: 'HTML Web Pages',
    description: 'Build your first webpage using tags, headers, paragraphs, and list items.',
    category: 'Web',
    difficulty: 'beginner',
    xp_reward: 120,
    coin_reward: 50,
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'e1111111-1111-1111-1111-111111111111',
    course_id: 'c0000000-0000-0000-0000-000000000010',
    prerequisite_mission_id: null,
    title: 'Logic & Puzzle Blocks',
    description: 'Learn the fundamentals of sequential thinking by arranging block instructions.',
    category: 'Logic',
    difficulty: 'beginner',
    xp_reward: 100,
    coin_reward: 40,
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'e4444444-4444-4444-4444-444444444444',
    course_id: 'c0000000-0000-0000-0000-000000000010',
    prerequisite_mission_id: 'e1111111-1111-1111-1111-111111111111',
    title: 'Python Syntax & Logic',
    description: 'Master advanced Python scripting, variables, structures, and branching conditionals.',
    category: 'Python',
    difficulty: 'intermediate',
    xp_reward: 200,
    coin_reward: 80,
    order_index: 2,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'e3333333-3333-3333-3333-333333333333',
    course_id: 'c0000000-0000-0000-0000-000000000011',
    prerequisite_mission_id: null,
    title: 'CSS Custom Styling',
    description: 'Add layout styles, color schemes, font sizing, and margins to web nodes.',
    category: 'Web',
    difficulty: 'intermediate',
    xp_reward: 150,
    coin_reward: 60,
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'e5555555-5555-5555-5555-555555555555',
    course_id: 'c0000000-0000-0000-0000-000000000012',
    prerequisite_mission_id: null,
    title: 'Neural Nets & AI models',
    description: 'Explore machine learning models, neural layer functions, and algorithmic predictions.',
    category: 'AI',
    difficulty: 'advanced',
    xp_reward: 250,
    coin_reward: 100,
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  }
];

export const INITIAL_LESSONS = [
  {
    id: 'l-g1',
    mission_id: 'e0111111-1111-1111-1111-111111111111',
    title: 'Grade 1: Introduction to Instructions',
    content: 'Computers follow instructions in order. Follow the command to complete your first Grade 1 task!\n\n![Sequential Problem Solving](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80)',
    video_url: '',
    code_example: 'print("Level 1")',
    order_index: 1,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'l-g2',
    mission_id: 'e0222222-2222-2222-2222-222222222222',
    title: 'Grade 2: Pattern Recognition',
    content: 'Let\'s find repeating logic shapes to automate our commands!\n\n![Logic Patterns](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80)',
    video_url: '',
    code_example: 'print("Level 2")',
    order_index: 1,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'l-g3',
    mission_id: 'e0333333-3333-3333-3333-333333333333',
    title: 'Grade 3: Sequences',
    content: 'Arrange multiple block instructions one after another.\n\n![Logic Chains](https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80)',
    video_url: '',
    code_example: 'print("Level 3")',
    order_index: 1,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'l-g4',
    mission_id: 'e0444444-4444-4444-4444-444444444444',
    title: 'Grade 4: Loops',
    content: 'Repeat actions without writing the same command multiple times.\n\n![Loop Cycles](https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80)',
    video_url: '',
    code_example: 'print("Level 4")',
    order_index: 1,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'l-g5',
    mission_id: 'e0555555-5555-5555-5555-555555555555',
    title: 'Grade 5: Decision Making',
    content: 'Use sensors to make decisions dynamically based on input coordinates.\n\n![Virtual Robot Sensor](https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80)',
    video_url: '',
    code_example: 'print("Level 5")',
    order_index: 1,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'l-g6',
    mission_id: 'e0666666-6666-6666-6666-666666666666',
    title: 'Grade 6: Web Tags',
    content: 'Structure text elements using enclosing structural markup tags.\n\n![Web Coding Screen](https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80)',
    video_url: '',
    code_example: 'print("Level 6")',
    order_index: 1,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'l-g7',
    mission_id: 'e0777777-7777-7777-7777-777777777777',
    title: 'Grade 7: Styles & Spacings',
    content: 'Learn how to apply layouts and custom spacing properties using stylesheets.\n\n![Interface Design](https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80)',
    video_url: '',
    code_example: 'print("Level 7")',
    order_index: 1,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'l-g8',
    mission_id: 'e0888888-8888-8888-8888-888888888888',
    title: 'Grade 8: Print Operations',
    content: 'Send variable states and status reports directly to console outputs.\n\n![Console Logs Output](https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80)',
    video_url: '',
    code_example: 'print("Level 8")',
    order_index: 1,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'l11',
    mission_id: 'e1111111-1111-1111-1111-111111111111',
    title: 'What is Coding Logic?',
    content: 'Coding is giving clear, sequential instructions to a computer. Imagine you are teaching a robot to make a sandwich. You must say: "1. Take two slices of bread. 2. Spread jam. 3. Put slices together." If you mix the order, the sandwich fails! This is sequential logic.\n\n![Sequential Problem Solving](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80)',
    video_url: '',
    code_example: '# A clean sequence of instructions\nstep1 = "Take bread"\nstep2 = "Spread jam"\nprint(step1)',
    order_index: 1,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'l12',
    mission_id: 'e1111111-1111-1111-1111-111111111111',
    title: 'Algorithms: Directions to Goal',
    content: 'An algorithm is a step-by-step procedure to solve a puzzle. When coding a character to run through a maze, the algorithm describes every turn. Moving forward, turning left, and picking up items are basic command blocks.\n\n![Algorithm Maze Solver](https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80)',
    video_url: '',
    code_example: '# Maze solving sequence\nmove_forward()\nturn_left()\nmove_forward()',
    order_index: 2,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'l21',
    mission_id: 'e2222222-2222-2222-2222-222222222222',
    title: 'HTML Structure & Headings',
    content: 'HTML (HyperText Markup Language) creates the structure of web pages. We use enclosing tags like <h1>...</h1> for headings. Tags act like labels telling the web browser how to represent text content.\n\n![HTML Elements Diagram](https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80)',
    video_url: '',
    code_example: '<h1>Welcome to CIST</h1>\n<p>HTML skeleton starts here.</p>',
    order_index: 1,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'l31',
    mission_id: 'e3333333-3333-3333-3333-333333333333',
    title: 'Cascading Style Sheets Basics',
    content: 'CSS handles layout aesthetics. We link styling properties (colors, fonts, sizes) to our HTML structures using selectors. CSS selectors target tags or classes to modify look and feel.\n\n![Design Palettes styling](https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80)',
    video_url: '',
    code_example: 'h1 {\n  color: #C53030;\n  font-size: 32px;\n}',
    order_index: 1,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'l41',
    mission_id: 'e4444444-4444-4444-4444-444444444444',
    title: 'Python Console Output & Indentation',
    content: 'Python is a text-based scripting language. Unlike other languages that use brackets, Python uses indentation (4 spaces) to group statements. We print results using print() wrapped in string quotations.\n\n![Python Scripts Editor](https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80)',
    video_url: '',
    code_example: 'def greet(name):\n    print("Hello " + name)\ngreet("Sofia")',
    order_index: 1,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'l42',
    mission_id: 'e4444444-4444-4444-4444-444444444444',
    title: 'Python Variables & Dynamic Types',
    content: 'Variables hold values. Python automatically identifies data types dynamically. Set them using the = operator.\n\n![Dynamic Types Schema](https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80)',
    video_url: '',
    code_example: 'age = 15\nheight = 1.75\nis_student = True\nprint(age)',
    order_index: 2,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'l51',
    mission_id: 'e5555555-5555-5555-5555-555555555555',
    title: 'Machine Learning Concepts',
    content: 'Machine learning teaches computers to make predictions from patterns in datasets. Instead of writing explicit logical branches, the algorithm adjusts itself by reviewing past inputs.\n\n![Neural Network Synapses Node Schema](https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80)',
    video_url: '',
    code_example: '# High-level ML concept\ninputs = [1, 2, 3]\noutputs = [2, 4, 6]\n# AI figures out: Output = Input * 2',
    order_index: 1,
    created_at: new Date('2026-06-01').toISOString()
  }
];

export const INITIAL_CHALLENGES = [
  {
    id: 'ch-g1',
    mission_id: 'e0111111-1111-1111-1111-111111111111',
    title: 'Draft Level 1 Message',
    description: 'Output a Level 1 console log.',
    instructions: 'Write print("Level 1") to pass the grading check.',
    starter_code: 'print("...")',
    expected_output: 'Level 1\n',
    is_published: true,
    difficulty: 'beginner',
    xp_reward: 50,
    coin_reward: 10,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'ch-g2',
    mission_id: 'e0222222-2222-2222-2222-222222222222',
    title: 'Draft Level 2 Message',
    description: 'Output a Level 2 console log.',
    instructions: 'Write print("Level 2") to pass.',
    starter_code: 'print("...")',
    expected_output: 'Level 2\n',
    is_published: true,
    difficulty: 'beginner',
    xp_reward: 50,
    coin_reward: 10,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'ch-g3',
    mission_id: 'e0333333-3333-3333-3333-333333333333',
    title: 'Draft Level 3 Message',
    description: 'Output a Level 3 console log.',
    instructions: 'Write print("Level 3") to pass.',
    starter_code: 'print("...")',
    expected_output: 'Level 3\n',
    is_published: true,
    difficulty: 'beginner',
    xp_reward: 55,
    coin_reward: 12,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'ch-g4',
    mission_id: 'e0444444-4444-4444-4444-444444444444',
    title: 'Draft Level 4 Message',
    description: 'Output a Level 4 console log.',
    instructions: 'Write print("Level 4") to pass.',
    starter_code: 'print("...")',
    expected_output: 'Level 4\n',
    is_published: true,
    difficulty: 'beginner',
    xp_reward: 55,
    coin_reward: 12,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'ch-g5',
    mission_id: 'e0555555-5555-5555-5555-555555555555',
    title: 'Draft Level 5 Message',
    description: 'Output a Level 5 console log.',
    instructions: 'Write print("Level 5") to pass.',
    starter_code: 'print("...")',
    expected_output: 'Level 5\n',
    is_published: true,
    difficulty: 'beginner',
    xp_reward: 60,
    coin_reward: 15,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'ch-g6',
    mission_id: 'e0666666-6666-6666-6666-666666666666',
    title: 'Draft Level 6 Message',
    description: 'Output a Level 6 console log.',
    instructions: 'Write print("Level 6") to pass.',
    starter_code: 'print("...")',
    expected_output: 'Level 6\n',
    is_published: true,
    difficulty: 'beginner',
    xp_reward: 60,
    coin_reward: 15,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'ch-g7',
    mission_id: 'e0777777-7777-7777-7777-777777777777',
    title: 'Draft Level 7 Message',
    description: 'Output a Level 7 console log.',
    instructions: 'Write print("Level 7") to pass.',
    starter_code: 'print("...")',
    expected_output: 'Level 7\n',
    is_published: true,
    difficulty: 'beginner',
    xp_reward: 70,
    coin_reward: 20,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'ch-g8',
    mission_id: 'e0888888-8888-8888-8888-888888888888',
    title: 'Draft Level 8 Message',
    description: 'Output a Level 8 console log.',
    instructions: 'Write print("Level 8") to pass.',
    starter_code: 'print("...")',
    expected_output: 'Level 8\n',
    is_published: true,
    difficulty: 'beginner',
    xp_reward: 70,
    coin_reward: 20,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'ch1',
    mission_id: 'e1111111-1111-1111-1111-111111111111',
    title: 'Robot Greeting Code',
    description: 'Set up your robot assistant name correctly in the console logs.',
    instructions: 'Assign "Codey" to the robot_name variable and output it using print.',
    starter_code: 'robot_name = "..."\nprint(robot_name)',
    expected_output: 'Codey\n',
    is_published: true,
    difficulty: 'beginner',
    xp_reward: 60,
    coin_reward: 20,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'ch2',
    mission_id: 'e2222222-2222-2222-2222-222222222222',
    title: 'Web Heading Challenge',
    description: 'Assign a custom title variable representing HTML header properties.',
    instructions: 'Define web_header as "My First Site" and output it.',
    starter_code: 'web_header = "..."\nprint(web_header)',
    expected_output: 'My First Site\n',
    is_published: true,
    difficulty: 'beginner',
    xp_reward: 80,
    coin_reward: 25,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'ch3',
    mission_id: 'e3333333-3333-3333-3333-333333333333',
    title: 'Style Selector Matcher',
    description: 'Program a style selector string representation.',
    instructions: 'Assign "h1-color" to the style_class variable and print it.',
    starter_code: 'style_class = "..."\nprint(style_class)',
    expected_output: 'h1-color\n',
    is_published: true,
    difficulty: 'intermediate',
    xp_reward: 90,
    coin_reward: 30,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'ch4',
    mission_id: 'e4444444-4444-4444-4444-444444444444',
    title: 'Grade Calculator Solver',
    description: 'Calculate class passing grades dynamically.',
    instructions: 'Initialize passing_score to 75 and print it to pass the grader tests.',
    starter_code: 'passing_score = 0\nprint(passing_score)',
    expected_output: '75\n',
    is_published: true,
    difficulty: 'intermediate',
    xp_reward: 100,
    coin_reward: 40,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'ch5',
    mission_id: 'e5555555-5555-5555-5555-555555555555',
    title: 'Assign AI Neural Weight',
    description: 'Configure simple mathematical weights representing input synapse connections.',
    instructions: 'Set synapse_weight to "0.95" (as a string) and print it.',
    starter_code: 'synapse_weight = "0.0"\nprint(synapse_weight)',
    expected_output: '0.95\n',
    is_published: true,
    difficulty: 'advanced',
    xp_reward: 120,
    coin_reward: 50,
    created_at: new Date('2026-06-01').toISOString()
  }
];

export const INITIAL_BADGES = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    name: 'Iron Coder',
    description: 'Start your CS journey by completing the Python Basics introductory path.',
    icon_url: 'Iron',
    requirement_type: 'mission',
    requirement_value: 1,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    name: 'Bronze Operator',
    description: 'Demonstrate basic logic by solving 3 code challenges.',
    icon_url: 'Bronze',
    requirement_type: 'challenge',
    requirement_value: 3,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'b3333333-3333-3333-3333-333333333333',
    name: 'Silver Specialist',
    description: 'Detect and squash 5 syntax or logic bugs in the Bug Hunter arena.',
    icon_url: 'Silver',
    requirement_type: 'challenge',
    requirement_value: 5,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'b4444444-4444-4444-4444-444444444444',
    name: 'Gold Sentinel',
    description: 'Command robotic algorithms by solving the virtual robot maze path.',
    icon_url: 'Gold',
    requirement_type: 'mission',
    requirement_value: 1,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'b5555555-5555-5555-5555-555555555555',
    name: 'Platinum Duelist',
    description: 'Design and deploy an approved custom showcase software project.',
    icon_url: 'Platinum',
    requirement_type: 'project',
    requirement_value: 1,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'b6666666-6666-6666-6666-666666666666',
    name: 'Diamond Initiator',
    description: 'Reach elite rank status by gaining over 5,000 total XP.',
    icon_url: 'Diamond',
    requirement_type: 'xp',
    requirement_value: 5000,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'b7777777-7777-7777-7777-777777777777',
    name: 'Ascendant Controller',
    description: 'Prove command of senior concepts by earning over 7,500 total XP.',
    icon_url: 'Ascendant',
    requirement_type: 'xp',
    requirement_value: 7500,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'b8888888-8888-8888-8888-888888888888',
    name: 'Immortal Sentinel',
    description: 'Attain master programmer status by earning over 10,000 total XP.',
    icon_url: 'Immortal',
    requirement_type: 'xp',
    requirement_value: 10000,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'b9999999-9999-9999-9999-999999999999',
    name: 'Radiant Legend',
    description: 'Pinnacle CIST CodeQuest achievement. Earn over 15,000 total XP.',
    icon_url: 'Radiant',
    requirement_type: 'xp',
    requirement_value: 15000,
    created_at: new Date('2026-06-01').toISOString()
  }
];

export const INITIAL_STUDENT_BADGES: any[] = [];

export const INITIAL_PROJECTS: any[] = [];

export const INITIAL_COMMUNITY_POSTS: any[] = [];

export const INITIAL_COMMENTS: any[] = [];

export const INITIAL_LEADERBOARD_REQUESTS: any[] = [];

export const INITIAL_PROGRESS: any[] = [];

export const INITIAL_NOTIFICATIONS: any[] = [];

export const INITIAL_COURSES = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    title: 'Grade 1 Creative Logic',
    description: 'Introduction to sequential instructions and logic concepts.',
    icon_url: 'Gamepad2',
    color_theme: 'emerald',
    grade: 'Grade 1',
    order_index: 1,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    title: 'Grade 2 Pattern Matching',
    description: 'Explore logic loops, repetitive directions, and visual puzzles.',
    icon_url: 'BookOpen',
    color_theme: 'emerald',
    grade: 'Grade 2',
    order_index: 2,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    title: 'Grade 3 Coding Patterns',
    description: 'Solve code sequencing and conditional logic gates.',
    icon_url: 'Award',
    color_theme: 'emerald',
    grade: 'Grade 3',
    order_index: 3,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    title: 'Grade 4 Visual Loops',
    description: 'Master repeating actions, repeat blocks, and nest sequences.',
    icon_url: 'Gamepad2',
    color_theme: 'amber',
    grade: 'Grade 4',
    order_index: 4,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    title: 'Grade 5 Robotic Control',
    description: 'Introduction to visual motor coordinates and sensor logic.',
    icon_url: 'BookOpen',
    color_theme: 'amber',
    grade: 'Grade 5',
    order_index: 5,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'c0000000-0000-0000-0000-000000000006',
    title: 'Grade 6 Web Foundations',
    description: 'Discover the basic skeleton of web structures using HTML tags.',
    icon_url: 'Award',
    color_theme: 'amber',
    grade: 'Grade 6',
    order_index: 6,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'c0000000-0000-0000-0000-000000000007',
    title: 'Grade 7 Custom CSS Styling',
    description: 'Implement layout formatting, text styling, and custom web margins.',
    icon_url: 'Gamepad2',
    color_theme: 'navy',
    grade: 'Grade 7',
    order_index: 7,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'c0000000-0000-0000-0000-000000000008',
    title: 'Grade 8 Console Operations',
    description: 'Develop simple block algorithms using variable arrays and text.',
    icon_url: 'BookOpen',
    color_theme: 'navy',
    grade: 'Grade 8',
    order_index: 8,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'c0000000-0000-0000-0000-000000000009',
    title: 'Grade 9 Web Designing',
    description: 'Build fully responsive custom websites with advanced CSS styles.',
    icon_url: 'Award',
    color_theme: 'navy',
    grade: 'Grade 9',
    order_index: 9,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'c0000000-0000-0000-0000-000000000010',
    title: 'Grade 10 Python & Algorithms',
    description: 'Master advanced Python scripting, loops, variables, and logic controls.',
    icon_url: 'Gamepad2',
    color_theme: 'navy',
    grade: 'Grade 10',
    order_index: 10,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'c0000000-0000-0000-0000-000000000011',
    title: 'Grade 11 Custom Scripting',
    description: 'Solve mathematical challenges using recursive operations and custom scripts.',
    icon_url: 'BookOpen',
    color_theme: 'navy',
    grade: 'Grade 11',
    order_index: 11,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  },
  {
    id: 'c0000000-0000-0000-0000-000000000012',
    title: 'Grade 12 Neural Networks & AI',
    description: 'Train mathematical models, evaluate synapses weights, and understand AI functions.',
    icon_url: 'Award',
    color_theme: 'navy',
    grade: 'Grade 12',
    order_index: 12,
    is_published: true,
    created_at: new Date('2026-06-01').toISOString()
  }
];
