// src/app/(student)/projects/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { dbService } from '@/lib/db';
import { Compass, ThumbsUp, ExternalLink, Calendar, Star, AlertCircle, Filter, Trophy } from 'lucide-react';

export default function ProjectsShowcasePage() {
  const { student } = useApp();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('All');
  const [votedProjects, setVotedProjects] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  async function loadProjects() {
    try {
      const list = await dbService.getProjects('approved');
      setProjects(list);
      
      // Load which projects the student already voted for (using local keys)
      if (student) {
        const voted: string[] = [];
        for (const p of list) {
          const key = `cist_cq_vote_${p.id}_${student.id}`;
          if (localStorage.getItem(key)) {
            voted.push(p.id);
          }
        }
        setVotedProjects(voted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, [student]);

  const handleVote = async (projectId: string) => {
    if (!student) return;
    setErrorMsg('');
    try {
      await dbService.voteProject(projectId, student.id);
      setVotedProjects(prev => [...prev, projectId]);
      // Update local state votes count
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, votes_count: p.votes_count + 1 } : p));
    } catch (err: any) {
      setErrorMsg(err.message || 'Voting failed.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full border-4 border-navy-deep border-t-transparent h-10 w-10"></div>
      </div>
    );
  }

  const categories = ['All', 'Python', 'Website', 'Robotics', 'AI', 'Game', 'School Innovation'];

  const filteredProjects = filterCat === 'All'
    ? projects
    : projects.filter(p => p.category === filterCat);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
            <Compass className="h-6 w-6 text-navy-deep" />
            <span>CIST Innovation Showcase</span>
          </h2>
          <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
            Explore approved student scripts, robot controls, and web applications. Vote for your favorites!
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-800 font-semibold flex items-center space-x-2 animate-bounce">
          <AlertCircle className="h-5 w-5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Categories & Filter Bar */}
      <div className="flex flex-wrap gap-2 items-center bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <Filter className="h-4 w-4 text-slate-400 mr-2 ml-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition capitalize ${
              filterCat === cat
                ? 'bg-navy-deep text-white shadow-sm'
                : 'text-slate-650 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Showcase Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 p-8">
          <div className="text-3xl">🏜️</div>
          <h3 className="mt-4 text-sm font-bold text-slate-700">No Projects Found</h3>
          <p className="text-xs text-slate-500 mt-1">Check back later or choose another filter tag.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((p) => {
            const author = p.students?.profiles || { full_name: 'CIST Student', avatar_url: '', rank_title: 'Rookie Coder' };
            const hasVoted = votedProjects.includes(p.id);

            return (
              <div
                key={p.id}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md hover:border-navy-light/35 transition duration-200"
              >
                {/* Visual Image Banner */}
                <div className="h-40 w-full relative bg-slate-100 overflow-hidden border-b">
                  <img
                    src={p.image_url}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute top-3 right-3 bg-navy-deep text-white px-2.5 py-0.5 rounded text-[9px] uppercase font-black tracking-widest shadow">
                    {p.category}
                  </span>
                  
                  {p.teacher_score && (
                    <span className="absolute bottom-3 left-3 bg-gold-accent text-navy-dark px-2.5 py-1 rounded text-xs font-black shadow flex items-center space-x-1 border border-gold-accent">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>Score: {p.teacher_score}/100</span>
                    </span>
                  )}
                </div>

                {/* Details Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-snug">{p.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-2 font-semibold">
                      {p.description}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4 space-y-3.5">
                    {/* Author Signature */}
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={author.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=cist'}
                        alt="author"
                        className="h-7 w-7 rounded border object-cover bg-white shrink-0"
                      />
                      <div className="text-[10px]">
                        <span className="block font-black text-slate-800 leading-none">{author.full_name}</span>
                        <span className="text-slate-450 uppercase leading-none font-bold block mt-1">
                          {author.rank_title}
                        </span>
                      </div>
                    </div>

                    {/* Actions and external codes links */}
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-1 border-t border-slate-100/50">
                      <div className="flex space-x-2">
                        {p.github_url && (
                          <a
                            href={p.github_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg border hover:bg-slate-100 text-slate-700 transition flex items-center justify-center"
                            title="GitHub Repository"
                          >
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                          </a>
                        )}
                        {p.project_url && (
                          <a
                            href={p.project_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg border hover:bg-slate-100 text-slate-700 transition"
                            title="Live Demo"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>

                      {/* Vote Button */}
                      <button
                        onClick={() => handleVote(p.id)}
                        disabled={hasVoted}
                        className={`flex items-center space-x-1.5 px-4.5 py-2 rounded-lg text-xs font-bold transition duration-200 border shadow-sm ${
                          hasVoted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-white hover:bg-navy-deep hover:text-white border-slate-200 text-slate-700 active:scale-95'
                        }`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5 fill-current" />
                        <span>{p.votes_count} Votes</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
