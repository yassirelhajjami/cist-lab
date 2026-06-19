// src/app/(student)/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { dbService } from '@/lib/db';
import { getXpProgress } from '@/components/layout/Navbar';
import { UserCircle, Mail, Hash, BookOpen, Award, Compass, Star, FileText } from 'lucide-react';

export default function StudentProfilePage() {
  const { student, profile } = useApp();
  const [badges, setBadges] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
      if (!student) return;
      try {
        const myBadges = await dbService.getStudentBadges(student.id);
        setBadges(myBadges);

        // Load all projects and filter by student
        const allProjects = await dbService.getProjects();
        const myProjects = allProjects.filter((p: any) => p.student_id === student.id);
        setProjects(myProjects);

        // Load progress
        const allProgress = await dbService.getStudentProgress(student.id);
        setProgress(allProgress);

        const allMissions = await dbService.getMissions();
        setMissions(allMissions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProfileData();
  }, [student]);

  if (loading || !profile || !student) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full border-4 border-navy-deep border-t-transparent h-10 w-10"></div>
      </div>
    );
  }

  const xpInfo = getXpProgress(profile.xp);
  const completedMissions = missions.filter(m =>
    progress.some(p => p.mission_id === m.id && !p.lesson_id && !p.challenge_id && p.status === 'completed')
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
          <UserCircle className="h-6 w-6 text-navy-deep" />
          <span>My CodeQuest Profile</span>
        </h2>
        <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
          Student file register record card, innovation dashboard, and achievements ledger
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* LEFT COLUMN: Student Information card */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
          <div className="text-center">
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="h-24 w-24 rounded-2xl border-4 border-gold-accent shadow bg-slate-50 mx-auto object-cover"
            />
            <h3 className="mt-3.5 text-lg font-black text-slate-850">{profile.full_name}</h3>
            <span className="inline-block bg-maple-red/20 text-maple-red px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mt-1.5">
              {profile.rank_title}
            </span>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-3.5 text-xs text-slate-700">
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

          <div className="border-t border-slate-100 pt-5 text-xs">
            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Academic Notes</span>
            <p className="text-slate-500 italic font-semibold leading-relaxed">
              {student.notes || 'No academic notes filed.'}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Badges, Projects list */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Badges earned */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-black text-sm uppercase text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center space-x-2">
              <Award className="h-4.5 w-4.5 text-navy-deep" />
              <span>Earned Badges ({badges.length})</span>
            </h3>

            {badges.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-450 italic font-semibold">
                No badges unlocked yet. Start completing mission paths!
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center space-x-2 rounded-lg bg-gold-accent/5 border border-gold-accent/25 p-2 px-3 text-xs"
                    title={b.description}
                  >
                    <span className="text-xl">{b.icon_url}</span>
                    <span className="font-bold text-slate-800 uppercase tracking-tight">{b.name}</span>
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
                    <span className="text-base">🏆</span>
                    <div>
                      <span className="font-black block uppercase tracking-wide leading-none">{m.title}</span>
                      <span className="text-[9px] text-emerald-600 block mt-1 leading-none font-bold">
                        Reward XP claimed successfully
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
