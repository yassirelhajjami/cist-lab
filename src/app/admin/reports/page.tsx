// src/app/admin/reports/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { dbService } from '@/lib/db';
import { FileSpreadsheet, Download, BarChart2, CheckCircle, Award } from 'lucide-react';

export default function AdminReportsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [classStats, setClassStats] = useState({
    avgXp: 0,
    totalXp: 0,
    avgLevel: 0,
    completedMissionsCount: 0
  });

  useEffect(() => {
    async function loadReportsData() {
      try {
        const list = await dbService.getStudents();
        setStudents(list);

        if (list.length > 0) {
          const totalXp = list.reduce((sum: number, s: any) => sum + s.xp, 0);
          const totalLevel = list.reduce((sum: number, s: any) => sum + s.level, 0);
          
          // Count total completed missions across students
          let totalCompletedMissions = 0;
          for (const s of list) {
            const progress = await dbService.getStudentProgress(s.students.id);
            const count = progress.filter((p: any) => !p.lesson_id && !p.challenge_id && p.status === 'completed').length;
            totalCompletedMissions += count;
          }

          setClassStats({
            avgXp: Math.round(totalXp / list.length),
            totalXp,
            avgLevel: Math.round((totalLevel / list.length) * 10) / 10,
            completedMissionsCount: totalCompletedMissions
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReportsData();
  }, []);

  const handleExportCSV = () => {
    if (students.length === 0) return;
    
    // Define headers
    const headers = ['Full Name', 'Email', 'Student Code', 'Grade', 'Classroom', 'XP', 'Level', 'Rank', 'Status'];
    const rows = students.map((s) => [
      s.full_name,
      s.email,
      s.students.student_code,
      s.grade,
      s.students.classroom,
      s.xp,
      s.level,
      s.rank_title,
      s.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    // Download triggers
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cist_codequest_student_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full border-4 border-navy-deep border-t-transparent h-10 w-10"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs font-semibold text-slate-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
            <FileSpreadsheet className="h-6 w-6 text-navy-deep" />
            <span>Reports & Data Export</span>
          </h2>
          <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
            Export class rosters, review overall student progression analytics, and download spreadsheets
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-1.5 rounded-lg bg-maple-red hover:bg-maple-light px-5 py-2.5 text-xs font-bold text-white shadow transition-all active:scale-95"
        >
          <Download className="h-4.5 w-4.5" />
          <span>Export Student Roster (CSV)</span>
        </button>
      </div>

      {/* Stats Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Class size</span>
          <span className="text-2xl font-black text-slate-800 mt-2 block">{students.length} Students</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Average Stars XP</span>
          <span className="text-2xl font-black text-slate-800 mt-2 block">{classStats.avgXp} XP</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Average Level</span>
          <span className="text-2xl font-black text-slate-800 mt-2 block">Level {classStats.avgLevel}</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="block text-[10px] uppercase font-bold text-slate-400">Completed Pathways</span>
          <span className="text-2xl font-black text-slate-800 mt-2 block">{classStats.completedMissionsCount} Modules</span>
        </div>
      </div>

      {/* Analytics Roster layout */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-black text-sm uppercase text-slate-850 flex items-center space-x-2 border-b border-slate-100 pb-3">
          <BarChart2 className="h-4.5 w-4.5 text-navy-deep" />
          <span>Classroom Standings Ledger</span>
        </h3>

        <div className="space-y-2.5">
          {students.map((s) => (
            <div key={s.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-150 hover:bg-slate-50 transition">
              <div>
                <span className="font-black text-slate-800 block leading-none">{s.full_name}</span>
                <span className="text-[9px] text-slate-400 block mt-1 leading-none">{s.email}</span>
              </div>

              <div className="text-right">
                <span className="font-black text-slate-850 block leading-none">Level {s.level}</span>
                <span className="text-[9.5px] text-slate-450 block mt-1 leading-none font-bold">
                  {s.xp} XP • {s.coins} Coins
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
