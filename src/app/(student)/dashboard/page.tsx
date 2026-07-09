// src/app/(student)/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { dbService, XP_LEVELS } from '@/lib/db';
import { getXpProgress } from '@/components/layout/Navbar';
import Link from 'next/link';
import {
  Flame,
  Coins,
  Trophy,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles,
  Camera,
  CheckCircle2,
  BellRing,
  Zap,
  FolderHeart,
  Bell
} from 'lucide-react';

const AVATAR_TEMPLATES = [
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=adam',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=sofia',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=ryan',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=yasmine',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=nabil',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Alex',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Emma',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=Leo'
];

export default function StudentDashboard() {
  const { profile, student, notifications, refreshUser, loginStreak } = useApp();
  const [activeMission, setActiveMission] = useState<any>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [badgesCount, setBadgesCount] = useState(0);
  const [leaderboardPos, setLeaderboardPos] = useState<number | string>('-');

  useEffect(() => {
    async function loadDashboardData() {
      if (profile && student) {
        // Load missions and courses, then find next incomplete mission for student's grade
        const [allMissions, courses] = await Promise.all([
          dbService.getMissions(),
          dbService.getCourses()
        ]);
        const progress = await dbService.getStudentProgress(student.id);
        const completedMissionIds = progress
          .filter((p: any) => !p.lesson_id && !p.challenge_id && p.status === 'completed')
          .map((p: any) => p.mission_id);
        
        const studentCourses = courses.filter((c: any) => c.grade === student.grade);
        const gradeMissions = allMissions.filter((m: any) => studentCourses.some((sc: any) => sc.id === m.course_id));

        const nextMission = gradeMissions.find((m: any) => !completedMissionIds.includes(m.id) && m.is_published) || gradeMissions[0] || null;
        setActiveMission(nextMission);

        // Load badges count
        const earnedBadges = await dbService.getStudentBadges(student.id);
        setBadgesCount(earnedBadges.length);

        // Find leaderboard position
        const board = await dbService.getLeaderboard();
        const pos = board.findIndex((item: any) => item.id === student.id);
        setLeaderboardPos(pos !== -1 ? pos + 1 : 'Not Joined');
      }
    }
    loadDashboardData();
  }, [profile, student]);

  if (!profile || !student) return null;

  const xpInfo = getXpProgress(profile.xp);

  const handleSelectAvatar = async (url: string) => {
    await dbService.updateStudent(profile.id, { avatar_url: url }, {});
    await refreshUser();
    setAvatarOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-navy-deep p-6 text-white shadow-lg border border-navy-light/30">
        {/* Background Gradients */}
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-maple-red/20 blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 h-36 w-36 rounded-full bg-gold-accent/10 blur-2xl"></div>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 z-10">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-5 text-center md:text-left">
            {/* Interactive Avatar */}
            <div className="relative group cursor-pointer" onClick={() => setAvatarOpen(true)}>
              <img
                src={profile.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=adam'}
                alt={profile.full_name}
                className="h-24 w-24 rounded-2xl border-4 border-gold-accent bg-white shadow-xl hover:scale-105 transition duration-200"
              />
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div>
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3 justify-center md:justify-start">
                <h2 className="text-2xl font-black uppercase text-white">
                  Welcome back, <span className="text-gold-accent">{profile.full_name.split(' ')[0]}</span>!
                </h2>
                <span className="bg-maple-red/30 border border-maple-red/40 px-2.5 py-0.5 rounded text-[10px] uppercase font-black text-maple-light tracking-wider">
                  {profile.rank_title}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-300">
                {activeMission 
                  ? `Ready to code? Continue your "${activeMission.title}" mission path and unlock ${activeMission.xp_reward} XP!`
                  : "You've conquered all active school coding pathways! Check out the showcase or code lab."
                }
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-2 text-gold-accent text-xs font-black uppercase tracking-wider bg-navy-medium/40 border border-navy-light/30 rounded-xl px-4 py-3 shadow-inner">
            <Flame className="h-5 w-5 fill-current text-orange-500 animate-bounce" />
            <span>Daily Streak: {loginStreak} Day{loginStreak !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Grid statistics metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* STAT 1: LEVEL */}
        <div className="rounded-xl border border-navy-light/20 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-accent/15 text-gold-accent">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Level</span>
            <span className="text-2xl font-black text-slate-900 leading-none">Level {profile.level}</span>
            <span className="block text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">
              Rank: {profile.rank_title}
            </span>
          </div>
        </div>

        {/* STAT 2: COINS */}
        <div className="rounded-xl border border-navy-light/20 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/15 text-yellow-600">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Coins Balance</span>
            <span className="text-2xl font-black text-slate-900 leading-none">{profile.coins} Coins</span>
            <span className="block text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">
              Spendable in rewards store
            </span>
          </div>
        </div>

        {/* STAT 3: LEADERBOARD POSITION */}
        <div className="rounded-xl border border-navy-light/20 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-maple-red/15 text-maple-red">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Leaderboard</span>
            <span className="text-2xl font-black text-slate-900 leading-none">Rank #{leaderboardPos}</span>
            <span className="block text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">
              Top XP rankings
            </span>
          </div>
        </div>

        {/* STAT 4: BADGES */}
        <div className="rounded-xl border border-navy-light/20 bg-white p-5 shadow-sm flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Badges Earned</span>
            <span className="text-2xl font-black text-slate-900 leading-none">{badgesCount} Achievements</span>
            <span className="block text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">
              Unlocked via skill quests
            </span>
          </div>
        </div>
      </div>

      {/* Main content grid split */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Active Quest Path Resume */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-navy-light/20 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-black uppercase text-sm text-slate-800 flex items-center space-x-2">
                <BookOpen className="h-4.5 w-4.5 text-navy-deep" />
                <span>Next Quest Module</span>
              </h3>
              <Link href="/missions" className="text-xs text-navy-medium hover:text-maple-red font-bold flex items-center space-x-1">
                <span>All Paths</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {activeMission ? (
              <div className="rounded-xl border border-slate-200 p-5 bg-slate-50/50 hover:border-navy-light/30 transition duration-200">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <span className="bg-navy-deep text-white px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wide">
                      {activeMission.category}
                    </span>
                    <h4 className="mt-2 text-lg font-extrabold text-slate-900">{activeMission.title}</h4>
                    <p className="mt-1 text-sm text-slate-500 max-w-lg leading-snug">{activeMission.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-bold text-slate-400 uppercase">Rewards</span>
                    <span className="inline-flex items-center text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2 py-1.5 rounded-full mt-1 gap-1">
                      <Zap className="h-3 w-3 text-amber-500 fill-current" />
                      <span>{activeMission.xp_reward} XP</span>
                    </span>
                    <span className="inline-flex items-center text-xs font-bold text-yellow-600 bg-white border border-slate-200 px-2 py-1.5 rounded-full mt-1 ml-2 gap-1">
                      <Coins className="h-3 w-3 text-yellow-500 fill-current" />
                      <span>{activeMission.coin_reward} Coins</span>
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-200/60 pt-4">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
                    <span>Difficulty:</span>
                    <span className={`uppercase text-[10px] font-black px-1.5 py-0.5 rounded ${
                      activeMission.difficulty === 'beginner' ? 'bg-emerald-100 text-emerald-700' :
                      activeMission.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {activeMission.difficulty}
                    </span>
                  </div>
                  <Link
                    href={`/missions/${activeMission.id}`}
                    className="flex items-center space-x-2 rounded-lg bg-navy-deep hover:bg-maple-red px-5 py-2 text-xs font-bold text-white transition duration-200 shadow"
                  >
                    <span>Resume Quest</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-slate-400">
                All class missions completed! You are a CIST CodeQuest Hero.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Notification log history */}
        <div className="space-y-6">
          <div className="rounded-xl border border-navy-light/20 bg-white p-6 shadow-sm">
            <h3 className="font-black uppercase text-sm text-slate-800 flex items-center space-x-2 mb-4 border-b border-slate-100 pb-3">
              <BellRing className="h-4.5 w-4.5 text-navy-deep" />
              <span>Quest Logs & Alerts</span>
            </h3>

            <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No notifications yet. Try completing lessons!
                </div>
              ) : (
                notifications.slice(0, 5).map((n: any) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-lg border border-slate-150 text-xs flex items-start space-x-3 hover:bg-slate-50 transition ${
                      !n.is_read ? 'bg-navy-light/5 border-navy-light/20' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {n.type === 'badge' ? (
                        <Award className="h-4.5 w-4.5 text-gold-accent" />
                      ) : n.type === 'xp' ? (
                        <Zap className="h-4.5 w-4.5 text-amber-500 fill-current" />
                      ) : n.type === 'project' ? (
                        <FolderHeart className="h-4.5 w-4.5 text-purple-500" />
                      ) : (
                        <Bell className="h-4.5 w-4.5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800">{n.title}</p>
                      <p className="text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                      <span className="text-[9px] text-slate-400 mt-1 block">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AVATAR PICKER MODAL POPUP */}
      {avatarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">
              Select Character Avatar
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Pick a pixel art template to represent you inside the platform leaderboard.
            </p>

            <div className="grid grid-cols-4 gap-4">
              {AVATAR_TEMPLATES.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectAvatar(url)}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-2 hover:border-gold-accent hover:bg-gold-accent/5 transition"
                >
                  <img src={url} alt={`avatar-${idx}`} className="h-16 w-16 mx-auto object-contain bg-white rounded-lg border border-slate-100" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setAvatarOpen(false)}
              className="mt-6 w-full rounded-lg bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
