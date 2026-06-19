// src/app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { dbService } from '@/lib/db';
import { Users, Compass, ShieldAlert, Award, ArrowUpRight, CheckSquare, Sparkles, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    pendingProjects: 0,
    pendingPosts: 0,
    pendingLeaderboards: 0,
    totalXp: 0,
    topStudent: 'Adam Belghiti',
    topProject: 'School Lunch AI Predictor'
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [completionData, setCompletionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    async function loadStats() {
      try {
        const students = await dbService.getStudents();
        const projects = await dbService.getProjects();
        const posts = await dbService.getPosts();
        const leaderboardReqs = await dbService.getLeaderboardRequests();

        const pendingProjCount = projects.filter((p: any) => p.status === 'pending').length;
        const pendingPostCount = posts.filter((p: any) => p.status === 'pending').length;
        const pendingLeaderCount = leaderboardReqs.filter((r: any) => r.status === 'pending').length;

        // Sum XP
        const totalXpSum = students.reduce((sum: number, s: any) => sum + (s.xp || 0), 0);

        // Sort to find top student
        const sortedStudents = [...students].sort((a: any, b: any) => b.xp - a.xp);
        const topStudentName = sortedStudents[0] ? sortedStudents[0].full_name : 'Adam Belghiti';

        // Sort to find top project
        const sortedProjects = [...projects].filter(p => p.status === 'approved').sort((a: any, b: any) => b.votes_count - a.votes_count);
        const topProjectTitle = sortedProjects[0] ? sortedProjects[0].title : 'School Lunch AI Predictor';

        setStats({
          totalStudents: students.length,
          activeStudents: students.filter((s: any) => s.status === 'active').length,
          pendingProjects: pendingProjCount,
          pendingPosts: pendingPostCount,
          pendingLeaderboards: pendingLeaderCount,
          totalXp: totalXpSum,
          topStudent: topStudentName,
          topProject: topProjectTitle
        });

        // Setup chart details: student names vs XP
        const formattedChart = students.map((s: any) => ({
          name: s.full_name.split(' ')[0],
          XP: s.xp,
          Coins: s.coins
        }));
        setChartData(formattedChart);

        // Completed paths charts mock data
        setCompletionData([
          { name: 'Python Basics', completed: 4 },
          { name: 'Variables Village', completed: 3 },
          { name: 'Loops Dungeon', completed: 2 },
          { name: 'Robot Solver', completed: 1 },
          { name: 'AI Explorer', completed: 0 }
        ]);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full border-4 border-navy-deep border-t-transparent h-10 w-10"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
          <ShieldAlert className="h-6 w-6 text-navy-deep" />
          <span>Teacher Control Overview</span>
        </h2>
        <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
          Canadian International School Tangier • CIST CodeQuest Administration Deck
        </p>
      </div>

      {/* Stats Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* STAT 1: ACTIVE STUDENTS */}
        <div className="rounded-xl border border-navy-light/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Class Size</span>
            <Users className="h-4.5 w-4.5 text-navy-deep" />
          </div>
          <div className="mt-3.5 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{stats.totalStudents}</span>
            <span className="text-xs text-slate-500 font-bold">({stats.activeStudents} Active)</span>
          </div>
        </div>

        {/* STAT 2: PENDING REVIEWS COOLDOWNS */}
        <div className="rounded-xl border border-navy-light/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Moderation Queues</span>
            <CheckSquare className="h-4.5 w-4.5 text-maple-red" />
          </div>
          <div className="mt-3.5 flex flex-wrap gap-2 text-xs">
            <Link href="/admin/projects" className="bg-maple-red/10 border border-maple-red/25 text-maple-light font-black px-2 py-1 rounded">
              🎨 {stats.pendingProjects} Projects
            </Link>
            <Link href="/admin/community" className="bg-navy-deep/10 border border-navy-light/20 text-navy-deep font-black px-2 py-1 rounded">
              💬 {stats.pendingPosts} Posts
            </Link>
          </div>
        </div>

        {/* STAT 3: TOTAL CLASS XP */}
        <div className="rounded-xl border border-navy-light/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total Stars Accumulation</span>
            <Award className="h-4.5 w-4.5 text-gold-accent" />
          </div>
          <div className="mt-3.5 flex items-baseline space-x-1">
            <span className="text-3xl font-black text-slate-900">{stats.totalXp.toLocaleString()}</span>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total XP</span>
          </div>
        </div>

        {/* STAT 4: HIGHLIGHTS SPOTLIGHT */}
        <div className="rounded-xl border border-navy-light/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">Class Leaders</span>
            <Sparkles className="h-4.5 w-4.5 text-gold-accent" />
          </div>
          <div className="mt-2 text-xs space-y-1 text-slate-700">
            <p className="font-semibold truncate">
              🌟 Top: <span className="font-extrabold text-slate-900">{stats.topStudent}</span>
            </p>
            <p className="font-semibold truncate">
              🏆 Showcase: <span className="font-extrabold text-slate-900">{stats.topProject}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts block split grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* CHART 1: STUDENT XP BAR CHART */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-black text-sm uppercase text-slate-800 mb-6 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Classroom XP Levels Standings</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Recharts Visuals</span>
          </h3>
          <div className="h-72 w-full font-semibold text-xs">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ background: '#0B2545', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="XP" fill="#134074" radius={[4, 4, 0, 0]} name="XP score" />
                  <Bar dataKey="Coins" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Coins count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CHART 2: PATHWAY COMPLETIONS */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-black text-sm uppercase text-slate-800 mb-6 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span>Mission completion stats</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Class engagement rate</span>
          </h3>
          <div className="h-72 w-full font-semibold text-xs">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={completionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#0B2545', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="completed" stroke="#C53030" fill="#C53030" fillOpacity={0.15} name="Students Completed" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Shortcuts review center */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-black text-sm uppercase text-slate-850 border-b border-slate-150 pb-3.5 mb-5 flex items-center space-x-2">
          <CheckSquare className="h-5 w-5 text-navy-deep" />
          <span>Pending Student Submissions Review Center</span>
        </h3>

        <div className="grid gap-4 sm:grid-cols-3 text-center">
          <div className="rounded-lg border border-slate-200 p-4 hover:border-navy-light/40 transition">
            <span className="block text-2xl font-black text-slate-800">{stats.pendingProjects}</span>
            <span className="text-xs text-slate-550 block mt-1.5 uppercase font-bold tracking-tight">Showcase Projects</span>
            <Link
              href="/admin/projects"
              className="mt-3.5 inline-flex items-center space-x-1 text-xs text-navy-deep hover:text-maple-red font-black uppercase"
            >
              <span>Moderate Queue</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-lg border border-slate-200 p-4 hover:border-navy-light/40 transition">
            <span className="block text-2xl font-black text-slate-800">{stats.pendingPosts}</span>
            <span className="text-xs text-slate-550 block mt-1.5 uppercase font-bold tracking-tight">Community Forum posts</span>
            <Link
              href="/admin/community"
              className="mt-3.5 inline-flex items-center space-x-1 text-xs text-navy-deep hover:text-maple-red font-black uppercase"
            >
              <span>Moderate Queue</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-lg border border-slate-200 p-4 hover:border-navy-light/40 transition">
            <span className="block text-2xl font-black text-slate-800">{stats.pendingLeaderboards}</span>
            <span className="text-xs text-slate-550 block mt-1.5 uppercase font-bold tracking-tight">Leaderboard requests</span>
            <Link
              href="/admin/leaderboard-requests"
              className="mt-3.5 inline-flex items-center space-x-1 text-xs text-navy-deep hover:text-maple-red font-black uppercase"
            >
              <span>Moderate Queue</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
