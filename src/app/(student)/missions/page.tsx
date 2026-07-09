// src/app/(student)/missions/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { dbService } from '@/lib/db';
import Link from 'next/link';
import { Map, Star, Trophy, Sparkles, Filter, ChevronRight, Award, GraduationCap, Gamepad2, BookOpen } from 'lucide-react';

export default function MissionsPage() {
  const { student, profile, loading: appLoading } = useApp();
  const [missions, setMissions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState('All');
  const [progressMap, setProgressMap] = useState<Record<string, { completed: number; total: number; pct: number }>>({});

  useEffect(() => {
    async function loadMissions() {
      if (appLoading) return;
      // Allow loading if it is an admin (who doesn't have a student profile but can review paths)
      const isStudent = profile?.role === 'student';
      if (!profile && !student) {
        setLoading(false);
        return;
      }
      try {
        const [allMissions, allLessons, allChallenges, allCourses] = await Promise.all([
          dbService.getMissions(),
          dbService.getLessons(),
          dbService.getChallenges(),
          dbService.getCourses()
        ]);
        
        let progress: any[] = [];
        if (student) {
          progress = await dbService.getStudentProgress(student.id);
        }

        setMissions(allMissions);
        setCourses(allCourses);

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
  }, [student, profile, appLoading]);

  const isAdmin = profile?.role === 'admin';
  const studentGrade = student?.grade || profile?.grade || 'Grade 10';

  const allowedCourses = isAdmin
    ? courses
    : courses.filter(c => c.grade === studentGrade);

  // Auto-select single course if student only has access to one
  useEffect(() => {
    if (allowedCourses.length === 1 && selectedCourseId === 'all') {
      setSelectedCourseId(allowedCourses[0].id);
    }
  }, [allowedCourses, selectedCourseId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full border-4 border-navy-deep border-t-transparent h-10 w-10"></div>
      </div>
    );
  }

  const categories = ['All', 'Logic', 'Web', 'Python', 'AI'];
  
  const filteredMissions = missions.filter(m => {
    const matchesCategory = filterCategory === 'All' || m.category === filterCategory;
    const matchesCourse = selectedCourseId === 'all'
      ? allowedCourses.some(ac => ac.id === m.course_id)
      : m.course_id === selectedCourseId;
    return matchesCategory && matchesCourse && m.is_published;
  });

  const getCourseBadgeColor = (theme?: string) => {
    if (theme === 'emerald') return 'bg-emerald-500/10 text-emerald-700 border-emerald-550/20';
    if (theme === 'amber') return 'bg-amber-500/10 text-amber-700 border-amber-550/20';
    return 'bg-navy-deep/10 text-navy-deep border-navy-light/20';
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
            <Map className="h-6 w-6 text-navy-deep" />
            <span>K-12 CS Learning Pathways</span>
          </h2>
          <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
            Explore our curriculum structured for Grade 1 through Grade 12
          </p>
        </div>

        {/* Course Filter Tabs */}
        <div className="flex flex-wrap gap-2 items-center">
          {isAdmin && (
            <span className="text-[10px] bg-rose-100 text-rose-700 font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider border border-rose-250/25">
              👑 Admin View (All Grades)
            </span>
          )}
          {!isAdmin && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1.5 rounded-lg uppercase tracking-wider border border-emerald-250/25">
              🔑 {studentGrade} Access
            </span>
          )}
          {allowedCourses.length > 1 && (
            <button
              onClick={() => setSelectedCourseId('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                selectedCourseId === 'all'
                  ? 'bg-navy-deep text-white shadow-md shadow-navy-deep/20'
                  : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'
              }`}
            >
              All Courses
            </button>
          )}
          {allowedCourses.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCourseId(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                selectedCourseId === c.id
                  ? 'bg-navy-deep text-white shadow-md shadow-navy-deep/20'
                  : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      {/* Course Detail Display Banner (Only if single course selected) */}
      {selectedCourseId !== 'all' && (
        (() => {
          const currentCourse = courses.find(c => c.id === selectedCourseId);
          if (!currentCourse) return null;
          return (
            <div className={`p-5 rounded-2xl border flex items-start gap-4 ${getCourseBadgeColor(currentCourse.color_theme)}`}>
              <div className="h-10 w-10 shrink-0 rounded-xl bg-white/80 flex items-center justify-center text-lg shadow-sm">
                {currentCourse.color_theme === 'emerald' ? '🎮' : currentCourse.color_theme === 'amber' ? '📖' : '🎓'}
              </div>
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wide">{currentCourse.title}</h3>
                <p className="text-xs font-semibold opacity-90 mt-1">{currentCourse.description}</p>
              </div>
            </div>
          );
        })()
      )}

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 items-center text-xs">
        <span className="font-bold text-slate-400 uppercase mr-1 tracking-wider">Subjects:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1 rounded-full font-bold transition ${
              filterCategory === cat
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid listing */}
      {filteredMissions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 p-8">
          <div className="text-4xl">🏜️</div>
          <h3 className="mt-4 text-sm font-bold text-slate-700">No Missions Found</h3>
          <p className="text-xs text-slate-500 mt-1">There are no missions currently assigned to your grade path.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredMissions.map((m) => {
            const prog = progressMap[m.id] || { completed: 0, total: 0, pct: 0 };
            const isCompleted = prog.pct === 100;
            const correspondingCourse = courses.find(c => c.id === m.course_id);
            
            return (
              <div
                key={m.id}
                className={`group rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md hover:border-navy-light/45 duration-200 flex flex-col justify-between ${
                  isCompleted ? 'border-emerald-250 bg-emerald-50/10' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Category Tag & Grade Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-navy-deep text-white px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-widest leading-none">
                        {m.category}
                      </span>
                      {correspondingCourse && (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider leading-none border ${getCourseBadgeColor(correspondingCourse.color_theme)}`}>
                          {correspondingCourse.grade}
                        </span>
                      )}
                    </div>
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
