// src/app/(student)/games/page.tsx
'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Gamepad2, Play, Award, RotateCcw, AlertTriangle, HelpCircle, Terminal, RefreshCw, Cpu, Star, Fence } from 'lucide-react';

// =========================================================================
// MINI-GAME 1: ROBOT MAZE GRID ANIMATOR
// =========================================================================
// =========================================================================
// MINI-GAME 1: ROBOT MAZE GRID ANIMATOR WITH LEVELS & FUNCTIONS
// =========================================================================
const LEVELS = [
  {
    id: 1,
    name: 'Level 1: Rookie Pathway',
    grid: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ],
    start: { r: 0, c: 0, dir: 'E' },
    target: { r: 2, c: 2 },
    desc: 'Guide the robot to the target star at cell [2, 2]. Perfect for basic testing!'
  },
  {
    id: 2,
    name: 'Level 2: Obstacle Village',
    grid: [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 0, 0],
      [0, 0, 0, 1, 0],
      [1, 1, 0, 1, 0],
      [0, 0, 0, 0, 0]
    ],
    start: { r: 0, c: 0, dir: 'E' },
    target: { r: 4, c: 4 },
    desc: 'Guide the robot to the star at [4, 4] avoiding the red brick walls.'
  },
  {
    id: 3,
    name: 'Level 3: Loop & Function Dungeon',
    grid: [
      [0, 0, 1, 0, 0],
      [1, 0, 1, 0, 1],
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0]
    ],
    start: { r: 4, c: 0, dir: 'N' },
    target: { r: 0, c: 4 },
    desc: 'Use function definitions or sequences to navigate the maze to [0, 4]!'
  }
];

function RobotMazeGame({ onWin }: { onWin: (xp: number, coins: number) => void }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const activeLevel = LEVELS[levelIdx];
  const [robot, setRobot] = useState({ ...activeLevel.start }); // N, E, S, W
  const [commands, setCommands] = useState('moveForward()\nturnRight()\nmoveForward()\nmoveForward()');
  const [isPlaying, setIsPlaying] = useState(false);
  const [logs, setLogs] = useState<string[]>(['Grid initialized. Write commands or use the buttons.']);
  const [hasWon, setHasWon] = useState(false);

  const handleLevelChange = (idx: number) => {
    setLevelIdx(idx);
    const lvl = LEVELS[idx];
    setRobot({ ...lvl.start });
    setIsPlaying(false);
    setLogs([`Switched to ${lvl.name}. Grid reset.`]);
    setHasWon(false);

    if (idx === 2) {
      setCommands('def solve():\n  moveForward()\n  moveForward()\n  turnRight()\n\nsolve()\nsolve()');
    } else {
      setCommands('moveForward()\nturnRight()\nmoveForward()\nmoveForward()');
    }
  };

  const resetGame = () => {
    setRobot({ ...activeLevel.start });
    setIsPlaying(false);
    setLogs(['Grid reset. Ready to input sequence.']);
    setHasWon(false);
  };

  const appendCommand = (cmd: string) => {
    setCommands(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n${cmd}` : cmd;
    });
    setLogs(prev => [...prev, `Appended command: ${cmd}`]);
  };

  const handleExecute = () => {
    if (isPlaying || hasWon) return;
    setIsPlaying(true);
    setLogs(prev => [...prev, '> Starting sequence execution...']);
    
    // Preprocess commands to support Python-like function definitions and calls
    const steps: string[] = [];
    const lines = commands.split('\n').map(s => s.trim());
    const functions: Record<string, string[]> = {};
    
    let currentFuncName: string | null = null;
    
    for (const line of lines) {
      const cleanLine = line.toLowerCase().replace(/\s+/g, '');
      if (cleanLine === '') continue;
      
      // Check function definition: def my_func():
      const defMatch = /^def([a-zA-Z0-9_]+)\(\):$/i.exec(cleanLine);
      if (defMatch) {
        currentFuncName = defMatch[1];
        functions[currentFuncName] = [];
        continue;
      }
      
      // If we are currently collecting commands for a function body
      if (currentFuncName) {
        if (cleanLine === 'moveforward()' || cleanLine === 'turnleft()' || cleanLine === 'turnright()') {
          functions[currentFuncName].push(cleanLine);
          continue;
        } else {
          // If we hit any other command (or def) outside of the function, stop collecting
          currentFuncName = null;
        }
      }
      
      // Check if it's a function call or direct command
      const callMatch = /^([a-zA-Z0-9_]+)\(\)$/i.exec(cleanLine);
      if (callMatch) {
        const name = callMatch[1];
        if (functions[name]) {
          // Expand the function call
          steps.push(...functions[name]);
          setLogs(prev => [...prev, `Called custom function: ${name}()`]);
        } else if (cleanLine === 'moveforward()' || cleanLine === 'turnleft()' || cleanLine === 'turnright()') {
          steps.push(cleanLine);
        } else {
          setLogs(prev => [...prev, `[WARNING] Function ${name}() is called but not defined.`]);
        }
      } else {
        // Unrecognized or plain command
        steps.push(cleanLine);
      }
    }

    if (steps.length === 0) {
      setLogs(prev => [...prev, '[ERROR] No executable commands found. Please write some code or use the buttons.']);
      setIsPlaying(false);
      return;
    }
    
    let current = { ...robot };
    let pathIndex = 0;

    const interval = setInterval(() => {
      if (pathIndex >= steps.length) {
        clearInterval(interval);
        setIsPlaying(false);
        // Check win
        if (current.r === activeLevel.target.r && current.c === activeLevel.target.c) {
          setLogs(prev => [...prev, `[SUCCESS] Target star reached. Reward +100 XP gained for ${activeLevel.name}!`]);
          setHasWon(true);
          onWin(100, 20);
        } else {
          setLogs(prev => [...prev, `[ERROR] End of commands. Target star at [${activeLevel.target.r}, ${activeLevel.target.c}] not reached.`]);
        }
        return;
      }

      const cmd = steps[pathIndex];
      pathIndex++;

      if (cmd === 'moveforward()') {
        let nextR = current.r;
        let nextC = current.c;

        if (current.dir === 'N') nextR--;
        if (current.dir === 'E') nextC++;
        if (current.dir === 'S') nextR++;
        if (current.dir === 'W') nextC--;

        // Boundary check
        if (nextR < 0 || nextR >= 5 || nextC < 0 || nextC >= 5) {
          setLogs(prev => [...prev, '[CRASH] Robot hit the maze outer boundary!']);
          clearInterval(interval);
          setIsPlaying(false);
          return;
        }

        // Obstacle check
        if (activeLevel.grid[nextR][nextC] === 1) {
          setLogs(prev => [...prev, '[CRASH] Robot hit a wall brick!']);
          clearInterval(interval);
          setIsPlaying(false);
          return;
        }

        current.r = nextR;
        current.c = nextC;
        setRobot({ ...current });
        setLogs(prev => [...prev, `Moved forward to cell [${nextR}, ${nextC}]`]);
      } else if (cmd === 'turnleft()') {
        const dirs = ['N', 'W', 'S', 'E'];
        const currentIdx = dirs.indexOf(current.dir);
        current.dir = dirs[(currentIdx + 1) % 4];
        setRobot({ ...current });
        setLogs(prev => [...prev, `Turned left. Facing ${current.dir}`]);
      } else if (cmd === 'turnright()') {
        const dirs = ['N', 'E', 'S', 'W'];
        const currentIdx = dirs.indexOf(current.dir);
        current.dir = dirs[(currentIdx + 1) % 4];
        setRobot({ ...current });
        setLogs(prev => [...prev, `Turned right. Facing ${current.dir}`]);
        setLogs(prev => [...prev, `[ERROR] Syntax unrecognized command "${cmd}"`]);
      }
    }, 700);
  };

  const getDirArrow = (dir: string) => {
    if (dir === 'N') return '▲';
    if (dir === 'E') return '►';
    if (dir === 'S') return '▼';
    return '◄';
  };

  return (
    <div className="space-y-4">
      {/* Level Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5 shadow-inner">
        <div>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Simulation Pathway</span>
          <h4 className="text-xs font-extrabold text-slate-700 mt-0.5">{activeLevel.name}</h4>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{activeLevel.desc}</p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {LEVELS.map((lvl, lidx) => (
            <button
              key={lvl.id}
              onClick={() => handleLevelChange(lidx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                levelIdx === lidx
                  ? 'bg-navy-deep text-white shadow'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Lvl {lvl.id}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Visual Canvas Grid */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col items-center justify-center">
          <span className="text-xs text-slate-500 font-bold uppercase mb-4 tracking-wider">Virtual Robotics Grid</span>
          <div className="grid grid-cols-5 gap-1.5 w-60 h-60 bg-slate-105 p-2 rounded-lg border border-slate-300">
            {activeLevel.grid.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const isRobot = robot.r === rIdx && robot.c === cIdx;
                const isTarget = activeLevel.target.r === rIdx && activeLevel.target.c === cIdx;
                const isObstacle = cell === 1;

                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`relative rounded flex items-center justify-center font-bold text-xs shadow-inner ${
                      isRobot ? 'bg-navy-deep text-gold-accent border-2 border-gold-accent' :
                      isTarget ? 'bg-amber-100 text-amber-500 border border-amber-300 animate-pulse' :
                      isObstacle ? 'bg-maple-red border border-maple-dark text-white' :
                      'bg-white border border-slate-200'
                    }`}
                  >
                    {isRobot && <span className="text-lg">{getDirArrow(robot.dir)}</span>}
                    {isTarget && <Star className="h-4.5 w-4.5 fill-current" />}
                    {isObstacle && <Fence className="h-4 w-4 text-white" />}
                  </div>
                );
              })
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 flex space-x-4 text-[10px] uppercase font-bold text-slate-500">
            <span className="flex items-center"><span className="h-2.5 w-2.5 rounded bg-navy-deep mr-1 block border border-gold-accent"></span> Robot</span>
            <span className="flex items-center"><span className="h-2.5 w-2.5 rounded bg-maple-red mr-1 block"></span> Obstacle</span>
            <span className="flex items-center"><span className="h-2.5 w-2.5 rounded bg-amber-200 mr-1 block"></span> Target Star</span>
          </div>
        </div>

        {/* Editor & Console Logs */}
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-650 mb-1.5">Command Sequences</label>
              
              {/* Easy Action buttons */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                <button
                  onClick={() => appendCommand('moveForward()')}
                  className="px-2.5 py-1.5 bg-navy-deep/90 hover:bg-navy-deep text-white border border-navy-light/20 rounded text-[10px] font-black tracking-wide uppercase transition active:scale-95 flex items-center space-x-1 shadow-sm"
                >
                  <span>Forward</span>
                </button>
                <button
                  onClick={() => appendCommand('turnLeft()')}
                  className="px-2.5 py-1.5 bg-navy-deep/90 hover:bg-navy-deep text-white border border-navy-light/20 rounded text-[10px] font-black tracking-wide uppercase transition active:scale-95 flex items-center space-x-1 shadow-sm"
                >
                  <span>Left</span>
                </button>
                <button
                  onClick={() => appendCommand('turnRight()')}
                  className="px-2.5 py-1.5 bg-navy-deep/90 hover:bg-navy-deep text-white border border-navy-light/20 rounded text-[10px] font-black tracking-wide uppercase transition active:scale-95 flex items-center space-x-1 shadow-sm"
                >
                  <span>Right</span>
                </button>
                <button
                  onClick={() => appendCommand('def solve():\n  moveForward()\n  \nsolve()')}
                  className="px-2.5 py-1.5 bg-gold-accent/20 text-gold-accent border border-gold-accent/30 rounded text-[10px] font-black tracking-wide uppercase transition active:scale-95 flex items-center space-x-1 shadow-sm"
                >
                  <span>Define Function</span>
                </button>
              </div>

              <textarea
                value={commands}
                onChange={(e) => setCommands(e.target.value)}
                className="w-full h-28 rounded-lg bg-navy-dark border border-navy-light/25 p-3 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-gold-accent resize-none"
              />
            </div>

            {/* Console logs */}
            <div className="bg-black p-3.5 rounded-lg border border-navy-light/20 font-mono text-[10px] text-slate-300 h-28 overflow-y-auto">
              <span className="block text-gray-500 font-bold uppercase text-[9px] border-b border-navy-light/10 pb-1 mb-1">Execution output</span>
              {logs.map((log, idx) => {
                const isSuccess = log.startsWith('[SUCCESS]') || log.startsWith('Moved');
                const isError = log.startsWith('[CRASH]') || log.startsWith('[ERROR]') || log.startsWith('[WARNING]');
                return (
                  <div key={idx} className={isSuccess ? 'text-emerald-400' : isError ? 'text-rose-450' : 'text-slate-300'}>
                    {log}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex space-x-3">
            <button
              onClick={resetGame}
              className="flex items-center space-x-1 border border-slate-300 hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-650 rounded-lg shadow-sm"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Grid</span>
            </button>
            <button
              onClick={handleExecute}
              disabled={isPlaying || hasWon}
              className="flex-1 flex items-center justify-center space-x-1.5 bg-navy-deep hover:bg-maple-red px-4 py-2.5 text-xs font-bold text-white rounded-lg shadow disabled:opacity-50"
            >
              <Play className="h-3.5 w-3.5 fill-current text-gold-accent" />
              <span>Execute Sequence</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// MINI-GAME 2: BUG HUNTER SYNTAX REPAIR
// =========================================================================
const BUG_CHALLENGES = [
  {
    title: 'Python Missing Colons',
    brokenCode: 'for i in range(5)\n    print("Counting", i)',
    solution: 'for i in range(5):\n    print("Counting", i)',
    description: 'Fix the syntax error on the first line. A standard Python for-loop requires a special character to start the block.'
  },
  {
    title: 'Variables Capitalization Mismatch',
    brokenCode: 'studentXp = 100\nprint(studentxp)',
    solution: 'studentXp = 100\nprint(studentXp)',
    description: 'Python is highly case-sensitive. Correct the variable call inside the print command.'
  }
];

function BugHunterGame({ onWin }: { onWin: (xp: number, coins: number) => void }) {
  const [index, setIndex] = useState(0);
  const [code, setCode] = useState(BUG_CHALLENGES[0].brokenCode);
  const [logs, setLogs] = useState<string[]>(['Identify and fix the syntax bug in the console editor.']);
  const [hasWon, setHasWon] = useState(false);

  const handleCheck = () => {
    const current = BUG_CHALLENGES[index];
    if (code.trim() === current.solution.trim()) {
      setLogs(prev => [...prev, '[SUCCESS] Perfect! Syntax bug squashed correctly.', 'Reward +50 XP and 10 coins earned.']);
      setHasWon(true);
      onWin(50, 10);
    } else {
      setLogs(prev => [...prev, '❌ Tester Error: Code compiler failed with syntax validation check. Try again.']);
      setHasWon(false);
    }
  };

  const handleNext = () => {
    const nextIdx = (index + 1) % BUG_CHALLENGES.length;
    setIndex(nextIdx);
    setCode(BUG_CHALLENGES[nextIdx].brokenCode);
    setLogs(['Loaded next challenge. Identify the bug.']);
    setHasWon(false);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
        <h4 className="text-xs font-black uppercase text-slate-600 flex items-center space-x-1.5 mb-1.5">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>Bug Hunter Task: {BUG_CHALLENGES[index].title}</span>
        </h4>
        <p className="text-xs text-slate-500 font-semibold">{BUG_CHALLENGES[index].description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-12 items-stretch">
        <div className="md:col-span-8">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-32 rounded-lg bg-navy-dark border border-navy-light/25 p-4 text-xs font-mono text-white focus:outline-none focus:border-gold-accent resize-none"
            spellCheck="false"
          />
        </div>
        <div className="md:col-span-4 bg-black p-3.5 rounded-lg border border-navy-light/20 font-mono text-[10px] text-slate-300 flex flex-col justify-between h-32">
          <div className="overflow-y-auto max-h-24">
            <span className="block text-gray-500 font-bold uppercase text-[9.5px] border-b border-navy-light/10 pb-1 mb-1">Terminal</span>
            {logs.map((log, idx) => (
              <div key={idx} className={log.startsWith('🎉') ? 'text-emerald-400' : log.startsWith('❌') ? 'text-rose-400' : 'text-slate-350'}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={handleNext}
          className="flex items-center space-x-1 border border-slate-300 hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-650 rounded-lg shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Next Bug</span>
        </button>
        <button
          onClick={handleCheck}
          disabled={hasWon}
          className="flex items-center space-x-1.5 bg-navy-deep hover:bg-maple-red px-5 py-2.5 text-xs font-bold text-white rounded-lg shadow disabled:opacity-50"
        >
          <Play className="h-3.5 w-3.5 fill-current text-gold-accent" />
          <span>Test Debugging</span>
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// MINI-GAME 3: ALGORITHM ARENA SELECTION PUZZLE
// =========================================================================
const ALGO_ARENA_CHALLENGES = [
  {
    question: 'Select the missing expression block to correctly reverse a string in Python: \ndef reverse_string(text):\n  return ______',
    options: ['text[::-1]', 'text.reverse()', 'text[1:0:-1]', 'reversed(text)'],
    correctIndex: 0,
    explanation: 'In Python, slice syntax [::-1] step is a very efficient shorthand way to reverse sequences.'
  },
  {
    question: 'Which block completes the summation helper of list elements: \ndef list_sum(numbers):\n  total = 0\n  for n in numbers:\n    ______\n  return total',
    options: ['total = n', 'total += n', 'n += total', 'total = sum(n)'],
    correctIndex: 1,
    explanation: 'We use the addition-assignment operator (+=) to aggregate values into our accumulator.'
  }
];

function AlgorithmArenaGame({ onWin }: { onWin: (xp: number, coins: number) => void }) {
  const [index, setIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [hasWon, setHasWon] = useState(false);

  const handleSubmit = () => {
    if (selectedOpt === null || hasWon) return;
    const current = ALGO_ARENA_CHALLENGES[index];
    if (selectedOpt === current.correctIndex) {
      setFeedback(`🎉 Correct! ${current.explanation} Reward +60 XP earned.`);
      setHasWon(true);
      onWin(60, 15);
    } else {
      setFeedback('❌ Incorrect block. Review Python sequence slice boundaries or assignments and try again.');
    }
  };

  const handleNext = () => {
    const nextIdx = (index + 1) % ALGO_ARENA_CHALLENGES.length;
    setIndex(nextIdx);
    setSelectedOpt(null);
    setFeedback('');
    setHasWon(false);
  };

  return (
    <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="bg-navy-deep text-white p-4.5 rounded-lg border border-navy-light/10 font-mono text-xs leading-relaxed">
        {ALGO_ARENA_CHALLENGES[index].question}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {ALGO_ARENA_CHALLENGES[index].options.map((opt, oIdx) => (
          <button
            key={oIdx}
            onClick={() => {
              if (hasWon) return;
              setSelectedOpt(oIdx);
              setFeedback('');
            }}
            className={`text-left p-3.5 rounded-lg text-xs font-semibold border transition ${
              selectedOpt === oIdx
                ? 'bg-navy-deep border-navy-deep text-white shadow-sm'
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`p-3 rounded-lg text-xs font-semibold leading-relaxed border ${
          feedback.startsWith('🎉')
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {feedback}
        </div>
      )}

      <div className="flex justify-end space-x-3 mt-4">
        <button
          onClick={handleNext}
          className="flex items-center space-x-1 border border-slate-300 hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-650 rounded-lg shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Next Arena</span>
        </button>
        <button
          onClick={handleSubmit}
          disabled={selectedOpt === null || hasWon}
          className="flex items-center space-x-1.5 bg-navy-deep hover:bg-maple-red px-5 py-2.5 text-xs font-bold text-white rounded-lg shadow disabled:opacity-50"
        >
          <Play className="h-3.5 w-3.5 fill-current text-gold-accent" />
          <span>Submit Solution</span>
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// MINI-GAME 4: LOGIC TRIVIA QUIZ
// =========================================================================
const QUIZ_QUESTIONS = [
  {
    q: 'Which logic gate output is TRUE only if all inputs are TRUE?',
    options: ['OR gate', 'AND gate', 'NAND gate', 'XOR gate'],
    correct: 1
  },
  {
    q: 'What is the standard notation for base-16 number systems used in coloring values?',
    options: ['Binary', 'Octal', 'Hexadecimal', 'Decimal'],
    correct: 2
  },
  {
    q: 'Which component represents the short-term working volatile memory of a laptop?',
    options: ['HDD Storage Drive', 'CPU Processor core', 'RAM Card modules', 'BIOS Firmware'],
    correct: 2
  }
];

function LogicQuizGame({ onWin }: { onWin: (xp: number, coins: number) => void }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleAnswer = (oIdx: number) => {
    if (selected !== null) return;
    setSelected(oIdx);
    const correct = QUIZ_QUESTIONS[index].correct;
    if (oIdx === correct) {
      setScore(prev => prev + 1);
      setFeedback('🎉 Correct answer!');
    } else {
      setFeedback(`❌ Incorrect. Correct answer was: "${QUIZ_QUESTIONS[index].options[correct]}".`);
    }
  };

  const handleNext = () => {
    if (index + 1 < QUIZ_QUESTIONS.length) {
      setIndex(prev => prev + 1);
      setSelected(null);
      setFeedback('');
    } else {
      setIsFinished(true);
      // Award XP if got 2 or more correct
      if (score >= 2) {
        onWin(75, 15);
      }
    }
  };

  const resetQuiz = () => {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setIsFinished(false);
    setFeedback('');
  };

  if (isFinished) {
    const passed = score >= 2;
    return (
      <div className="text-center py-6 bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h4 className="text-lg font-black uppercase text-slate-800">Quiz Completed</h4>
        <div className="text-4xl">{passed ? '🏆' : '📚'}</div>
        <p className="text-xs font-semibold text-slate-500">
          Your score: <span className="text-slate-800 font-extrabold text-sm">{score} / {QUIZ_QUESTIONS.length}</span> correct.
        </p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          {passed
            ? 'Excellent work! You achieved passing grades and claimed +75 XP.'
            : 'Keep studying computing hardware and network systems to earn standard badges.'
          }
        </p>
        <button
          onClick={resetQuiz}
          className="mt-4 inline-flex items-center space-x-1.5 bg-navy-deep hover:bg-maple-red px-5 py-2.5 text-xs font-bold text-white rounded-lg shadow"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Retake Trivia</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
        <span>Question {index + 1} of {QUIZ_QUESTIONS.length}</span>
        <span>Score: {score} / {index}</span>
      </div>

      <h4 className="text-sm font-black text-slate-850 leading-normal">{QUIZ_QUESTIONS[index].q}</h4>

      <div className="grid gap-3 sm:grid-cols-2">
        {QUIZ_QUESTIONS[index].options.map((opt, oIdx) => {
          const isSelected = selected === oIdx;
          const isCorrect = QUIZ_QUESTIONS[index].correct === oIdx;
          return (
            <button
              key={oIdx}
              onClick={() => handleAnswer(oIdx)}
              className={`text-left p-3.5 rounded-lg text-xs font-semibold border transition ${
                isSelected 
                  ? 'bg-navy-deep border-navy-deep text-white shadow-sm'
                  : 'bg-white border-slate-200 hover:bg-slate-150 text-slate-700'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div className={`p-3 rounded-lg text-xs font-semibold leading-relaxed border flex items-center justify-between ${
          feedback.startsWith('🎉')
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <span>{feedback}</span>
          <button
            onClick={handleNext}
            className="rounded-lg bg-white border border-slate-200 px-3 py-1 font-bold text-slate-700 hover:bg-slate-50 text-[10px]"
          >
            {index + 1 < QUIZ_QUESTIONS.length ? 'Next' : 'Finish'}
          </button>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// MAIN PAGES EXPORTS
// =========================================================================
export default function GamesPage() {
  const { addXpAndCoins } = useApp();
  const [activeGame, setActiveGame] = useState<'none' | 'maze' | 'bug' | 'algo' | 'quiz'>('none');
  const [alert, setAlert] = useState('');

  const handleWin = (xp: number, coins: number) => {
    addXpAndCoins(xp, coins, 'Mini-game victory');
    setAlert(`🎮 Victory! You earned ${xp} XP and ${coins} Coins!`);
    setTimeout(() => setAlert(''), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
          <Gamepad2 className="h-6 w-6 text-navy-deep" />
          <span>Interactive Games Zone</span>
        </h2>
        <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
          Solve logic challenges, program virtual microcontrollers, and climb levels
        </p>
      </div>

      {alert && (
        <div className="rounded-xl border border-emerald-250 bg-emerald-50 p-4 font-bold text-xs text-emerald-850 flex items-center space-x-2.5 animate-pulse">
          <Award className="h-5 w-5 text-emerald-600" />
          <span>{alert}</span>
        </div>
      )}

      {/* Arena Switch Selector Grid */}
      {activeGame === 'none' ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {/* GAME CARD 1: ROBOT MAZE */}
          <button
            onClick={() => setActiveGame('maze')}
            className="group text-left rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-navy-light/45 duration-200 flex space-x-4.5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-deep/10 text-navy-deep group-hover:bg-navy-deep group-hover:text-white transition shrink-0">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 group-hover:text-navy-deep">Robot Maze Simulator</h3>
              <p className="mt-1 text-xs text-slate-500 leading-snug">
                Write moveForward(), turnLeft() and turnRight() sequences to guide a virtual Lego bot to target nodes. Avoid barriers.
              </p>
              <span className="inline-block bg-navy-light/10 text-navy-light px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider mt-3">
                Difficulty: Intermediate • Reward: +100 XP
              </span>
            </div>
          </button>

          {/* GAME CARD 2: BUG HUNTER */}
          <button
            onClick={() => setActiveGame('bug')}
            className="group text-left rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-navy-light/45 duration-200 flex space-x-4.5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-maple-red/10 text-maple-red group-hover:bg-maple-red group-hover:text-white transition shrink-0">
              <Terminal className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 group-hover:text-maple-red">Bug Hunter Sandbox</h3>
              <p className="mt-1 text-xs text-slate-500 leading-snug">
                Find and fix broken loop blocks, indentation errors, and variables naming mismatch tags. Squash the bugs to earn XP.
              </p>
              <span className="inline-block bg-maple-red/10 text-maple-red px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider mt-3">
                Difficulty: Beginner • Reward: +50 XP
              </span>
            </div>
          </button>

          {/* GAME CARD 3: ALGORITHM ARENA */}
          <button
            onClick={() => setActiveGame('algo')}
            className="group text-left rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-navy-light/45 duration-200 flex space-x-4.5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-accent/10 text-gold-accent group-hover:bg-gold-accent group-hover:text-white transition shrink-0">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 group-hover:text-gold-accent">Algorithm Arena</h3>
              <p className="mt-1 text-xs text-slate-500 leading-snug">
                Complete core algorithm lines to reverse string sequences, sum numerical arrays, and optimize indexing performance loops.
              </p>
              <span className="inline-block bg-gold-accent/10 text-gold-accent px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider mt-3">
                Difficulty: Intermediate • Reward: +60 XP
              </span>
            </div>
          </button>

          {/* GAME CARD 4: LOGIC TRIVIA */}
          <button
            onClick={() => setActiveGame('quiz')}
            className="group text-left rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-navy-light/45 duration-200 flex space-x-4.5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition shrink-0">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 group-hover:text-blue-600">Hardware & Logic Trivia</h3>
              <p className="mt-1 text-xs text-slate-500 leading-snug">
                Put your academic computing knowledge to the test. Answer hardware chips, gates logic, and network packets questions.
              </p>
              <span className="inline-block bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider mt-3">
                Difficulty: Beginner • Reward: +75 XP
              </span>
            </div>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          {/* Active game sub header */}
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3 flex-wrap gap-4">
            <h3 className="font-black text-sm uppercase text-slate-800 flex items-center space-x-2">
              <Gamepad2 className="h-4.5 w-4.5 text-navy-deep" />
              <span>
                {activeGame === 'maze' ? 'Robot Maze Simulator' :
                 activeGame === 'bug' ? 'Bug Hunter Squashing' :
                 activeGame === 'algo' ? 'Algorithm Selector Arena' :
                 'CS Logic Trivia Quiz'}
              </span>
            </h3>
            <button
              onClick={() => setActiveGame('none')}
              className="text-xs font-bold text-navy-deep hover:text-maple-red uppercase transition"
            >
              Back to Game Selection
            </button>
          </div>

          {activeGame === 'maze' && <RobotMazeGame onWin={handleWin} />}
          {activeGame === 'bug' && <BugHunterGame onWin={handleWin} />}
          {activeGame === 'algo' && <AlgorithmArenaGame onWin={handleWin} />}
          {activeGame === 'quiz' && <LogicQuizGame onWin={handleWin} />}
        </div>
      )}
    </div>
  );
}
