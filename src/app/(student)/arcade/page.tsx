// src/app/(student)/arcade/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import {
  Play,
  RotateCcw,
  Sparkles,
  Gamepad2,
  Lock,
  Star,
  Award,
  ChevronRight,
  BookOpen,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Flame,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';
import { isArcadeLevelUnlocked } from '@/lib/progression/level-access';
import {
  GRADE_NAMES,
  getLevelsForGrade,
  LevelDef,
  BlockType
} from './level-defs';
import {
  playJumpSound,
  playCollectSound,
  playChestSound,
  playSuccessSound,
  playFailSound
} from './audio';
import { LEARNING_STAGES } from './learning-games';
import { StageGameExperience } from './stage-experience';
import { GameIcon, GameIconName } from '@/components/ui/GameIcon';

// Program instruction representation
interface CommandItem {
  id: string;
  type: BlockType;
  // For repeat blocks: loop configuration
  loopAction?: 'forward' | 'backward' | 'jump' | 'turn_left';
  loopCount?: number;
}

const getCommandIconName = (type: BlockType): GameIconName => {
  if (type === 'forward') return 'forward';
  if (type === 'backward') return 'backward';
  if (type === 'jump') return 'jump';
  if (type === 'if_blocked') return 'condition';
  if (type.startsWith('repeat_')) return 'repeat';
  return 'turn';
};

export default function CodingArcadePage() {
  const { profile, addXpAndCoins } = useApp();

  // Navigation states
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [activeLevel, setActiveLevel] = useState<LevelDef | null>(null);

  // User progress states (saved in localStorage)
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [levelStars, setLevelStars] = useState<Record<number, number>>({});
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Game execution/runtime states
  const [currentX, setCurrentX] = useState<number>(2);
  const [currentY, setCurrentY] = useState<number>(0); // 0 = ground, 1 = on crate/jumping
  const [facing, setFacing] = useState<'right' | 'left'>('right');
  const [characterAction, setCharacterAction] = useState<'idle' | 'walk' | 'jump' | 'fall' | 'celebrate'>('idle');
  const [collectedBananas, setCollectedBananas] = useState<number[]>([]);
  const [chestOpen, setChestOpen] = useState<boolean>(false);
  const [gameMessage, setGameMessage] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);
  
  // Interpreter control states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(-1);
  const [speed, setSpeed] = useState<number>(1); // 1x, 2x, 4x

  // Program build states
  const [program, setProgram] = useState<CommandItem[]>([]);
  const commandIdRef = useRef(0);

  // Dialog & Mascots states
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [earnedStars, setEarnedStars] = useState<number>(0);
  const [rewardsClaimed, setRewardsClaimed] = useState<boolean>(false);

  // Local storage loading
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedCompleted = localStorage.getItem('cist_arcade_completed_levels');
      const savedStars = localStorage.getItem('cist_arcade_level_stars');
      const savedSound = localStorage.getItem('cist_arcade_sound');
      if (savedCompleted) setCompletedLevels(JSON.parse(savedCompleted));
      if (savedStars) setLevelStars(JSON.parse(savedStars));
      if (savedSound) setSoundEnabled(savedSound === 'true');
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Update sound state to localstorage
  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    localStorage.setItem('cist_arcade_sound', String(nextVal));
  };

  // Helper: auto-detect user's school grade on profile load
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (!profile?.grade) return;
      const match = profile.grade.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num >= 1 && num <= 12) {
          setSelectedGrade(num);
        }
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [profile]);

  // Load level definitions
  const gradeLevels = getLevelsForGrade(selectedGrade);

  // Load selected level into sandbox
  const selectLevel = (level: LevelDef) => {
    if (!isArcadeLevelUnlocked(level.id, completedLevels)) return;

    setActiveLevel(level);
    resetSandbox(level);
    setProgram([]);
    setShowWinModal(false);
    setRewardsClaimed(false);
  };

  // Reset sandbox coordinates and visual objects
  const resetSandbox = (level: LevelDef | null = activeLevel) => {
    if (!level) return;
    setCurrentX(level.startPos);
    setCurrentY(0);
    setFacing(level.chestPos >= level.startPos ? 'right' : 'left');
    setCharacterAction('idle');
    setCollectedBananas([]);
    setChestOpen(false);
    setIsRunning(false);
    setCurrentStepIdx(-1);
    setGameMessage({ text: level.instructions, type: 'info' });
  };

  // Sound play wrappers with check
  const triggerJumpSound = () => soundEnabled && playJumpSound();
  const triggerCollectSound = () => soundEnabled && playCollectSound();
  const triggerChestSound = () => soundEnabled && playChestSound();
  const triggerSuccessSound = () => soundEnabled && playSuccessSound();
  const triggerFailSound = () => soundEnabled && playFailSound();

  // Add command to workspace program list
  const addCommand = (type: BlockType) => {
    if (!activeLevel) return;
    if (program.length >= activeLevel.maxSlots) {
      setGameMessage({ text: `Maximum of ${activeLevel.maxSlots} command slots reached!`, type: 'error' });
      return;
    }

    commandIdRef.current += 1;
    let newItem: CommandItem = {
      id: `command-${commandIdRef.current}`,
      type
    };

    // If it's a repeat loop block, seed defaults
    if (type.startsWith('repeat_')) {
      const count = parseInt(type.split('_')[1], 10);
      newItem = {
        ...newItem,
        type,
        loopAction: 'forward',
        loopCount: count
      };
    }

    setProgram([...program, newItem]);
  };

  // Remove command from program list
  const removeCommand = (idx: number) => {
    const updated = [...program];
    updated.splice(idx, 1);
    setProgram(updated);
  };

  // Clear entire program
  const clearProgram = () => {
    setProgram([]);
    resetSandbox();
  };

  // Configure repeat loop parameters inline
  const updateRepeatConfig = (idx: number, updates: Partial<CommandItem>) => {
    const updated = [...program];
    updated[idx] = { ...updated[idx], ...updates };
    setProgram(updated);
  };

  // =========================================================================
  // GAME RUNTIME INTERPRETER
  // =========================================================================
  const runProgram = async () => {
    if (!activeLevel || program.length === 0 || isRunning) return;
    setIsRunning(true);
    resetSandbox();

    // Expand loop structures and conditions into flat linear execution sequence
    const executionQueue: { type: BlockType; originIdx: number; loopAction?: string }[] = [];

    program.forEach((item, idx) => {
      if (item.type.startsWith('repeat_') && item.loopAction && item.loopCount) {
        for (let loopIdx = 0; loopIdx < item.loopCount; loopIdx++) {
          executionQueue.push({
            type: item.loopAction,
            originIdx: idx,
            loopAction: `Loop ${loopIdx + 1}/${item.loopCount}`
          });
        }
      } else {
        executionQueue.push({
          type: item.type,
          originIdx: idx
        });
      }
    });

    // Step-by-step runner
    let step = 0;
    let x = activeLevel.startPos;
    let y = 0;
    let face: 'right' | 'left' = activeLevel.chestPos >= activeLevel.startPos ? 'right' : 'left';
    const bananas = [...collectedBananas];

    const intervalTime = 800 / speed;

    const executeNextStep = () => {
      if (step >= executionQueue.length) {
        // Program finished executing. Check final state
        setIsRunning(false);
        setCurrentStepIdx(-1);

        if (x === activeLevel.chestPos) {
          if (bananas.length === activeLevel.bananaPos.length) {
            handleVictory(executionQueue.length);
          } else {
            triggerFailSound();
            setGameMessage({ text: "You reached the chest, but missed some bananas! Collect all of them.", type: 'error' });
          }
        } else {
          triggerFailSound();
          setGameMessage({ text: "The program ended, but the monkey did not reach the treasure! Try again.", type: 'error' });
        }
        return;
      }

      const activeInstruction = executionQueue[step];
      setCurrentStepIdx(activeInstruction.originIdx);

      // Perform state logic based on instruction
      let blockToCheck = activeInstruction.type;

      // Handle conditional logic expansion
      if (blockToCheck === 'if_blocked') {
        const nextX = face === 'right' ? x + 1 : x - 1;
        const obstacleInFront = activeLevel.obstacles.find(obs => obs.x === nextX);
        blockToCheck = obstacleInFront ? 'jump' : 'forward';
      }

      if (blockToCheck === 'forward') {
        setCharacterAction('walk');
        x = face === 'right' ? x + 1 : x - 1;
        setCurrentX(x);
        // If stepping off crate
        const currentObstacle = activeLevel.obstacles.find(obs => obs.x === x);
        if (!currentObstacle || currentObstacle.type !== 'crate') {
          setCurrentY(0);
          y = 0;
        }
      } else if (blockToCheck === 'backward') {
        setCharacterAction('walk');
        x = face === 'right' ? x - 1 : x + 1;
        setCurrentX(x);
        const currentObstacle = activeLevel.obstacles.find(obs => obs.x === x);
        if (!currentObstacle || currentObstacle.type !== 'crate') {
          setCurrentY(0);
          y = 0;
        }
      } else if (blockToCheck === 'turn_left') {
        face = 'left';
        setFacing('left');
      } else if (blockToCheck === 'turn_right') {
        face = 'right';
        setFacing('right');
      } else if (blockToCheck === 'jump') {
        setCharacterAction('jump');
        triggerJumpSound();
        const startX = x;
        const landingX = face === 'right' ? startX + 2 : startX - 2;

        // Animate Jump arc
        setCurrentY(1.5); // High point of jump
        
        setTimeout(() => {
          x = landingX;
          setCurrentX(x);

          // Check landing tile type
          const landObstacle = activeLevel.obstacles.find(obs => obs.x === x);
          if (landObstacle && ['crate', 'breakable', 'falling'].includes(landObstacle.type)) {
            setCurrentY(1); // land on crate
            y = 1;
          } else {
            setCurrentY(0); // land on ground
            y = 0;
          }
          setCharacterAction('idle');
        }, intervalTime / 2);
      }

      // Check collision/hazards after landing/stepping (wait briefly for animation alignment)
      setTimeout(() => {
        // 1. Check if the monkey hit a crate wall (walking directly into it)
        const hitCrate = activeLevel.obstacles.find(obs => obs.x === x && ['crate', 'breakable', 'falling'].includes(obs.type) && y === 0);
        if (hitCrate) {
          triggerFailSound();
          setIsRunning(false);
          setCurrentStepIdx(-1);
          setGameMessage({ text: "Ouch! You walked right into a crate. Try jumping over it!", type: 'error' });
          return;
        }

        // 2. Check if the monkey fell in a hole or water
        const fellInHole = activeLevel.obstacles.find(obs => obs.x === x && ['hole', 'water', 'spikes', 'enemy'].includes(obs.type) && y === 0);
        if (fellInHole) {
          triggerFailSound();
          setIsRunning(false);
          setCurrentStepIdx(-1);
          setCurrentY(-1); // fall visual
          setCharacterAction('fall');
          const hazardMessage = fellInHole.type === 'hole'
            ? "Oops! The monkey fell down a deep hole!"
            : fellInHole.type === 'water'
              ? "Splash! The monkey fell into the water!"
              : fellInHole.type === 'spikes'
                ? "Careful! Jump over the spikes!"
                : "A jungle critter blocked the path. Jump over it!";
          setGameMessage({ text: hazardMessage, type: 'error' });
          return;
        }

        // 3. Collect banana if aligned
        const onBananaIdx = activeLevel.bananaPos.indexOf(x);
        if (onBananaIdx !== -1 && !bananas.includes(x)) {
          triggerCollectSound();
          bananas.push(x);
          setCollectedBananas([...bananas]);
        }

        // Move to next step
        step++;
        if (blockToCheck !== 'jump') setCharacterAction('idle');
        executeNextStep();
      }, intervalTime / 2 + 10);
    };

    // Begin execution loop
    executeNextStep();
  };

  // Victory handlers
  const handleVictory = (commandsCount: number) => {
    if (!activeLevel) return;
    triggerChestSound();
    setChestOpen(true);
    setCharacterAction('celebrate');

    // Calculate stars
    let stars = 1;
    if (commandsCount <= activeLevel.starThresholds[0]) {
      stars = 3;
    } else if (commandsCount <= activeLevel.starThresholds[1]) {
      stars = 2;
    }
    setEarnedStars(stars);

    // Trigger success music and modal
    setTimeout(() => {
      triggerSuccessSound();
      setShowWinModal(true);
      
      // Save progress to localstorage
      const nextCompleted = Array.from(new Set([...completedLevels, activeLevel.id]));
      const nextStars = { ...levelStars, [activeLevel.id]: Math.max(levelStars[activeLevel.id] || 0, stars) };
      setCompletedLevels(nextCompleted);
      setLevelStars(nextStars);
      localStorage.setItem('cist_arcade_completed_levels', JSON.stringify(nextCompleted));
      localStorage.setItem('cist_arcade_level_stars', JSON.stringify(nextStars));
      
      // Play Canvas Confetti celebration dynamically
      import('canvas-confetti').then((m) => {
        m.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }).catch(err => console.error("Confetti loader error", err));
    }, 400);
  };

  // Database rewards award claimer
  const claimRewards = async () => {
    if (rewardsClaimed || !activeLevel) return;
    setRewardsClaimed(true);

    const xpReward = activeLevel.grade * 15; // Grade-scaling XP
    const coinReward = activeLevel.grade * 5; // Grade-scaling Coins
    
    try {
      await addXpAndCoins(xpReward, coinReward, `Completed Arcade Level ${activeLevel.grade}-${activeLevel.id - (activeLevel.grade - 1) * 10}`);
    } catch (e) {
      console.error("Error updating player rewards:", e);
    }
  };

  // Move to next level
  const loadNextLevel = () => {
    if (!activeLevel) return;
    const nextId = activeLevel.id + 1;
    const allLevels = getLevelsForGrade(selectedGrade);
    const nextInGrade = allLevels.find(l => l.id === nextId);

    if (nextInGrade) {
      selectLevel(nextInGrade);
    } else if (selectedGrade < 12) {
      // Transition to next grade
      const nextGrade = selectedGrade + 1;
      setSelectedGrade(nextGrade);
      const nextGradeLevels = getLevelsForGrade(nextGrade);
      selectLevel(nextGradeLevels[0]);
    } else {
      // Finished all 120 levels!
      setGameMessage({ text: "Congratulations! You have completed all 120 Arcade levels!", type: 'success' });
      setActiveLevel(null);
    }
  };

  // Grade progress helper
  const getGradeProgress = (gradeNum: number) => {
    const startId = (gradeNum - 1) * 10 + 1;
    const endId = startId + 9;
    const solved = completedLevels.filter(id => id >= startId && id <= endId).length;
    return solved;
  };

  // Level status checkers
  const isLevelUnlocked = (lvl: LevelDef) => {
    return isArcadeLevelUnlocked(lvl.id, completedLevels);
  };

  const totalStarsEarned = Object.values(levelStars).reduce((sum, val) => sum + val, 0);

  // Parallax theme-styled background definitions
  const getThemeStyle = (gradeNum: number) => {
    if (gradeNum <= 3) {
      return {
        bg: 'from-sky-200 via-sky-300 to-emerald-300',
        floor: 'bg-gradient-to-b from-lime-500 to-emerald-800 border-t-4 border-lime-300',
        obstacleBg: 'bg-amber-800',
        cloudColor: 'bg-white/60',
        groundIcon: 'jungle-tree' as GameIconName,
        type: 'Grassland Kingdom'
      };
    } else if (gradeNum <= 6) {
      return {
        bg: 'from-amber-950 via-orange-900 to-amber-900',
        floor: 'bg-amber-800 border-t-4 border-amber-600',
        obstacleBg: 'bg-yellow-700',
        cloudColor: 'bg-amber-400/10',
        groundIcon: 'rock' as GameIconName,
        type: 'Sahara Dune'
      };
    } else if (gradeNum <= 9) {
      return {
        bg: 'from-cyan-950 via-sky-900 to-slate-900',
        floor: 'bg-cyan-800 border-t-4 border-cyan-400',
        obstacleBg: 'bg-sky-700',
        cloudColor: 'bg-cyan-200/10',
        groundIcon: 'sparkle' as GameIconName,
        type: 'Crystal Glacier'
      };
    } else {
      return {
        bg: 'from-indigo-950 via-purple-950 to-slate-950',
        floor: 'bg-purple-950 border-t-4 border-violet-500',
        obstacleBg: 'bg-violet-900',
        cloudColor: 'bg-violet-400/10',
        groundIcon: 'crown' as GameIconName,
        type: 'Castle Realm'
      };
    }
  };

  const activeTheme = getThemeStyle(selectedGrade);

  return (
    <div className="-m-4 md:-m-6 lg:-m-8 flex flex-col bg-navy-dark min-h-[calc(100vh-4rem)] text-slate-100 overflow-x-hidden">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-navy-deep to-navy-dark px-6 py-5 border-b border-navy-light/15 flex flex-col md:flex-row items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3.5">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-gold-accent to-amber-500 text-navy-dark shadow-lg shadow-gold-accent/15">
            <Gamepad2 className="h-7 w-7 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
              Coding Arcade
              <span className="text-xs bg-gold-accent/10 border border-gold-accent/30 text-gold-accent px-2 py-0.5 rounded-full uppercase font-black">
                120 Levels
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Algorithm puzzle challenges inspired by CodeMonkey. Pass levels to claim XP & Coins!
            </p>
          </div>
        </div>

        {/* Global Progress Metrics */}
        <div className="mt-4 md:mt-0 flex items-center gap-6">
          <div className="bg-navy-medium/40 border border-navy-light/15 rounded-xl px-4 py-2 text-center">
            <span className="block text-[9px] font-black uppercase tracking-wider text-slate-500">Stars Collected</span>
            <span className="text-xl font-extrabold text-gold-accent flex items-center justify-center gap-1">
              <Star className="h-5 w-5 fill-gold-accent text-gold-accent" />
              {totalStarsEarned} <span className="text-xs text-slate-500">/ 360</span>
            </span>
          </div>

          <div className="bg-navy-medium/40 border border-navy-light/15 rounded-xl px-4 py-2 text-center">
            <span className="block text-[9px] font-black uppercase tracking-wider text-slate-500">Total Completion</span>
            <span className="text-xl font-extrabold text-indigo-400">
              {completedLevels.length} <span className="text-xs text-slate-500">/ 120</span>
            </span>
          </div>

          {/* Sound toggle button */}
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl bg-navy-medium/60 border border-navy-light/20 hover:bg-navy-medium hover:text-white transition-all"
            title="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 className="h-5 w-5 text-indigo-400" /> : <VolumeX className="h-5 w-5 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* DASHBOARD OR LEVEL WORKSPACE */}
      {!activeLevel ? (
        <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-8">
          
          {/* GRADE TABS GRID */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-navy-light/10 pb-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">Select Grade Cohort</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {GRADE_NAMES.map((name, idx) => {
                const gradeNum = idx + 1;
                const learningStage = LEARNING_STAGES.find((stage) => stage.grade === gradeNum);
                const displayName = gradeNum === 1 ? 'Monkey Sequencing' : learningStage?.title || name;
                const solved = getGradeProgress(gradeNum);
                const percent = Math.round((solved / 10) * 100);
                const isSelected = selectedGrade === gradeNum;

                return (
                  <button
                    key={gradeNum}
                    onClick={() => setSelectedGrade(gradeNum)}
                    className={`text-left rounded-2xl p-4.5 border transition-all duration-200 cursor-pointer relative group overflow-hidden ${
                      isSelected
                        ? 'bg-navy-deep border-indigo-500 shadow-lg shadow-indigo-500/10'
                        : 'bg-navy-deep/40 border-navy-light/15 hover:border-slate-500'
                    }`}
                  >
                    {/* Glowing highlight */}
                    {isSelected && (
                      <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl"></div>
                    )}
                    
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Stage {gradeNum} • {gradeNum === 1 ? 'Block Coding' : learningStage?.subject}</span>
                    <span className="block text-sm font-extrabold text-slate-200 mt-1 truncate group-hover:text-white">{displayName}</span>
                    
                    {/* Progress Slider */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 pb-1">
                        <span>{solved}/10 Cleared</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-navy-dark h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ADVENTURE MAP TRAIL FOR SELECTED GRADE */}
          <div className="rounded-3xl bg-navy-deep border border-navy-light/10 p-6 md:p-8 shadow-2xl relative overflow-hidden">
            {/* Background elements */}
            <div className={`absolute inset-0 bg-gradient-to-b opacity-5 pointer-events-none ${activeTheme.bg}`}></div>
            
            <div className="relative flex flex-col md:flex-row md:items-center justify-between border-b border-navy-light/10 pb-5 mb-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Current Map Path</span>
                <h3 className="text-lg md:text-xl font-extrabold text-slate-100 uppercase mt-0.5">
                  Stage {selectedGrade}: {selectedGrade === 1 ? 'Monkey Sequencing' : LEARNING_STAGES.find((stage) => stage.grade === selectedGrade)?.title}
                </h3>
              </div>
              <div className="mt-2 md:mt-0 bg-navy-medium/40 border border-navy-light/10 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300">
                Concepts: <span className="text-indigo-400 font-extrabold">
                  {selectedGrade === 1 && "Simple sequences"}
                  {selectedGrade > 1 && LEARNING_STAGES.find((stage) => stage.grade === selectedGrade)?.description}
                </span>
              </div>
            </div>

            {/* Path Trail Display */}
            <div className="relative min-h-[250px] flex flex-col justify-center py-6">
              
              {/* Connection Vector Path Dotted Lines */}
              <div className="absolute inset-0 hidden md:flex items-center pointer-events-none px-12">
                <svg className="w-full h-2 px-6 opacity-30">
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="white" strokeWidth="4" strokeDasharray="10, 10" />
                </svg>
              </div>

              {/* Levels Horizontal/Vertical Grid */}
              <div className="relative grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-6 md:gap-4 z-10">
                {gradeLevels.map((lvl, index) => {
                  const unlocked = isLevelUnlocked(lvl);
                  const isCompleted = completedLevels.includes(lvl.id);
                  const stars = levelStars[lvl.id] || 0;

                  return (
                    <div key={lvl.id} className="flex flex-col items-center">
                      <button
                        onClick={() => unlocked && selectLevel(lvl)}
                        disabled={!unlocked}
                        aria-label={unlocked ? `Open challenge ${index + 1}: ${lvl.name}` : `Challenge ${index + 1} locked. Complete challenge ${index} first.`}
                        title={unlocked ? lvl.name : `Complete Challenge ${index} to unlock`}
                        className={`w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 transition-all relative ${
                          isCompleted
                            ? 'bg-emerald-950/80 border-emerald-500 shadow-lg shadow-emerald-500/10 hover:scale-105 cursor-pointer text-slate-100'
                            : unlocked
                              ? 'bg-indigo-950/80 border-indigo-500 hover:border-slate-300 hover:scale-105 cursor-pointer text-slate-100 shadow-lg shadow-indigo-500/10'
                              : 'bg-navy-dark border-navy-light/20 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        {/* Lock overlay */}
                        {!unlocked && (
                          <Lock className="h-4.5 w-4.5 text-slate-600 mb-0.5" />
                        )}

                        {/* Level num */}
                        <span className={`text-base font-black ${!unlocked && 'text-slate-600'}`}>
                          {index + 1}
                        </span>

                        {/* Stars preview */}
                        {isCompleted && (
                          <div className="absolute -bottom-2 flex items-center justify-center gap-0.5 bg-navy-medium border border-navy-light/30 px-1.5 py-0.5 rounded-full">
                            {Array.from({ length: 3 }).map((_, sIdx) => (
                              <Star
                                key={sIdx}
                                className={`h-2.5 w-2.5 ${
                                  sIdx < stars ? 'fill-gold-accent text-gold-accent' : 'text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </button>
                      <span className="text-[10px] font-black uppercase text-slate-500 mt-3 block text-center truncate w-full max-w-[80px]">
                        {lvl.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : activeLevel.grade > 1 ? (
        <StageGameExperience
          grade={activeLevel.grade}
          levelNumber={activeLevel.id - (activeLevel.grade - 1) * 10}
          onBack={() => setActiveLevel(null)}
          onComplete={() => handleVictory(3)}
        />
      ) : (
        
        // LEVEL PLAYROOM WORKSPACE
        <div className="flex flex-1 flex-col xl:h-[calc(100vh-9.5rem)] xl:min-h-[680px] xl:flex-row xl:overflow-hidden bg-gradient-to-b from-sky-100/10 to-navy-dark">
          
          {/* LEFT PANEL: GAME GRID CANVAS VIEW */}
          <div className="flex w-full flex-col bg-navy-dark border-b border-navy-light/15 xl:w-[64%] xl:border-b-0 xl:border-r xl:overflow-hidden">
            
            {/* Mascot Help & Info Header */}
            <div className="p-4 bg-navy-deep border-b border-navy-light/10 flex items-center justify-between gap-4 shrink-0">
              <button
                onClick={() => setActiveLevel(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-dark hover:bg-navy-medium border border-navy-light/10 text-xs font-bold text-slate-300 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Maps Portal</span>
              </button>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Level {activeLevel.grade}-{activeLevel.id - (activeLevel.grade - 1) * 10}
                </span>
                <h2 className="text-sm font-extrabold text-slate-200">&ldquo;{activeLevel.name}&rdquo;</h2>
              </div>

              <div className="flex items-center gap-2 text-xs font-black uppercase bg-navy-medium/50 px-2.5 py-1 rounded-lg border border-navy-light/10 text-indigo-400">
                <Flame className="h-4 w-4 text-orange-500 animate-bounce" />
                <span>Grade {activeLevel.grade}</span>
              </div>
            </div>

            {/* Mascot Instruction Dialog */}
            <div className="p-4 bg-navy-medium/20 border-b border-navy-light/10 flex items-start space-x-3 shrink-0">
              <div className="h-10 w-10 rounded-xl overflow-hidden shrink-0 border border-indigo-400/20 bg-indigo-500/10 flex items-center justify-center">
                {/* Visual parrot/mascot */}
                <GameIcon name="parrot" className="h-9 w-9" alt="Jocker the parrot" />
              </div>
              <div className="bg-navy-deep/80 border border-navy-light/15 rounded-2xl px-4 py-2.5 relative flex-1 text-xs leading-relaxed text-slate-300">
                <div className="absolute left-[-6px] top-4 w-3 h-3 bg-navy-deep border-b border-l border-navy-light/15 transform rotate-45"></div>
                <span className="font-extrabold text-[10px] text-indigo-400 block uppercase mb-0.5">Jocker the Parrot Says</span>
                {gameMessage?.text}
              </div>
            </div>

            {/* VISUAL GAME BOARD CANVA PANEL */}
            <div className="flex min-h-[540px] flex-1 items-center justify-center p-4 md:px-6 md:py-5 xl:min-h-0 bg-[radial-gradient(circle_at_center,#2b6f8f_0%,#102a43_78%)] select-none">
              
              {/* SIDE SCROLLER BOX MAP container */}
              <div className="relative flex h-full max-h-[580px] w-full min-h-[430px] flex-col justify-end overflow-hidden rounded-[2rem] border-[8px] border-sky-400/80 shadow-2xl ring-4 ring-white/10 xl:min-h-0">
                
                {/* Background Theme Parallax */}
                <div className={`absolute inset-0 bg-gradient-to-b ${activeTheme.bg} z-0`}></div>

                {/* Layered world scenery */}
                <div className="absolute right-[8%] top-[8%] z-[1] h-20 w-20 rounded-full bg-yellow-200/90 shadow-[0_0_45px_rgba(253,224,71,.55)]" />
                <div className="absolute inset-x-0 bottom-24 z-[1] h-[48%] opacity-45">
                  <div className="absolute -bottom-12 -left-[8%] h-48 w-[52%] rounded-[50%_50%_0_0] bg-emerald-950/50 rotate-3" />
                  <div className="absolute -bottom-16 right-[-8%] h-56 w-[64%] rounded-[50%_50%_0_0] bg-teal-950/55 -rotate-3" />
                </div>
                <div className="absolute inset-x-0 bottom-16 z-[2] flex items-end justify-around px-6 text-5xl opacity-55 pointer-events-none">
                  <GameIcon name="pine" className="h-14 w-14" /><GameIcon name="palm" className="h-11 w-11" /><GameIcon name="jungle-tree" className="h-12 w-12" /><GameIcon name="pine" className="h-16 w-16" /><GameIcon name="palm" className="h-14 w-14" /><GameIcon name="jungle-tree" className="h-12 w-12" />
                </div>
                
                {/* Animated clouds live high in the sky, away from the playable road. */}
                <div className="arcade-sky-cloud absolute left-[8%] top-[8%] z-[2] h-10 w-28 opacity-75" aria-hidden="true" />
                <div className="arcade-sky-cloud arcade-sky-cloud--slow absolute left-[42%] top-[16%] z-[2] h-8 w-24 opacity-55" aria-hidden="true" />
                <div className="arcade-sky-cloud arcade-sky-cloud--reverse absolute right-[12%] top-[28%] z-[2] h-9 w-28 opacity-65" aria-hidden="true" />

                {/* Sky elements based on theme */}
                {selectedGrade >= 10 && (
                  <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(white_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                )}

                {/* Cloud World Custom Animated Elements */}
                {activeTheme.type === 'Sky Haven' && (
                  <>
                    {/* Floating hot air balloon */}
                    <GameIcon name="balloon" className="absolute left-[22%] top-6 z-0 h-10 w-10 animate-bounce opacity-60" />
                    {/* Flying white peace dove bird */}
                    <GameIcon name="dove" className="absolute left-[76%] top-14 z-0 h-9 w-9 animate-pulse opacity-50" />
                  </>
                )}

                {/* GAME FIELD LAYOUT */}
                <div className="relative w-full h-[62%] z-10 flex items-end px-5 md:px-8">

                  {/* Hero uses continuous coordinates so movement flows between tiles */}
                  <div
                    className="absolute z-40 transition-[left,bottom] ease-in-out"
                    style={{
                      left: `calc(${((currentX + 0.5) / 12) * 100}% - 2.1rem)`,
                      bottom: currentY < 0 ? '-24px' : `${18 + currentY * 76}px`,
                      transitionDuration: `${Math.max(180, 520 / speed)}ms`
                    }}
                  >
                    <div
                      className={`arcade-hero arcade-hero--${characterAction} relative flex h-[4.4rem] w-[4.4rem] items-center justify-center rounded-full border-4 border-white/80 bg-emerald-400/20 shadow-[0_12px_20px_rgba(0,0,0,.35)] backdrop-blur-sm`}
                      style={{ transform: `scaleX(${facing === 'right' ? 1 : -1})` }}
                    >
                      {chestOpen && <span className="absolute -top-8 whitespace-nowrap rounded-full bg-yellow-300 px-2 py-1 text-[9px] font-black text-emerald-950 shadow-lg">QUEST CLEAR!</span>}
                      {currentY === -1 && <GameIcon name="sparkle" className="absolute -top-9 h-8 w-8 animate-spin" />}
                      <Image
                        src="/game/monkey-hero.png"
                        alt="CodeQuest monkey hero"
                        width={120}
                        height={120}
                        priority
                        className="h-[5.6rem] w-[5.6rem] max-w-none object-contain drop-shadow-[0_5px_4px_rgba(0,0,0,.35)]"
                      />
                      <span className="absolute -bottom-2 h-2 w-12 rounded-full bg-black/25 blur-[2px]" />
                    </div>
                  </div>
                  
                  {/* Grid Column block tiles */}
                  <div className="w-full grid grid-cols-12 gap-0 items-end">
                    {Array.from({ length: 12 }).map((_, colIdx) => {
                      const obstacle = activeLevel.obstacles.find(obs => obs.x === colIdx);
                      const hasBanana = activeLevel.bananaPos.includes(colIdx) && !collectedBananas.includes(colIdx);
                      const hasChest = activeLevel.chestPos === colIdx;

                      return (
                        <div
                          key={colIdx}
                          className="relative flex flex-col items-center justify-end h-32"
                          style={{
                            // Mark grid column widths evenly
                            gridColumn: `${colIdx + 1} / span 1`
                          }}
                        >
                          
                          {/* BANANA */}
                          {hasBanana && (
                            <div className="absolute bottom-14 z-20 animate-bounce" style={{ animationDuration: `${2 + (colIdx % 2)}s` }}>
                              <GameIcon name="banana" className="h-10 w-10 drop-shadow-md" alt="Banana" />
                            </div>
                          )}

                          {/* TREASURE CHEST */}
                          {hasChest && (
                            <div className="absolute bottom-0 z-20 translate-y-[-2px]">
                              {chestOpen ? (
                                <div className="relative flex flex-col items-center">
                                  <GameIcon name="treasure" className="h-11 w-11 animate-pulse drop-shadow-[0_0_12px_rgba(212,175,55,0.8)]" alt="Open treasure" />
                                  <GameIcon name="crown" className="absolute -top-5 h-6 w-6 animate-bounce" />
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <GameIcon name={selectedGrade >= 10 ? 'crown' : 'flag'} className="h-12 w-12 drop-shadow-md" alt="Goal" />
                                  <span className="mt-1 rounded-full bg-black/25 px-2 py-0.5 text-[8px] font-black text-white">GOAL</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Obstacles (crates, water, hole) */}
                          {obstacle && (
                            <div className="absolute bottom-0 w-full z-15">
                              {obstacle.type === 'crate' && (
                                <div className="w-12 h-12 mx-auto rounded-lg border-4 border-amber-950/60 bg-gradient-to-br from-amber-500 to-amber-800 flex items-center justify-center shadow-xl font-black text-amber-950 text-xl">
                                  <GameIcon name="crate" className="h-10 w-10" />
                                </div>
                              )}
                              {obstacle.type === 'breakable' && <GameIcon name="log" className="mx-auto h-12 w-12 drop-shadow-lg" />}
                              {obstacle.type === 'falling' && <GameIcon name="rock" className="arcade-falling-block mx-auto h-12 w-12 drop-shadow-lg" />}
                              {obstacle.type === 'spikes' && <GameIcon name="spikes" className="mx-auto h-12 w-12 drop-shadow-lg" />}
                              {obstacle.type === 'enemy' && <GameIcon name="bug" className="arcade-enemy mx-auto h-12 w-12 drop-shadow-lg" />}
                            </div>
                          )}
                          
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* THE TILED GROUND FLOOR */}
                <div className={`w-full h-20 ${activeTheme.floor} z-10 px-5 md:px-8 border-t-4 border-emerald-300/40 shadow-[inset_0_8px_0_rgba(255,255,255,.06)]`}>
                  <div className="w-full grid grid-cols-12 gap-0">
                    {Array.from({ length: 12 }).map((_, colIdx) => {
                      const obstacle = activeLevel.obstacles.find(obs => obs.x === colIdx);
                      const isPit = obstacle && ['hole', 'water', 'spikes', 'enemy'].includes(obstacle.type);

                      if (isPit) {
                        return (
                          <div key={colIdx} className="h-20 bg-navy-dark/90 relative flex items-center justify-center">
                            {obstacle.type === 'water' ? (
                              <div className="absolute inset-0 bg-blue-600/60 animate-pulse border-t border-blue-400">
                                <GameIcon name="water" className="mx-auto mt-1 h-8 w-8" />
                              </div>
                            ) : obstacle.type === 'spikes' || obstacle.type === 'enemy' ? (
                              <div className="absolute inset-0 bg-emerald-950/70 border-t border-emerald-400/30" />
                            ) : (
                              <div className="absolute inset-0 bg-black/60">
                                <span className="mx-auto mt-2 block h-5 w-8 rounded-[50%] bg-black/80 shadow-inner" />
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={colIdx}
                          className="h-20 border-r border-navy-light/10 flex flex-col items-center justify-between py-2 relative"
                          style={{
                            backgroundColor: colIdx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)'
                          }}
                        >
                          <span className={`text-[10px] font-bold opacity-35 select-none ${activeTheme.type === 'Sky Haven' ? 'text-slate-700' : 'text-slate-500'}`}>{colIdx}</span>
                          <GameIcon name={activeTheme.groundIcon} className="h-4 w-4 opacity-75" />
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* RIGHT PANEL: PROGRAMMING INTERFACE */}
          <div className="flex w-full flex-col overflow-hidden bg-[#d8ebf8] text-navy-dark border-sky-400/80 shadow-2xl xl:w-[36%] xl:min-h-0">
            
            {/* WORKSPACE CONTROLS HEADER */}
            <div className="px-5 py-3 border-b-2 border-sky-300 bg-sky-100 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <h3 className="text-xs font-black uppercase tracking-wider text-sky-900">Build your move sequence</h3>
              </div>

              {/* Execution Speed toggler */}
              <div className="flex items-center space-x-1.5 bg-navy-dark border border-navy-light/15 p-1 rounded-xl">
                <span className="text-[9px] font-black uppercase text-slate-500 px-1.5">Speed:</span>
                {[1, 2, 4].map(s => (
                  <button
                    key={s}
                    disabled={isRunning}
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-0.5 text-[10px] font-black rounded-lg transition-all ${
                      speed === s 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-navy-medium'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* DOCK OF sequenced COMMAND SLOTS */}
            <div className="min-h-0 flex-1 space-y-3 overflow-auto bg-[#cfe6f6] p-4">
              
              <div className="flex items-center justify-between text-xs text-sky-800 font-bold uppercase pb-1 border-b border-sky-300">
                <span>Sequence List</span>
                <span>{program.length} / {activeLevel.maxSlots} Slots Used</span>
              </div>

              {program.length === 0 ? (
                <div className="border-3 border-dashed border-sky-400 rounded-2xl px-6 py-5 text-center text-sky-700 space-y-2 bg-white/35">
                  <div className="w-10 h-10 rounded-full border border-sky-300 mx-auto flex items-center justify-center bg-white/60">
                    <Plus className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider">Empty Program</div>
                  <p className="text-[11px] leading-relaxed text-slate-500 max-w-[250px] mx-auto">
                    Click the command blocks below to sequence instructions for the monkey.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 pb-1 2xl:grid-cols-2">
                  {program.map((item, idx) => {
                    const isExecuting = isRunning && currentStepIdx === idx;
                    const isLoop = item.type.startsWith('repeat_');

                    return (
                      <div
                        key={item.id}
                        className={`min-w-0 rounded-2xl p-3.5 border-2 border-b-4 transition-all relative flex flex-col justify-between ${
                          isExecuting
                            ? 'bg-indigo-950/70 border-indigo-400 ring-2 ring-indigo-400/25 scale-[1.03]'
                            : 'bg-white border-sky-300 hover:border-sky-500 shadow-sm'
                        }`}
                      >
                        {/* Remove block cross */}
                        <button
                          disabled={isRunning}
                          onClick={() => removeCommand(idx)}
                          className="absolute top-2 right-2 p-1 text-slate-500 hover:text-maple-red hover:bg-navy-medium/40 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        <span className="text-[9px] font-black text-slate-500 uppercase">Slot {idx + 1}</span>
                        
                        {/* Command Details */}
                        <div className="mt-1.5 flex items-center space-x-2">
                          <GameIcon name={getCommandIconName(item.type)} className="h-8 w-8 shrink-0" />
                          <div>
                            <span className="text-xs font-black uppercase text-sky-950">
                              {item.type === 'forward' && 'Step Forward'}
                              {item.type === 'backward' && 'Step Backward'}
                              {item.type === 'turn_left' && 'Turn Left'}
                              {item.type === 'turn_right' && 'Turn Right'}
                              {item.type === 'jump' && 'Jump'}
                              {item.type === 'if_blocked' && 'If Blocked'}
                              {isLoop && `Repeat`}
                            </span>
                          </div>
                        </div>

                        {/* Repeat Inline Configuration */}
                        {isLoop && (
                          <div className="mt-3 pt-2.5 border-t border-navy-light/10 space-y-1.5">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black uppercase text-slate-500 mb-0.5">Do Action</span>
                              <select
                                disabled={isRunning}
                                value={item.loopAction}
                                onChange={(e) => updateRepeatConfig(idx, { loopAction: e.target.value as CommandItem['loopAction'] })}
                                className="bg-navy-dark text-slate-200 border border-navy-light/20 rounded px-1 py-0.5 text-[10px] font-semibold w-full focus:outline-none"
                              >
                                <option value="forward">Step Forward</option>
                                <option value="backward">Step Backward</option>
                                <option value="jump">Jump</option>
                                <option value="turn_left">Turn Around</option>
                              </select>
                            </div>
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-[8px] font-black uppercase text-slate-500">Times:</span>
                              <div className="flex gap-1">
                                {[2, 3, 4, 5].map(t => (
                                  <button
                                    key={t}
                                    disabled={isRunning}
                                    onClick={() => updateRepeatConfig(idx, { loopCount: t, type: `repeat_${t}` as BlockType })}
                                    className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                      item.loopCount === t 
                                        ? 'bg-indigo-500 text-white' 
                                        : 'bg-navy-medium text-slate-400'
                                    }`}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* If Block config help */}
                        {item.type === 'if_blocked' && (
                          <div className="mt-2 pt-2 border-t border-navy-light/10 text-[8px] font-semibold text-slate-400 leading-snug">
                            Checks next tile. If CRATE, executes <span className="text-amber-400 font-bold">JUMP</span>, else executes <span className="text-indigo-400 font-bold">FORWARD</span>.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* ACTION INPUT PALETTE FOR AVAILABLE BLOCKS */}
            <div className="px-5 py-4 border-t-2 border-sky-300 bg-sky-100 shrink-0">
              
              <div className="text-[10px] font-black uppercase tracking-wider text-sky-800 pb-2.5">
                Choose a move
              </div>

              <div className="flex flex-wrap gap-2">
                {activeLevel.allowedBlocks.map((block) => {
                  let color = 'bg-blue-600 border-blue-500 hover:bg-blue-500';
                  let label: string = block;
                  let icon: GameIconName = 'forward';

                  if (block === 'backward') {
                    color = 'bg-sky-600 border-sky-500 hover:bg-sky-500';
                    icon = 'backward';
                  } else if (block.startsWith('turn_')) {
                    color = 'bg-purple-600 border-purple-500 hover:bg-purple-500';
                    icon = 'turn';
                    label = block === 'turn_left' ? 'turn left' : 'turn right';
                  } else if (block === 'jump') {
                    color = 'bg-amber-600 border-amber-500 hover:bg-amber-500';
                    icon = 'jump';
                  } else if (block.startsWith('repeat_')) {
                    color = 'bg-yellow-600 border-yellow-500 hover:bg-yellow-500 text-yellow-950 font-black';
                    icon = 'repeat';
                    const count = block.split('_')[1];
                    label = `Repeat ${count}x`;
                  } else if (block === 'if_blocked') {
                    color = 'bg-emerald-600 border-emerald-500 hover:bg-emerald-500';
                    icon = 'condition';
                    label = 'If Blocked';
                  }

                  return (
                    <button
                      key={block}
                      disabled={isRunning}
                      onClick={() => addCommand(block)}
                      className={`quest-button min-w-32 px-5 py-3 rounded-2xl border text-sm font-black uppercase tracking-wide flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-md disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${color}`}
                    >
                      <GameIcon name={icon} className="h-7 w-7" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* RUN & CLEAR ACTIONS CONSOLE FOOTER */}
            <div className="p-4 border-t-2 border-sky-300 bg-sky-200 flex items-center justify-between gap-4 shrink-0">
              
              <button
                disabled={isRunning || program.length === 0}
                onClick={clearProgram}
                className="px-5 py-3 rounded-2xl border-2 border-sky-400 bg-white/55 hover:bg-white text-xs font-black uppercase text-sky-900 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="h-4.5 w-4.5" />
                <span>Clear</span>
              </button>

              <div className="flex-1 flex gap-2">
                {isRunning ? (
                  <button
                    onClick={() => {
                      setIsRunning(false);
                      resetSandbox();
                    }}
                    className="quest-button w-full py-4 rounded-2xl bg-maple-red hover:bg-red-600 text-white font-black text-base uppercase transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="h-5 w-5" />
                    <span>Stop & Reset</span>
                  </button>
                ) : (
                  <button
                    disabled={program.length === 0}
                    onClick={runProgram}
                    className="quest-button w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base uppercase transition-all shadow-lg shadow-emerald-700/20 active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="h-5 w-5 fill-white text-white" />
                    <span>Play My Moves</span>
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* LEVEL COMPLETED CELEBRATION MODAL */}
      {showWinModal && activeLevel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-dark/95 p-4 animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-gold-accent bg-navy-deep p-8 text-center shadow-2xl">
            {/* Sparkles accent glows */}
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gold-accent/10 blur-2xl pointer-events-none"></div>
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>
            
            {/* Victory Badge icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold-accent to-amber-500 text-navy-dark shadow-xl animate-bounce">
              <Award className="h-10 w-10" />
            </div>

            <h1 className="mt-6 text-2xl font-black text-slate-100 uppercase tracking-widest leading-none">
              Level Completed!
            </h1>
            <p className="mt-2 text-xs text-slate-400 font-semibold uppercase">
              {activeLevel.name}
            </p>

            {activeLevel.id % 10 !== 0 && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-emerald-300">
                <Lock className="h-4 w-4" />
                Challenge {(activeLevel.id % 10) + 1} unlocked
              </div>
            )}

            {/* Stars Reward visual */}
            <div className="mt-6 flex justify-center items-center space-x-3.5">
              {[1, 2, 3].map((starNum) => (
                <Star
                  key={starNum}
                  className={`h-11 w-11 transition-all ${
                    starNum <= earnedStars 
                      ? 'fill-gold-accent text-gold-accent scale-110 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' 
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Platform Gamified Rewards Card */}
            <div className="mt-8 rounded-2xl bg-navy-dark border border-navy-light/10 p-5 space-y-4">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">Rewards Unlocked</div>
              
              <div className="flex items-center justify-center space-x-8">
                <div className="flex items-center space-x-2 text-slate-200">
                  <GameIcon name="gem" className="h-9 w-9" />
                  <div className="text-left leading-none">
                    <span className="block text-[9px] font-bold text-slate-500 uppercase">XP Reward</span>
                    <span className="text-base font-black">+{activeLevel.grade * 15} XP</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-slate-200">
                  <GameIcon name="coin" className="h-9 w-9" />
                  <div className="text-left leading-none">
                    <span className="block text-[9px] font-bold text-slate-500 uppercase">Coins Reward</span>
                    <span className="text-base font-black">+{activeLevel.grade * 5} Coins</span>
                  </div>
                </div>
              </div>

              {!rewardsClaimed ? (
                <button
                  onClick={claimRewards}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wide transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="h-4.5 w-4.5" />
                  <span>Claim Rewards & Save Progress</span>
                </button>
              ) : (
                <div className="flex items-center justify-center space-x-1.5 text-xs text-emerald-400 font-extrabold py-2 uppercase bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  <span>XP & Coins Added to Profile!</span>
                </div>
              )}
            </div>

            {/* Next buttons actions */}
            <div className="mt-8 grid grid-cols-2 gap-3.5">
              <button
                onClick={() => {
                  setShowWinModal(false);
                  resetSandbox();
                }}
                className="py-3 rounded-xl border border-navy-light/15 hover:border-slate-500 font-extrabold text-xs text-slate-300 hover:text-white uppercase transition-all active:scale-95 cursor-pointer"
              >
                Replay Level
              </button>
              
              <button
                onClick={loadNextLevel}
                className="py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/10 active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Next Level</span>
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
