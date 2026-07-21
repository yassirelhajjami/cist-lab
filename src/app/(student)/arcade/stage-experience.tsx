'use client';

import React, { useState } from 'react';
import { ArrowLeft, BookOpen, ExternalLink, Gamepad2, ShieldCheck } from 'lucide-react';
import { LearningArcadeGame } from './learning-games';

const BLOCK_GAMES: Record<number, { title: string; topic: string; url: string; source: string }> = {
  2: { title: 'Puzzle Builder', topic: 'Learn how Blockly pieces connect', url: 'https://blockly.games/puzzle?lang=en', source: 'Blockly Games' },
  3: { title: 'Maze Runner', topic: 'Sequences, loops, and conditions', url: 'https://blockly.games/maze?lang=en', source: 'Blockly Games' },
  4: { title: 'Bird Logic', topic: 'Conditions and decision making', url: 'https://blockly.games/bird?lang=en', source: 'Blockly Games' },
  5: { title: 'Turtle Artist', topic: 'Loops and drawing with code', url: 'https://blockly.games/turtle?lang=en', source: 'Blockly Games' },
  6: { title: 'Movie Maker', topic: 'Math, coordinates, and animation', url: 'https://blockly.games/movie?lang=en', source: 'Blockly Games' },
  7: { title: 'Music Studio', topic: 'Functions and musical patterns', url: 'https://blockly.games/music?lang=en', source: 'Blockly Games' },
  8: { title: 'Pond Tutor', topic: 'Move from blocks to JavaScript', url: 'https://blockly.games/pond-tutor?lang=en', source: 'Blockly Games' },
  9: { title: 'Pond Strategy', topic: 'Program an autonomous strategy', url: 'https://blockly.games/pond-duck?lang=en', source: 'Blockly Games' },
  10: { title: 'Scratch Creator', topic: 'Build an original interactive project', url: 'https://scratchfoundation.github.io/scratch-gui/', source: 'Scratch Foundation' },
};

export function StageGameExperience({ grade, levelNumber, onBack, onComplete }: { grade: number; levelNumber: number; onBack: () => void; onComplete: () => void }) {
  const game = BLOCK_GAMES[grade];
  const [view, setView] = useState<'game' | 'lesson'>('game');

  if (!game) return <LearningArcadeGame grade={grade} levelNumber={levelNumber} onBack={onBack} onComplete={onComplete} />;

  if (view === 'lesson') {
    return <div className="relative"><button onClick={() => setView('game')} className="absolute right-6 top-6 z-20 flex items-center gap-2 rounded-xl border border-white/15 bg-slate-950/80 px-4 py-2 text-xs font-black text-white backdrop-blur"><Gamepad2 className="h-4 w-4" /> Back to game</button><LearningArcadeGame grade={grade} levelNumber={levelNumber} onBack={onBack} onComplete={onComplete} /></div>;
  }

  return (
    <div className="min-h-[calc(100vh-9.5rem)] bg-gradient-to-b from-sky-100 to-slate-200 p-3 md:p-6">
      <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[2rem] border-4 border-sky-400 bg-white shadow-2xl">
        <header className="flex flex-col gap-4 border-b-2 border-sky-200 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-800 hover:bg-sky-200" aria-label="Back to course library"><ArrowLeft className="h-5 w-5" /></button>
            <div><span className="text-[10px] font-black uppercase tracking-[.18em] text-sky-600">Stage {grade} • Challenge {levelNumber}</span><h1 className="text-xl font-black text-slate-900">{game.title}</h1><p className="text-xs font-semibold text-slate-500">{game.topic}</p></div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-700"><ShieldCheck className="h-4 w-4" /> Official educational game</span>
            <a href={game.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl border-2 border-sky-200 px-3 py-2 text-xs font-black text-sky-800 hover:bg-sky-50"><ExternalLink className="h-4 w-4" /> Open separately</a>
            <button onClick={() => setView('lesson')} className="quest-button flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white"><BookOpen className="h-4 w-4" /> Pass & unlock next</button>
          </div>
        </header>
        <div className="relative h-[min(760px,calc(100vh-13rem))] min-h-[560px] bg-slate-100">
          <iframe src={game.url} title={`${game.title} by ${game.source}`} className="absolute inset-0 h-full w-full border-0" allow="fullscreen; autoplay; clipboard-write" referrerPolicy="strict-origin-when-cross-origin" />
        </div>
        <footer className="flex flex-col gap-3 border-t-2 border-sky-200 bg-sky-50 px-5 py-3 text-xs font-semibold text-slate-600 sm:flex-row sm:items-center sm:justify-between"><span>Game provided by {game.source}. If it does not load inside the platform, use “Open separately”.</span><button onClick={() => setView('lesson')} className="font-black text-emerald-700 hover:text-emerald-900">Pass the lesson mission to unlock Challenge {Math.min(levelNumber + 1, 10)} →</button></footer>
      </div>
    </div>
  );
}
