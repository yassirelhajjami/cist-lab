// src/app/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Trophy, Cpu, Gamepad2, ArrowRight, ShieldCheck, Flame, Award } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-navy-dark text-white selection:bg-maple-red selection:text-white overflow-x-hidden">
      {/* Background Jarvis Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-25 z-0"
        style={{ backgroundImage: "url('/jarvis.png')" }}
      />
      {/* Gradient to smooth visibility and maintain readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-dark/85 to-navy-dark pointer-events-none z-0" />

      {/* Decorative Top Accent */}
      <div className="h-2 w-full bg-gradient-to-r from-maple-red via-gold-accent to-navy-medium relative z-10"></div>

      {/* Navigation Header */}
      <header className="relative z-10 mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src="/cist.png" alt="CIST Logo" className="h-10 w-10 object-contain rounded-xl shadow-lg border border-navy-light/10 bg-white p-0.5" />
          <div>
            <h1 className="text-lg font-black tracking-tight uppercase leading-none">
              CIST <span className="text-gold-accent">CodeQuest</span>
            </h1>
            <span className="text-[10px] tracking-widest text-gray-400 uppercase">
              Canadian Int. School Tangier
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="https://averroescenter.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-navy-deep/40 hover:bg-navy-deep/75 px-5 py-2 text-sm font-bold border border-navy-light/20 transition hover:shadow-md text-gray-300 hover:text-white"
          >
            Log in to averroescenter
          </a>
          <Link
            href="/login"
            className="rounded-lg bg-navy-medium hover:bg-navy-light px-5 py-2 text-sm font-bold border border-navy-light/35 transition hover:shadow-md"
          >
            Portal Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
        {/* Glow Spheres */}
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-maple-red/10 blur-3xl"></div>
        <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-gold-accent/10 blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-tight">
            CIST <span className="text-gold-accent">CodeQuest</span>
          </h1>
          <p className="mt-4 text-xl sm:text-2xl font-black text-gray-300 uppercase tracking-wide">
            Learn Computer Science Through Missions, Games, and Projects.
          </p>
          <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            Welcome to the official technology academy of the Canadian International School Tangier. Complete interactive pathways, control virtual robots, publish software, and level up with your classmates.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group flex w-full sm:w-auto items-center justify-center space-x-2 rounded-xl bg-maple-red px-8 py-4 font-bold text-white transition-all duration-200 hover:bg-maple-light shadow-lg hover:shadow-maple-red/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Start Learning</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="flex w-full sm:w-auto items-center justify-center space-x-2 rounded-xl bg-navy-medium px-8 py-4 font-bold text-white transition-all duration-200 hover:bg-navy-light border border-navy-light/40 shadow-inner"
            >
              <span>Teacher Portal</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Gamified Core Features Grid */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-12 border-t border-navy-light/20">
        <h2 className="text-center text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
          Platform Achievements
        </h2>
        <p className="text-center text-xs text-gray-400 mt-1 uppercase tracking-widest">
          Engineered for safe classroom education & healthy progression
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1 */}
          <div className="rounded-xl border border-navy-light/30 bg-navy-deep p-6 transition hover:border-gold-accent/40 shadow-lg hover:-translate-y-1 duration-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold-accent/15 text-gold-accent mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold uppercase text-white">Interactive Missions</h3>
            <p className="mt-2 text-sm text-gray-400 leading-snug">
              Complete levels on Python basics, Variables village, and Neural nets using the interactive slideshow slides and code puzzles.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl border border-navy-light/30 bg-navy-deep p-6 transition hover:border-maple-red/40 shadow-lg hover:-translate-y-1 duration-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-maple-red/15 text-maple-light mb-4">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold uppercase text-white">Logic Games</h3>
            <p className="mt-2 text-sm text-gray-400 leading-snug">
              Solve algorithmic puzzles inside the Bug Hunter terminal, navigate the visual Robot Maze, and tackle time-based logic quizzes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl border border-navy-light/30 bg-navy-deep p-6 transition hover:border-navy-light/40 shadow-lg hover:-translate-y-1 duration-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-light/15 text-blue-400 mb-4">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold uppercase text-white">Robotics Lab</h3>
            <p className="mt-2 text-sm text-gray-400 leading-snug">
              Program motor sequences, setup LED triggers, configure distance sensors, and see how hardware algorithms react instantly.
            </p>
          </div>

          {/* Card 4 */}
          <div className="rounded-xl border border-navy-light/30 bg-navy-deep p-6 transition hover:border-gold-accent/40 shadow-lg hover:-translate-y-1 duration-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold-accent/15 text-gold-accent mb-4">
              <Trophy className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold uppercase text-white">XP Leaderboards</h3>
            <p className="mt-2 text-sm text-gray-400 leading-snug">
              Unlock unique student badges, maintain daily learning streaks, and submit requests to compete on the official CIST rankings!
            </p>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <section className="relative z-10 bg-navy-deep/40 py-16 border-t border-navy-light/20">
        <div className="mx-auto max-w-5xl px-6 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
            <div className="flex items-center space-x-2 text-gold-accent font-black uppercase text-xs tracking-wider mb-2">
              <ShieldCheck className="h-4.5 w-4.5" />
              <span>Safe School Guidelines</span>
            </div>
            <h2 className="text-3xl font-black uppercase text-white">
              Moderated Student Sandbox
            </h2>
            <p className="mt-4 text-gray-400 leading-relaxed text-sm">
              CodeQuest ensures a safe digital playground for CIST. All student community posts and custom software showcase submissions are held in a pending state until a teacher reviews and approves them from the control deck. Profanity checks and simple logging policies are enforced throughout the system.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-bold text-gray-300">
              <span className="bg-navy-medium px-3 py-1 rounded border border-navy-light/30">✓ Admin Moderation</span>
              <span className="bg-navy-medium px-3 py-1 rounded border border-navy-light/30">✓ No Private Messages</span>
              <span className="bg-navy-medium px-3 py-1 rounded border border-navy-light/30">✓ School Walls Only</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-4 w-full md:w-80 p-6 rounded-xl border border-navy-light/30 bg-navy-deep shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase">Live Stats</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center mt-2">
              <div className="rounded bg-navy-medium/30 p-3 border border-navy-light/10">
                <span className="block text-2xl font-black text-gold-accent">5</span>
                <span className="text-[10px] uppercase text-gray-400 font-bold">Class Modules</span>
              </div>
              <div className="rounded bg-navy-medium/30 p-3 border border-navy-light/10">
                <span className="block text-2xl font-black text-maple-light">30+</span>
                <span className="text-[10px] uppercase text-gray-400 font-bold">Coding Quests</span>
              </div>
            </div>
            <div className="mt-4 border-t border-navy-light/20 pt-4 flex items-center space-x-2 text-xs text-gray-400 justify-center">
              <span>Verified School Server</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mx-auto max-w-7xl px-6 py-12 border-t border-navy-light/25 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-6">
        <div>
          <p>© 2026 Canadian International School Tangier. All rights reserved.</p>
        </div>
        <div className="flex space-x-4">
          <Link href="/login" className="hover:text-white transition uppercase font-bold">Portal Log</Link>
          <span>•</span>
          <span className="uppercase">Tangier, Morocco</span>
        </div>
      </footer>
    </div>
  );
}

