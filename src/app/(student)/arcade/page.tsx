// src/app/(student)/arcade/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import {
  Gamepad2, Trophy, CheckCircle2, Play, X, ExternalLink,
  Zap, Coins, BookOpen, Sparkles, Info
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
interface ArcadeGame {
  id: string;
  title: string;
  description: string;
  platform: 'scratch' | 'blockly';
  embedUrl: string;
  externalUrl: string;
  thumbnail: string;          // emoji used as fallback icon
  subject: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  xpReward: number;
  coinReward: number;
  tags: string[];
  embedWidth: number;
  embedHeight: number;
  isNew?: boolean;
  gradeBands: string[];       // e.g. ['1-2', '3-4']
}

const SCRATCH_GAMES: ArcadeGame[] = [
  // --- GRADES 1-2 ---
  {
    id: 'scratch-maze',
    title: 'Maze Runner',
    description: 'Navigate a sprite through a maze using arrow keys. Observe how collision detection and coordinate tracking are used to create puzzle gameplay.',
    platform: 'scratch',
    embedUrl: 'https://scratch.mit.edu/projects/104/embed',
    externalUrl: 'https://scratch.mit.edu/projects/104/',
    thumbnail: '🌀',
    subject: 'Coordinates & Collision',
    difficulty: 'Beginner',
    xpReward: 40,
    coinReward: 15,
    tags: ['coordinates', 'user input', 'sensing'],
    embedWidth: 485,
    embedHeight: 402,
    gradeBands: ['1-2']
  },
  {
    id: 'scratch-clicker',
    title: 'Balloon Clicker Game',
    description: 'Pop as many balloons as you can before the timer runs out! A great way to understand click event listeners, score variables, and random balloon spawning.',
    platform: 'scratch',
    embedUrl: 'https://scratch.mit.edu/projects/11725619/embed',
    externalUrl: 'https://scratch.mit.edu/projects/11725619/',
    thumbnail: '🎈',
    subject: 'Click Events & Variables',
    difficulty: 'Beginner',
    xpReward: 40,
    coinReward: 15,
    tags: ['variables', 'events', 'timer'],
    embedWidth: 485,
    embedHeight: 402,
    gradeBands: ['1-2']
  },

  // --- GRADES 3-4 ---
  {
    id: 'scratch-pong',
    title: 'Pong Classic',
    description: 'The legendary Pong game — study how ball physics, paddle collisions, and score tracking are implemented in Scratch. A perfect introduction to game loops and conditionals.',
    platform: 'scratch',
    embedUrl: 'https://scratch.mit.edu/projects/10128407/embed',
    externalUrl: 'https://scratch.mit.edu/projects/10128407/',
    thumbnail: '🏓',
    subject: 'Game Logic & Loops',
    difficulty: 'Beginner',
    xpReward: 40,
    coinReward: 15,
    tags: ['loops', 'conditionals', 'events'],
    embedWidth: 485,
    embedHeight: 402,
    gradeBands: ['3-4']
  },
  {
    id: 'scratch-flappy',
    title: 'Flappy Bird Premium',
    description: 'Fly through pipes in this smooth remake by griffpatch. Demystifies scrolling backgrounds, velocity gravity calculations, and hitboxes.',
    platform: 'scratch',
    embedUrl: 'https://scratch.mit.edu/projects/92679233/embed',
    externalUrl: 'https://scratch.mit.edu/projects/92679233/',
    thumbnail: '🐤',
    subject: 'Gravity & Scrolling',
    difficulty: 'Intermediate',
    xpReward: 50,
    coinReward: 20,
    tags: ['gravity', 'physics', 'clones'],
    embedWidth: 485,
    embedHeight: 402,
    isNew: true,
    gradeBands: ['3-4']
  },

  // --- GRADES 5-6 ---
  {
    id: 'scratch-pacman',
    title: 'Pac-Man Arcade',
    description: 'Classic maze game. Study sprite coordinates tracking, layout collision paths, and AI ghost behaviors chasing the player.',
    platform: 'scratch',
    embedUrl: 'https://scratch.mit.edu/projects/27533816/embed',
    externalUrl: 'https://scratch.mit.edu/projects/27533816/',
    thumbnail: '🟡',
    subject: 'AI Pathing & Tiles',
    difficulty: 'Intermediate',
    xpReward: 60,
    coinReward: 25,
    tags: ['pathing', 'grid', 'arrays'],
    embedWidth: 485,
    embedHeight: 402,
    gradeBands: ['5-6']
  },
  {
    id: 'scratch-invaders',
    title: 'Space Invaders',
    description: 'Protect the galaxy! Understand clone-based spawning, shoot mechanics, and state variables for multiple alien invaders.',
    platform: 'scratch',
    embedUrl: 'https://scratch.mit.edu/projects/10558189/embed',
    externalUrl: 'https://scratch.mit.edu/projects/10558189/',
    thumbnail: '👾',
    subject: 'Sprite Cloning & States',
    difficulty: 'Intermediate',
    xpReward: 50,
    coinReward: 20,
    tags: ['cloning', 'spawn', 'variables'],
    embedWidth: 485,
    embedHeight: 402,
    gradeBands: ['5-6']
  },

  // --- GRADES 7-8 ---
  {
    id: 'scratch-platformer',
    title: 'Appel Platformer',
    description: 'A premium side-scrolling platformer with complex physics, level layouts, and custom sprite movements designed by griffpatch.',
    platform: 'scratch',
    embedUrl: 'https://scratch.mit.edu/projects/60917032/embed',
    externalUrl: 'https://scratch.mit.edu/projects/60917032/',
    thumbnail: '🏃',
    subject: 'Physics & Animation',
    difficulty: 'Intermediate',
    xpReward: 60,
    coinReward: 25,
    tags: ['gravity', 'animation', 'scrolling'],
    embedWidth: 485,
    embedHeight: 402,
    gradeBands: ['7-8']
  },
  {
    id: 'scratch-minecraft',
    title: 'Paper Minecraft',
    description: 'Explore, craft, and survive in this 2D block-based sandbox. Teaches complex tile grid mapping, variables, and status engines.',
    platform: 'scratch',
    embedUrl: 'https://scratch.mit.edu/projects/25438885/embed',
    externalUrl: 'https://scratch.mit.edu/projects/25438885/',
    thumbnail: '⛏️',
    subject: 'Tile Grid Mapping',
    difficulty: 'Advanced',
    xpReward: 80,
    coinReward: 30,
    tags: ['tilemaps', 'grid-math', 'sandbox'],
    embedWidth: 485,
    embedHeight: 402,
    gradeBands: ['7-8']
  },
  {
    id: 'scratch-td',
    title: 'Tower Defense Tactics',
    description: 'Place turrets to stop incoming bugs. Features list coordinate path tracking, distance calculations, and target sorting logic.',
    platform: 'scratch',
    embedUrl: 'https://scratch.mit.edu/projects/11922709/embed',
    externalUrl: 'https://scratch.mit.edu/projects/11922709/',
    thumbnail: '🏰',
    subject: 'Target Sorting & Vectors',
    difficulty: 'Advanced',
    xpReward: 70,
    coinReward: 25,
    tags: ['lists', 'math', 'vectors'],
    embedWidth: 485,
    embedHeight: 402,
    gradeBands: ['7-8']
  },

  // --- GRADES 9-10 ---
  {
    id: 'scratch-quiz',
    title: 'Getting Over It',
    description: 'Scratch physics remake of the famous game. Navigate tricky terrain using mouse-pointer coordinates and coordinate rotation logic.',
    platform: 'scratch',
    embedUrl: 'https://scratch.mit.edu/projects/389464290/embed',
    externalUrl: 'https://scratch.mit.edu/projects/389464290/',
    thumbnail: '🏺',
    subject: 'Physics & Rotations',
    difficulty: 'Advanced',
    xpReward: 65,
    coinReward: 25,
    tags: ['physics', 'coordinates', 'trigonometry'],
    embedWidth: 485,
    embedHeight: 402,
    gradeBands: ['9-10']
  },
  {
    id: 'scratch-sorting',
    title: 'Algorithms Sorting Visualizer',
    description: 'Watch Bubble, Insertion, and Selection sort run in real-time. Visually details array exchanges and comparison counters.',
    platform: 'scratch',
    embedUrl: 'https://scratch.mit.edu/projects/123010370/embed',
    externalUrl: 'https://scratch.mit.edu/projects/123010370/',
    thumbnail: '📊',
    subject: 'Algorithm Efficiency',
    difficulty: 'Advanced',
    xpReward: 60,
    coinReward: 20,
    tags: ['sorting', 'algorithms', 'arrays'],
    embedWidth: 485,
    embedHeight: 402,
    isNew: true,
    gradeBands: ['9-10']
  },
  {
    id: 'scratch-tetris',
    title: 'Tetris Block Puzzle',
    description: 'Classic Tetris game in Scratch. Master tile grid rotation math, line clearing checks, and random piece spawning loops.',
    platform: 'scratch',
    embedUrl: 'https://scratch.mit.edu/projects/26265732/embed',
    externalUrl: 'https://scratch.mit.edu/projects/26265732/',
    thumbnail: '🧱',
    subject: 'Grid Array Manipulation',
    difficulty: 'Intermediate',
    xpReward: 55,
    coinReward: 20,
    tags: ['grid', 'arrays', 'rotation'],
    embedWidth: 485,
    embedHeight: 402,
    gradeBands: ['9-10']
  },

  // --- GRADES 11-12 ---
  {
    id: 'scratch-neural',
    title: 'Neural Networks Canvas',
    description: 'Train a simple perceptron with Scratch nodes. Adjust weights dynamically to classify inputs and watch synapses adapt.',
    platform: 'scratch',
    embedUrl: 'https://scratch.mit.edu/projects/665181745/embed',
    externalUrl: 'https://scratch.mit.edu/projects/665181745/',
    thumbnail: '🧠',
    subject: 'Synapse Weights & AI',
    difficulty: 'Advanced',
    xpReward: 90,
    coinReward: 40,
    tags: ['machine-learning', 'weights', 'perceptron'],
    embedWidth: 485,
    embedHeight: 402,
    isNew: true,
    gradeBands: ['11-12']
  },
  {
    id: 'scratch-3d-maze',
    title: '3D Raycaster Engine',
    description: 'Classic Wolfenstein-style 3D projection engine built natively in Scratch using custom trigonometric ray casting.',
    platform: 'scratch',
    embedUrl: 'https://scratch.mit.edu/projects/163820257/embed',
    externalUrl: 'https://scratch.mit.edu/projects/163820257/',
    thumbnail: '🧱',
    subject: '3D Projection Math',
    difficulty: 'Advanced',
    xpReward: 100,
    coinReward: 45,
    tags: ['raycasting', '3d', 'trigonometry'],
    embedWidth: 485,
    embedHeight: 402,
    gradeBands: ['11-12']
  },
  {
    id: 'scratch-asteroids',
    title: 'Asteroids Space Physics',
    description: 'Maneuver through fields of drifting space rocks. Models inertia momentum vectors, projectile cloning, and angle forces.',
    platform: 'scratch',
    embedUrl: 'https://scratch.mit.edu/projects/17498701/embed',
    externalUrl: 'https://scratch.mit.edu/projects/17498701/',
    thumbnail: '🚀',
    subject: 'Inertia & Vectors',
    difficulty: 'Advanced',
    xpReward: 80,
    coinReward: 30,
    tags: ['momentum', 'force', 'angles'],
    embedWidth: 485,
    embedHeight: 402,
    gradeBands: ['11-12']
  }
];

const BLOCKLY_GAMES: ArcadeGame[] = [
  // --- GRADES 1-2 ---
  {
    id: 'blockly-puzzle',
    title: 'Blockly Puzzle',
    description: 'Connect pictures of animals to their matching names, leg counts, and specific traits. A fun, interactive tutorial on blockly structures and logic.',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/puzzle?lang=en',
    externalUrl: 'https://blockly.games/puzzle',
    thumbnail: '🧩',
    subject: 'Block Assembly & Logic',
    difficulty: 'Beginner',
    xpReward: 30,
    coinReward: 10,
    tags: ['logic', 'matching', 'tutorial'],
    embedWidth: 1024,
    embedHeight: 600,
    gradeBands: ['1-2']
  },
  {
    id: 'blockly-maze-1',
    title: 'Blockly Maze: Intro',
    description: 'Drag-and-drop code blocks to guide a character through sequencing mazes. Teaches basic movement and order execution (Level 1).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/maze?lang=en&level=1',
    externalUrl: 'https://blockly.games/maze',
    thumbnail: '🗺️',
    subject: 'Sequencing',
    difficulty: 'Beginner',
    xpReward: 40,
    coinReward: 15,
    tags: ['sequencing', 'direction', 'movement'],
    embedWidth: 1024,
    embedHeight: 600,
    gradeBands: ['1-2']
  },
  {
    id: 'blockly-maze-2',
    title: 'Blockly Maze: Paths',
    description: 'Guide the character around basic corner paths. Focuses on sequencing multiple turns (Level 2).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/maze?lang=en&level=2',
    externalUrl: 'https://blockly.games/maze',
    thumbnail: '👣',
    subject: 'Turn Sequences',
    difficulty: 'Beginner',
    xpReward: 42,
    coinReward: 15,
    tags: ['sequencing', 'turns', 'maze'],
    embedWidth: 1024,
    embedHeight: 600,
    gradeBands: ['1-2']
  },
  {
    id: 'blockly-maze-3',
    title: 'Blockly Maze: Loops',
    description: 'Use the repeat-until block to optimize your solution. Teaches code reduction and loop iterations (Level 3).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/maze?lang=en&level=3',
    externalUrl: 'https://blockly.games/maze',
    thumbnail: '🔄',
    subject: 'Loop Iterations',
    difficulty: 'Beginner',
    xpReward: 45,
    coinReward: 15,
    tags: ['loops', 'repetition', 'blocks'],
    embedWidth: 1024,
    embedHeight: 600,
    gradeBands: ['1-2']
  },

  // --- GRADES 3-4 ---
  {
    id: 'blockly-maze-4',
    title: 'Blockly Maze: Branching',
    description: 'Use conditional turns inside a loop to navigate complex maze corridors (Level 4).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/maze?lang=en&level=4',
    externalUrl: 'https://blockly.games/maze',
    thumbnail: '🌿',
    subject: 'Conditionals in Loops',
    difficulty: 'Intermediate',
    xpReward: 50,
    coinReward: 20,
    tags: ['conditionals', 'loops', 'maze'],
    embedWidth: 1024,
    embedHeight: 600,
    gradeBands: ['3-4']
  },
  {
    id: 'blockly-bird-1',
    title: 'Blockly Bird: Flight Path',
    description: 'Guide a bird to find the worm using coordinates and simple direction angles (Level 1).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/bird?lang=en&level=1',
    externalUrl: 'https://blockly.games/bird',
    thumbnail: '🐦',
    subject: 'Angles & Directions',
    difficulty: 'Beginner',
    xpReward: 40,
    coinReward: 15,
    tags: ['angles', 'direction', 'conditions'],
    embedWidth: 1024,
    embedHeight: 600,
    gradeBands: ['3-4']
  },
  {
    id: 'blockly-bird-2',
    title: 'Blockly Bird: If-Branching',
    description: 'Change direction depending on whether the bird is carrying a worm or not. Teaches state conditionals (Level 2).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/bird?lang=en&level=2',
    externalUrl: 'https://blockly.games/bird',
    thumbnail: '🐛',
    subject: 'State Conditionals',
    difficulty: 'Beginner',
    xpReward: 45,
    coinReward: 15,
    tags: ['conditionals', 'if/else', 'state'],
    embedWidth: 1024,
    embedHeight: 600,
    gradeBands: ['3-4']
  },
  {
    id: 'blockly-turtle-1',
    title: 'Blockly Turtle: Squares',
    description: 'Draw perfect geometric shapes by repeating forward and turn movements. Teaches loop sequencing (Level 1).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/turtle?lang=en&level=1',
    externalUrl: 'https://blockly.games/turtle',
    thumbnail: '🐢',
    subject: 'Geometry Loops',
    difficulty: 'Beginner',
    xpReward: 45,
    coinReward: 15,
    tags: ['loops', 'geometry', 'drawing'],
    embedWidth: 1024,
    embedHeight: 600,
    gradeBands: ['3-4']
  },

  // --- GRADES 5-6 ---
  {
    id: 'blockly-turtle-2',
    title: 'Blockly Turtle: Pentagons',
    description: 'Compute precise angles for multi-sided polygons to draw intersecting geometric shapes (Level 2).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/turtle?lang=en&level=2',
    externalUrl: 'https://blockly.games/turtle',
    thumbnail: '🛑',
    subject: 'Polygon Geometry',
    difficulty: 'Intermediate',
    xpReward: 50,
    coinReward: 20,
    tags: ['loops', 'angles', 'polygons'],
    embedWidth: 1024,
    embedHeight: 600,
    gradeBands: ['5-6']
  },
  {
    id: 'blockly-movie-1',
    title: 'Blockly Movie: Animation',
    description: 'Animate a simple geometric character by linking coordinates directly to runtime timelines (Level 1).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/movie?lang=en&level=1',
    externalUrl: 'https://blockly.games/movie',
    thumbnail: '🎬',
    subject: 'Timeline Coordinates',
    difficulty: 'Intermediate',
    xpReward: 50,
    coinReward: 20,
    tags: ['animation', 'coordinates', 'time'],
    embedWidth: 1024,
    embedHeight: 600,
    gradeBands: ['5-6']
  },
  {
    id: 'blockly-movie-2',
    title: 'Blockly Movie: Velocity',
    description: 'Make two shapes move in opposite directions at once. Introduces coordinate offsetting (Level 2).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/movie?lang=en&level=2',
    externalUrl: 'https://blockly.games/movie',
    thumbnail: '↔️',
    subject: 'Coordinate Offset',
    difficulty: 'Intermediate',
    xpReward: 55,
    coinReward: 20,
    tags: ['animation', 'offsets', 'movement'],
    embedWidth: 1024,
    embedHeight: 600,
    gradeBands: ['5-6']
  },
  {
    id: 'blockly-music-1',
    title: 'Blockly Music: Composer',
    description: 'Sequence pitch notes and timing to compose basic melodies. Teaches function procedures (Level 1).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/music?lang=en&level=1',
    externalUrl: 'https://blockly.games/music',
    thumbnail: '🎶',
    subject: 'Functions & Sound',
    difficulty: 'Intermediate',
    xpReward: 55,
    coinReward: 20,
    tags: ['sound', 'sequences', 'music'],
    embedWidth: 1024,
    embedHeight: 600,
    gradeBands: ['5-6']
  },

  // --- GRADES 7-8 ---
  {
    id: 'blockly-music-2',
    title: 'Blockly Music: Sound Loops',
    description: 'Write loops to replay chord segments and drum structures efficiently (Level 2).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/music?lang=en&level=2',
    externalUrl: 'https://blockly.games/music',
    thumbnail: '🥁',
    subject: 'Melody Repetition',
    difficulty: 'Intermediate',
    xpReward: 60,
    coinReward: 25,
    tags: ['loops', 'repetition', 'music'],
    embedWidth: 1024,
    embedHeight: 600,
    gradeBands: ['7-8']
  },
  {
    id: 'blockly-pond-tutor-1',
    title: 'Pond Tutor: Angles & Shooting',
    description: 'Shoot at targets by entering target heading angles. Teaches basic coordinate mapping in a visual grid (Level 1).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/pond-tutor?lang=en&level=1',
    externalUrl: 'https://blockly.games/pond-tutor',
    thumbnail: '🦆',
    subject: 'Angle Heading Math',
    difficulty: 'Intermediate',
    xpReward: 50,
    coinReward: 20,
    tags: ['angles', 'targeting', 'coordinate-grid'],
    embedWidth: 1024,
    embedHeight: 620,
    gradeBands: ['7-8']
  },
  {
    id: 'blockly-pond-tutor-2',
    title: 'Pond Tutor: Cannon Range',
    description: 'Configure firing distance parameters to hit targets at varying coordinates (Level 2).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/pond-tutor?lang=en&level=2',
    externalUrl: 'https://blockly.games/pond-tutor',
    thumbnail: '🎯',
    subject: 'Cannon Range Math',
    difficulty: 'Intermediate',
    xpReward: 55,
    coinReward: 20,
    tags: ['cannon', 'distance', 'math'],
    embedWidth: 1024,
    embedHeight: 620,
    gradeBands: ['7-8']
  },
  {
    id: 'blockly-pond-tutor-3',
    title: 'Pond Tutor: Target Lock',
    description: 'Combine scanner direction angle and range to successfully locate and destroy active moving targets (Level 3).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/pond-tutor?lang=en&level=3',
    externalUrl: 'https://blockly.games/pond-tutor',
    thumbnail: '🔒',
    subject: 'Target Scanner Integration',
    difficulty: 'Intermediate',
    xpReward: 60,
    coinReward: 25,
    tags: ['scanning', 'angles', 'combat'],
    embedWidth: 1024,
    embedHeight: 620,
    gradeBands: ['7-8']
  },

  // --- GRADES 9-10 ---
  {
    id: 'blockly-pond-tutor-4',
    title: 'Pond Tutor: Logic Sensors',
    description: 'Use basic loop sensors to keep track of opponent duck states and trigger defense shields (Level 4).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/pond-tutor?lang=en&level=4',
    externalUrl: 'https://blockly.games/pond-tutor',
    thumbnail: '🛡️',
    subject: 'Logic Sensors',
    difficulty: 'Intermediate',
    xpReward: 65,
    coinReward: 25,
    tags: ['sensors', 'logic', 'conditionals'],
    embedWidth: 1024,
    embedHeight: 620,
    gradeBands: ['9-10']
  },
  {
    id: 'blockly-pond-tutor-5',
    title: 'Pond Tutor: Scan Loop',
    description: 'Write custom scanning variables to store opponent ranges and trigger automated sweeps (Level 5).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/pond-tutor?lang=en&level=5',
    externalUrl: 'https://blockly.games/pond-tutor',
    thumbnail: '📡',
    subject: 'Scan Loops',
    difficulty: 'Advanced',
    xpReward: 70,
    coinReward: 25,
    tags: ['scanning', 'loops', 'variables'],
    embedWidth: 1024,
    embedHeight: 620,
    gradeBands: ['9-10']
  },
  {
    id: 'blockly-pond-tutor-6',
    title: 'Pond Tutor: Flee Vector',
    description: 'Compute reverse coordinate vectors to swim away from incoming fire (Level 6).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/pond-tutor?lang=en&level=6',
    externalUrl: 'https://blockly.games/pond-tutor',
    thumbnail: '🏃',
    subject: 'Flee Vectors',
    difficulty: 'Advanced',
    xpReward: 75,
    coinReward: 30,
    tags: ['math', 'vectors', 'movement'],
    embedWidth: 1024,
    embedHeight: 620,
    gradeBands: ['9-10']
  },
  {
    id: 'blockly-pond-tutor-7',
    title: 'Pond Tutor: Intercept Math',
    description: 'Combine duck speed velocity variables to intercept moving targets proactively (Level 7).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/pond-tutor?lang=en&level=7',
    externalUrl: 'https://blockly.games/pond-tutor',
    thumbnail: '🏹',
    subject: 'Intercept Math',
    difficulty: 'Advanced',
    xpReward: 80,
    coinReward: 30,
    tags: ['intercept', 'angles', 'velocity'],
    embedWidth: 1024,
    embedHeight: 620,
    gradeBands: ['9-10']
  },

  // --- GRADES 11-12 ---
  {
    id: 'blockly-pond-tutor-8',
    title: 'Pond Tutor: State Transition',
    description: 'Transition duck logic between scanning state, shooting state, and fleeing state dynamically (Level 8).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/pond-tutor?lang=en&level=8',
    externalUrl: 'https://blockly.games/pond-tutor',
    thumbnail: '🔄',
    subject: 'AI State Transition',
    difficulty: 'Advanced',
    xpReward: 90,
    coinReward: 35,
    tags: ['states', 'ai', 'logic'],
    embedWidth: 1024,
    embedHeight: 620,
    gradeBands: ['11-12']
  },
  {
    id: 'blockly-pond-tutor-9',
    title: 'Pond Tutor: Advanced Combat',
    description: 'Manage complex tracking arrays in JavaScript to target multiple enemies simultaneously (Level 9).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/pond-tutor?lang=en&level=9',
    externalUrl: 'https://blockly.games/pond-tutor',
    thumbnail: '⚔️',
    subject: 'Multi-Target Tracking',
    difficulty: 'Advanced',
    xpReward: 100,
    coinReward: 40,
    tags: ['arrays', 'javascript', 'combat'],
    embedWidth: 1024,
    embedHeight: 620,
    gradeBands: ['11-12']
  },
  {
    id: 'blockly-pond-tutor-10',
    title: 'Pond Tutor: Ultimate Duel',
    description: 'Execute the ultimate battle script combining all state variables, pathing, and scanners to win (Level 10).',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/pond-tutor?lang=en&level=10',
    externalUrl: 'https://blockly.games/pond-tutor',
    thumbnail: '🏆',
    subject: 'Full Script Execution',
    difficulty: 'Advanced',
    xpReward: 110,
    coinReward: 45,
    tags: ['battle', 'strategy', 'blockly-final'],
    embedWidth: 1024,
    embedHeight: 620,
    gradeBands: ['11-12']
  },
  {
    id: 'blockly-pond-duck',
    title: 'Pond Sandbox Arena',
    description: 'Full code sandbox. Program a battle duck in pure JavaScript to compete against advanced AI players in a free-for-all pond.',
    platform: 'blockly',
    embedUrl: 'https://blockly.games/pond-duck?lang=en',
    externalUrl: 'https://blockly.games/pond-duck',
    thumbnail: '🌊',
    subject: 'AI Scripting Sandbox',
    difficulty: 'Advanced',
    xpReward: 130,
    coinReward: 50,
    tags: ['javascript', 'sandbox', 'ai'],
    embedWidth: 1024,
    embedHeight: 620,
    gradeBands: ['11-12']
  }
];

const ALL_GAMES = [...SCRATCH_GAMES, ...BLOCKLY_GAMES];

const DIFFICULTY_COLOR: Record<string, string> = {
  Beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Advanced: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

const PLATFORM_GRADIENT: Record<string, string> = {
  scratch: 'from-orange-500/20 to-amber-500/20 border-orange-500/30',
  blockly: 'from-sky-500/20 to-indigo-500/20 border-sky-500/30',
};

const PLATFORM_BADGE: Record<string, string> = {
  scratch: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  blockly: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
};



// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ArcadePage() {
  const { addXpAndCoins, student } = useApp();

  const [filter, setFilter] = useState<'all' | 'scratch' | 'blockly'>('all');
  const [difficulty, setDifficulty] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');
  const [selectedGradeBand, setSelectedGradeBand] = useState<string>('9-10');
  const [activeGame, setActiveGame] = useState<ArcadeGame | null>(null);
  const [completed, setCompleted] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(`cist_arcade_completed_${student?.id || 'guest'}`);
    return saved ? (JSON.parse(saved) as string[]) : [];
  });
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimed, setClaimed] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const savedClaimed = localStorage.getItem(`cist_arcade_claimed_${student?.id || 'guest'}`);
    return savedClaimed ? (JSON.parse(savedClaimed) as string[]) : [];
  });
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Helper to parse numerical grade and get grade band
  const getGradeBand = (gradeStr: string | undefined | null): string => {
    if (!gradeStr) return '9-10';
    const num = parseInt(gradeStr.replace(/\D/g, ''), 10);
    if (isNaN(num)) return '9-10';
    if (num >= 11) return '11-12';
    if (num >= 9) return '9-10';
    if (num >= 7) return '7-8';
    if (num >= 5) return '5-6';
    if (num >= 3) return '3-4';
    return '1-2';
  };

  // Reload completion state when student changes (e.g. after login)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(`cist_arcade_completed_${student?.id || 'guest'}`);
    const savedClaimed = localStorage.getItem(`cist_arcade_claimed_${student?.id || 'guest'}`);
    
    setTimeout(() => {
      setCompleted(saved ? (JSON.parse(saved) as string[]) : []);
      setClaimed(savedClaimed ? (JSON.parse(savedClaimed) as string[]) : []);

      if (student?.grade) {
        setSelectedGradeBand(getGradeBand(student.grade));
      } else {
        setSelectedGradeBand('9-10');
      }
    }, 0);
  }, [student]);

  const saveCompletion = (gameId: string) => {
    const next = completed.includes(gameId) ? completed : [...completed, gameId];
    setCompleted(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`cist_arcade_completed_${student?.id || 'guest'}`, JSON.stringify(next));
    }
  };

  const handleOpenGame = (game: ArcadeGame) => {
    setActiveGame(game);
    setIframeLoaded(false);
    // Mark as "played" (opened) — not claimed yet
    saveCompletion(game.id);
  };

  const handleClaimXP = async (game: ArcadeGame) => {
    if (claimed.includes(game.id)) return;
    setClaimLoading(true);
    try {
      await addXpAndCoins(game.xpReward, game.coinReward, `Arcade: ${game.title}`);
      const next = [...claimed, game.id];
      setClaimed(next);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`cist_arcade_claimed_${student?.id || 'guest'}`, JSON.stringify(next));
      }
    } finally {
      setClaimLoading(false);
    }
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    // If the iframe never fires onLoad, it might be blocked
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (e.deltaY !== 0) {
      container.scrollLeft += e.deltaY;
      // Do not call e.preventDefault() here if we want to allow default window scrolling when they finish scrolling,
      // but to strictly scroll the container when over it:
      e.preventDefault();
    }
  };

  const filtered = ALL_GAMES.filter((g) => {
    const platformMatch = filter === 'all' || g.platform === filter;
    const diffMatch = difficulty === 'all' || g.difficulty === difficulty;
    const gradeMatch = selectedGradeBand === 'all' || g.gradeBands.includes(selectedGradeBand);
    return platformMatch && diffMatch && gradeMatch;
  });

  const gradeBandGames = ALL_GAMES.filter(g => selectedGradeBand === 'all' || g.gradeBands.includes(selectedGradeBand));
  const totalXpAvailable = gradeBandGames.reduce((sum, g) => sum + g.xpReward, 0);
  const totalXpEarned = gradeBandGames.filter((g) => claimed.includes(g.id)).reduce((sum, g) => sum + g.xpReward, 0);

  return (
    <div className="-m-4 md:-m-6 lg:-m-8 min-h-screen bg-navy-dark text-white pb-12">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-navy-deep via-navy-dark to-[#0d1b35] border-b border-navy-light/20">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-6 left-12 text-7xl blur-sm select-none">🎮</div>
          <div className="absolute bottom-4 right-20 text-6xl blur-sm select-none">⭐</div>
          <div className="absolute top-3 right-40 text-5xl blur-sm select-none">🚀</div>
        </div>
        <div className="relative z-10 px-6 py-8 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Gamepad2 className="h-6 w-6 text-gold-accent" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-accent">
                  CIST CodeQuest
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white leading-none">
                Game <span className="text-gold-accent">Arcade</span>
              </h1>
              {student && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-gold-accent/20 border border-gold-accent/30 rounded-full text-[11px] font-bold text-gold-accent">
                  🎓 Recommended for Grades {selectedGradeBand}
                </div>
              )}
              <p className="mt-2 text-sm text-gray-400 max-w-xl">
                Play interactive coding games from <strong className="text-orange-400">Scratch</strong> and{' '}
                <strong className="text-sky-400">Blockly</strong>. Explore, experiment, and earn XP when you&apos;re done.
              </p>
            </div>

            {/* XP Progress */}
            <div className="shrink-0 bg-navy-deep/60 border border-navy-light/20 rounded-2xl px-5 py-4 min-w-48">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Arcade XP</span>
                <Sparkles className="h-4 w-4 text-gold-accent" />
              </div>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-black text-gold-accent">{totalXpEarned}</span>
                <span className="text-sm text-gray-500 mb-0.5">/ {totalXpAvailable} XP</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-navy-medium overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold-accent to-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${totalXpAvailable ? (totalXpEarned / totalXpAvailable) * 100 : 0}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] text-gray-500">
                {claimed.length} / {ALL_GAMES.length} games completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CIST Pond Multiplayer Arena Banner */}
      <div className="max-w-6xl mx-auto px-6 mt-6 mb-8">
        <div className="bg-gradient-to-r from-navy-deep via-[#111f3d] to-navy-medium border border-navy-light/20 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg hover:shadow-navy-light/10 transition duration-300">
          <div className="flex items-center space-x-4">
            <span className="text-3xl animate-bounce">🌊</span>
            <div>
              <h3 className="text-sm font-black uppercase text-gold-accent tracking-wider flex items-center space-x-1.5">
                <span>Pond JS Multiplayer Arena</span>
                <span className="bg-maple-red text-white text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded leading-none animate-pulse">
                  Live
                </span>
              </h3>
              <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed max-w-xl">
                Deploy your custom JavaScript state machines, calculate fleeing vectors, and fight matching opponent scripts on a real-time canvas battleground. Earn +30 XP for a victory!
              </p>
            </div>
          </div>
          <Link
            href="/arcade/multiplayer"
            className="flex items-center space-x-1 px-5 py-2.5 bg-navy-medium hover:bg-navy-light border border-navy-light/35 rounded-xl text-xs font-black text-white hover:text-gold-accent shadow transition duration-200 shrink-0 cursor-pointer"
          >
            <span>Fight Code Duels</span>
            <span>⚔️</span>
          </Link>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-navy-deep border-b border-navy-light/15 px-6 py-3">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Grade Band Filter (Left) */}
          {student ? (
            <div className="flex items-center gap-1.5 py-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-gold-accent mr-1.5 shrink-0">Grade Level:</span>
              <span className="bg-gold-accent/20 text-gold-accent border border-gold-accent/30 px-3 py-1.5 rounded-xl text-xs font-black">
                Grade {selectedGradeBand} (Your Class)
              </span>
            </div>
          ) : (
            <div 
              onWheel={handleWheel}
              className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full no-scrollbar"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-gold-accent mr-1.5 shrink-0">Grade Level:</span>
              {(['1-2', '3-4', '5-6', '7-8', '9-10', '11-12'] as const).map((band) => (
                <button
                  key={band}
                  onClick={() => setSelectedGradeBand(band)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                    selectedGradeBand === band
                      ? 'bg-gold-accent text-navy-dark shadow scale-105 border border-gold-accent/50'
                      : 'bg-navy-medium/30 text-gray-400 border border-navy-light/10 hover:text-white hover:bg-navy-medium/55'
                  }`}
                >
                  Grade {band}
                </button>
              ))}
            </div>
          )}

          {/* Platform and Difficulty filters (Right) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Platform filter */}
            <div className="flex items-center gap-1.5 bg-navy-medium/50 rounded-xl p-1 border border-navy-light/15">
              {(['all', 'scratch', 'blockly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    filter === p
                      ? p === 'scratch'
                        ? 'bg-orange-500 text-white shadow'
                        : 'bg-sky-500 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {p === 'scratch' ? '🟠 Scratch' : p === 'blockly' ? '🔷 Blockly' : 'All'}
                </button>
              ))}
            </div>

            {/* Difficulty filter */}
            <div className="flex items-center gap-1.5 bg-navy-medium/50 rounded-xl p-1 border border-navy-light/15">
              {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    difficulty === d
                      ? 'bg-white/15 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <span className="text-xs text-gray-500 font-semibold shrink-0">
              {filtered.length} game{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ── Game Grid ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Scratch Section */}
        {(filter === 'all' || filter === 'scratch') && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-8 w-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-lg">
                🟠
              </div>
              <div>
                <h2 className="text-base font-black uppercase tracking-wider text-white">Scratch Projects</h2>
                <p className="text-[11px] text-gray-400">scratch.mit.edu — Visual block coding for ages 8+</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered
                .filter((g) => g.platform === 'scratch')
                .map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isCompleted={completed.includes(game.id)}
                    isClaimed={claimed.includes(game.id)}
                    onPlay={() => handleOpenGame(game)}
                    onClaim={() => handleClaimXP(game)}
                    claimLoading={claimLoading}
                  />
                ))}
            </div>
          </section>
        )}

        {/* Blockly Section */}
        {(filter === 'all' || filter === 'blockly') && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-8 w-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-lg">
                🔷
              </div>
              <div>
                <h2 className="text-base font-black uppercase tracking-wider text-white">Blockly Games</h2>
                <p className="text-[11px] text-gray-400">blockly.games — Google&apos;s visual programming puzzles</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered
                .filter((g) => g.platform === 'blockly')
                .map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    isCompleted={completed.includes(game.id)}
                    isClaimed={claimed.includes(game.id)}
                    onPlay={() => handleOpenGame(game)}
                    onClaim={() => handleClaimXP(game)}
                    claimLoading={claimLoading}
                  />
                ))}
            </div>
          </section>
        )}


        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-navy-deep/40 rounded-3xl border border-navy-light/10 p-8 max-w-xl mx-auto mt-6">
            <span className="text-4xl mb-4">👾</span>
            <h3 className="text-lg font-black text-white mb-2">No games found</h3>
            <p className="text-sm text-gray-400">
              No games match the current filters. Try selecting a different difficulty, platform, or grade level!
            </p>
          </div>
        )}
      </div>

      {/* ── Game Modal ── */}
      {activeGame && (
        <GameModal
          game={activeGame}
          isClaimed={claimed.includes(activeGame.id)}
          claimLoading={claimLoading}
          iframeLoaded={iframeLoaded}
          onLoad={handleIframeLoad}
          onClaim={() => handleClaimXP(activeGame)}
          onClose={() => {
            setActiveGame(null);
            setIframeLoaded(false);
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME CARD
// ─────────────────────────────────────────────────────────────────────────────
function GameCard({
  game,
  isCompleted,
  isClaimed,
  onPlay,
  onClaim,
  claimLoading,
}: {
  game: ArcadeGame;
  isCompleted: boolean;
  isClaimed: boolean;
  onPlay: () => void;
  onClaim: () => void;
  claimLoading: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-gradient-to-br ${
        PLATFORM_GRADIENT[game.platform]
      } overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/40`}
    >
      {/* New badge */}
      {game.isNew && (
        <div className="absolute top-3 right-3 z-10 bg-maple-red text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow">
          NEW
        </div>
      )}

      {/* Claimed badge */}
      {isClaimed && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
          <CheckCircle2 className="h-3 w-3" />
          XP Claimed
        </div>
      )}

      {/* Thumbnail area */}
      <div className="flex items-center justify-center h-28 bg-navy-dark/50 border-b border-navy-light/10 text-6xl select-none">
        {game.thumbnail}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Platform + Difficulty badges */}
        <div className="flex items-center gap-2">
          <span
            className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${PLATFORM_BADGE[game.platform]}`}
          >
            {game.platform === 'scratch' ? '🟠 Scratch' : game.platform === 'blockly' ? '🔷 Blockly' : '⚡ Hour of Code'}
          </span>
          <span
            className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${DIFFICULTY_COLOR[game.difficulty]}`}
          >
            {game.difficulty}
          </span>
        </div>

        <h3 className="text-sm font-black text-white leading-tight">{game.title}</h3>
        <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-3">{game.description}</p>

        {/* Subject pill */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <BookOpen className="h-3 w-3" />
          <span className="font-semibold">{game.subject}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {game.tags.map((t) => (
            <span
              key={t}
              className="text-[9px] px-1.5 py-0.5 rounded bg-navy-medium/60 text-gray-400 font-semibold border border-navy-light/10"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Rewards row */}
        <div className="flex items-center gap-3 mt-auto pt-2 border-t border-navy-light/10">
          <div className="flex items-center gap-1 text-gold-accent text-xs font-bold">
            <Zap className="h-3.5 w-3.5" />
            +{game.xpReward} XP
          </div>
          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
            <Coins className="h-3.5 w-3.5" />
            +{game.coinReward}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={onPlay}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-maple-red hover:bg-maple-light text-white text-xs font-bold uppercase tracking-wider py-2.5 transition-all shadow-md shadow-maple-red/20 active:scale-95"
          >
            <Play className="h-3.5 w-3.5" />
            Play Now
          </button>

          {isCompleted && !isClaimed && (
            <button
              onClick={onClaim}
              disabled={claimLoading}
              className="flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Trophy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Claim</span>
            </button>
          )}

          {isClaimed && (
            <div className="flex items-center gap-1 rounded-xl bg-emerald-600/20 text-emerald-400 text-xs font-bold px-3 py-2.5 border border-emerald-500/30">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GAME MODAL
// ─────────────────────────────────────────────────────────────────────────────
function GameModal({
  game,
  isClaimed,
  claimLoading,
  iframeLoaded,
  onLoad,
  onClaim,
  onClose,
}: {
  game: ArcadeGame;
  isClaimed: boolean;
  claimLoading: boolean;
  iframeLoaded: boolean;
  onLoad: () => void;
  onClaim: () => void;
  onClose: () => void;
}) {
  const [showFallback, setShowFallback] = useState(false);

  // After 4 seconds without the iframe loading, show the fallback
  useEffect(() => {
    const t = setTimeout(() => {
      if (!iframeLoaded) setShowFallback(true);
    }, 4000);
    return () => clearTimeout(t);
  }, [iframeLoaded]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-7xl bg-navy-deep rounded-2xl border border-navy-light/25 shadow-2xl shadow-black/60 flex flex-col max-h-[95vh] overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-navy-light/20 bg-navy-dark/50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{game.thumbnail}</span>
            <div>
              <h2 className="text-sm font-black text-white leading-tight">{game.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${PLATFORM_BADGE[game.platform]}`}>
                  {game.platform === 'scratch' ? '🟠 Scratch' : '🔷 Blockly'}
                </span>
                <span className="text-[10px] text-gray-400">{game.subject}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Claim XP button */}
            {!isClaimed ? (
              <button
                onClick={onClaim}
                disabled={claimLoading}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 transition-all shadow active:scale-95 disabled:opacity-50"
              >
                <Trophy className="h-3.5 w-3.5" />
                Mark Complete (+{game.xpReward} XP)
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 text-xs font-bold px-4 py-2 border border-emerald-500/30">
                <CheckCircle2 className="h-3.5 w-3.5" />
                XP Claimed!
              </div>
            )}

            {/* Open in new tab */}
            <a
              href={game.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-xl bg-navy-medium hover:bg-navy-light/30 text-gray-300 text-xs font-bold px-3 py-2 transition-all border border-navy-light/20"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Tab</span>
            </a>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-gray-400 hover:text-white hover:bg-navy-medium transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Iframe area */}
        <div className="flex-1 relative bg-navy-dark overflow-hidden min-h-[640px]">
          {/* Loading spinner — shown until iframe fires onLoad */}
          {!iframeLoaded && !showFallback && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
              <div className="h-12 w-12 rounded-full border-4 border-gold-accent border-t-transparent animate-spin" />
              <p className="text-xs text-gray-400 font-semibold">Loading {game.title}…</p>
            </div>
          )}

          {/* Fallback — shown if iframe doesn't load in 4s (likely blocked) */}
          {showFallback && !iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10 bg-navy-dark text-center px-8">
              <div className="text-5xl">{game.thumbnail}</div>
              <div>
                <h3 className="text-base font-black text-white mb-1">Can&apos;t load in-page</h3>
                <p className="text-sm text-gray-400 max-w-sm">
                  This game&apos;s server blocked the embedded preview. Click the button below to play in a new tab — then
                  come back and mark it complete to earn your XP!
                </p>
              </div>
              <a
                href={game.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-maple-red hover:bg-maple-light text-white font-bold px-6 py-3 transition-all shadow-lg active:scale-95"
              >
                <ExternalLink className="h-4 w-4" />
                Open {game.title} in New Tab
              </a>
              {!isClaimed && (
                <button
                  onClick={onClaim}
                  disabled={claimLoading}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-sm font-bold px-5 py-2.5 hover:bg-emerald-600/50 transition active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Complete (+{game.xpReward} XP)
                </button>
              )}
              {isClaimed && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold">
                  <CheckCircle2 className="h-4 w-4" /> XP Already Claimed!
                </div>
              )}
            </div>
          )}

          {/* The iframe itself */}
          <iframe
            key={game.id}
            src={game.embedUrl}
            title={game.title}
            width="100%"
            height="100%"
            className="w-full h-full"
            style={{ minHeight: '620px', border: 'none', display: 'block' }}
            allow="autoplay; fullscreen"
            allowFullScreen
            onLoad={onLoad}
            onError={() => setShowFallback(true)}
          />
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-navy-dark/60 border-t border-navy-light/15 text-[10px] text-gray-500 shrink-0">
          <Info className="h-3 w-3 shrink-0" />
          <span>
            Play the game, then click <strong className="text-emerald-400">Mark Complete</strong> to earn{' '}
            <strong className="text-gold-accent">+{game.xpReward} XP</strong> and{' '}
            <strong className="text-amber-400">+{game.coinReward} Coins</strong>. XP can only be claimed once per game.
          </span>
        </div>
      </div>
    </div>
  );
}
