'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { dbService } from '@/lib/db';
import type { Course, Mission, StudentProgress } from '@/types';
import { getXpProgress } from '@/components/layout/Navbar';
import {
  ArrowRight, Camera, CheckCircle2, Compass, X
} from 'lucide-react';
import { GameIcon, GameIconName } from '@/components/ui/GameIcon';

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

const quickAdventures = [
  { href: '/scratch', title: 'Block Jungle', note: 'Create with colorful blocks', icon: 'palette' as GameIconName, color: 'bg-violet-100 border-violet-200' },
  { href: '/games', title: 'Puzzle Temple', note: 'Train your logic powers', icon: 'condition' as GameIconName, color: 'bg-amber-100 border-amber-200' },
  { href: '/code-lab', title: 'Code Workshop', note: 'Build something amazing', icon: 'monitor' as GameIconName, color: 'bg-sky-100 border-sky-200' },
];

export default function StudentDashboard() {
  const { profile, student, notifications, refreshUser, loginStreak } = useApp();
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [badgesCount, setBadgesCount] = useState(0);
  const [leaderboardPos, setLeaderboardPos] = useState<number | string>('-');

  useEffect(() => {
    async function loadDashboardData() {
      if (!profile || !student) return;
      const [allMissions, courses, progress, earnedBadges, board] = await Promise.all([
        dbService.getMissions(), dbService.getCourses(), dbService.getStudentProgress(student.id),
        dbService.getStudentBadges(student.id), dbService.getLeaderboard()
      ]);
      const completedMissionIds = progress
        .filter((item: StudentProgress) => !item.lesson_id && !item.challenge_id && item.status === 'completed')
        .map((item: StudentProgress) => item.mission_id);
      const courseIds = courses.filter((course: Course) => course.grade === student.grade).map((course: Course) => course.id);
      const gradeMissions = allMissions.filter((mission: Mission) => courseIds.includes(mission.course_id || '') && mission.is_published);
      setActiveMission(gradeMissions.find((mission: Mission) => !completedMissionIds.includes(mission.id)) || gradeMissions[0] || null);
      setBadgesCount(earnedBadges.length);
      const position = board.findIndex((item: { id: string }) => item.id === student.id);
      setLeaderboardPos(position >= 0 ? position + 1 : '—');
    }
    loadDashboardData().catch(console.error);
  }, [profile, student]);

  if (!profile || !student) return null;

  const xpInfo = getXpProgress(profile.xp);
  const firstName = profile.full_name.split(' ')[0];
  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const handleSelectAvatar = async (url: string) => {
    await dbService.updateStudent(profile.id, { avatar_url: url }, {});
    await refreshUser();
    setAvatarOpen(false);
  };

  return (
    <div className="space-y-7 pb-10">
      <section className="relative overflow-hidden rounded-[2rem] border-2 border-emerald-900/10 bg-gradient-to-br from-emerald-700 via-teal-700 to-sky-700 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-yellow-300/20" />
        <div className="absolute right-12 bottom-[-6rem] h-48 w-48 rounded-full border-[28px] border-white/5" />
        <div className="absolute left-1/2 top-5 text-5xl opacity-15 rotate-12">{'</>'}</div>
        <div className="relative z-10 grid items-center gap-6 lg:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <button onClick={() => setAvatarOpen(true)} className="group relative mx-auto shrink-0 sm:mx-0" aria-label="Change your explorer avatar">
              <div className="rounded-[1.7rem] bg-yellow-300 p-1.5 shadow-xl rotate-[-2deg] transition group-hover:rotate-2 group-hover:scale-105">
                <img src={profile.avatar_url || AVATAR_TEMPLATES[0]} alt="Your explorer avatar" className="h-24 w-24 rounded-[1.3rem] bg-white object-cover" />
              </div>
              <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-white bg-sky-500 shadow-lg"><Camera className="h-4 w-4" /></span>
            </button>
            <div className="text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/12 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-yellow-200"><Compass className="h-3.5 w-3.5" /> Explorer basecamp</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Ready for an adventure, {firstName}?</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-emerald-50/85">Your next coding quest is waiting. Solve puzzles, collect stars, and build your way to the top!</p>
            </div>
          </div>
          <div className="mx-auto flex gap-2 lg:mx-0">
            <div className="rounded-2xl border border-white/15 bg-black/10 px-4 py-3 text-center"><GameIcon name="xp" className="mx-auto h-9 w-9" /><b className="mt-1 block text-lg">{loginStreak}</b><span className="text-[9px] font-black uppercase tracking-wider text-white/65">day streak</span></div>
            <div className="rounded-2xl border border-white/15 bg-black/10 px-4 py-3 text-center"><GameIcon name="trophy" className="mx-auto h-9 w-9" /><b className="mt-1 block text-lg">{profile.level}</b><span className="text-[9px] font-black uppercase tracking-wider text-white/65">level</span></div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Adventure level', value: `Level ${profile.level}`, note: profile.rank_title, icon: 'trophy' as GameIconName, style: 'bg-yellow-100' },
          { label: 'Treasure coins', value: profile.coins.toLocaleString(), note: 'Spend on cool rewards', icon: 'coin' as GameIconName, style: 'bg-orange-100' },
          { label: 'Explorer rank', value: `#${leaderboardPos}`, note: 'On the school leaderboard', icon: 'crown' as GameIconName, style: 'bg-rose-100' },
          { label: 'Badges found', value: badgesCount.toString(), note: 'Keep collecting!', icon: 'gem' as GameIconName, style: 'bg-violet-100' }
        ].map(({ label, value, note, icon, style }) => (
          <article key={label} className="quest-card quest-card-hover flex items-center gap-4 p-4.5">
            <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${style}`}><GameIcon name={icon} className="h-14 w-14 drop-shadow-md" /></div>
            <div><span className="quest-kicker">{label}</span><strong className="mt-0.5 block text-2xl font-black text-slate-900">{value}</strong><span className="text-[11px] font-semibold text-slate-500">{note}</span></div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.65fr_1fr]">
        <article className="quest-card overflow-hidden">
          <div className="flex items-center justify-between border-b-2 border-emerald-50 px-5 py-4 md:px-6">
            <div><span className="quest-kicker">Continue your journey</span><h3 className="text-xl font-black text-slate-900">Your next quest</h3></div>
            <Link href="/missions" className="flex items-center gap-1 text-xs font-black text-emerald-700 hover:text-emerald-900">Quest map <ArrowRight className="h-4 w-4" /></Link>
          </div>
          {activeMission ? (
            <div className="p-5 md:p-6">
              <div className="rounded-[1.5rem] border-2 border-sky-100 bg-gradient-to-br from-sky-50 to-emerald-50 p-5 md:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2"><span className="rounded-full bg-emerald-700 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">{activeMission.category}</span><span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-[10px] font-black uppercase text-emerald-700">{activeMission.difficulty}</span></div>
                    <h4 className="mt-4 text-2xl font-black text-slate-900">{activeMission.title}</h4>
                    <p className="mt-2 max-w-xl text-sm font-medium leading-relaxed text-slate-600">{activeMission.description}</p>
                  </div>
                  <div className="flex shrink-0 gap-2"><span className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-black text-amber-600 shadow-sm"><GameIcon name="xp" className="h-5 w-5" /> {activeMission.xp_reward} XP</span><span className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-black text-orange-600 shadow-sm"><GameIcon name="coin" className="h-5 w-5" /> {activeMission.coin_reward}</span></div>
                </div>
                <div className="mt-6 flex flex-col gap-4 border-t-2 border-white/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800"><CheckCircle2 className="h-5 w-5" /> Complete activities to unlock rewards</div>
                  <Link href={`/missions/${activeMission.id}`} className="quest-button flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white shadow-lg">Start quest <ArrowRight className="h-4 w-4" /></Link>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-4"><div className="quest-progress h-4 flex-1"><div className="h-full" style={{ width: `${xpInfo.percentage}%` }} /></div><span className="text-xs font-black text-emerald-800">{xpInfo.percentage}% to level {profile.level + 1}</span></div>
            </div>
          ) : <div className="p-12 text-center"><GameIcon name="trophy" className="mx-auto h-20 w-20" /><h4 className="mt-3 text-xl font-black">All quests conquered!</h4><p className="mt-1 text-sm text-slate-500">Visit the workshop and create something new.</p></div>}
        </article>

        <article className="quest-card p-5 md:p-6">
          <div className="flex items-start justify-between"><div><span className="quest-kicker">Pick a side adventure</span><h3 className="text-xl font-black text-slate-900">Explore & play</h3></div><GameIcon name="flag" className="h-11 w-11" /></div>
          <div className="mt-5 space-y-3">
            {quickAdventures.map(({ href, title, note, icon, color }) => <Link key={href} href={href} className="group flex items-center gap-3 rounded-2xl border-2 border-slate-100 bg-slate-50/70 p-3 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white"><span className={`flex h-12 w-12 items-center justify-center rounded-xl border ${color}`}><GameIcon name={icon} className="h-10 w-10" /></span><span className="min-w-0 flex-1"><b className="block text-sm font-black text-slate-800">{title}</b><span className="text-[11px] font-semibold text-slate-500">{note}</span></span><ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600" /></Link>)}
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-amber-50 p-4 text-xs font-semibold leading-relaxed text-amber-900"><GameIcon name="sparkle" className="h-7 w-7 shrink-0" />Try one small challenge every day to keep your streak alive.</div>
        </article>
      </section>

      <section className="quest-card p-5 md:p-6">
        <div className="flex items-center justify-between"><div><span className="quest-kicker">Messages from your world</span><h3 className="text-xl font-black text-slate-900">Latest quest news</h3></div>{unreadCount > 0 && <span className="rounded-full bg-rose-100 px-3 py-1 text-[10px] font-black text-rose-700">{unreadCount} NEW</span>}</div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {notifications.length === 0 ? <div className="col-span-full rounded-2xl bg-slate-50 py-8 text-center text-sm font-semibold text-slate-400">Your adventure log is quiet—for now!</div> : notifications.slice(0, 3).map((notification) => <div key={notification.id} className="rounded-2xl border-2 border-slate-100 bg-slate-50/70 p-4"><GameIcon name="bell" className="h-9 w-9" /><b className="mt-3 block text-sm text-slate-800">{notification.title}</b><p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{notification.message}</p></div>)}
        </div>
      </section>

      {avatarOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="avatar-title"><div className="quest-card w-full max-w-lg p-6"><div className="flex items-start justify-between"><div><span className="quest-kicker">Choose your hero</span><h3 id="avatar-title" className="text-2xl font-black text-slate-900">Explorer avatars</h3></div><button onClick={() => setAvatarOpen(false)} className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200" aria-label="Close avatar picker"><X className="h-5 w-5" /></button></div><div className="mt-6 grid grid-cols-4 gap-3">{AVATAR_TEMPLATES.map((url, index) => <button key={url} onClick={() => handleSelectAvatar(url)} className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-2 transition hover:-translate-y-1 hover:border-emerald-400"><img src={url} alt={`Explorer avatar ${index + 1}`} className="aspect-square w-full rounded-xl bg-white" /></button>)}</div></div></div>}
    </div>
  );
}
