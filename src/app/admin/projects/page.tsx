// src/app/admin/projects/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { dbService } from '@/lib/db';
import { Compass, Check, X, ShieldAlert, Star, AlertCircle, FileText } from 'lucide-react';

export default function AdminProjectsModeration() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected'
  
  // Moderate form states
  const [score, setScore] = useState(90);
  const [feedback, setFeedback] = useState('Excellent project code design! Keep on coding.');
  const [xpAward, setXpAward] = useState(200);
  const [msg, setMsg] = useState('');

  async function loadProjects() {
    try {
      const all = await dbService.getProjects();
      setProjects(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  const handleModerate = async (projectId: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    setMsg('');
    try {
      await dbService.moderateProject(
        projectId,
        status,
        status === 'approved' ? score : 0,
        feedback,
        status === 'approved' ? xpAward : 0
      );
      setMsg(`🎉 Success! Project has been ${status} and rewards dispatched.`);
      // Reset form variables
      setScore(90);
      setFeedback('Excellent project code design! Keep on coding.');
      setXpAward(200);
      await loadProjects();
    } catch (err: any) {
      setMsg(`Error: ${err.message || 'Operation failed'}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full border-4 border-navy-deep border-t-transparent h-10 w-10"></div>
      </div>
    );
  }

  const filteredProjects = projects.filter((p: any) => p.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
          <Compass className="h-6 w-6 text-navy-deep" />
          <span>Project Moderation & Grading</span>
        </h2>
        <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
          Assess student software files, evaluate code architectures, assign grades, and award bonus XP
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-xl border border-emerald-250 bg-emerald-50 text-xs text-emerald-850 font-bold flex items-center space-x-2.5 animate-pulse">
          <AlertCircle className="h-5 w-5" />
          <span>{msg}</span>
        </div>
      )}

      {/* Tabs Switch */}
      <div className="flex space-x-2 border-b border-slate-200">
        {['pending', 'approved', 'rejected'].map((tab) => {
          const count = projects.filter((p: any) => p.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider transition ${
                activeTab === tab
                  ? 'border-b-4 border-maple-red text-navy-deep font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* List Feed */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl p-8">
          <div className="text-3xl">🗃️</div>
          <h3 className="mt-3 text-sm font-bold text-slate-700">Moderation Queue Clear</h3>
          <p className="text-xs text-slate-500 mt-1">No items found matching the selected status.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProjects.map((p) => {
            const author = p.students?.profiles || { full_name: 'CIST Student', avatar_url: '', email: '', rank_title: 'Rookie Coder' };
            
            return (
              <div
                key={p.id}
                className="grid gap-6 lg:grid-cols-12 bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:border-slate-350 transition duration-150"
              >
                {/* Visual info column */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                    <img src={author.avatar_url} alt="av" className="h-9 w-9 rounded border bg-slate-50 object-cover" />
                    <div>
                      <span className="block font-black text-slate-850 text-sm leading-none">{author.full_name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1 leading-none">
                        {author.email} • {author.rank_title}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="bg-navy-deep text-white px-2 py-0.5 rounded text-[8.5px] uppercase font-black tracking-widest">
                      {p.category}
                    </span>
                    <h3 className="mt-2 text-base font-black text-slate-900 leading-snug">{p.title}</h3>
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed font-semibold">{p.description}</p>
                  </div>

                  <div className="h-40 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={p.image_url} alt="project-screen" className="h-full w-full object-cover" />
                  </div>
                </div>

                {/* Moderation Controls Form (only visible for pending items) */}
                <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-150 pt-5 lg:pt-0 lg:pl-6 flex flex-col justify-between h-full space-y-4">
                  {p.status === 'pending' ? (
                    <div className="space-y-4 flex-1">
                      <h4 className="text-xs font-black uppercase text-slate-700 flex items-center space-x-1.5 border-b pb-1.5 border-slate-100">
                        <ShieldAlert className="h-4.5 w-4.5 text-maple-red" />
                        <span>Teacher Assessment Sheet</span>
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">
                            Grade Score (0-100)
                          </label>
                          <input
                            type="number"
                            value={score}
                            onChange={(e) => setScore(Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-850"
                            min="0"
                            max="100"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">
                            Bonus XP Awarded
                          </label>
                          <input
                            type="number"
                            value={xpAward}
                            onChange={(e) => setXpAward(Number(e.target.value))}
                            className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-850"
                            min="0"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">
                          Teacher Feedback Notes
                        </label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="w-full h-18 rounded-lg border border-slate-250 bg-slate-50 p-2.5 text-xs font-semibold resize-none"
                          required
                        />
                      </div>

                      <div className="flex space-x-3 pt-3">
                        <button
                          onClick={() => handleModerate(p.id, 'rejected')}
                          className="flex-1 flex items-center justify-center space-x-1 border border-rose-200 bg-rose-50 hover:bg-rose-100 px-4 py-2.5 text-xs font-bold text-maple-red rounded-lg"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject Entry</span>
                        </button>
                        <button
                          onClick={() => handleModerate(p.id, 'approved')}
                          className="flex-2 flex items-center justify-center space-x-1 bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white rounded-lg shadow-sm"
                        >
                          <Check className="h-4 w-4" />
                          <span>Approve & Dispatch</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase text-slate-700 border-b pb-1.5 border-slate-100 flex items-center space-x-1.5">
                        <FileText className="h-4.5 w-4.5 text-navy-deep" />
                        <span>Grading Ledger Archive</span>
                      </h4>

                      <div className="space-y-3.5 text-xs">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-400 font-bold uppercase text-[9.5px]">Assigned Grade</span>
                          <span className="font-black text-slate-800">{p.teacher_score}/100</span>
                        </div>
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-slate-400 font-bold uppercase text-[9.5px]">Stars Dispatched</span>
                          <span className="font-black text-slate-800">⚡ {p.xp_awarded + 200} XP (incl. submit bonus)</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold uppercase text-[9.5px] block">Teacher Review comments:</span>
                          <p className="mt-1 text-slate-500 font-semibold italic">"{feedback}"</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
