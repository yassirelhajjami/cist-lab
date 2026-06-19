// src/app/(student)/games/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Gamepad2,
  Play,
  Award,
  RotateCcw,
  AlertTriangle,
  HelpCircle,
  Terminal,
  RefreshCw,
  Cpu,
  Star,
  ShieldCheck,
  ChevronRight,
  Lock,
  CheckCircle2,
  ArrowUp,
  RotateCcw as RotateLeft,
  RotateCw as RotateRight,
  Eraser,
  Trash2
} from 'lucide-react';

// =========================================================================
// TYPES & CONTEXTS
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
  cmd: 'up' | 'ccw' | 'cw' | 'f1' | 'f2' | null;
  cond: 'none' | 'red' | 'blue' | 'green' | null;
}

interface LevelConfig {
  id: number;
  name: string;
  phase: number;
  rows: number;
  cols: number;
  grid: Cell[][];
  start: RobotState;
  desc: string;
  allowedCmds: ('up' | 'ccw' | 'cw' | 'f1' | 'f2')[];
  allowedConds: ('none' | 'red' | 'blue' | 'green')[];
  maxF1Slots: number;
  maxF2Slots: number;
}

// Helper to make initial grids
const createEmptyGrid = (rows: number, cols: number, color: Cell['color'] = 'gray'): Cell[][] => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ color, hasStar: false }))
  );
};

// =========================================================================
// 9 PROGRESSIVE LEVELS CONFIGURATION
// =========================================================================
const getLevelsConfig = (): LevelConfig[] => {
  // --- PHASE 1 LEVELS (No functions, no conditions) ---
  const lvl1: LevelConfig = {
    id: 1,
    name: 'Level 1: Straight Pathway',
    phase: 1,
    rows: 5,
    cols: 5,
    grid: createEmptyGrid(5, 5, 'gray'),
    start: { r: 2, c: 0, dir: 'E' },
    desc: 'Sequence simple moves to drive the robot directly to the star. Stepping on gray crashes!',
    allowedCmds: ['up'],
    allowedConds: ['none'],
    maxF1Slots: 5,
    maxF2Slots: 0
  };
  // Path on row 2
  for (let c = 0; c < 5; c++) lvl1.grid[2][c].color = 'white';
  lvl1.grid[2][4].hasStar = true;

  const lvl2: LevelConfig = {
    id: 2,
    name: 'Level 2: Corner Turning',
    phase: 1,
    rows: 5,
    cols: 5,
    grid: createEmptyGrid(5, 5, 'gray'),
    start: { r: 4, c: 1, dir: 'N' },
    desc: 'Turn corner directions carefully using Left or Right rotations to secure the star.',
    allowedCmds: ['up', 'ccw', 'cw'],
    allowedConds: ['none'],
    maxF1Slots: 6,
    maxF2Slots: 0
  };
  // Path L-shape
  for (let r = 1; r <= 4; r++) lvl2.grid[r][1].color = 'white';
  for (let c = 1; c <= 3; c++) lvl2.grid[1][c].color = 'white';
  lvl2.grid[1][3].hasStar = true;

  const lvl3: LevelConfig = {
    id: 3,
    name: 'Level 3: Multi-Star Path',
    phase: 1,
    rows: 6,
    cols: 6,
    grid: createEmptyGrid(6, 6, 'gray'),
    start: { r: 5, c: 1, dir: 'N' },
    desc: 'Plan a sequence that drives the robot to collect both target stars on the path.',
    allowedCmds: ['up', 'ccw', 'cw'],
    allowedConds: ['none'],
    maxF1Slots: 8,
    maxF2Slots: 0
  };
  // Zig-zag path
  for (let r = 3; r <= 5; r++) lvl3.grid[r][1].color = 'white';
  for (let c = 1; c <= 4; c++) lvl3.grid[3][c].color = 'white';
  for (let r = 1; r <= 3; r++) lvl3.grid[r][4].color = 'white';
  lvl3.grid[3][1].hasStar = true;
  lvl3.grid[1][4].hasStar = true;


  // --- PHASE 2 LEVELS (Functions enabled, no conditions) ---
  const lvl4: LevelConfig = {
    id: 4,
    name: 'Level 4: Repeating Staircase',
    phase: 2,
    rows: 6,
    cols: 6,
    grid: createEmptyGrid(6, 6, 'gray'),
    start: { r: 5, c: 0, dir: 'E' },
    desc: 'Use recursion! Setup F1 to perform a stair step, then call F1 to repeat it indefinitely.',
    allowedCmds: ['up', 'ccw', 'cw', 'f1'],
    allowedConds: ['none'],
    maxF1Slots: 4,
    maxF2Slots: 0
  };
  // Stair steps
  lvl4.grid[5][0].color = 'white';
  lvl4.grid[5][1].color = 'white'; lvl4.grid[5][1].hasStar = true;
  lvl4.grid[4][1].color = 'white';
  lvl4.grid[4][2].color = 'white'; lvl4.grid[4][2].hasStar = true;
  lvl4.grid[3][2].color = 'white';
  lvl4.grid[3][3].color = 'white'; lvl4.grid[3][3].hasStar = true;
  lvl4.grid[2][3].color = 'white';
  lvl4.grid[2][4].color = 'white'; lvl4.grid[2][4].hasStar = true;
  lvl4.grid[1][4].color = 'white';
  lvl4.grid[1][5].color = 'white'; lvl4.grid[1][5].hasStar = true;

  const lvl5: LevelConfig = {
    id: 5,
    name: 'Level 5: Double Loop Bridge',
    phase: 2,
    rows: 6,
    cols: 6,
    grid: createEmptyGrid(6, 6, 'gray'),
    start: { r: 4, c: 4, dir: 'W' },
    desc: 'Write reusable code block helpers inside F1 and F2 to traverse the looping bridges.',
    allowedCmds: ['up', 'ccw', 'cw', 'f1', 'f2'],
    allowedConds: ['none'],
    maxF1Slots: 4,
    maxF2Slots: 4
  };
  // Walkway
  for (let c = 1; c <= 4; c++) lvl5.grid[4][c].color = 'white';
  for (let r = 2; r <= 4; r++) lvl5.grid[r][1].color = 'white';
  for (let c = 1; c <= 4; c++) lvl5.grid[2][c].color = 'white';
  lvl5.grid[4][1].hasStar = true;
  lvl5.grid[2][1].hasStar = true;
  lvl5.grid[2][4].hasStar = true;

  const lvl6: LevelConfig = {
    id: 6,
    name: 'Level 6: Spiral Maze',
    phase: 2,
    rows: 6,
    cols: 6,
    grid: createEmptyGrid(6, 6, 'gray'),
    start: { r: 5, c: 0, dir: 'E' },
    desc: 'Program a recursive function that drives the robot along the spiral to collect the stars.',
    allowedCmds: ['up', 'ccw', 'cw', 'f1'],
    allowedConds: ['none'],
    maxF1Slots: 5,
    maxF2Slots: 0
  };
  for (let c = 0; c <= 5; c++) lvl6.grid[5][c].color = 'white';
  for (let r = 0; r <= 4; r++) lvl6.grid[r][5].color = 'white';
  for (let c = 0; c <= 4; c++) lvl6.grid[0][c].color = 'white';
  lvl6.grid[5][5].hasStar = true;
  lvl6.grid[0][5].hasStar = true;
  lvl6.grid[0][0].hasStar = true;


  // --- PHASE 3 LEVELS (Full conditions & color matching, matching screenshot) ---
  const lvl7: LevelConfig = {
    id: 7,
    name: 'Level 7: The Square Loop',
    phase: 3,
    rows: 12,
    cols: 12,
    grid: createEmptyGrid(12, 12, 'gray'),
    start: { r: 9, c: 3, dir: 'N' },
    desc: 'Match your program to the visual grid! Use Green condition blocks to turn on green stars, Red for paths, and secure all 5 stars.',
    allowedCmds: ['up', 'ccw', 'cw', 'f1', 'f2'],
    allowedConds: ['none', 'red', 'green'],
    maxF1Slots: 4,
    maxF2Slots: 4
  };
  // Grid layout from image:
  // Corners at:
  // Top-Left: [2, 3] -> Green, Star
  lvl7.grid[2][3] = { color: 'green', hasStar: true };
  // Top-Right: [2, 10] -> Green, Star
  lvl7.grid[2][10] = { color: 'green', hasStar: true };
  // Bottom-Right: [9, 10] -> Green, Star
  lvl7.grid[9][10] = { color: 'green', hasStar: true };
  // Bottom-Left: [9, 3] -> Green, Star (robot starts here)
  lvl7.grid[9][3] = { color: 'green', hasStar: true };

  // Tail:
  // [9, 2] -> Red, no star
  lvl7.grid[9][2] = { color: 'red', hasStar: false };
  // [9, 1] -> Green, Star
  lvl7.grid[9][1] = { color: 'green', hasStar: true };

  // Edges connecting them (all red):
  for (let r = 3; r <= 8; r++) {
    lvl7.grid[r][3] = { color: 'red', hasStar: false };
    lvl7.grid[r][10] = { color: 'red', hasStar: false };
  }
  for (let c = 4; c <= 9; c++) {
    lvl7.grid[2][c] = { color: 'red', hasStar: false };
    lvl7.grid[9][c] = { color: 'red', hasStar: false };
  }

  const lvl8: LevelConfig = {
    id: 8,
    name: 'Level 8: Alternating Colors',
    phase: 3,
    rows: 8,
    cols: 8,
    grid: createEmptyGrid(8, 8, 'gray'),
    start: { r: 5, c: 1, dir: 'E' },
    desc: 'Use Blue/Red conditions to separate turning directives on alternating color bands.',
    allowedCmds: ['up', 'ccw', 'cw', 'f1'],
    allowedConds: ['none', 'red', 'blue'],
    maxF1Slots: 5,
    maxF2Slots: 0
  };
  for (let c = 1; c <= 6; c++) {
    lvl8.grid[5][c] = {
      color: c % 2 === 0 ? 'red' : 'blue',
      hasStar: false
    };
  }
  lvl8.grid[5][3].hasStar = true;
  lvl8.grid[5][6].hasStar = true;

  const lvl9: LevelConfig = {
    id: 9,
    name: 'Level 9: RGB Color Collector',
    phase: 3,
    rows: 8,
    cols: 8,
    grid: createEmptyGrid(8, 8, 'gray'),
    start: { r: 6, c: 2, dir: 'N' },
    desc: 'Master the ultimate color-coded path. Combine Red, Blue, and Green conditions for full loops.',
    allowedCmds: ['up', 'ccw', 'cw', 'f1', 'f2'],
    allowedConds: ['none', 'red', 'blue', 'green'],
    maxF1Slots: 6,
    maxF2Slots: 6
  };
  // Path
  for (let r = 2; r <= 6; r++) {
    lvl9.grid[r][2] = { color: r % 2 === 0 ? 'red' : 'blue', hasStar: r === 2 };
    lvl9.grid[r][5] = { color: r % 2 === 0 ? 'green' : 'blue', hasStar: r === 6 };
  }
  for (let c = 3; c <= 4; c++) {
    lvl9.grid[2][c] = { color: 'green', hasStar: false };
    lvl9.grid[6][c] = { color: 'red', hasStar: false };
  }

  return [lvl1, lvl2, lvl3, lvl4, lvl5, lvl6, lvl7, lvl8, lvl9];
};

// =========================================================================
// QUIZZES FOR THE END OF PHASES
// =========================================================================
interface Question {
  q: string;
  options: string[];
  correct: number;
}

const PHASE_QUIZZES: Record<number, Question[]> = {
  1: [
    {
      q: "If a robot is facing North and executes 'Turn Right' followed by 'Turn Right', what direction is it facing?",
      options: ["East", "South", "West", "North"],
      correct: 1
    },
    {
      q: "A robot starts at row 0, column 0 facing East and moves Forward 3 times. What is its new position?",
      options: ["[0, 3]", "[3, 0]", "[3, 3]", "[0, 0]"],
      correct: 0
    },
    {
      q: "If a grid pathway has a brick wall (gray cell) at cell [2,2], what happens when the robot attempts to move forward into it?",
      options: [
        "It turns automatically to avoid it",
        "It crashes and the execution stops",
        "It jumps over the wall to next tile",
        "It waits for user to enter another code"
      ],
      correct: 1
    }
  ],
  2: [
    {
      q: "In algorithmic logic games like this, what is recursion?",
      options: [
        "A function that calls itself to repeat a sequence",
        "A loops that terminates instantly",
        "A syntax syntax check compilation error",
        "A database query command"
      ],
      correct: 0
    },
    {
      q: "If function F1 calls F2, and F2 recursively calls F1 without any conditional exit, what will happen?",
      options: [
        "The program executes normally and loops 10 times",
        "The robot moves twice as fast to the target",
        "A stack overflow / infinite loop crash will occur",
        "The web browser tab closes automatically"
      ],
      correct: 2
    },
    {
      q: "If F1 contains: [Forward, F1] and we run the code. What does it represent?",
      options: [
        "An infinite loop moving the robot forward continually",
        "Moving forward exactly once",
        "A syntax function call error",
        "A simple turning sequence"
      ],
      correct: 0
    }
  ],
  3: [
    {
      q: "How do color conditions help the robot navigate complex loops?",
      options: [
        "They allow executing actions only when standing on a matching colored cell",
        "They speed up the robot's movement automatically",
        "They modify the styling of the webpage",
        "They award extra CIST coins"
      ],
      correct: 0
    },
    {
      q: "If F1 contains: [If Red: turnRight, If Green: turnLeft, Forward]. What happens on a Blue cell?",
      options: [
        "The robot turns left",
        "The robot turns right",
        "The robot moves forward without turning",
        "The robot crashes immediately"
      ],
      correct: 2
    },
    {
      q: "If F1 contains: [If Green: F2, Forward] and F2 contains [turnLeft]. What does the robot do on a Green cell?",
      options: [
        "Turns left and then moves forward",
        "Only moves forward",
        "Only turns left",
        "Crashes"
      ],
      correct: 0
    }
  ]
};

// =========================================================================
// MAIN COMPONENT EXPORT
// =========================================================================
export default function LogicArena() {
  const { addXpAndCoins } = useApp();
  const allLevels = getLevelsConfig();

  // Load progress state from localStorage
  const [activeTab, setActiveTab] = useState<'games' | 'test'>('games');
  const [activePhase, setActivePhase] = useState<number>(1);
  const [selectedLevelIdx, setSelectedLevelIdx] = useState<number>(0);
  
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [unlockedPhases, setUnlockedPhases] = useState<number[]>([1]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLevels = localStorage.getItem('cist_logic_levels');
      const savedPhases = localStorage.getItem('cist_logic_phases');
      if (savedLevels) setCompletedLevels(JSON.parse(savedLevels));
      if (savedPhases) setUnlockedPhases(JSON.parse(savedPhases));
    }
  }, []);

  const saveProgress = (levels: number[], phases: number[]) => {
    setCompletedLevels(levels);
    setUnlockedPhases(phases);
    localStorage.setItem('cist_logic_levels', JSON.stringify(levels));
    localStorage.setItem('cist_logic_phases', JSON.stringify(phases));
  };

  const activeLevel = allLevels[selectedLevelIdx];

  // Game execution state variables
  const [gridState, setGridState] = useState<Cell[][]>([]);
  const [robot, setRobot] = useState<RobotState>({ r: 0, c: 0, dir: 'E' });
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [executionHistory, setExecutionHistory] = useState<string[]>([]);

  // Function Slot Builders
  const [f1, setF1] = useState<CommandSlot[]>([]);
  const [f2, setF2] = useState<CommandSlot[]>([]);
  const [activeSlot, setActiveSlot] = useState<{ fn: 'f1' | 'f2'; index: number } | null>(null);

  // Quiz state variables
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizError, setQuizError] = useState(false);

  // Notification Alerts
  const [alertMsg, setAlertMsg] = useState('');

  // Set the current level
  useEffect(() => {
    resetLevelState(activeLevel);
  }, [selectedLevelIdx]);

  const resetLevelState = (lvl: LevelConfig) => {
    // Deep copy grid
    const copyGrid: Cell[][] = lvl.grid.map(row => row.map(cell => ({ ...cell })));
    setGridState(copyGrid);
    setRobot({ ...lvl.start });
    setIsPlaying(false);
    setHasWon(false);
    setTerminalLogs([`Simulated grid initialized for "${lvl.name}". ready.`]);
    setExecutionHistory([]);
    setActiveSlot(null);

    // Reset functions with blank slots
    setF1(Array.from({ length: lvl.maxF1Slots }, () => ({ cmd: null, cond: 'none' })));
    setF2(Array.from({ length: lvl.maxF2Slots }, () => ({ cmd: null, cond: 'none' })));
  };

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 5500);
  };

  // =========================================================================
  // ROBOZZLE PUZZLE RUNTIME ENGINE
  // =========================================================================
  const handleRunExecution = () => {
    if (isPlaying || hasWon) return;

    // Check if F1 has any instruction
    const f1HasCmds = f1.some(slot => slot.cmd !== null);
    if (!f1HasCmds) {
      setTerminalLogs(prev => [...prev, '❌ ERROR: F1 is empty. Robot execution must start at F1.']);
      return;
    }

    setIsPlaying(true);
    setHasWon(false);
    setExecutionHistory([]);
    setTerminalLogs(prev => [...prev, '> Spawning execution thread starting at F1...']);

    // Setup working runtime variables
    let currentRobot = { ...activeLevel.start };
    let currentGrid = gridState.map(row => row.map(c => ({ ...c })));
    let starsRemaining = currentGrid.flat().filter(c => c.hasStar).length;
    
    // Call stack frame: { fn: 'f1' | 'f2', ip: number }
    let callStack: { fn: 'f1' | 'f2'; ip: number }[] = [{ fn: 'f1', ip: 0 }];
    let stepCount = 0;
    
    setRobot({ ...currentRobot });
    setGridState(currentGrid);

    timerRef.current = setInterval(() => {
      stepCount++;
      
      // Safety Limit to prevent infinite freezes
      if (stepCount > 300) {
        clearInterval(timerRef.current!);
        setIsPlaying(false);
        setTerminalLogs(prev => [...prev, '❌ RUNTIME CRASH: Infinite recursion limit hit (300 steps).']);
        return;
      }

      // If callstack is empty, execution halts
      if (callStack.length === 0) {
        clearInterval(timerRef.current!);
        setIsPlaying(false);
        if (starsRemaining === 0) {
          handleWinLevel();
        } else {
          setTerminalLogs(prev => [...prev, `❌ HALT: No instructions left. Stars remaining: ${starsRemaining}`]);
        }
        return;
      }

      // Stack Overflow safety check
      if (callStack.length > 50) {
        clearInterval(timerRef.current!);
        setIsPlaying(false);
        setTerminalLogs(prev => [...prev, '❌ RUNTIME CRASH: Stack overflow! Recursion depth exceeded 50.']);
        return;
      }

      // Fetch top frame
      let frame = callStack[callStack.length - 1];
      const slots = frame.fn === 'f1' ? f1 : f2;

      // Handle instruction pointer bounds
      if (frame.ip >= slots.length) {
        callStack.pop();
        return; // Next interval loop will handle the parent frame
      }

      const slot = slots[frame.ip];
      frame.ip++; // Advance IP

      // Skip blank slot
      if (!slot.cmd) {
        return;
      }

      // Check color condition
      const currentCell = currentGrid[currentRobot.r][currentRobot.c];
      const matchCond = slot.cond === 'none' || slot.cond === null || slot.cond === currentCell.color;

      if (!matchCond) {
        return; // Condition not met, skip execution of this slot
      }

      // Record visual history
      setExecutionHistory(prev => [...prev, `${frame.fn.toUpperCase()}[${frame.ip - 1}]`]);

      // Execute Action
      if (slot.cmd === 'up') {
        let nextR = currentRobot.r;
        let nextC = currentRobot.c;

        if (currentRobot.dir === 'N') nextR--;
        if (currentRobot.dir === 'E') nextC++;
        if (currentRobot.dir === 'S') nextR++;
        if (currentRobot.dir === 'W') nextC--;

        // Crash conditions
        if (nextR < 0 || nextR >= activeLevel.rows || nextC < 0 || nextC >= activeLevel.cols) {
          clearInterval(timerRef.current!);
          setIsPlaying(false);
          setTerminalLogs(prev => [...prev, `💥 CRASH: Robot went off-grid boundary at [${nextR}, ${nextC}]!`]);
          return;
        }

        const nextCell = currentGrid[nextR][nextC];
        if (nextCell.color === 'gray') {
          clearInterval(timerRef.current!);
          setIsPlaying(false);
          setTerminalLogs(prev => [...prev, `💥 CRASH: Stepped onto a gray cell at [${nextR}, ${nextC}]! Paths must follow colored tiles.`]);
          return;
        }

        // Move succeeded
        currentRobot.r = nextR;
        currentRobot.c = nextC;
        setRobot({ ...currentRobot });

        // Collect stars
        if (nextCell.hasStar) {
          nextCell.hasStar = false;
          starsRemaining--;
          setGridState(currentGrid.map(row => row.map(c => ({ ...c }))));
          setTerminalLogs(prev => [...prev, `✨ Star collected at [${nextR}, ${nextC}]! (${starsRemaining} left)`]);
          
          if (starsRemaining === 0) {
            clearInterval(timerRef.current!);
            setIsPlaying(false);
            handleWinLevel();
            return;
          }
        }
      } else if (slot.cmd === 'ccw') {
        const dirs: RobotState['dir'][] = ['N', 'W', 'S', 'E'];
        const idx = dirs.indexOf(currentRobot.dir);
        currentRobot.dir = dirs[(idx + 1) % 4];
        setRobot({ ...currentRobot });
      } else if (slot.cmd === 'cw') {
        const dirs: RobotState['dir'][] = ['N', 'E', 'S', 'W'];
        const idx = dirs.indexOf(currentRobot.dir);
        currentRobot.dir = dirs[(idx + 1) % 4];
        setRobot({ ...currentRobot });
      } else if (slot.cmd === 'f1') {
        callStack.push({ fn: 'f1', ip: 0 });
      } else if (slot.cmd === 'f2') {
        callStack.push({ fn: 'f2', ip: 0 });
      }

    }, 350); // Animated speed
  };

  const handleWinLevel = () => {
    setHasWon(true);
    setTerminalLogs(prev => [...prev, `🎉 VICTORY! Collected all stars successfully on ${activeLevel.name}!`]);
    
    // Add rewards once
    if (!completedLevels.includes(activeLevel.id)) {
      const newCompleted = [...completedLevels, activeLevel.id];
      saveProgress(newCompleted, unlockedPhases);
      addXpAndCoins(80, 20, `Completed Logic Level ${activeLevel.id}`);
      triggerAlert(`🎮 Level ${activeLevel.id} Cleared! Gained +80 XP & +20 CIST Coins!`);
    }
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    resetLevelState(activeLevel);
  };

  // Click slot to set edit mode
  const handleSlotClick = (fn: 'f1' | 'f2', index: number) => {
    if (isPlaying) return;
    setActiveSlot({ fn, index });
  };

  const updateActiveSlotCmd = (cmd: CommandSlot['cmd']) => {
    if (!activeSlot) return;
    const { fn, index } = activeSlot;
    if (fn === 'f1') {
      const copy = [...f1];
      copy[index] = { ...copy[index], cmd };
      setF1(copy);
    } else {
      const copy = [...f2];
      copy[index] = { ...copy[index], cmd };
      setF2(copy);
    }
  };

  const updateActiveSlotCond = (cond: CommandSlot['cond']) => {
    if (!activeSlot) return;
    const { fn, index } = activeSlot;
    if (fn === 'f1') {
      const copy = [...f1];
      copy[index] = { ...copy[index], cond };
      setF1(copy);
    } else {
      const copy = [...f2];
      copy[index] = { ...copy[index], cond };
      setF2(copy);
    }
  };

  // Helper values
  const getDirSymbol = (dir: RobotState['dir']) => {
    if (dir === 'N') return '▲';
    if (dir === 'E') return '►';
    if (dir === 'S') return '▼';
    return '◄';
  };

  const getCmdSymbol = (cmd: CommandSlot['cmd']) => {
    if (cmd === 'up') return '↑';
    if (cmd === 'ccw') return '↺';
    if (cmd === 'cw') return '↻';
    if (cmd === 'f1') return 'F1';
    if (cmd === 'f2') return 'F2';
    return '';
  };

  // =========================================================================
  // QUIZ HANDLERS
  // =========================================================================
  const startQuiz = () => {
    setQuizIdx(0);
    setQuizAnswers({});
    setQuizScore(0);
    setQuizCompleted(false);
    setQuizError(false);
    setActiveTab('test');
  };

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
      // Quiz finished
      setQuizCompleted(true);
      const passed = nextScore === questions.length;
      if (passed) {
        // Unlock next phase
        const nextPhase = activePhase + 1;
        const newPhases = [...unlockedPhases];
        if (!newPhases.includes(nextPhase) && nextPhase <= 3) {
          newPhases.push(nextPhase);
        }
        saveProgress(completedLevels, newPhases);
        addXpAndCoins(100, 25, `Passed Logic Phase ${activePhase} Test`);
        triggerAlert(`🏆 Passed Phase ${activePhase} Test! +100 XP rewarded!`);
      } else {
        setQuizError(true);
      }
    }
  };

  const handlePhaseChange = (phaseNum: number) => {
    if (!unlockedPhases.includes(phaseNum)) return;
    setActivePhase(phaseNum);
    setActiveTab('games');
    // Load first level of the phase
    const idx = allLevels.findIndex(lvl => lvl.phase === phaseNum);
    if (idx !== -1) setSelectedLevelIdx(idx);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
            <Cpu className="h-6 w-6 text-navy-deep animate-pulse" />
            <span>Logic Programming Arena</span>
          </h2>
          <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
            Solve progressive grid puzzles, declare functional sub-routines, and complete tests
          </p>
        </div>

        {/* Phase Badges */}
        <div className="flex gap-2">
          {[1, 2, 3].map(num => {
            const unlocked = unlockedPhases.includes(num);
            const active = activePhase === num && activeTab === 'games';
            return (
              <button
                key={num}
                onClick={() => handlePhaseChange(num)}
                disabled={!unlocked}
                className={`relative px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
                  active ? 'bg-navy-deep text-white shadow-md' :
                  unlocked ? 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50' :
                  'bg-slate-100 text-slate-400 border border-slate-150 cursor-not-allowed'
                }`}
              >
                {!unlocked && <Lock className="h-3 w-3" />}
                <span>Phase {num}</span>
              </button>
            );
          })}
        </div>
      </div>

      {alertMsg && (
        <div className="rounded-xl border border-emerald-250 bg-emerald-50 p-4 font-bold text-xs text-emerald-850 flex items-center space-x-2.5 shadow-sm animate-bounce">
          <Award className="h-5 w-5 text-emerald-600 animate-spin" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        
        {/* LEFT COLUMN: Map List & Status */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b pb-2">
              Phase {activePhase} Challenge List
            </span>
            <div className="space-y-2">
              {allLevels
                .filter(lvl => lvl.phase === activePhase)
                .map((lvl) => {
                  const isActive = activeLevel.id === lvl.id;
                  const isDone = completedLevels.includes(lvl.id);
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => {
                        setActiveTab('games');
                        setSelectedLevelIdx(allLevels.findIndex(x => x.id === lvl.id));
                      }}
                      className={`w-full text-left p-3 rounded-lg text-xs font-semibold border flex items-center justify-between transition-all ${
                        isActive
                          ? 'bg-navy-deep border-navy-deep text-white shadow-md translate-x-1'
                          : 'bg-white border-slate-150 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <span className="block font-black uppercase text-[9px] tracking-wider opacity-60">Level {lvl.id}</span>
                        <span className="block mt-0.5 truncate">{lvl.name.split(': ')[1]}</span>
                      </div>
                      {isDone && (
                        <CheckCircle2 className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                      )}
                    </button>
                  );
                })}
            </div>

            {/* Test at the end of phase */}
            <div className="pt-2">
              <button
                onClick={startQuiz}
                className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider border text-center transition flex items-center justify-center space-x-1.5 ${
                  activeTab === 'test'
                    ? 'bg-maple-red border-maple-red text-white shadow-lg'
                    : 'bg-white border-dashed border-slate-350 text-slate-750 hover:bg-slate-50'
                }`}
              >
                <span>Phase {activePhase} Assessment</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm text-xs space-y-3 leading-relaxed">
            <h5 className="font-black text-slate-700 uppercase tracking-wide flex items-center space-x-1">
              <HelpCircle className="h-4 w-4 text-navy-deep" />
              <span>Logic Guidelines</span>
            </h5>
            <p className="text-slate-550 font-medium">
              The goal of the robot is to traverse the colored paths and gather all target star nodes.
            </p>
            <p className="text-slate-550 font-medium">
              Click on function cells inside <strong>F1</strong> and <strong>F2</strong> to select them, then assign commands and optional color conditions.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Play Area / Quiz Quiz */}
        <div className="lg:col-span-9">
          
          {/* TAB 1: GAMEPLAY WORKSPACE */}
          {activeTab === 'games' && (
            <div className="grid gap-6 md:grid-cols-12 items-stretch">
              
              {/* Visual Canvas Block (7 Columns) */}
              <div className="md:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between items-center">
                <div className="w-full flex justify-between items-center border-b pb-3.5 mb-5">
                  <div>
                    <h3 className="font-black text-slate-800 text-sm uppercase leading-none">
                      {activeLevel.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1.5 leading-snug">
                      {activeLevel.desc}
                    </p>
                  </div>
                </div>

                {/* Grid Wrapper */}
                <div
                  className="grid bg-slate-100 p-3.5 rounded-2xl border border-slate-300 shadow-inner"
                  style={{
                    gridTemplateColumns: `repeat(${activeLevel.cols}, minmax(0, 1fr))`,
                    gap: activeLevel.id === 7 ? '2px' : '4px',
                    width: activeLevel.id === 7 ? '380px' : '280px',
                    height: activeLevel.id === 7 ? '380px' : '280px'
                  }}
                >
                  {gridState.map((row, r) =>
                    row.map((cell, c) => {
                      const isRobot = robot.r === r && robot.c === c;
                      const hasStar = cell.hasStar;
                      const isGray = cell.color === 'gray';

                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`relative rounded border aspect-square flex items-center justify-center transition-all ${
                            isGray ? 'bg-slate-250 border-slate-300' :
                            cell.color === 'red' ? 'bg-rose-500 border-rose-600' :
                            cell.color === 'blue' ? 'bg-sky-500 border-sky-600' :
                            cell.color === 'green' ? 'bg-emerald-500 border-emerald-600 animate-pulse' :
                            'bg-white border-slate-200'
                          }`}
                        >
                          {isRobot && (
                            <span className="font-extrabold text-white text-base drop-shadow-md select-none transform transition-transform">
                              {getDirSymbol(robot.dir)}
                            </span>
                          )}
                          {!isRobot && hasStar && (
                            <Star className="h-5 w-5 text-amber-300 fill-current drop-shadow animate-bounce" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Colors Legend */}
                {activeLevel.phase === 3 && (
                  <div className="mt-5 flex gap-4 text-[9px] uppercase font-black text-slate-450 tracking-wider">
                    <span className="flex items-center"><span className="h-3 w-3 rounded bg-rose-500 mr-1.5 block"></span> Red Path</span>
                    <span className="flex items-center"><span className="h-3 w-3 rounded bg-sky-500 mr-1.5 block"></span> Blue Path</span>
                    <span className="flex items-center"><span className="h-3 w-3 rounded bg-emerald-500 mr-1.5 block"></span> Green Corner</span>
                  </div>
                )}

                {/* Control Action Buttons */}
                <div className="w-full flex gap-3 mt-6 border-t pt-4">
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-1 border border-slate-350 hover:bg-slate-50 px-4 py-3 text-xs font-black uppercase text-slate-700 rounded-xl transition shadow-sm"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset</span>
                  </button>
                  
                  <button
                    onClick={handleRunExecution}
                    disabled={isPlaying || hasWon}
                    className="flex-1 flex items-center justify-center space-x-2 bg-navy-deep hover:bg-maple-red px-4 py-3 text-xs font-black uppercase text-white rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    <Play className="h-4 w-4 text-gold-accent fill-current" />
                    <span>Execute Program</span>
                  </button>
                </div>
              </div>

              {/* Function Editor Panel (5 Columns) */}
              <div className="md:col-span-5 flex flex-col justify-between gap-5">
                
                {/* Visual Function Editors */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
                  <div className="border-b pb-2 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Program Slots</span>
                    {activeSlot && (
                      <span className="text-[9px] bg-navy-deep/10 text-navy-deep px-2 py-0.5 rounded font-black uppercase">
                        Editing: {activeSlot.fn.toUpperCase()}[{activeSlot.index}]
                      </span>
                    )}
                  </div>

                  {/* F1 Grid Block */}
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold text-slate-800 flex items-center space-x-1">
                      <span className="bg-navy-deep text-white px-2 py-0.5 rounded text-[10px]">F1</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Primary Execution Thread</span>
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {f1.map((slot, index) => {
                        const isActive = activeSlot?.fn === 'f1' && activeSlot.index === index;
                        return (
                          <button
                            key={index}
                            onClick={() => handleSlotClick('f1', index)}
                            className={`relative h-11 border rounded-lg flex items-center justify-center font-black text-sm transition-all ${
                              isActive
                                ? 'border-navy-deep ring-2 ring-navy-deep/20 bg-slate-50'
                                : 'border-slate-200 bg-white hover:border-slate-400'
                            }`}
                          >
                            {/* Color Condition Badge */}
                            {slot.cond && slot.cond !== 'none' && (
                              <span className={`absolute top-0.5 left-0.5 h-2 w-2 rounded-full ${
                                slot.cond === 'red' ? 'bg-rose-500' :
                                slot.cond === 'blue' ? 'bg-sky-500' :
                                'bg-emerald-500'
                              }`} />
                            )}
                            <span className="text-slate-800">{getCmdSymbol(slot.cmd)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* F2 Grid Block */}
                  {activeLevel.maxF2Slots > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-extrabold text-slate-800 flex items-center space-x-1">
                        <span className="bg-navy-deep text-white px-2 py-0.5 rounded text-[10px]">F2</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Sub-Routine Helper</span>
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        {f2.map((slot, index) => {
                          const isActive = activeSlot?.fn === 'f2' && activeSlot.index === index;
                          return (
                            <button
                              key={index}
                              onClick={() => handleSlotClick('f2', index)}
                              className={`relative h-11 border rounded-lg flex items-center justify-center font-black text-sm transition-all ${
                                isActive
                                  ? 'border-navy-deep ring-2 ring-navy-deep/20 bg-slate-50'
                                  : 'border-slate-200 bg-white hover:border-slate-400'
                              }`}
                            >
                              {/* Color Condition Badge */}
                              {slot.cond && slot.cond !== 'none' && (
                                <span className={`absolute top-0.5 left-0.5 h-2 w-2 rounded-full ${
                                  slot.cond === 'red' ? 'bg-rose-500' :
                                  slot.cond === 'blue' ? 'bg-sky-500' :
                                  'bg-emerald-500'
                                }`} />
                              )}
                              <span className="text-slate-800">{getCmdSymbol(slot.cmd)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Program Command Selector Palette */}
                  {activeSlot && (
                    <div className="pt-4 border-t border-slate-150 space-y-4 animate-fade-in">
                      {/* Commands Row */}
                      <div className="space-y-2">
                        <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-450 block">Select Command Action</span>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => updateActiveSlotCmd('up')}
                            className="p-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg font-black text-xs inline-flex items-center space-x-1 text-slate-700"
                            title="Move Forward"
                          >
                            <ArrowUp className="h-4 w-4" />
                            <span>Forward</span>
                          </button>
                          <button
                            onClick={() => updateActiveSlotCmd('ccw')}
                            className="p-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg font-black text-xs inline-flex items-center space-x-1 text-slate-700"
                            title="Turn Left"
                          >
                            <RotateLeft className="h-4 w-4" />
                            <span>Left</span>
                          </button>
                          <button
                            onClick={() => updateActiveSlotCmd('cw')}
                            className="p-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg font-black text-xs inline-flex items-center space-x-1 text-slate-700"
                            title="Turn Right"
                          >
                            <RotateRight className="h-4 w-4" />
                            <span>Right</span>
                          </button>
                          
                          {activeLevel.allowedCmds.includes('f1') && (
                            <button
                              onClick={() => updateActiveSlotCmd('f1')}
                              className="p-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg font-black text-xs text-slate-700"
                            >
                              Call F1
                            </button>
                          )}
                          {activeLevel.allowedCmds.includes('f2') && (
                            <button
                              onClick={() => updateActiveSlotCmd('f2')}
                              className="p-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg font-black text-xs text-slate-700"
                            >
                              Call F2
                            </button>
                          )}
                          
                          <button
                            onClick={() => {
                              updateActiveSlotCmd(null);
                              updateActiveSlotCond('none');
                            }}
                            className="p-2 border border-rose-150 bg-rose-50 hover:bg-rose-100 rounded-lg font-black text-xs inline-flex items-center space-x-1 text-maple-red"
                          >
                            <Eraser className="h-3.5 w-3.5" />
                            <span>Clear</span>
                          </button>
                        </div>
                      </div>

                      {/* Color Conditions Row (Only if Level allows) */}
                      {activeLevel.allowedConds.length > 1 && (
                        <div className="space-y-2">
                          <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-450 block">Select Color Condition</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateActiveSlotCond('none')}
                              className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-750 font-bold text-xs rounded-lg"
                            >
                              Always
                            </button>
                            {activeLevel.allowedConds.includes('red') && (
                              <button
                                onClick={() => updateActiveSlotCond('red')}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs rounded-lg flex items-center space-x-1"
                              >
                                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                                <span>Red</span>
                              </button>
                            )}
                            {activeLevel.allowedConds.includes('blue') && (
                              <button
                                onClick={() => updateActiveSlotCond('blue')}
                                className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-xs rounded-lg flex items-center space-x-1"
                              >
                                <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                                <span>Blue</span>
                              </button>
                            )}
                            {activeLevel.allowedConds.includes('green') && (
                              <button
                                onClick={() => updateActiveSlotCond('green')}
                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-lg flex items-center space-x-1"
                              >
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                <span>Green</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Console Output logs & Stack */}
                <div className="bg-black p-4 rounded-xl border border-navy-light/20 font-mono text-[10.5px] text-slate-350 flex flex-col justify-between h-40">
                  <div className="flex-1 overflow-y-auto space-y-1.5">
                    <span className="block text-gray-500 font-bold uppercase text-[9px] border-b border-navy-light/10 pb-1 mb-1.5">
                      Execution Output Terminal
                    </span>
                    {terminalLogs.map((log, index) => {
                      const isSuccess = log.startsWith('🎉') || log.startsWith('✨');
                      const isCrash = log.startsWith('❌') || log.startsWith('💥');
                      return (
                        <div key={index} className={isSuccess ? 'text-emerald-400 font-bold' : isCrash ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                          {log}
                        </div>
                      );
                    })}
                  </div>

                  {executionHistory.length > 0 && (
                    <div className="border-t border-navy-light/10 pt-2 mt-2 overflow-x-auto whitespace-nowrap text-slate-450 flex items-center space-x-2">
                      <span className="text-[9px] uppercase font-bold text-gray-500 shrink-0">History Stack:</span>
                      <div className="flex gap-1 text-[9.5px]">
                        {executionHistory.slice(-8).map((hist, idx) => (
                          <span key={idx} className="bg-navy-deep/20 border border-navy-light/15 px-1.5 py-0.5 rounded text-slate-300">
                            {hist}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE PHASE TEST ASSESSMENTS */}
          {activeTab === 'test' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 max-w-2xl mx-auto">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="text-lg font-black uppercase text-slate-800 flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-maple-red" />
                    <span>Phase {activePhase} Logical Assessment</span>
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
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-sm text-slate-850 leading-relaxed">
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
                          className={`w-full text-left p-4 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-navy-deep border-navy-deep text-white shadow-md'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
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
                      className="px-6 py-3 bg-navy-deep hover:bg-maple-red text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition disabled:opacity-50 flex items-center space-x-1"
                    >
                      <span>{quizIdx + 1 === PHASE_QUIZZES[activePhase].length ? 'Finish Quiz' : 'Next Question'}</span>
                      <ChevronRight className="h-4 w-4" />
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
                        className="inline-flex items-center space-x-1 bg-navy-deep hover:bg-maple-red text-white font-black uppercase tracking-wider text-xs px-6 py-3 rounded-xl shadow transition"
                      >
                        <RefreshCw className="h-4 w-4" />
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
                          // Go to next unlocked phase if applicable
                          const nextP = activePhase + 1;
                          if (nextP <= 3 && unlockedPhases.includes(nextP)) {
                            handlePhaseChange(nextP);
                          } else {
                            setActiveTab('games');
                          }
                        }}
                        className="inline-flex items-center space-x-1.5 bg-navy-deep hover:bg-maple-red text-white font-black uppercase tracking-wider text-xs px-6 py-3 rounded-xl shadow transition"
                      >
                        <span>Continue Logic Path</span>
                        <ChevronRight className="h-4 w-4" />
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
