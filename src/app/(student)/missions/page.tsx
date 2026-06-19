// src/app/(student)/missions/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { dbService } from '@/lib/db';
import Link from 'next/link';
import { Map, Star, Trophy, Sparkles, Filter, ChevronRight, Award } from 'lucide-react';

export default function MissionsPage() {
  const { student } = useApp();
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [progressMap, setProgressMap] = useState<Record<string, { completed: number; total: number; pct: number }>>({});

  useEffect(() => {
    async function loadMissions() {
      if (!student) return;
      try {
        const [allMissions, progress, allLessons, allChallenges] = await Promise.all([
          dbService.getMissions(),
          dbService.getStudentProgress(student.id),
          dbService.getLessons(),
          dbService.getChallenges()
        ]);
        setMissions(allMissions);

        const map: Record<string, { completed: number; total: number; pct: number }> = {};

        for (const m of allMissions) {
          const lessons = allLessons.filter((l: any) => l.mission_id === m.id);
          const challenges = allChallenges.filter((c: any) => c.mission_id === m.id);
          const totalItems = lessons.length + challenges.length;
          
          if (totalItems === 0) {
            map[m.id] = { completed: 0, total: 0, pct: 0 };
            continue;
          }

          const completedLessons = progress.filter((p: any) => p.mission_id === m.id && p.lesson_id && p.status === 'completed').length;
          const completedChallenges = progress.filter((p: any) => p.mission_id === m.id && p.challenge_id && p.status === 'completed').length;
          const completedCount = completedLessons + completedChallenges;

          map[m.id] = {
            completed: completedCount,
            total: totalItems,
            pct: Math.round((completedCount / totalItems) * 100)
          };
        }
        setProgressMap(map);
      } catch (err) {
        console.error('Failed to load missions page:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMissions();
  }, [student]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full border-4 border-navy-deep border-t-transparent h-10 w-10"></div>
      </div>
    );
  }

  const categories = ['All', 'Python', 'Algorithms', 'Robotics', 'Web', 'AI', 'Logic'];
  
  const filteredMissions = filterCategory === 'All'
    ? missions.filter(m => m.is_published)
    : missions.filter(m => m.category === filterCategory && m.is_published);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
            <Map className="h-6 w-6 text-navy-deep" />
            <span>Missions Path Map</span>
          </h2>
          <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
            Complete paths, conquer debugging tasks, and claim CIST school badges
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-slate-400 mr-1 hidden sm:block" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                filterCategory === cat
                  ? 'bg-navy-deep text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid listing */}
      {filteredMissions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 p-8">
          <div className="text-4xl">🏜️</div>
          <h3 className="mt-4 text-sm font-bold text-slate-700">No Missions Found</h3>
          <p className="text-xs text-slate-500 mt-1">Check back later or search a different class category.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredMissions.map((m) => {
            const prog = progressMap[m.id] || { completed: 0, total: 0, pct: 0 };
            const isCompleted = prog.pct === 100;
            
            return (
              <div
                key={m.id}
                className={`group rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md hover:border-navy-light/45 duration-200 flex flex-col justify-between ${
                  isCompleted ? 'border-emerald-250 bg-emerald-50/10' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Category Tag & Difficulty */}
                  <div className="flex items-center justify-between">
                    <span className="bg-navy-deep text-white px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-widest leading-none">
                      {m.category}
                    </span>
                    <span className={`uppercase text-[9px] font-black px-2 py-0.5 rounded leading-none ${
                      m.difficulty === 'beginner' ? 'bg-emerald-100 text-emerald-700' :
                      m.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {m.difficulty}
                    </span>
                  </div>

                  <h3 className="mt-3.5 text-lg font-black text-slate-900 group-hover:text-navy-medium transition">
                    {m.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 leading-snug">{m.description}</p>
                </div>

                {/* Progress bar */}
                <div className="mt-5">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                    <span>Pathway Progress</span>
                    <span>{prog.completed} / {prog.total} Completed ({prog.pct}%)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/50">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-navy-deep'
                      }`}
                      style={{ width: `${prog.pct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Bottom stats and action CTA */}
                <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-3 text-xs font-bold text-slate-600">
                    <span className="flex items-center bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-full">
                      ⚡ {m.xp_reward} XP
                    </span>
                    <span className="flex items-center text-yellow-600 bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-full">
                      🪙 {m.coin_reward} Coins
                    </span>
                  </div>

                  <Link
                    href={`/missions/${m.id}`}
                    className={`flex items-center space-x-1.5 rounded-lg px-4.5 py-2 text-xs font-bold transition duration-200 ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : prog.pct > 0
                        ? 'bg-navy-deep hover:bg-maple-red text-white'
                        : 'bg-navy-deep hover:bg-maple-red text-white'
                    }`}
                  >
                    <span>{isCompleted ? 'Review Path' : prog.pct > 0 ? 'Continue' : 'Start Path'}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
