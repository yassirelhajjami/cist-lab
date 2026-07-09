// src/app/(student)/leaderboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { dbService } from '@/lib/db';
import { Trophy, Send, Clock, Sparkles, Award, Star, Compass, Crown, Medal } from 'lucide-react';

export default function LeaderboardPage() {
  const { student, profile } = useApp();
  
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('score'); // 'score' (Formula) or 'xp' (pure XP)
  
  // Submit request form
  const [message, setMessage] = useState('');
  const [reqStatus, setReqStatus] = useState<any>(null); // 'none', 'pending', 'approved', 'rejected'
  const [submitting, setSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState('');

  async function loadLeaderboardData() {
    try {
      const board = await dbService.getLeaderboard();
      setLeaderboard(board);

      if (student) {
        const reqs = await dbService.getLeaderboardRequests();
        const myReq = reqs.find((r: any) => r.student_id === student.id);
        if (myReq) {
          setReqStatus(myReq.status);
        } else {
          setReqStatus('none');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaderboardData();
  }, [student]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !message.trim()) return;
    setSubmitting(true);
    setFormFeedback('');

    try {
      await dbService.submitLeaderboardRequest(student.id, message);
      setReqStatus('pending');
      setFormFeedback('Success! Your leaderboard access request is pending review.');
    } catch (err: any) {
      setFormFeedback(err.message || 'Request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full border-4 border-navy-deep border-t-transparent h-10 w-10"></div>
      </div>
    );
  }

  // Sort leaderboard according to active filter
  const sortedBoard = [...leaderboard].sort((a, b) => {
    if (filterType === 'xp') {
      return b.xp - a.xp;
    }
    return b.score - a.score;
  });

  const podium = sortedBoard.slice(0, 3);
  const listData = sortedBoard.slice(3);

  // Position references: Top 2, Top 1, Top 3 (standard podium look)
  const podiumIndexes = [1, 0, 2];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-navy-deep" />
          <span>CodeQuest Leaderboard</span>
        </h2>
        <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
          Formula: XP Score + (Project votes * 10) + (Teacher score * 5). Join the ranking pathway!
        </p>
      </div>

      {/* Renders Join Request Box if not approved */}
      {reqStatus !== 'approved' && (
        <div className="rounded-xl border border-navy-light/25 bg-navy-deep p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-accent/15 blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-xl text-center md:text-left">
              <h3 className="text-base font-black uppercase text-gold-accent flex items-center justify-center md:justify-start space-x-2">
                <Sparkles className="h-4.5 w-4.5" />
                <span>Join the Rankings Ladder</span>
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed mt-2.5">
                Students must submit a request to join the CIST leaderboard. This keeps our community competitive and safe. Write a short message to your instructor detailing your latest coding achievements.
              </p>
            </div>

            {reqStatus === 'pending' ? (
              <div className="flex items-center space-x-2.5 rounded-lg bg-white/10 px-5 py-3 border border-white/20 text-xs font-semibold">
                <Clock className="h-4 w-4 text-gold-accent animate-pulse" />
                <span>Request Pending Review</span>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="flex-1 w-full max-w-sm space-y-3">
                <textarea
                  placeholder="e.g. Mr. Finch, I completed Variable Village and submitted my Tangier tour app. Please add me to the board!"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-18 rounded-lg bg-navy-dark border border-navy-light/30 p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-gold-accent resize-none"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-maple-red hover:bg-maple-light py-2 text-xs font-bold uppercase text-white transition flex items-center justify-center space-x-1.5 shadow"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Request</span>
                </button>
              </form>
            )}
          </div>
          
          {formFeedback && (
            <p className="mt-3.5 text-xs font-bold text-gold-accent text-center md:text-left">{formFeedback}</p>
          )}
        </div>
      )}

      {/* Filter and Podium Board Grid */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        
        {/* Left Column: Podium and Rankings */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            {/* Filter Toggle */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-6">
              <span className="font-black text-sm uppercase text-slate-800">Academic Standings</span>
              <div className="flex space-x-1 border rounded-lg bg-slate-50 p-0.5">
                <button
                  onClick={() => setFilterType('score')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                    filterType === 'score' ? 'bg-white text-navy-deep shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  CIST Index
                </button>
                <button
                  onClick={() => setFilterType('xp')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                    filterType === 'xp' ? 'bg-white text-navy-deep shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Pure XP
                </button>
              </div>
            </div>

            {leaderboard.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No students currently rank on the board.
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Visual Podium Top 3 */}
                <div className="grid grid-cols-3 gap-3 items-end pt-10 pb-4 max-w-lg mx-auto border-b border-slate-100">
                  {podiumIndexes.map((pIdx) => {
                    const player = podium[pIdx];
                    if (!player) return <div key={pIdx} className="hidden sm:block"></div>;

                    const height = pIdx === 0 ? 'h-36' : pIdx === 1 ? 'h-28' : 'h-24';
                    const colors = pIdx === 0 ? 'bg-amber-100 border-amber-300 text-amber-800' :
                                   pIdx === 1 ? 'bg-slate-100 border-slate-350 text-slate-800' :
                                   'bg-amber-50/50 border-orange-200 text-orange-850';
                    const podiumBg = pIdx === 0 ? 'bg-gradient-to-t from-gold-accent to-gold-light' :
                                     pIdx === 1 ? 'bg-gradient-to-t from-slate-300 to-slate-100' :
                                     'bg-gradient-to-t from-orange-400 to-orange-200';

                    return (
                      <div key={player.id} className="flex flex-col items-center">
                        {/* Avatar */}
                        <div className="relative">
                          <img
                            src={player.avatar_url || undefined}
                            alt={player.name}
                            className="h-12 w-12 rounded-full border-2 bg-white object-contain border-navy-deep"
                          />
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
                            {pIdx === 0 ? (
                              <Crown className="h-5 w-5 text-yellow-500 fill-current drop-shadow-md" />
                            ) : pIdx === 1 ? (
                              <Medal className="h-5 w-5 text-slate-400 fill-current drop-shadow-sm" />
                            ) : (
                              <Medal className="h-5 w-5 text-amber-600 fill-current drop-shadow-sm" />
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-850 mt-1.5 truncate max-w-20 leading-none">
                          {player.name.split(' ')[0]}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold block mt-0.5 leading-none">
                          {filterType === 'xp' ? `${player.xp} XP` : `${player.score} pts`}
                        </span>

                        {/* Pedestal Box */}
                        <div className={`w-full ${height} ${podiumBg} rounded-t-lg mt-3 flex items-center justify-center shadow-inner`}>
                          <span className="text-2xl font-black text-navy-dark/70">{pIdx + 1}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Rankings List for positions 4+ */}
                <div className="space-y-2 mt-4">
                  {listData.map((player, idx) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3.5 rounded-lg border border-slate-150 text-xs font-semibold hover:bg-slate-50 transition ${
                        player.id === student?.id ? 'bg-navy-deep/5 border-navy-deep/20' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-5 text-center text-slate-400 font-bold">{idx + 4}</span>
                        <img src={player.avatar_url || undefined} alt="av" className="h-8 w-8 rounded-full border bg-white shrink-0 object-contain" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-850 font-black">{player.name}</span>
                            <span className="text-[8px] bg-slate-100 text-slate-550 px-1 rounded uppercase font-bold">
                              {player.rank_title}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400 block mt-0.5">{player.grade}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-800 font-black">
                          {filterType === 'xp' ? `${player.xp} XP` : `${player.score} pts`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scoring guides */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
          <h3 className="font-black text-sm uppercase text-slate-800 border-b border-slate-100 pb-3">
            Scoring Formula
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Leaderboard standings are calculated dynamically to favor both active curriculum completion and quality showcase publications:
          </p>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center justify-between border-b pb-1.5 border-slate-100">
              <span className="font-medium text-slate-500">Completing Lesson</span>
              <span className="font-bold text-slate-800">+25 XP</span>
            </div>
            <div className="flex items-center justify-between border-b pb-1.5 border-slate-100">
              <span className="font-medium text-slate-500">Completing Challenge</span>
              <span className="font-bold text-slate-800">+75 XP</span>
            </div>
            <div className="flex items-center justify-between border-b pb-1.5 border-slate-100">
              <span className="font-medium text-slate-500">Completing Mission</span>
              <span className="font-bold text-slate-800">+100 XP</span>
            </div>
            <div className="flex items-center justify-between border-b pb-1.5 border-slate-100">
              <span className="font-medium text-slate-500">Approved Showcase</span>
              <span className="font-bold text-slate-800">+200 XP</span>
            </div>
            <div className="flex items-center justify-between border-b pb-1.5 border-slate-100">
              <span className="font-medium text-slate-500">Showcase Peer Vote</span>
              <span className="font-bold text-slate-800">+10 Rank Pts</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-500">Teacher Score Scale</span>
              <span className="font-bold text-slate-800">1x Score * 5 Pts</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
