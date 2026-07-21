// src/app/(student)/scratch/page.tsx
'use client';

import React from 'react';
import { Puzzle, Sparkles, BookOpen } from 'lucide-react';

export default function ScratchSandboxPage() {
  return (
    <div className="-m-4 md:-m-6 lg:-m-8 flex flex-col md:flex-row bg-navy-dark h-[calc(100vh-4.5rem)] text-slate-100 overflow-hidden md:rounded-tl-[2rem]">
      
      {/* Tutorial/Tips Panel */}
      <div className="w-full md:w-80 bg-gradient-to-b from-emerald-800 to-teal-950 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between shrink-0 h-48 md:h-full overflow-y-auto">
        <div className="p-4.5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-navy-light/10 pb-3">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Puzzle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white leading-none">Block Jungle</h2>
              <span className="text-[9px] font-bold text-emerald-200/70 uppercase mt-1 block">Build stories with code blocks</span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs text-slate-400">
            <p className="leading-relaxed">
              Welcome, explorer! Snap colorful blocks together to bring characters, stories, and games to life.
            </p>

            <div className="rounded-xl bg-navy-dark/40 border border-navy-light/10 p-3 space-y-2">
              <div className="flex items-center space-x-1.5 text-indigo-400 font-bold uppercase text-[10px]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Quick Starter Tips</span>
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-400 font-semibold">
                <li>Click the <span className="text-emerald-400 font-bold">Green Flag</span> to run scripts</li>
                <li>Drag blocks from categories on the left</li>
                <li>Add extensions like <span className="text-amber-400 font-bold">Pen</span> or <span className="text-amber-400 font-bold">Music</span></li>
                <li>Export projects to local files via File menu</li>
              </ul>
            </div>

            <div className="rounded-xl bg-navy-dark/40 border border-navy-light/10 p-3 space-y-2">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold uppercase text-[10px]">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Block Categories</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-wider text-slate-300">
                <span className="flex items-center space-x-1"><span className="h-2 w-2 rounded bg-blue-500"></span> <span>Motion</span></span>
                <span className="flex items-center space-x-1"><span className="h-2 w-2 rounded bg-purple-500"></span> <span>Looks</span></span>
                <span className="flex items-center space-x-1"><span className="h-2 w-2 rounded bg-pink-500"></span> <span>Sound</span></span>
                <span className="flex items-center space-x-1"><span className="h-2 w-2 rounded bg-yellow-500"></span> <span>Events</span></span>
                <span className="flex items-center space-x-1"><span className="h-2 w-2 rounded bg-orange-500"></span> <span>Control</span></span>
                <span className="flex items-center space-x-1"><span className="h-2 w-2 rounded bg-emerald-500"></span> <span>Sensing</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-navy-light/10 text-[9px] font-black uppercase text-slate-500 tracking-wider">
          <span>CIST Coding Academy Studio</span>
        </div>
      </div>

      {/* Embedded Scratch Iframe Editor */}
      <div className="flex-1 bg-navy-dark relative h-full">
        <iframe
          src="https://scratchfoundation.github.io/scratch-gui/"
          className="absolute inset-0 w-full h-full border-none"
          title="Scratch Editor Sandbox"
          allow="geolocation; microphone; camera; midi; encrypted-media"
          allowFullScreen
        />
      </div>

    </div>
  );
}
