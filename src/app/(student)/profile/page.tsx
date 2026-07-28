// src/app/(student)/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { dbService } from '@/lib/db';
import { getXpProgress } from '@/components/layout/Navbar';
import { UserCircle, Mail, Hash, BookOpen, Award, Compass, FileText, CheckCircle2, Target } from 'lucide-react';
import { BadgeIcon } from '@/components/ui/BadgeIcon';
import { GameIcon } from '@/components/ui/GameIcon';

export default function StudentProfilePage() {
  const { student, profile, loading: appLoading } = useApp();
  const [badges, setBadges] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
      if (appLoading) return;
      if (!student) {
        setLoading(false);
        return;
      }
      try {
        const [myBadges, allProjects, allProgress, allMissions] = await Promise.all([
          dbService.getStudentBadges(student.id),
          dbService.getProjects(),
          dbService.getStudentProgress(student.id),
          dbService.getMissions()
        ]);
        setBadges(myBadges);
        const myProjects = allProjects.filter((p: any) => p.student_id === student.id);
        setProjects(myProjects);
        setProgress(allProgress);
        setMissions(allMissions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfileData();
  }, [student, appLoading]);

  if (loading || appLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full border-4 border-navy-deep border-t-transparent h-10 w-10"></div>
      </div>
    );
  }

  if (!profile || !student) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-200 p-8">
        <div className="text-4xl">🏜️</div>
        <h3 className="mt-4 text-sm font-bold text-slate-700">No Student Profile Found</h3>
        <p className="text-xs text-slate-500 mt-1">Please log in with a student account to view this page.</p>
      </div>
    );
  }

  const xpInfo = getXpProgress(profile.xp);
  const completedMissions = missions.filter(m =>
    progress.some(p => p.mission_id === m.id && !p.lesson_id && !p.challenge_id && p.status === 'completed')
  );
  const completedActivities = progress.filter((item) => item.status === 'completed').length;
  const approvedProjects = projects.filter((item) => item.status === 'approved').length;

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
          <UserCircle className="h-6 w-6 text-navy-deep" />
          <span>My CodeQuest Profile</span>
        </h2>
        <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
          Your personal adventure record, learning progress, and achievements
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* LEFT COLUMN: Student Information card */}
        <div className="lg:col-span-4 overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-[0_18px_50px_rgba(15,118,110,.12)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-teal-700 to-sky-700 px-6 pb-7 pt-8 text-white">
            <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full border-[28px] border-white/5" />
            <div className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-yellow-300/10" />
          <div className="text-center">
              <div className="relative mx-auto h-52 w-52 overflow-hidden rounded-[2.5rem] border-[6px] border-yellow-300 bg-gradient-to-b from-sky-100 to-emerald-100 shadow-2xl">
                <img
                  src={profile.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=cist'}
                  alt={`${profile.full_name}'s avatar`}
                  className="h-full w-full scale-[1.18] object-contain object-center drop-shadow-xl"
                />
              </div>
              <h3 className="mt-5 text-2xl font-black tracking-tight">{profile.full_name}</h3>
              <p className="mt-1 text-xs font-bold uppercase tracking-[.2em] text-emerald-100">Grade {student.grade} explorer</p>
            </div>
          </div>

          <div className="p-6">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[.18em] text-emerald-700">Adventure level</span>
                  <p className="mt-1 text-2xl font-black text-slate-900">Level {profile.level}</p>
                </div>
                <GameIcon name="trophy" className="h-14 w-14" />
              </div>
              <div className="mt-4 flex items-center justify-between text-[11px] font-black text-slate-600">
                <span>{xpInfo.earned.toLocaleString()} XP earned</span>
                <span>{xpInfo.range.toLocaleString()} XP goal</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full border border-emerald-200 bg-white p-0.5">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-500 transition-all" style={{ width: `${xpInfo.percentage}%` }} />
              </div>
              <p className="mt-2 text-right text-[10px] font-bold text-emerald-700">{xpInfo.percentage}% to level {profile.level + 1}</p>
            </div>

          <div className="mt-6 space-y-3.5 text-xs text-slate-700">
            <div className="flex items-center space-x-3">
              <Mail className="h-4.5 w-4.5 text-slate-400" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">School Email</span>
                <span className="font-semibold">{profile.email}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Hash className="h-4.5 w-4.5 text-slate-400" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Student Code</span>
                <span className="font-semibold">{student.student_code}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <BookOpen className="h-4.5 w-4.5 text-slate-400" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Class & Grade</span>
                <span className="font-semibold">{student.grade} • {student.classroom}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5 text-xs">
            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Academic Notes</span>
            <p className="text-slate-500 italic font-semibold leading-relaxed">
              {student.notes || 'No academic notes filed.'}
            </p>
          </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Badges, Projects list */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total XP', value: profile.xp.toLocaleString(), icon: 'xp' as const, tint: 'bg-amber-50 border-amber-200' },
              { label: 'Treasure coins', value: profile.coins.toLocaleString(), icon: 'coin' as const, tint: 'bg-orange-50 border-orange-200' },
              { label: 'Activities done', value: completedActivities.toString(), icon: 'trophy' as const, tint: 'bg-emerald-50 border-emerald-200' },
              { label: 'Badges earned', value: badges.length.toString(), icon: 'gem' as const, tint: 'bg-violet-50 border-violet-200' }
            ].map((stat) => (
              <div key={stat.label} className={`rounded-2xl border p-4 shadow-sm ${stat.tint}`}>
                <GameIcon name={stat.icon} className="h-10 w-10" />
                <p className="mt-2 text-2xl font-black text-slate-900">{stat.value}</p>
                <p className="text-[9px] font-black uppercase tracking-[.14em] text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[1.5rem] border border-sky-100 bg-gradient-to-r from-sky-50 to-emerald-50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white"><Target className="h-5 w-5" /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-black text-slate-900">Learning journey</h3>
                  <span className="text-xs font-black text-emerald-700">{completedMissions.length} paths mastered</span>
                </div>
                <p className="mt-1 text-xs font-semibold text-slate-500">{approvedProjects} approved projects · {completedActivities} completed learning activities</p>
              </div>
            </div>
          </div>
          
          {/* Section 1: Badges earned */}
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-black text-sm uppercase text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center space-x-2">
              <Award className="h-4.5 w-4.5 text-navy-deep" />
              <span>Earned Badges ({badges.length})</span>
            </h3>

            {badges.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-450 italic font-semibold">
                No badges unlocked yet. Start completing mission paths!
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className="group flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-3 text-xs transition hover:-translate-y-0.5 hover:shadow-md"
                    title={b.description}
                  >
                    <BadgeIcon name={b.icon_url} className="h-14 w-14 shrink-0 transition group-hover:scale-110" />
                    <div className="min-w-0">
                      <span className="block font-black uppercase tracking-tight text-slate-900">{b.name}</span>
                      <span className="mt-1 block text-[9px] font-bold uppercase tracking-wider text-amber-700">Achievement unlocked</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Showcase Projects checklist */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-black text-sm uppercase text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center space-x-2">
              <Compass className="h-4.5 w-4.5 text-navy-deep" />
              <span>My Showcase Submissions ({projects.length})</span>
            </h3>

            {projects.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-450 italic font-semibold">
                No software files submitted yet. Open the Code Lab to begin publishing!
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-slate-200 p-4 flex items-start justify-between flex-wrap gap-4 text-xs hover:border-slate-300 transition"
                  >
                    <div>
                      <div className="flex items-center space-x-2.5">
                        <span className="font-black text-slate-850 text-sm">{p.title}</span>
                        <span className="bg-slate-100 text-slate-550 px-2 py-0.5 rounded text-[8.5px] uppercase font-bold tracking-wider leading-none">
                          {p.category}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1.5 leading-relaxed font-semibold max-w-lg">{p.description}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      {p.teacher_score && (
                        <div className="text-right">
                          <span className="block text-[9px] uppercase font-bold text-slate-400">Score</span>
                          <span className="font-black text-slate-800">{p.teacher_score}/100</span>
                        </div>
                      )}
                      
                      <div className="text-right">
                        <span className="block text-[9px] uppercase font-bold text-slate-400">Status</span>
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          p.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          p.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-slate-100 text-slate-600 animate-pulse'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Completed Pathways */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-black text-sm uppercase text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center space-x-2">
              <FileText className="h-4.5 w-4.5 text-navy-deep" />
              <span>Completed Mission Pathways ({completedMissions.length})</span>
            </h3>

            {completedMissions.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-450 italic font-semibold">
                No pathways fully completed yet. Start Python Basics or Robot Solver!
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {completedMissions.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg bg-emerald-50/35 border border-emerald-200 text-xs flex items-center space-x-2.5 text-emerald-800"
                  >
                    <GameIcon name="trophy" className="h-9 w-9 shrink-0" />
                    <div>
                      <span className="font-black block uppercase tracking-wide leading-none">{m.title}</span>
                      <span className="text-[9px] text-emerald-600 block mt-1 leading-none font-bold">
                        Path completed · rewards claimed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
