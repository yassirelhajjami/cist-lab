// src/app/admin/leaderboard-requests/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { dbService } from '@/lib/db';
import { Trophy, Check, X, Clock, ShieldAlert, AlertCircle } from 'lucide-react';

export default function AdminLeaderboardRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [moderatingId, setModeratingId] = useState<string | null>(null);

  async function loadRequests() {
    try {
      const list = await dbService.getLeaderboardRequests();
      setRequests(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRequests(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleModerate = async (requestId: string, status: 'approved' | 'rejected') => {
    setModeratingId(requestId);
    setMsg('');
    try {
      await dbService.moderateLeaderboardRequest(requestId, status);
      setMsg(`🎉 Success! Request status updated to ${status}.`);
      await loadRequests();
    } catch (err: any) {
      setMsg(`Error: ${err.message || 'Operation failed'}`);
    } finally {
      setModeratingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full border-4 border-navy-deep border-t-transparent h-10 w-10"></div>
      </div>
    );
  }

  const pendingRequests = requests.filter((r: any) => r.status === 'pending');
  const archivedRequests = requests.filter((r: any) => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-navy-deep" />
          <span>Leaderboard Admission Requests</span>
        </h2>
        <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
          Review student registration applications to join the rankings ladders
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-xl border border-emerald-250 bg-emerald-50 text-xs text-emerald-850 font-bold flex items-center space-x-2.5 animate-pulse">
          <AlertCircle className="h-5 w-5" />
          <span>{msg}</span>
        </div>
      )}

      {/* Split Lists Pending vs Archive */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Pending Queue */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-black text-sm uppercase text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-1.5">
            <Clock className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
            <span>Pending Approvals ({pendingRequests.length})</span>
          </h3>

          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-250 rounded-xl p-5 shadow-sm text-slate-400">
              Leaderboard admission queue is clear.
            </div>
          ) : (
            pendingRequests.map((r) => {
              const author = r.students?.profiles || { full_name: 'CIST Student', avatar_url: '', email: '', rank_title: 'Rookie Coder' };
              
              return (
                <div
                  key={r.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start justify-between flex-wrap gap-4 hover:border-slate-300 transition"
                >
                  <div className="space-y-3 flex-1 min-w-[240px]">
                    <div className="flex items-center space-x-2.5">
                      <img src={author.avatar_url} alt="av" className="h-8 w-8 rounded border bg-slate-50 object-contain" />
                      <div>
                        <span className="text-xs font-black text-slate-850 block leading-none">{author.full_name}</span>
                        <span className="text-[9px] text-slate-400 block mt-1 leading-none">{author.rank_title}</span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">Student Message:</span>
                      <p className="text-xs text-slate-650 font-semibold italic mt-1 bg-slate-50 p-2.5 border border-slate-150 rounded">
                        &ldquo;{r.message}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2 shrink-0 items-center">
                    {moderatingId === r.id ? (
                      <div className="animate-spin rounded-full border-2 border-navy-deep border-t-transparent h-5 w-5 mr-2"></div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleModerate(r.id, 'rejected')}
                          className="p-2 rounded bg-rose-50 hover:bg-rose-100 text-maple-red border border-rose-200"
                          title="Decline request"
                        >
                          <X className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleModerate(r.id, 'approved')}
                          className="p-2 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                          title="Approve to leaderboard"
                        >
                          <Check className="h-4.5 w-4.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* History Ledger Archive */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-black text-sm uppercase text-slate-800 border-b border-slate-100 pb-3 flex items-center space-x-1.5">
            <ShieldAlert className="h-4.5 w-4.5 text-navy-deep" />
            <span>Admission Archive Ledger ({archivedRequests.length})</span>
          </h3>

          <div className="space-y-2.5">
            {archivedRequests.length === 0 ? (
              <div className="text-center py-8 bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-slate-400">
                No past moderated entries.
              </div>
            ) : (
              archivedRequests.map((r) => {
                const author = r.students?.profiles || { full_name: 'CIST Student', avatar_url: '', rank_title: 'Rookie Coder' };
                const isApproved = r.status === 'approved';

                return (
                  <div
                    key={r.id}
                    className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm text-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="font-black text-slate-800 block">{author.full_name}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">{author.rank_title}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                      isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
