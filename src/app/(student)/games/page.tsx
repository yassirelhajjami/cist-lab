// src/app/(student)/games/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Award,
  Trash2,
  Undo2,
  Redo2,
  BookOpen
} from 'lucide-react';
import { TempleIcon } from '@/components/ui/TempleIcon';

// =========================================================================
// DATA MODELS
// =========================================================================
interface Cell {
  color: 'gray' | 'red' | 'blue' | 'green' | 'white';
  hasStar: boolean;
}

interface RobotState {
  r: number;
  c: number;
  dir: 'N' | 'E' | 'S' | 'W';
}

interface CommandSlot {
  cmd: 'up' | 'ccw' | 'cw' | 'f1' | 'f2' | 'paint_red' | 'paint_green' | 'paint_blue' | null;
  cond: 'none' | 'red' | 'blue' | 'green' | null;
}

interface LevelDef {
  id: number;
  name: string;
  phase: number;
  rows: number;
  cols: number;
  desc: string;
  start: RobotState;
  stars: { r: number; c: number }[];
  path: { r: number; c: number; color?: Cell['color'] }[];
  maxF1Slots: number;
  maxF2Slots: number;
  minCmdsFor3Stars: number;
}

// =========================================================================
// 21 HANDCRAFTED PROGRESSIVE LEVELS
// =========================================================================
const LEVEL_DEFS: LevelDef[] = [
  // --- PHASE 1: BASIC MOVEMENT (1 - 5) ---
  {
    id: 1,
    name: "Rookie Line",
    phase: 1,
    rows: 15,
    cols: 15,
    desc: "Sequence simple moves to drive the robot directly to the star.",
    start: { r: 7, c: 3, dir: 'E' },
    stars: [{ r: 7, c: 11 }],
    path: [
      { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 },
      { r: 7, c: 7 }, { r: 7, c: 8 }, { r: 7, c: 9 }, { r: 7, c: 10 }, { r: 7, c: 11 }
    ],
    maxF1Slots: 6,
    maxF2Slots: 0,
    minCmdsFor3Stars: 5
  },
  {
    id: 2,
    name: "Left Turn L-Path",
    phase: 1,
    rows: 15,
    cols: 15,
    desc: "Turn left at the corner to follow the path and claim the star.",
    start: { r: 9, c: 5, dir: 'E' },
    stars: [{ r: 4, c: 9 }],
    path: [
      { r: 9, c: 5 }, { r: 9, c: 6 }, { r: 9, c: 7 }, { r: 9, c: 8 }, { r: 9, c: 9 },
      { r: 8, c: 9 }, { r: 7, c: 9 }, { r: 6, c: 9 }, { r: 5, c: 9 }, { r: 4, c: 9 }
    ],
    maxF1Slots: 7,
    maxF2Slots: 0,
    minCmdsFor3Stars: 6
  },
  {
    id: 3,
    name: "Right Turn L-Path",
    phase: 1,
    rows: 15,
    cols: 15,
    desc: "Follow the path, make a right turn, and grab the star.",
    start: { r: 4, c: 4, dir: 'S' },
    stars: [{ r: 9, c: 9 }],
    path: [
      { r: 4, c: 4 }, { r: 5, c: 4 }, { r: 6, c: 4 }, { r: 7, c: 4 }, { r: 8, c: 4 }, { r: 9, c: 4 },
      { r: 9, c: 5 }, { r: 9, c: 6 }, { r: 9, c: 7 }, { r: 9, c: 8 }, { r: 9, c: 9 }
    ],
    maxF1Slots: 8,
    maxF2Slots: 0,
    minCmdsFor3Stars: 7
  },
  {
    id: 4,
    name: "The Rectangle Loop",
    phase: 1,
    rows: 15,
    cols: 15,
    desc: "Navigate around the rectangular path to collect all three corner stars.",
    start: { r: 10, c: 4, dir: 'N' },
    stars: [{ r: 4, c: 4 }, { r: 4, c: 10 }, { r: 10, c: 10 }],
    path: [
      { r: 4, c: 4 }, { r: 4, c: 5 }, { r: 4, c: 6 }, { r: 4, c: 7 }, { r: 4, c: 8 }, { r: 4, c: 9 }, { r: 4, c: 10 },
      { r: 5, c: 10 }, { r: 6, c: 10 }, { r: 7, c: 10 }, { r: 8, c: 10 }, { r: 9, c: 10 }, { r: 10, c: 10 },
      { r: 10, c: 9 }, { r: 10, c: 8 }, { r: 10, c: 7 }, { r: 10, c: 6 }, { r: 10, c: 5 }, { r: 10, c: 4 },
      { r: 9, c: 4 }, { r: 8, c: 4 }, { r: 7, c: 4 }, { r: 6, c: 4 }, { r: 5, c: 4 }
    ],
    maxF1Slots: 10,
    maxF2Slots: 0,
    minCmdsFor3Stars: 10
  },
  {
    id: 5,
    name: "Zig-Zag Steps",
    phase: 1,
    rows: 15,
    cols: 15,
    desc: "Follow the steps of the zig-zag to collect three target stars.",
    start: { r: 9, c: 3, dir: 'E' },
    stars: [{ r: 9, c: 5 }, { r: 7, c: 7 }, { r: 5, c: 9 }],
    path: [
      { r: 9, c: 3 }, { r: 9, c: 4 }, { r: 9, c: 5 },
      { r: 8, c: 5 }, { r: 7, c: 5 }, { r: 7, c: 6 }, { r: 7, c: 7 },
      { r: 6, c: 7 }, { r: 5, c: 7 }, { r: 5, c: 8 }, { r: 5, c: 9 }
    ],
    maxF1Slots: 11,
    maxF2Slots: 0,
    minCmdsFor3Stars: 11
  },

  // --- PHASE 2: COLOR CONDITIONS (6 - 10) ---
  {
    id: 6,
    name: "Alternating Colors",
    phase: 2,
    rows: 15,
    cols: 15,
    desc: "Collect stars using color conditional rules. Execute only when matching the cell color.",
    start: { r: 7, c: 3, dir: 'E' },
    stars: [{ r: 7, c: 7 }, { r: 7, c: 11 }],
    path: [
      { r: 7, c: 3, color: 'blue' }, { r: 7, c: 4, color: 'red' }, { r: 7, c: 5, color: 'blue' },
      { r: 7, c: 6, color: 'red' }, { r: 7, c: 7, color: 'blue' }, { r: 7, c: 8, color: 'red' },
      { r: 7, c: 9, color: 'blue' }, { r: 7, c: 10, color: 'red' }, { r: 7, c: 11, color: 'blue' }
    ],
    maxF1Slots: 6,
    maxF2Slots: 0,
    minCmdsFor3Stars: 5
  },
  {
    id: 7,
    name: "Red Corners",
    phase: 2,
    rows: 15,
    cols: 15,
    desc: "Make the robot turn only when it steps on a Red cell corner.",
    start: { r: 8, c: 4, dir: 'N' },
    stars: [{ r: 4, c: 8 }],
    path: [
      { r: 8, c: 4, color: 'blue' }, { r: 7, c: 4, color: 'blue' }, { r: 6, c: 4, color: 'blue' },
      { r: 5, c: 4, color: 'blue' }, { r: 4, c: 4, color: 'red' }, // corner
      { r: 4, c: 5, color: 'blue' }, { r: 4, c: 6, color: 'blue' }, { r: 4, c: 7, color: 'blue' },
      { r: 4, c: 8, color: 'blue' }
    ],
    maxF1Slots: 4,
    maxF2Slots: 0,
    minCmdsFor3Stars: 3
  },
  {
    id: 8,
    name: "Green Checkpoints",
    phase: 2,
    rows: 15,
    cols: 15,
    desc: "Use Green cells as indicators to rotate CCW.",
    start: { r: 9, c: 9, dir: 'W' },
    stars: [{ r: 5, c: 5 }],
    path: [
      { r: 9, c: 9, color: 'blue' }, { r: 9, c: 8, color: 'blue' }, { r: 9, c: 7, color: 'blue' },
      { r: 9, c: 6, color: 'blue' }, { r: 9, c: 5, color: 'green' }, // checkpoint
      { r: 8, c: 5, color: 'blue' }, { r: 7, c: 5, color: 'blue' }, { r: 6, c: 5, color: 'blue' },
      { r: 5, c: 5, color: 'blue' }
    ],
    maxF1Slots: 4,
    maxF2Slots: 0,
    minCmdsFor3Stars: 3
  },
  {
    id: 9,
    name: "Color Swapper",
    phase: 2,
    rows: 15,
    cols: 15,
    desc: "Navigate through multi-colored tiles. Turn right on Red, turn left on Green.",
    start: { r: 9, c: 4, dir: 'N' },
    stars: [{ r: 4, c: 9 }],
    path: [
      { r: 9, c: 4, color: 'blue' }, { r: 8, c: 4, color: 'blue' }, { r: 7, c: 4, color: 'blue' },
      { r: 6, c: 4, color: 'red' }, // turn CW (East)
      { r: 6, c: 5, color: 'blue' }, { r: 6, c: 6, color: 'blue' },
      { r: 6, c: 7, color: 'green' }, // turn CCW (North)
      { r: 5, c: 7, color: 'blue' }, { r: 4, c: 7, color: 'red' }, // turn CW (East)
      { r: 4, c: 8, color: 'blue' }, { r: 4, c: 9, color: 'blue' }
    ],
    maxF1Slots: 6,
    maxF2Slots: 0,
    minCmdsFor3Stars: 4
  },
  {
    id: 10,
    name: "Blue Triggers",
    phase: 2,
    rows: 15,
    cols: 15,
    desc: "Deduce color conditions using Blue triggers to guide the robot safely through a small maze.",
    start: { r: 10, c: 3, dir: 'E' },
    stars: [{ r: 6, c: 9 }],
    path: [
      { r: 10, c: 3, color: 'white' }, { r: 10, c: 4, color: 'white' }, { r: 10, c: 5, color: 'blue' }, // Turn left
      { r: 9, c: 5, color: 'white' }, { r: 8, c: 5, color: 'green' }, // Turn right
      { r: 8, c: 6, color: 'white' }, { r: 8, c: 7, color: 'white' }, { r: 8, c: 8, color: 'blue' }, // Turn left
      { r: 7, c: 8, color: 'white' }, { r: 6, c: 8, color: 'green' }, // Turn right
      { r: 6, c: 9, color: 'white' }
    ],
    maxF1Slots: 8,
    maxF2Slots: 0,
    minCmdsFor3Stars: 6
  },

  // --- PHASE 3: FUNCTIONS & LOOPS (11 - 15) ---
  {
    id: 11,
    name: "Repeating Stairs",
    phase: 3,
    rows: 15,
    cols: 15,
    desc: "Use recursion! Setup F1 to perform a stair step and call F1 recursively.",
    start: { r: 10, c: 2, dir: 'E' },
    stars: [{ r: 10, c: 4 }, { r: 8, c: 6 }, { r: 6, c: 8 }],
    path: [
      { r: 10, c: 2 }, { r: 10, c: 3 }, { r: 10, c: 4 },
      { r: 9, c: 4 }, { r: 8, c: 4 }, { r: 8, c: 5 }, { r: 8, c: 6 },
      { r: 7, c: 6 }, { r: 6, c: 6 }, { r: 6, c: 7 }, { r: 6, c: 8 }
    ],
    maxF1Slots: 5,
    maxF2Slots: 0,
    minCmdsFor3Stars: 5
  },
  {
    id: 12,
    name: "Symmetric Bridges",
    phase: 3,
    rows: 15,
    cols: 15,
    desc: "Define F1 and F2 to alternate calling each other to solve a symmetric layout.",
    start: { r: 7, c: 2, dir: 'E' },
    stars: [{ r: 7, c: 5 }, { r: 7, c: 9 }, { r: 7, c: 12 }],
    path: [
      { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 },
      { r: 7, c: 6 }, { r: 7, c: 7 }, { r: 7, c: 8 }, { r: 7, c: 9 },
      { r: 7, c: 10 }, { r: 7, c: 11 }, { r: 7, c: 12 }
    ],
    maxF1Slots: 4,
    maxF2Slots: 4,
    minCmdsFor3Stars: 4
  },
  {
    id: 13,
    name: "The S-Curve Loop",
    phase: 3,
    rows: 15,
    cols: 15,
    desc: "Loop F1 recursively with turn commands to steer through a smooth S-curve.",
    start: { r: 9, c: 3, dir: 'E' },
    stars: [{ r: 9, c: 6 }, { r: 5, c: 8 }],
    path: [
      { r: 9, c: 3 }, { r: 9, c: 4 }, { r: 9, c: 5 }, { r: 9, c: 6 },
      { r: 8, c: 6 }, { r: 7, c: 6 }, { r: 7, c: 7 }, { r: 7, c: 8 },
      { r: 6, c: 8 }, { r: 5, c: 8 }, { r: 5, c: 9 }, { r: 5, c: 10 }
    ],
    maxF1Slots: 6,
    maxF2Slots: 0,
    minCmdsFor3Stars: 5
  },
  {
    id: 14,
    name: "Infinite Loop Track",
    phase: 3,
    rows: 15,
    cols: 15,
    desc: "A closed circular track. Write a looping function to keep the robot driving.",
    start: { r: 8, c: 4, dir: 'N' },
    stars: [{ r: 4, c: 4 }, { r: 4, c: 10 }, { r: 10, c: 10 }, { r: 10, c: 4 }],
    path: [
      { r: 4, c: 4 }, { r: 4, c: 5 }, { r: 4, c: 6 }, { r: 4, c: 7 }, { r: 4, c: 8 }, { r: 4, c: 9 }, { r: 4, c: 10 },
      { r: 5, c: 10 }, { r: 6, c: 10 }, { r: 7, c: 10 }, { r: 8, c: 10 }, { r: 9, c: 10 }, { r: 10, c: 10 },
      { r: 10, c: 9 }, { r: 10, c: 8 }, { r: 10, c: 7 }, { r: 10, c: 6 }, { r: 10, c: 5 }, { r: 10, c: 4 },
      { r: 9, c: 4 }, { r: 8, c: 4 }, { r: 7, c: 4 }, { r: 6, c: 4 }, { r: 5, c: 4 }
    ],
    maxF1Slots: 5,
    maxF2Slots: 0,
    minCmdsFor3Stars: 4
  },
  {
    id: 15,
    name: "Crossroad Bridge",
    phase: 3,
    rows: 15,
    cols: 15,
    desc: "Cross the bridge! Use F1 and F2 to manage different directions.",
    start: { r: 7, c: 2, dir: 'E' },
    stars: [{ r: 7, c: 7 }, { r: 5, c: 7 }, { r: 9, c: 7 }],
    path: [
      { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 }, { r: 7, c: 7 }, { r: 7, c: 8 }, { r: 7, c: 9 },
      { r: 5, c: 7 }, { r: 6, c: 7 }, { r: 8, c: 7 }, { r: 9, c: 7 }
    ],
    maxF1Slots: 6,
    maxF2Slots: 6,
    minCmdsFor3Stars: 6
  },

  // --- PHASE 4: ADVANCED LOGIC (16 - 18) ---
  {
    id: 16,
    name: "Nested Spiral Path",
    phase: 4,
    rows: 16,
    cols: 16,
    desc: "Deeply nested recursion is required to guide the robot into the center star.",
    start: { r: 12, c: 2, dir: 'E' },
    stars: [{ r: 6, c: 8 }],
    path: [
      { r: 12, c: 2 }, { r: 12, c: 3 }, { r: 12, c: 4 }, { r: 12, c: 5 }, { r: 12, c: 6 }, { r: 12, c: 7 }, { r: 12, c: 8 }, { r: 12, c: 9 }, { r: 12, c: 10 }, { r: 12, c: 11 }, { r: 12, c: 12 },
      { r: 11, c: 12 }, { r: 10, c: 12 }, { r: 9, c: 12 }, { r: 8, c: 12 }, { r: 7, c: 12 }, { r: 6, c: 12 }, { r: 5, c: 12 }, { r: 4, c: 12 },
      { r: 4, c: 11 }, { r: 4, c: 10 }, { r: 4, c: 9 }, { r: 4, c: 8 }, { r: 4, c: 7 }, { r: 4, c: 6 }, { r: 4, c: 5 }, { r: 4, c: 4 },
      { r: 5, c: 4 }, { r: 6, c: 4 }, { r: 7, c: 4 }, { r: 8, c: 4 }, { r: 9, c: 4 }, { r: 10, c: 4 },
      { r: 10, c: 5 }, { r: 10, c: 6 }, { r: 10, c: 7 }, { r: 10, c: 8 }, { r: 10, c: 9 }, { r: 10, c: 10 },
      { r: 9, c: 10 }, { r: 8, c: 10 }, { r: 7, c: 10 }, { r: 6, c: 10 },
      { r: 6, c: 9 }, { r: 6, c: 8 }
    ],
    maxF1Slots: 5,
    maxF2Slots: 5,
    minCmdsFor3Stars: 6
  },
  {
    id: 17,
    name: "Recursive Spiral",
    phase: 4,
    rows: 16,
    cols: 16,
    desc: "Alternate functions to solve recursion transitions over a narrow bridge.",
    start: { r: 8, c: 2, dir: 'E' },
    stars: [{ r: 8, c: 13 }],
    path: [
      { r: 8, c: 2 }, { r: 8, c: 3 }, { r: 8, c: 4 }, { r: 8, c: 5 }, { r: 8, c: 6 }, { r: 8, c: 7 },
      { r: 8, c: 8 }, { r: 8, c: 9 }, { r: 8, c: 10 }, { r: 8, c: 11 }, { r: 8, c: 12 }, { r: 8, c: 13 }
    ],
    maxF1Slots: 4,
    maxF2Slots: 4,
    minCmdsFor3Stars: 4
  },
  {
    id: 18,
    name: "The Stack Climber",
    phase: 4,
    rows: 16,
    cols: 16,
    desc: "Solve a step-like maze. Limit commands to optimize memory stack usage.",
    start: { r: 13, c: 3, dir: 'E' },
    stars: [{ r: 3, c: 13 }],
    path: [
      { r: 13, c: 3 }, { r: 13, c: 4 }, { r: 13, c: 5 },
      { r: 12, c: 5 }, { r: 11, c: 5 }, { r: 11, c: 6 }, { r: 11, c: 7 },
      { r: 10, c: 7 }, { r: 9, c: 7 }, { r: 9, c: 8 }, { r: 9, c: 9 },
      { r: 8, c: 9 }, { r: 7, c: 9 }, { r: 7, c: 10 }, { r: 7, c: 11 },
      { r: 6, c: 11 }, { r: 5, c: 11 }, { r: 5, c: 12 }, { r: 5, c: 13 },
      { r: 4, c: 13 }, { r: 3, c: 13 }
    ],
    maxF1Slots: 6,
    maxF2Slots: 6,
    minCmdsFor3Stars: 6
  },

  // --- PHASE 5: EXPERT PUZZLES (19 - 21) ---
  {
    id: 19,
    name: "The Square Loop",
    phase: 5,
    rows: 12,
    cols: 12,
    desc: "REPLICA PUZZLE: Replicate the screen! Red edges, Green corners, and a tail. Program F1/F2 conditionally.",
    start: { r: 9, c: 3, dir: 'N' },
    stars: [
      { r: 2, c: 3 }, { r: 2, c: 10 }, { r: 9, c: 10 }, { r: 9, c: 3 }, { r: 9, c: 1 }
    ],
    path: [
      // Corners
      { r: 2, c: 3, color: 'green' },
      { r: 2, c: 10, color: 'green' },
      { r: 9, c: 10, color: 'green' },
      { r: 9, c: 3, color: 'green' },
      // Tail
      { r: 9, c: 2, color: 'red' },
      { r: 9, c: 1, color: 'green' },
      // Connecting Red edges
      { r: 3, c: 3, color: 'red' }, { r: 4, c: 3, color: 'red' }, { r: 5, c: 3, color: 'red' },
      { r: 6, c: 3, color: 'red' }, { r: 7, c: 3, color: 'red' }, { r: 8, c: 3, color: 'red' },
      { r: 3, c: 10, color: 'red' }, { r: 4, c: 10, color: 'red' }, { r: 5, c: 10, color: 'red' },
      { r: 6, c: 10, color: 'red' }, { r: 7, c: 10, color: 'red' }, { r: 8, c: 10, color: 'red' },
      { r: 2, c: 4, color: 'red' }, { r: 2, c: 5, color: 'red' }, { r: 2, c: 6, color: 'red' },
      { r: 2, c: 7, color: 'red' }, { r: 2, c: 8, color: 'red' }, { r: 2, c: 9, color: 'red' },
      { r: 9, c: 4, color: 'red' }, { r: 9, c: 5, color: 'red' }, { r: 9, c: 6, color: 'red' },
      { r: 9, c: 7, color: 'red' }, { r: 9, c: 8, color: 'red' }, { r: 9, c: 9, color: 'red' }
    ],
    maxF1Slots: 5,
    maxF2Slots: 5,
    minCmdsFor3Stars: 4
  },
  {
    id: 20,
    name: "Color Painter Loop",
    phase: 5,
    rows: 15,
    cols: 15,
    desc: "Use Paint commands (Paint Red/Green/Blue) to color grid cells and direct the robot recursively.",
    start: { r: 8, c: 4, dir: 'E' },
    stars: [{ r: 8, c: 10 }],
    path: [
      { r: 8, c: 4, color: 'white' }, { r: 8, c: 5, color: 'white' }, { r: 8, c: 6, color: 'white' },
      { r: 8, c: 7, color: 'white' }, { r: 8, c: 8, color: 'white' }, { r: 8, c: 9, color: 'white' },
      { r: 8, c: 10, color: 'white' }
    ],
    maxF1Slots: 6,
    maxF2Slots: 6,
    minCmdsFor3Stars: 5
  },
  {
    id: 21,
    name: "The Ultimate Logic Maze",
    phase: 5,
    rows: 15,
    cols: 15,
    desc: "Solve this massive 15x15 maze. Combine functions and color painting to fit the constraints.",
    start: { r: 10, c: 4, dir: 'N' },
    stars: [{ r: 4, c: 10 }],
    path: [
      { r: 10, c: 4, color: 'red' }, { r: 9, c: 4, color: 'red' }, { r: 8, c: 4, color: 'red' },
      { r: 8, c: 5, color: 'blue' }, { r: 8, c: 6, color: 'blue' },
      { r: 7, c: 6, color: 'green' }, { r: 6, c: 6, color: 'green' },
      { r: 6, c: 7, color: 'red' }, { r: 6, c: 8, color: 'red' },
      { r: 5, c: 8, color: 'blue' }, { r: 4, c: 8, color: 'blue' },
      { r: 4, c: 9, color: 'green' }, { r: 4, c: 10, color: 'green' }
    ],
    maxF1Slots: 8,
    maxF2Slots: 8,
    minCmdsFor3Stars: 6
  }
];

const TEMPLE_PHASES = [
  { id: 1, name: 'Path of Steps', concept: 'Sequencing & direction', color: 'from-emerald-500 to-teal-600' },
  { id: 2, name: 'Chromatic Ruins', concept: 'Conditions & decisions', color: 'from-sky-500 to-blue-700' },
  { id: 3, name: 'Echo Chambers', concept: 'Functions & loops', color: 'from-violet-500 to-purple-700' },
  { id: 4, name: 'Recursive Vault', concept: 'Recursion & stack logic', color: 'from-orange-500 to-red-600' },
  { id: 5, name: 'Architect Sanctum', concept: 'Optimization & algorithms', color: 'from-amber-400 to-yellow-600' },
] as const;

export default function PuzzleTemple() {
  const { addXpAndCoins, student } = useApp();

  // Loader & Level Index States
  const [activeTab, setActiveTab] = useState<'games' | 'test'>('games');
  const [activePhase, setActivePhase] = useState<number>(1);
  const [selectedLevelIdx, setSelectedLevelIdx] = useState<number>(0);
  
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [levelStarsMap, setLevelStarsMap] = useState<Record<number, number>>({});
  const [unlockedPhases, setUnlockedPhases] = useState<number[]>([1]);

  // Load progress state from localStorage
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const progressKey = student?.id || 'guest';
      const savedLevels = localStorage.getItem(`cist_puzzle_temple_levels_${progressKey}`) || localStorage.getItem('cist_logic_levels_21');
      const savedStars = localStorage.getItem(`cist_puzzle_temple_stars_${progressKey}`) || localStorage.getItem('cist_logic_stars_21');
      const savedPhases = localStorage.getItem(`cist_puzzle_temple_phases_${progressKey}`) || localStorage.getItem('cist_logic_phases_21');
      if (savedLevels) setCompletedLevels(JSON.parse(savedLevels));
      if (savedStars) setLevelStarsMap(JSON.parse(savedStars));
      if (savedPhases) setUnlockedPhases(JSON.parse(savedPhases));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [student?.id]);

  const saveProgress = (levels: number[], phases: number[], starsMap: Record<number, number>) => {
    setCompletedLevels(levels);
    setUnlockedPhases(phases);
    setLevelStarsMap(starsMap);
    const progressKey = student?.id || 'guest';
    localStorage.setItem(`cist_puzzle_temple_levels_${progressKey}`, JSON.stringify(levels));
    localStorage.setItem(`cist_puzzle_temple_stars_${progressKey}`, JSON.stringify(starsMap));
    localStorage.setItem(`cist_puzzle_temple_phases_${progressKey}`, JSON.stringify(phases));
  };

  const activeLevel = LEVEL_DEFS[selectedLevelIdx];
  const activePhaseInfo = TEMPLE_PHASES.find((phase) => phase.id === activePhase) ?? TEMPLE_PHASES[0];
  const totalStars = Object.values(levelStarsMap).reduce((sum, stars) => sum + stars, 0);
  const phaseLevels = LEVEL_DEFS.filter((level) => level.phase === activePhase);
  const phaseCompletedCount = phaseLevels.filter((level) => completedLevels.includes(level.id)).length;
  const phaseMastered = phaseCompletedCount === phaseLevels.length;
  const isLevelUnlocked = (level: LevelDef) => {
    if (!unlockedPhases.includes(level.phase)) return false;
    const previousLevel = LEVEL_DEFS.find((candidate) => candidate.id === level.id - 1);
    return !previousLevel || previousLevel.phase !== level.phase || completedLevels.includes(previousLevel.id);
  };
  const pathRows = activeLevel.path.map((cell) => cell.r);
  const pathCols = activeLevel.path.map((cell) => cell.c);
  const minVisibleRow = Math.max(0, Math.min(...pathRows) - 1);
  const maxVisibleRow = Math.min(activeLevel.rows - 1, Math.max(...pathRows) + 1);
  const minVisibleCol = Math.max(0, Math.min(...pathCols) - 1);
  const maxVisibleCol = Math.min(activeLevel.cols - 1, Math.max(...pathCols) + 1);
  const visibleRows = Array.from({ length: maxVisibleRow - minVisibleRow + 1 }, (_, index) => minVisibleRow + index);
  const visibleCols = Array.from({ length: maxVisibleCol - minVisibleCol + 1 }, (_, index) => minVisibleCol + index);

  // Game execution state variables
  const [gridState, setGridState] = useState<Cell[][]>([]);
  const [robot, setRobot] = useState<RobotState>({ r: 0, c: 0, dir: 'E' });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [executionHistory, setExecutionHistory] = useState<{ cmd: CommandSlot['cmd']; cond: CommandSlot['cond']; id: string }[]>([]);
  const [activeHistIdx, setActiveHistIdx] = useState<number>(-1);
  const [executionSpeed, setExecutionSpeed] = useState<number>(350); // Speed in ms

  // Function Slot Builders & History for Undo/Redo
  const [f1, setF1] = useState<CommandSlot[]>([]);
  const [f2, setF2] = useState<CommandSlot[]>([]);
  const [undoStack, setUndoStack] = useState<{ f1: CommandSlot[]; f2: CommandSlot[] }[]>([]);
  const [redoStack, setRedoStack] = useState<{ f1: CommandSlot[]; f2: CommandSlot[] }[]>([]);
  
  // Drag and Palette selectors
  const [selectedPaletteItem, setSelectedPaletteItem] = useState<{ type: 'cmd' | 'cond' | 'brush' | 'eraser'; name: string } | null>(null);

  // Runtime State pointers for step-by-step
  const [runtimeStack, setRuntimeStack] = useState<{ fn: 'f1' | 'f2'; ip: number }[]>([]);
  const [runtimeRobot, setRuntimeRobot] = useState<RobotState>({ r: 0, c: 0, dir: 'E' });
  const [runtimeGrid, setRuntimeGrid] = useState<Cell[][]>([]);
  const [starsLeft, setStarsLeft] = useState<number>(0);
  const displayedStarsLeft = isPlaying ? starsLeft : activeLevel.stars.length;
  const [stepCount, setStepCount] = useState<number>(0);

  // Level Editor Mode
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [editorPaintColor, setEditorPaintColor] = useState<Cell['color']>('white');
  const [editorStarToggle, setEditorStarToggle] = useState(false);
  const [editorRobotPlacement, setEditorRobotPlacement] = useState(false);

  // Quiz state variables
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizError, setQuizError] = useState(false);

  // Alerts
  const [alertMsg, setAlertMsg] = useState('');

  // Initial Level Setup
  useEffect(() => {
    resetLevelState(activeLevel);
  }, [selectedLevelIdx]);

  const resetLevelState = (lvl: LevelDef) => {
    // Generate Grid based on Level Config
    const tempGrid = createEmptyGrid(lvl.rows, lvl.cols, 'gray');
    
    // Draw Path
    lvl.path.forEach(p => {
      tempGrid[p.r][p.c].color = p.color || 'white';
    });

    // Place Stars
    lvl.stars.forEach(s => {
      tempGrid[s.r][s.c].hasStar = true;
    });

    setGridState(tempGrid);
    setRobot({ ...lvl.start });
    setIsPlaying(false);
    setIsPaused(false);
    setHasWon(false);
    setTerminalLogs([`Level ${lvl.id}: ${lvl.name} initialized. Drag/click to place commands.`]);
    setExecutionHistory([]);
    setActiveHistIdx(-1);
    setRuntimeStack([]);
    setStepCount(0);
    setUndoStack([]);
    setRedoStack([]);

    // Fill blank slots
    setF1(Array.from({ length: lvl.maxF1Slots }, () => ({ cmd: null, cond: 'none' })));
    setF2(Array.from({ length: lvl.maxF2Slots }, () => ({ cmd: null, cond: 'none' })));
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab === 'test') return;
      
      const key = e.key.toLowerCase();
      if (key === ' ') {
        e.preventDefault();
        if (isPlaying) {
          setIsPaused(prev => !prev);
        } else {
          handlePlay();
        }
      } else if (key === 's') {
        handleStep();
      } else if (key === 'r') {
        handleReset();
      } else if (e.ctrlKey && key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (key === 'escape') {
        setSelectedPaletteItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isPaused, f1, f2, undoStack, redoStack]);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 5500);
  };

  // Push slot states into Undo Stack before modification
  const recordUndoState = (newF1 = f1, newF2 = f2) => {
    setUndoStack(prev => [...prev, { f1: f1.map(s => ({ ...s })), f2: f2.map(s => ({ ...s })) }]);
    setRedoStack([]); // Clear redo
  };

  const handleUndo = () => {
    if (undoStack.length === 0 || isPlaying) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, { f1: f1.map(s => ({ ...s })), f2: f2.map(s => ({ ...s })) }]);
    setF1(previous.f1);
    setF2(previous.f2);
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || isPlaying) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, { f1: f1.map(s => ({ ...s })), f2: f2.map(s => ({ ...s })) }]);
    setF1(next.f1);
    setF2(next.f2);
  };

  // =========================================================================
  // PALETTE & SLOT MANAGEMENT (HTML5 DND & CLICK-TO-PLACE)
  // =========================================================================
  const handleDragStart = (e: React.DragEvent, type: 'cmd' | 'cond' | 'brush' | 'eraser', name: string) => {
    e.dataTransfer.setData('type', type);
    e.dataTransfer.setData('name', name);
    setSelectedPaletteItem({ type, name });
  };

  const handleDropOnSlot = (e: React.DragEvent, fnName: 'f1' | 'f2', idx: number) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type') as 'cmd' | 'cond' | 'brush' | 'eraser';
    const name = e.dataTransfer.getData('name');
    applyModification(fnName, idx, type, name);
  };

  const handleSlotClick = (fnName: 'f1' | 'f2', idx: number) => {
    if (isPlaying) return;
    if (selectedPaletteItem) {
      applyModification(fnName, idx, selectedPaletteItem.type, selectedPaletteItem.name);
    } else {
      // If nothing selected, clicking clear it
      recordUndoState();
      const slots = fnName === 'f1' ? [...f1] : [...f2];
      slots[idx] = { cmd: null, cond: 'none' };
      if (fnName === 'f1') setF1(slots);
      else setF2(slots);
    }
  };

  const applyModification = (fnName: 'f1' | 'f2', idx: number, type: string, name: string) => {
    recordUndoState();
    const slots = fnName === 'f1' ? [...f1] : [...f2];

    if (type === 'cmd') {
      slots[idx] = { ...slots[idx], cmd: name as CommandSlot['cmd'] };
    } else if (type === 'cond') {
      slots[idx] = { ...slots[idx], cond: name as CommandSlot['cond'] };
    } else if (type === 'brush') {
      // Translate brush to paint commands
      const paintCmd = name === 'red' ? 'paint_red' : name === 'green' ? 'paint_green' : 'paint_blue';
      slots[idx] = { ...slots[idx], cmd: paintCmd as CommandSlot['cmd'] };
    } else if (type === 'eraser') {
      slots[idx] = { cmd: null, cond: 'none' };
    }

    if (fnName === 'f1') setF1(slots);
    else setF2(slots);
  };

  const clearAllSlots = () => {
    if (isPlaying) return;
    recordUndoState();
    setF1(f1.map(() => ({ cmd: null, cond: 'none' })));
    setF2(f2.map(() => ({ cmd: null, cond: 'none' })));
    setTerminalLogs(prev => [...prev, '✓ Function slots cleared.']);
  };

  // =========================================================================
  // ROBOZZLE GRID INTERPRETATION ENGINE
  // =========================================================================
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startPlayback = () => {
    setIsPlaying(true);
    setIsPaused(false);
    setHasWon(false);
    setExecutionHistory([]);
    setActiveHistIdx(-1);

    // Deep copy initial states
    const copyGrid = gridState.map(row => row.map(cell => ({ ...cell })));
    const initialRobot = { ...robot };
    const starsCount = copyGrid.flat().filter(c => c.hasStar).length;

    setRuntimeGrid(copyGrid);
    setRuntimeRobot(initialRobot);
    setStarsLeft(starsCount);
    setStepCount(0);

    const initialStack: { fn: 'f1' | 'f2'; ip: number }[] = [{ fn: 'f1', ip: 0 }];
    setRuntimeStack(initialStack);
    setTerminalLogs(prev => [...prev, '> Starting sequence execution. starting at F1...']);
  };

  const handlePlay = () => {
    if (!isPlaying) {
      // Validate F1 is not completely empty
      if (f1.every(s => s.cmd === null)) {
        setTerminalLogs(prev => [...prev, '❌ ERROR: F1 has no commands. Can\'t play.']);
        return;
      }
      startPlayback();
    } else {
      setIsPaused(false);
    }
  };

  // Execute Step-by-Step
  const handleStep = () => {
    if (!isPlaying) {
      if (f1.every(s => s.cmd === null)) return;
      startPlayback();
      setIsPaused(true);
    } else {
      setIsPaused(true);
      executeOneInstruction();
    }
  };

  // Main step executor loop
  const executeOneInstruction = () => {
    if (runtimeStack.length === 0) {
      if (starsLeft === 0) {
        handleWinLevel();
      } else {
        setTerminalLogs(prev => [...prev, '❌ HALT: Call stack is empty. Star targets remaining.']);
        setIsPlaying(false);
      }
      return;
    }

    if (stepCount > 600) {
      setTerminalLogs(prev => [...prev, '❌ HALT: Maximum execution step count limit exceeded (600).']);
      setIsPlaying(false);
      return;
    }

    if (runtimeStack.length > 50) {
      setTerminalLogs(prev => [...prev, '💥 STACK OVERFLOW: Recursion depth exceeded limit (50).']);
      setIsPlaying(false);
      return;
    }

    // Get current instruction pointer frame
    const updatedStack = [...runtimeStack];
    const frameIdx = updatedStack.length - 1;
    const frame = updatedStack[frameIdx];

    const slots = frame.fn === 'f1' ? f1 : f2;

    if (frame.ip >= slots.length) {
      updatedStack.pop();
      setRuntimeStack(updatedStack);
      setStepCount(prev => prev + 1);
      return; // Handled next call
    }

    const slot = slots[frame.ip];
    frame.ip++; // Increment instruction pointer
    setRuntimeStack(updatedStack);

    // Skip blank slots
    if (!slot.cmd) {
      setStepCount(prev => prev + 1);
      return;
    }

    // Check color condition
    const currentCell = runtimeGrid[runtimeRobot.r][runtimeRobot.c];
    const match = slot.cond === 'none' || slot.cond === null || slot.cond === currentCell.color;

    if (!match) {
      setStepCount(prev => prev + 1);
      return;
    }

    // Update execution history
    const histId = `${frame.fn}-${frame.ip - 1}-${stepCount}`;
    const newHist = { cmd: slot.cmd, cond: slot.cond, id: histId };
    setExecutionHistory(prev => [...prev, newHist]);
    setActiveHistIdx(executionHistory.length);

    // Run action
    const nextRobot = { ...runtimeRobot };
    const nextGrid = runtimeGrid.map(row => row.map(cell => ({ ...cell })));
    let nextStars = starsLeft;

    if (slot.cmd === 'up') {
      if (runtimeRobot.dir === 'N') nextRobot.r--;
      if (runtimeRobot.dir === 'E') nextRobot.c++;
      if (runtimeRobot.dir === 'S') nextRobot.r++;
      if (runtimeRobot.dir === 'W') nextRobot.c--;

      // Boundary check
      if (nextRobot.r < 0 || nextRobot.r >= activeLevel.rows || nextRobot.c < 0 || nextRobot.c >= activeLevel.cols) {
        setTerminalLogs(prev => [...prev, '💥 CRASH: Robot fell off grid boundaries!']);
        setIsPlaying(false);
        return;
      }

      // Walkable check
      const nextCell = nextGrid[nextRobot.r][nextRobot.c];
      if (nextCell.color === 'gray') {
        setTerminalLogs(prev => [...prev, `💥 CRASH: Stepped onto wall at [${nextRobot.r}, ${nextRobot.c}].`]);
        setIsPlaying(false);
        return;
      }

      setRuntimeRobot(nextRobot);

      // Star collection check
      if (nextCell.hasStar) {
        nextCell.hasStar = false;
        nextStars--;
        setStarsLeft(nextStars);
        setRuntimeGrid(nextGrid);
        setGridState(nextGrid); // update visually
        setTerminalLogs(prev => [...prev, `✨ Star collected at [${nextRobot.r}, ${nextRobot.c}]! (${nextStars} remaining)`]);
        
        if (nextStars === 0) {
          handleWinLevel();
          return;
        }
      }
    } else if (slot.cmd === 'ccw') {
      const dirs: RobotState['dir'][] = ['N', 'W', 'S', 'E'];
      nextRobot.dir = dirs[(dirs.indexOf(runtimeRobot.dir) + 1) % 4];
      setRuntimeRobot(nextRobot);
    } else if (slot.cmd === 'cw') {
      const dirs: RobotState['dir'][] = ['N', 'E', 'S', 'W'];
      nextRobot.dir = dirs[(dirs.indexOf(runtimeRobot.dir) + 1) % 4];
      setRuntimeRobot(nextRobot);
    } else if (slot.cmd === 'f1') {
      updatedStack.push({ fn: 'f1', ip: 0 });
      setRuntimeStack(updatedStack);
    } else if (slot.cmd === 'f2') {
      updatedStack.push({ fn: 'f2', ip: 0 });
      setRuntimeStack(updatedStack);
    } else if (slot.cmd === 'paint_red') {
      currentCell.color = 'red';
      setRuntimeGrid(nextGrid);
      setGridState(nextGrid);
      setTerminalLogs(prev => [...prev, `🎨 Cell at [${runtimeRobot.r}, ${runtimeRobot.c}] painted Red.`]);
    } else if (slot.cmd === 'paint_green') {
      currentCell.color = 'green';
      setRuntimeGrid(nextGrid);
      setGridState(nextGrid);
      setTerminalLogs(prev => [...prev, `🎨 Cell at [${runtimeRobot.r}, ${runtimeRobot.c}] painted Green.`]);
    } else if (slot.cmd === 'paint_blue') {
      currentCell.color = 'blue';
      setRuntimeGrid(nextGrid);
      setGridState(nextGrid);
      setTerminalLogs(prev => [...prev, `🎨 Cell at [${runtimeRobot.r}, ${runtimeRobot.c}] painted Blue.`]);
    }

    setStepCount(prev => prev + 1);
  };

  // Sync state loops for running Play mode
  useEffect(() => {
    if (isPlaying && !isPaused && !hasWon) {
      timerRef.current = setTimeout(() => {
        executeOneInstruction();
      }, executionSpeed);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, isPaused, runtimeStack, runtimeRobot, runtimeGrid, starsLeft, stepCount, executionSpeed]);

  const handleWinLevel = () => {
    setHasWon(true);
    setIsPlaying(false);
    setTerminalLogs(prev => [...prev, `🎉 VICTORY! Solved ${activeLevel.name} in ${stepCount} steps.`]);

    // Calculate score stars
    const totalCmds = [...f1, ...f2].filter(s => s.cmd !== null).length;
    let starsEarned = 1;
    if (totalCmds <= activeLevel.minCmdsFor3Stars) {
      starsEarned = 3;
    } else if (totalCmds <= activeLevel.minCmdsFor3Stars + 2) {
      starsEarned = 2;
    }

    const updatedStars = { ...levelStarsMap, [activeLevel.id]: Math.max(levelStarsMap[activeLevel.id] || 0, starsEarned) };
    
    // Add completed levels
    if (!completedLevels.includes(activeLevel.id)) {
      const newCompleted = [...completedLevels, activeLevel.id];
      saveProgress(newCompleted, unlockedPhases, updatedStars);
      addXpAndCoins(80, 20, `Completed Logic Level ${activeLevel.id}`);
      triggerAlert(`🎮 Level ${activeLevel.id} Cleared! Gained +80 XP & +20 CIST Coins! (${starsEarned} Star Score)`);
    } else {
      saveProgress(completedLevels, unlockedPhases, updatedStars);
      triggerAlert(`🎮 Level ${activeLevel.id} Re-solved! Score: ${starsEarned} Star(s)`);
    }
  };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    resetLevelState(activeLevel);
  };

  const goToNextChamber = () => {
    const nextIndex = selectedLevelIdx + 1;
    const nextLevel = LEVEL_DEFS[nextIndex];
    if (!nextLevel) return;
    if (nextLevel.phase !== activePhase) {
      setActiveTab('games');
      return;
    }
    setSelectedLevelIdx(nextIndex);
  };

  const getDirArrowSymbol = (dir: RobotState['dir']) => {
    if (dir === 'N') return '▲';
    if (dir === 'E') return '►';
    if (dir === 'S') return '▼';
    return '◄';
  };

  // =========================================================================
  // LEVEL EDITOR ARCHITECTURE IMPLEMENTATION
  // =========================================================================
  const handleEditorCellClick = (rIdx: number, cIdx: number) => {
    if (!isEditorMode) return;
    const copy = gridState.map(row => row.map(cell => ({ ...cell })));

    if (editorRobotPlacement) {
      // Place robot start position
      setRobot({ r: rIdx, c: cIdx, dir: 'N' });
      setEditorRobotPlacement(false);
      setTerminalLogs(prev => [...prev, `[EDITOR] Robot starting position placed at [${rIdx}, ${cIdx}]`]);
    } else if (editorStarToggle) {
      // Toggle star placement
      copy[rIdx][cIdx].hasStar = !copy[rIdx][cIdx].hasStar;
      // Walkable must be true/white if star is placed
      if (copy[rIdx][cIdx].hasStar && copy[rIdx][cIdx].color === 'gray') {
        copy[rIdx][cIdx].color = 'white';
      }
      setGridState(copy);
    } else {
      // Paint tile color
      copy[rIdx][cIdx].color = copy[rIdx][cIdx].color === editorPaintColor ? 'gray' : editorPaintColor;
      // If turned to wall, remove star
      if (copy[rIdx][cIdx].color === 'gray') {
        copy[rIdx][cIdx].hasStar = false;
      }
      setGridState(copy);
    }
  };

  // =========================================================================
  // QUIZ ASSESSMENTS
  // =========================================================================
  const handleSelectQuizOption = (optIdx: number) => {
    setQuizAnswers(prev => ({ ...prev, [quizIdx]: optIdx }));
  };

  const submitQuizAnswer = () => {
    const questions = PHASE_QUIZZES[activePhase];
    const userAns = quizAnswers[quizIdx];
    if (userAns === undefined) return;

    let nextScore = quizScore;
    if (userAns === questions[quizIdx].correct) {
      nextScore++;
      setQuizScore(nextScore);
    }

    if (quizIdx + 1 < questions.length) {
      setQuizIdx(prev => prev + 1);
    } else {
      setQuizCompleted(true);
      const passed = nextScore === questions.length;
      if (passed) {
        const nextPhase = activePhase + 1;
        const newPhases = [...unlockedPhases];
        if (!newPhases.includes(nextPhase) && nextPhase <= 5) {
          newPhases.push(nextPhase);
        }
        saveProgress(completedLevels, newPhases, levelStarsMap);
        addXpAndCoins(100, 25, `Passed Logic Phase ${activePhase} Test`);
        triggerAlert(`🏆 Passed Phase ${activePhase} Assessment! +100 XP rewarded!`);
      } else {
        setQuizError(true);
      }
    }
  };

  const startQuiz = () => {
    if (!phaseMastered) return;
    setQuizIdx(0);
    setQuizAnswers({});
    setQuizScore(0);
    setQuizCompleted(false);
    setQuizError(false);
    setActiveTab('test');
  };

  const handlePhaseChange = (phaseNum: number) => {
    if (!unlockedPhases.includes(phaseNum)) return;
    setActivePhase(phaseNum);
    setActiveTab('games');
    const idx = LEVEL_DEFS.findIndex(lvl => lvl.phase === phaseNum);
    if (idx !== -1) setSelectedLevelIdx(idx);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#164e3f_0,#082f32_38%,#071a2d_100%)] text-slate-900 font-sans p-3 md:p-5 space-y-4">
      {/* Top Bar Banner Header */}
      <div className="overflow-hidden rounded-[1.75rem] border border-emerald-300/25 bg-slate-950/75 px-6 py-5 text-white shadow-2xl backdrop-blur flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 shadow-lg"><BookOpen className="h-7 w-7 text-slate-950" /></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.25em] text-emerald-300">Puzzle Temple · {activePhaseInfo.name}</p>
            <h1 className="text-xl font-black text-white uppercase tracking-tight flex flex-wrap items-center gap-2">
              <span>Chamber {activeLevel.id}: {activeLevel.name}</span>
            </h1>
            <p className="mt-1 text-xs font-semibold text-slate-300">Master {activePhaseInfo.concept} to restore the temple core.</p>
          </div>
        </div>

        {/* Level Progression Progress Bar */}
        <div className="flex-1 max-w-md mx-6 hidden md:block">
          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
            <span className="text-slate-300">Temple restoration</span>
            <span>{completedLevels.length} / 21 Levels Cleared</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full border border-white/10 bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-300 transition-all duration-500"
              style={{ width: `${(completedLevels.length / 21) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="rounded-xl border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-center"><span className="block text-[9px] font-black uppercase text-amber-200">Temple stars</span><b className="text-lg text-white">{totalStars} / 63</b></div>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map(num => {
              const unlocked = unlockedPhases.includes(num);
              const active = activePhase === num && activeTab === 'games';
              return (
                <button
                  key={num}
                  onClick={() => handlePhaseChange(num)}
                  disabled={!unlocked}
                  className={`rounded-xl px-3 py-2 border text-[10px] font-bold tracking-wider uppercase transition ${
                    active ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg' :
                    unlocked ? 'bg-white/10 border-white/15 text-white hover:bg-white/20' :
                    'bg-slate-900 border-slate-700 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  P{num}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {alertMsg && (
        <div className="rounded-2xl bg-emerald-500 text-white font-bold text-xs p-4 flex items-center space-x-3 shadow-md animate-bounce">
          <Award className="h-5 w-5 text-white" />
          <span>{alertMsg}</span>
        </div>
      )}

      {hasWon && activeTab === 'games' && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-300/40 bg-gradient-to-r from-amber-400 to-orange-500 p-4 text-slate-950 shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-white/40"><Award className="h-6 w-6" /></div><div><b className="block text-base font-black">Chamber restored!</b><span className="text-xs font-semibold">Your algorithm collected every knowledge crystal.</span></div></div>
          {selectedLevelIdx + 1 < LEVEL_DEFS.length && LEVEL_DEFS[selectedLevelIdx + 1].phase === activePhase && <button onClick={goToNextChamber} className="rounded-xl bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-wider text-white">Next chamber</button>}
        </div>
      )}

      {/* Main Grid & Editor Splitter */}
      <div className="flex flex-col gap-4">
        
        {/* LEFT COLUMN: Map Selection Drawer (3 Cols) */}
        <div className="rounded-[1.5rem] border border-emerald-300/20 bg-slate-950/80 p-4 text-white shadow-xl space-y-4">
          <div className="border-b pb-2 flex justify-between items-center">
            <div><span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">{activePhaseInfo.name}</span><p className="mt-1 text-[10px] text-slate-400">{phaseCompletedCount}/{phaseLevels.length} chambers mastered</p></div>
            <button
              onClick={() => setIsEditorMode(prev => !prev)}
              className={`px-2 py-0.5 border text-[9px] uppercase font-black tracking-wide ${
                isEditorMode ? 'bg-[#ef4444] text-white' : 'bg-slate-100 text-slate-750'
              }`}
            >
              Editor {isEditorMode ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {LEVEL_DEFS
              .filter(lvl => lvl.phase === activePhase)
              .map(lvl => {
                const isActive = activeLevel.id === lvl.id;
                const isCleared = completedLevels.includes(lvl.id);
                const starsCount = levelStarsMap[lvl.id] || 0;
                const levelUnlocked = isLevelUnlocked(lvl);

                return (
                  <button
                    key={lvl.id}
                    disabled={!levelUnlocked}
                    onClick={() => {
                      if (!levelUnlocked) return;
                      setActiveTab('games');
                      setSelectedLevelIdx(LEVEL_DEFS.findIndex(x => x.id === lvl.id));
                    }}
                    className={`min-h-20 w-full rounded-xl text-left p-3.5 border flex items-center justify-between transition-all ${
                      isActive ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg' : levelUnlocked ? 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200' : 'bg-slate-900/70 border-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <span className="block text-[8px] font-black uppercase tracking-wider opacity-60">Level {lvl.id}</span>
                      <span className="block text-xs font-bold truncate">{lvl.name}</span>
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      {isCleared && (
                        <div className="flex space-x-0.5">
                          {Array.from({ length: starsCount }).map((_, i) => (
                            <TempleIcon key={i} name="star" className="h-4 w-4 text-yellow-400" />
                          ))}
                        </div>
                      )}
                      {!levelUnlocked && <TempleIcon name="lock" className="h-5 w-5 text-slate-600" />}
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Phase Quiz Test Button */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <p className="hidden text-xs font-semibold text-slate-400 md:block">Complete every chamber, then prove your knowledge in the Guardian Trial.</p>
            <button
              onClick={startQuiz}
              disabled={!phaseMastered}
              className={`shrink-0 rounded-xl px-6 py-3.5 border text-center font-black uppercase text-xs tracking-wider transition ${
                activeTab === 'test' ? 'bg-amber-400 text-slate-950 border-amber-300' : phaseMastered ? 'bg-amber-400 border-amber-300 text-slate-950 hover:bg-amber-300' : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              {phaseMastered ? `Enter Phase ${activePhase} Trial` : `Master all ${phaseLevels.length} chambers first`}
            </button>
          </div>

          {/* Level Editor Tools Panel */}
          {isEditorMode && (
            <div className="border-t pt-4 space-y-3">
              <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">Editor Palette</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setEditorStarToggle(false);
                    setEditorRobotPlacement(false);
                    setEditorPaintColor('white');
                  }}
                  className={`p-2 border text-[10px] font-bold uppercase ${editorPaintColor === 'white' && !editorStarToggle && !editorRobotPlacement ? 'bg-[#0B2545] text-white' : 'bg-slate-50'}`}
                >
                  White path
                </button>
                <button
                  onClick={() => {
                    setEditorStarToggle(false);
                    setEditorRobotPlacement(false);
                    setEditorPaintColor('red');
                  }}
                  className={`p-2 border text-[10px] font-bold uppercase ${editorPaintColor === 'red' && !editorStarToggle && !editorRobotPlacement ? 'bg-[#0B2545] text-white' : 'bg-slate-50'}`}
                >
                  Red path
                </button>
                <button
                  onClick={() => {
                    setEditorStarToggle(false);
                    setEditorRobotPlacement(false);
                    setEditorPaintColor('green');
                  }}
                  className={`p-2 border text-[10px] font-bold uppercase ${editorPaintColor === 'green' && !editorStarToggle && !editorRobotPlacement ? 'bg-[#0B2545] text-white' : 'bg-slate-50'}`}
                >
                  Green path
                </button>
                <button
                  onClick={() => {
                    setEditorStarToggle(false);
                    setEditorRobotPlacement(false);
                    setEditorPaintColor('blue');
                  }}
                  className={`p-2 border text-[10px] font-bold uppercase ${editorPaintColor === 'blue' && !editorStarToggle && !editorRobotPlacement ? 'bg-[#0B2545] text-white' : 'bg-slate-50'}`}
                >
                  Blue path
                </button>
                <button
                  onClick={() => {
                    setEditorStarToggle(true);
                    setEditorRobotPlacement(false);
                  }}
                  className={`p-2 border text-[10px] font-bold uppercase ${editorStarToggle ? 'bg-[#0B2545] text-white' : 'bg-slate-50'}`}
                >
                  Star tool
                </button>
                <button
                  onClick={() => {
                    setEditorRobotPlacement(true);
                    setEditorStarToggle(false);
                  }}
                  className={`p-2 border text-[10px] font-bold uppercase ${editorRobotPlacement ? 'bg-[#0B2545] text-white' : 'bg-slate-50'}`}
                >
                  Robot place
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: RoboZZle Interactive Board (9 Cols) */}
        <div className="flex flex-col gap-4">
          
          {activeTab === 'games' && (
            <div className="grid items-start gap-5 rounded-[1.5rem] border border-emerald-300/20 bg-slate-100 p-4 shadow-2xl lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,.75fr)]">
              <div className={`rounded-2xl bg-gradient-to-r ${activePhaseInfo.color} p-[1px] lg:col-span-2`}>
                <div className="flex flex-col gap-3 rounded-2xl bg-slate-950/90 p-4 text-white sm:flex-row sm:items-center sm:justify-between">
                  <div><span className="text-[9px] font-black uppercase tracking-[.22em] text-emerald-300">Learning objective</span><p className="mt-1 text-sm font-bold">{activeLevel.desc}</p></div>
                  <div className="flex shrink-0 gap-2 text-center"><div className="rounded-xl bg-white/10 px-3 py-2"><b className="block text-lg text-amber-300">{activeLevel.stars.length}</b><span className="text-[8px] uppercase text-slate-400">Targets</span></div><div className="rounded-xl bg-white/10 px-3 py-2"><b className="block text-lg text-cyan-300">{activeLevel.minCmdsFor3Stars}</b><span className="text-[8px] uppercase text-slate-400">3-star budget</span></div></div>
                </div>
              </div>
              
              {/* PLAY GRID VIEWPORT */}
              <div className="relative flex min-h-[520px] flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border border-amber-300/25 bg-[radial-gradient(circle_at_center,#155e75_0,#0f3b46_42%,#071a2d_100%)] p-5 shadow-inner lg:row-span-3">
                <div className="pointer-events-none absolute inset-5 rounded-[1.25rem] border border-amber-200/10" />
                <div className="pointer-events-none absolute left-[8%] top-[18%] h-24 w-24 rounded-full bg-cyan-300/10 blur-3xl" /><div className="pointer-events-none absolute bottom-[12%] right-[5%] h-32 w-32 rounded-full bg-amber-300/10 blur-3xl" />
                <div className="mb-5 flex w-full max-w-[760px] items-center justify-between text-white"><div><span className="text-[9px] font-black uppercase tracking-[.2em] text-amber-300">Temple chamber</span><b className="block text-lg">Guide the light core to every crystal</b></div><span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black">{displayedStarsLeft} crystal{displayedStarsLeft === 1 ? '' : 's'} left</span></div>
                <div
                  className="relative z-10 grid max-w-full overflow-auto rounded-[1.5rem] border-4 border-amber-300/40 bg-slate-950/80 p-3 shadow-2xl"
                  style={{
                    gridTemplateColumns: `repeat(${visibleCols.length}, minmax(34px, 54px))`,
                    gap: '4px'
                  }}
                >
                  {visibleRows.map((r) =>
                    visibleCols.map((c) => {
                      const cell = gridState[r]?.[c];
                      if (!cell) return null;
                      const isRobot = isPlaying ? (runtimeRobot.r === r && runtimeRobot.c === c) : (robot.r === r && robot.c === c);
                      const currentRobot = isPlaying ? runtimeRobot : robot;
                      const hasStar = cell.hasStar;

                      return (
                        <div
                          key={`${r}-${c}`}
                          onClick={() => handleEditorCellClick(r, c)}
                          className={`relative aspect-square min-h-[34px] rounded-lg flex items-center justify-center transition-all ${isEditorMode ? 'cursor-crosshair hover:opacity-85' : ''} ${
                            cell.color === 'gray' ? 'bg-slate-800/55 opacity-35' :
                            cell.color === 'red' ? 'bg-[#ef4444]' :
                            cell.color === 'blue' ? 'bg-[#3b82f6]' :
                            cell.color === 'green' ? 'bg-[#22c55e]' :
                            'bg-amber-50 shadow-[inset_0_0_0_2px_rgba(251,191,36,.22),0_4px_12px_rgba(0,0,0,.25)]'
                          }`}
                        >
                          {isRobot && (
                            <span className="grid h-[85%] w-[85%] place-items-center rounded-full bg-cyan-300 font-extrabold text-slate-950 text-sm select-none shadow-[0_0_16px_rgba(34,211,238,.9)] transform transition-transform">
                              {getDirArrowSymbol(currentRobot.dir)}
                            </span>
                          )}
                          {!isRobot && hasStar && (
                            <TempleIcon name="star" className="h-7 w-7 text-yellow-400 drop-shadow animate-pulse" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* EXECUTION HISTORY (Bottom Left) */}
              <div className="rounded-2xl border border-slate-700 bg-slate-950 p-4 text-white flex flex-col justify-between gap-4">
                <div className="flex-1 w-full overflow-hidden">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Live execution trail
                  </span>
                  
                  <div className="flex gap-1 overflow-x-auto whitespace-nowrap py-1">
                    {executionHistory.length === 0 ? (
                      <span className="text-slate-450 italic text-[10px] p-1">No instructions executed yet.</span>
                    ) : (
                      executionHistory.map((hist, idx) => {
                        const isActive = idx === activeHistIdx;
                        return (
                          <div
                            key={hist.id}
                            className={`px-2.5 py-1 text-[10.5px] font-bold border transition ${
                              isActive ? 'bg-[#ef4444] text-white border-[#ef4444]' : 'bg-slate-50 border-slate-250 text-slate-700'
                            }`}
                          >
                            <span>{getCmdSymbol(hist.cmd)}</span>
                            {hist.cond && hist.cond !== 'none' && (
                              <span className={`inline-block ml-1 h-2 w-2 rounded-full ${
                                hist.cond === 'red' ? 'bg-[#ef4444]' :
                                hist.cond === 'blue' ? 'bg-[#3b82f6]' :
                                'bg-[#22c55e]'
                              }`} />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* BOTTOM RIGHT CONTROLS */}
                <div className="grid grid-cols-5 gap-2 rounded-xl bg-white/5 p-2">
                  <button
                    onClick={handlePlay}
                    disabled={isPlaying && !isPaused}
                    className="rounded-xl p-3 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs shadow transition active:scale-95 disabled:opacity-30"
                    title="Play"
                  >
                    <TempleIcon name="play" className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setIsPaused(prev => !prev)}
                    disabled={!isPlaying}
                    className="rounded-xl p-3 bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs shadow transition active:scale-95 disabled:opacity-30"
                    title="Pause"
                  >
                    <TempleIcon name="pause" className="h-6 w-6" />
                  </button>
                  <button
                    onClick={handleStep}
                    className="rounded-xl p-3 bg-violet-500 hover:bg-violet-400 text-white font-extrabold text-xs shadow transition active:scale-95"
                    title="Step Forward"
                  >
                    <TempleIcon name="step" className="h-6 w-6" />
                  </button>
                  <button
                    onClick={handleReset}
                    className="rounded-xl p-3 bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs shadow transition active:scale-95"
                    title="Restart"
                  >
                    <TempleIcon name="reset" className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => {
                      const next = executionSpeed === 350 ? 120 : executionSpeed === 120 ? 600 : 350;
                      setExecutionSpeed(next);
                    }}
                    className="rounded-xl p-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow transition active:scale-95"
                    title={`Speed: ${executionSpeed === 600 ? 'Slow' : executionSpeed === 120 ? 'Fast' : 'Normal'}`}
                  >
                    <TempleIcon name="speed" className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* EDITOR GRID & FUNCTION SLOTS */}
              <div className="grid gap-4 items-start">
                
                {/* BOTTOM CENTER: Commands, Conditions, Brushes (5 Cols) */}
                <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm space-y-4">
                  
                  {/* Commands */}
                  <div>
                    <span className="block text-[10px] uppercase font-black tracking-[.18em] text-emerald-700 mb-2">Command stones</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'up', icon: 'forward' as const, label: 'Move forward' },
                        { name: 'ccw', icon: 'turn-left' as const, label: 'Turn left' },
                        { name: 'cw', icon: 'turn-right' as const, label: 'Turn right' },
                        { name: 'f1', icon: 'f1' as const, label: 'Call function one' },
                        { name: 'f2', icon: 'f2' as const, label: 'Call function two' }
                      ].map(cmd => {
                        const isSelected = selectedPaletteItem?.type === 'cmd' && selectedPaletteItem?.name === cmd.name;
                        return (
                          <button
                            key={cmd.name}
                            draggable="true"
                            aria-label={cmd.label}
                            title={cmd.label}
                            onDragStart={(e) => handleDragStart(e, 'cmd', cmd.name)}
                            onClick={() => setSelectedPaletteItem({ type: 'cmd', name: cmd.name })}
                            className={`h-12 min-w-12 rounded-xl border-2 px-3 text-sm font-black uppercase flex items-center justify-center transition active:scale-95 ${
                              isSelected ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg' : 'bg-slate-50 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-800 shadow-sm'
                            }`}
                          >
                            <TempleIcon name={cmd.icon} className="h-7 w-7" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Conditions */}
                  <div>
                    <span className="block text-[10px] uppercase font-black tracking-[.18em] text-sky-700 mb-2">If tile is...</span>
                    <div className="flex gap-1.5">
                      <button
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, 'cond', 'none')}
                        onClick={() => setSelectedPaletteItem({ type: 'cond', name: 'none' })}
                        className={`px-2.5 py-1.5 border text-[10px] font-bold uppercase transition ${
                          selectedPaletteItem?.type === 'cond' && selectedPaletteItem?.name === 'none'
                            ? 'bg-[#0B2545] text-white border-[#0B2545]'
                            : 'bg-white border-slate-350 text-slate-700'
                        }`}
                      >
                        Always
                      </button>
                      {[
                        { name: 'red', color: 'bg-[#ef4444]' },
                        { name: 'blue', color: 'bg-[#3b82f6]' },
                        { name: 'green', color: 'bg-[#22c55e]' }
                      ].map(cond => {
                        const isSelected = selectedPaletteItem?.type === 'cond' && selectedPaletteItem?.name === cond.name;
                        return (
                          <button
                            key={cond.name}
                            draggable="true"
                            onDragStart={(e) => handleDragStart(e, 'cond', cond.name)}
                            onClick={() => setSelectedPaletteItem({ type: 'cond', name: cond.name })}
                            className={`h-10 w-10 rounded-xl border-2 flex items-center justify-center transition ${cond.color} ${
                              isSelected ? 'ring-2 ring-[#0B2545] border-white' : 'border-slate-350'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Brushes */}
                  <div>
                    <span className="block text-[10px] uppercase font-black tracking-[.18em] text-violet-700 mb-2">Magic paint</span>
                    <div className="flex gap-1.5">
                      {[
                        { name: 'red', color: 'bg-[#ef4444]' },
                        { name: 'blue', color: 'bg-[#3b82f6]' },
                        { name: 'green', color: 'bg-[#22c55e]' }
                      ].map(brush => {
                        const isSelected = selectedPaletteItem?.type === 'brush' && selectedPaletteItem?.name === brush.name;
                        return (
                          <button
                            key={brush.name}
                            draggable="true"
                            onDragStart={(e) => handleDragStart(e, 'brush', brush.name)}
                            onClick={() => setSelectedPaletteItem({ type: 'brush', name: brush.name })}
                            className={`h-10 w-10 rounded-xl border-2 flex items-center justify-center transition relative ${brush.color} ${
                              isSelected ? 'ring-2 ring-[#0B2545] border-white' : 'border-slate-350'
                            }`}
                          >
                            <span className="absolute bottom-0.5 right-0.5 text-[8px] text-white">🖌️</span>
                          </button>
                        );
                      })}
                      
                      {/* Eraser */}
                      <button
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, 'eraser', 'eraser')}
                        onClick={() => setSelectedPaletteItem({ type: 'eraser', name: 'eraser' })}
                        className={`px-2.5 py-1.5 border text-[10px] font-bold uppercase transition ${
                          selectedPaletteItem?.type === 'eraser'
                            ? 'bg-[#ef4444] text-white border-[#ef4444]'
                            : 'bg-white border-slate-350 text-slate-700'
                        }`}
                      >
                        Eraser
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t flex gap-2">
                    <button
                      onClick={clearAllSlots}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center space-x-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Clear functions</span>
                    </button>
                    <button
                      onClick={handleUndo}
                      disabled={undoStack.length === 0 || isPlaying}
                      className="p-2 border bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50"
                      title="Undo"
                    >
                      <Undo2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={handleRedo}
                      disabled={redoStack.length === 0 || isPlaying}
                      className="p-2 border bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-50"
                      title="Redo"
                    >
                      <Redo2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </div>

                {/* FUNCTIONS AREA: F1 and F2 horizontal blocks (7 Cols) */}
                <div className="rounded-2xl border border-violet-200 bg-white p-4 shadow-sm space-y-4">
                  <span className="block text-[10px] font-black text-violet-700 uppercase tracking-[.18em] mb-1.5">Program altar · Build reusable spells</span>
                  
                  {/* F1 Block */}
                  <div className="flex items-center space-x-3 rounded-xl bg-violet-50 p-3 border-2 border-violet-100">
                    <div className="h-11 w-11 rounded-xl bg-violet-600 text-white font-black text-xs uppercase flex items-center justify-center shrink-0 shadow-md">
                      f1
                    </div>
                    <div className="flex-1 flex gap-1 overflow-x-auto whitespace-nowrap">
                      {f1.map((slot, index) => (
                        <div
                          key={index}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDropOnSlot(e, 'f1', index)}
                          onClick={() => handleSlotClick('f1', index)}
                          className={`relative h-12 w-12 rounded-xl border-2 flex items-center justify-center cursor-pointer transition ${
                            slot.cmd ? 'bg-white border-violet-400 shadow-sm' : 'bg-white/70 border-dashed border-violet-200 hover:border-violet-400'
                          }`}
                        >
                          {/* Color marker condition badge */}
                          {slot.cond && slot.cond !== 'none' && (
                            <span className={`absolute top-0.5 left-0.5 h-2 w-2 rounded-full ${
                              slot.cond === 'red' ? 'bg-[#ef4444]' :
                              slot.cond === 'blue' ? 'bg-[#3b82f6]' :
                              'bg-[#22c55e]'
                            }`} />
                          )}
                          <span className="text-xs font-black uppercase text-slate-800">
                            {getCmdSymbol(slot.cmd)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* F2 Block */}
                  {activeLevel.maxF2Slots > 0 && (
                    <div className="flex items-center space-x-3 rounded-xl bg-sky-50 p-3 border-2 border-sky-100">
                      <div className="h-11 w-11 rounded-xl bg-sky-600 text-white font-black text-xs uppercase flex items-center justify-center shrink-0 shadow-md">
                        f2
                      </div>
                      <div className="flex-1 flex gap-1 overflow-x-auto whitespace-nowrap">
                        {f2.map((slot, index) => (
                          <div
                            key={index}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDropOnSlot(e, 'f2', index)}
                            onClick={() => handleSlotClick('f2', index)}
                            className={`relative h-12 w-12 rounded-xl border-2 flex items-center justify-center cursor-pointer transition ${
                              slot.cmd ? 'bg-white border-sky-400 shadow-sm' : 'bg-white/70 border-dashed border-sky-200 hover:border-sky-400'
                            }`}
                          >
                            {/* Color marker condition badge */}
                            {slot.cond && slot.cond !== 'none' && (
                              <span className={`absolute top-0.5 left-0.5 h-2 w-2 rounded-full ${
                                slot.cond === 'red' ? 'bg-[#ef4444]' :
                                slot.cond === 'blue' ? 'bg-[#3b82f6]' :
                                'bg-[#22c55e]'
                              }`} />
                            )}
                            <span className="text-xs font-black uppercase text-slate-800">
                              {getCmdSymbol(slot.cmd)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Console Logs */}
              <div className="h-32 overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-4 font-mono text-[10.5px] text-slate-300 shadow-inner">
                <span className="block text-gray-500 font-bold uppercase text-[9px] border-b border-navy-light/10 pb-1 mb-1">Execution output</span>
                {terminalLogs.map((log, idx) => {
                  const isSuccess = log.startsWith('🎉') || log.startsWith('✨');
                  const isCrash = log.startsWith('❌') || log.startsWith('💥');
                  return (
                    <div key={idx} className={isSuccess ? 'text-emerald-400 font-bold' : isCrash ? 'text-rose-450 font-bold' : 'text-slate-300'}>
                      {log}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 2: ACTIVE PHASE TEST ASSESSMENTS */}
          {activeTab === 'test' && (
            <div className="mx-auto max-w-3xl space-y-6 rounded-[1.75rem] border border-amber-300/30 bg-white p-6 shadow-2xl md:p-8">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="text-lg font-black uppercase text-slate-800">
                    Phase {activePhase} Assessment
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Correctly answer all multiple-choice questions to unlock the next levels.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('games')}
                  className="text-xs font-bold text-navy-deep hover:text-maple-red uppercase transition"
                >
                  Back to Grid Map
                </button>
              </div>

              {!quizCompleted ? (
                <div className="space-y-6">
                  {/* Progress tracker */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-black">
                    <span>Question {quizIdx + 1} of {PHASE_QUIZZES[activePhase].length}</span>
                    <span>Current Score: {quizScore} correct</span>
                  </div>

                  {/* Question Prompt */}
                  <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-base font-bold leading-relaxed text-slate-850">
                    {PHASE_QUIZZES[activePhase][quizIdx].q}
                  </div>

                  {/* Options List */}
                  <div className="grid gap-3.5">
                    {PHASE_QUIZZES[activePhase][quizIdx].options.map((opt, oIdx) => {
                      const isSelected = quizAnswers[quizIdx] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectQuizOption(oIdx)}
                          className={`w-full rounded-2xl text-left p-4 text-xs font-bold border-2 transition-all ${
                            isSelected
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg -translate-y-0.5'
                              : 'bg-white border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 text-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <button
                      onClick={submitQuizAnswer}
                      disabled={quizAnswers[quizIdx] === undefined}
                      className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      <span>{quizIdx + 1 === PHASE_QUIZZES[activePhase].length ? 'Finish Quiz' : 'Next Question'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 space-y-6 animate-fade-in">
                  {quizError ? (
                    <div className="space-y-4">
                      <div className="text-5xl">❌</div>
                      <h4 className="text-lg font-black uppercase text-rose-650">Test Evaluation Failed</h4>
                      <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto leading-relaxed">
                        You scored <span className="font-extrabold text-slate-800">{quizScore} / {PHASE_QUIZZES[activePhase].length}</span> correct.
                        To pass, you must answer all logic questions correctly. Review the levels and try again!
                      </p>
                      <button
                        onClick={startQuiz}
                        className="inline-flex items-center bg-[#0B2545] hover:bg-maple-red text-white font-black uppercase tracking-wider text-xs px-6 py-3 rounded-none shadow transition"
                      >
                        <span>Retry Assessment</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-5xl">🏆</div>
                      <h4 className="text-lg font-black uppercase text-emerald-650">Phase {activePhase} Assessment Passed!</h4>
                      <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto leading-relaxed">
                        Perfect score! You got <span className="font-extrabold text-slate-800">3 / 3</span> correct.
                        You have unlocked the next Logic Phase pathways and earned +100 XP!
                      </p>
                      <button
                        onClick={() => {
                          const nextP = activePhase + 1;
                          if (nextP <= 5 && unlockedPhases.includes(nextP)) {
                            handlePhaseChange(nextP);
                          } else {
                            setActiveTab('games');
                          }
                        }}
                        className="inline-flex bg-[#0B2545] hover:bg-maple-red text-white font-black uppercase tracking-wider text-xs px-6 py-3 rounded-none shadow transition"
                      >
                        <span>Continue Logic Path</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
}

const PHASE_QUIZZES: Record<number, QuizQuestion[]> = {
  1: [
    {
      q: "What happens if a robot is at row 7, column 3 facing East and receives the commands [Move Forward, Move Forward]?",
      options: [
        "It moves to row 7, column 5, facing East",
        "It moves to row 5, column 3, facing North",
        "It moves to row 7, column 5, facing West",
        "It moves to row 9, column 3, facing South"
      ],
      correct: 0
    },
    {
      q: "If the robot faces North and receives the command 'Turn Right' (CW), which direction is it facing now?",
      options: ["South", "West", "East", "North"],
      correct: 2
    },
    {
      q: "What is the purpose of the gray grid cells in the play area?",
      options: [
        "They are walkable paths",
        "They represent walls/obstacles that cause a crash if stepped on",
        "They automatically paint the robot red",
        "They are star targets to collect"
      ],
      correct: 1
    }
  ],
  2: [
    {
      q: "If the current tile color is Red, and a command has a Green condition marker attached to it, will the command execute?",
      options: [
        "Yes, green matches red",
        "No, because the tile color (Red) does not match the green condition",
        "Yes, but it paints the tile green first",
        "It causes an immediate program crash"
      ],
      correct: 1
    },
    {
      q: "How can you make a robot turn only when stepping on a Blue tile?",
      options: [
        "Add a 'Turn Right' or 'Turn Left' command and set its condition to Blue",
        "Color the tile red using a brush tool",
        "Write a separate function F2 and call it always",
        "Press the play button twice when on a blue tile"
      ],
      correct: 0
    },
    {
      q: "If a command has the condition 'Always' (none), when will it execute?",
      options: [
        "Only on white/empty path tiles",
        "On any tile color, regardless of what color the robot is stepping on",
        "Only on red, blue, and green colored tiles",
        "Only when calling F1 recursively"
      ],
      correct: 1
    }
  ],
  3: [
    {
      q: "What is recursion in the context of programming logic in RoboZZle?",
      options: [
        "A function calling itself (e.g., F1 containing a call to F1)",
        "Executing commands step-by-step manually",
        "Clearing all function slots with the trash button",
        "Stepping off the boundaries of the grid"
      ],
      correct: 0
    },
    {
      q: "If F1 contains: [Move Forward, Call F2] and F2 contains [Turn Left, Call F1], what behavior does this create?",
      options: [
        "The robot moves once, turns left, and halts",
        "An alternating loop of moving forward and turning left indefinitely",
        "The robot crashes immediately on start",
        "The robot paints all cells on its path red"
      ],
      correct: 1
    },
    {
      q: "What happens if a function executes its last command slot and the call stack is empty?",
      options: [
        "The robot crashes because it has no instructions",
        "The execution halts successfully (victory if all stars are collected)",
        "The robot restarts from the start cell automatically",
        "It triggers a Call F1 by default"
      ],
      correct: 1
    }
  ],
  4: [
    {
      q: "What is the stack depth limit in this logic arena execution engine?",
      options: ["10 calls", "50 calls", "100 calls", "Infinite"],
      correct: 1
    },
    {
      q: "If you want to create a recursive loop that terminates when a star is collected, what is the best strategy?",
      options: [
        "Use conditional paint commands to change tile colors, then use color-conditional recursive calls",
        "Fill all slots of F1 and F2 with the Move Forward command",
        "Decrease the speed control slider to slow execution",
        "Manually click pause when the robot is on the star"
      ],
      correct: 0
    },
    {
      q: "In a nested recursion F1 -> F2 -> F1, how are the return pointers managed?",
      options: [
        "Using a stack (LIFO) where each function call pushes a new frame and returning pops it",
        "They are stored in localStorage",
        "Using a queue (FIFO) where calls are executed in sequence",
        "They are not managed, causing an immediate crash"
      ],
      correct: 0
    }
  ],
  5: [
    {
      q: "What does the Paint Red command do when executed?",
      options: [
        "Paints the cell the robot is currently standing on Red",
        "Paints the cell in front of the robot Red",
        "Paints the entire path Red",
        "Checks if the current cell is Red"
      ],
      correct: 0
    },
    {
      q: "How can painting tiles dynamically help in solving infinite loops on blank maps?",
      options: [
        "By marking cells so the robot can use color conditions to turn or change behavior on future visits",
        "By increasing the player's star score",
        "It disables the boundaries of the grid",
        "It automatically collects nearby stars"
      ],
      correct: 0
    },
    {
      q: "For expert puzzles, what is the key to optimizing code to fit within the small slot budget?",
      options: [
        "Using recursion and color-based conditional triggers to reuse instruction sequences",
        "Adding more slots to F1 in the level editor",
        "Pasting the same commands in all slots of F1 and F2",
        "Pressing the Step button very rapidly"
      ],
      correct: 0
    }
  ]
};

// Helpers
const createEmptyGrid = (rows: number, cols: number, color: Cell['color'] = 'gray'): Cell[][] => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ color, hasStar: false }))
  );
};

const getCmdSymbol = (cmd: CommandSlot['cmd']) => {
  if (cmd === 'up') return <TempleIcon name="forward" className="h-6 w-6" />;
  if (cmd === 'ccw') return <TempleIcon name="turn-left" className="h-6 w-6" />;
  if (cmd === 'cw') return <TempleIcon name="turn-right" className="h-6 w-6" />;
  if (cmd === 'f1') return <TempleIcon name="f1" className="h-6 w-6" />;
  if (cmd === 'f2') return <TempleIcon name="f2" className="h-6 w-6" />;
  if (cmd === 'paint_red') return <TempleIcon name="paint-red" className="h-6 w-6" />;
  if (cmd === 'paint_green') return <TempleIcon name="paint-green" className="h-6 w-6" />;
  if (cmd === 'paint_blue') return <TempleIcon name="paint-blue" className="h-6 w-6" />;
  return null;
};
