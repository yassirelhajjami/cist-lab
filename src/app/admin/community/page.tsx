// src/app/admin/community/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { dbService } from '@/lib/db';
import { Shield, Check, X, EyeOff, MessageSquare, AlertCircle, FileText } from 'lucide-react';

export default function AdminCommunityModeration() {
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' (pending), 'comments' (active list)
  const [msg, setMsg] = useState('');

  async function loadForumData() {
    try {
      const allPosts = await dbService.getPosts();
      setPosts(allPosts);

      // Load all comments from the db for moderation
      // We can fetch approved ones and show options to hide
      const commList: any[] = [];
      const approvedPosts = allPosts.filter((p: any) => p.status === 'approved');
      for (const p of approvedPosts) {
        const list = await dbService.getComments(p.id);
        commList.push(...list.map((c: any) => ({ ...c, postTitle: p.title })));
      }
      setComments(commList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadForumData();
  }, []);

  const handleModeratePost = async (postId: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    setMsg('');
    try {
      await dbService.moderatePost(postId, status);
      setMsg(`🎉 Post has been ${status === 'approved' ? 'approved and published' : 'rejected'}.`);
      await loadForumData();
    } catch (err: any) {
      setMsg(`Error: ${err.message || 'Operation failed'}`);
      setLoading(false);
    }
  };

  const handleHideComment = async (commentId: string) => {
    if (confirm('Are you sure you want to hide this student comment from the public forum?')) {
      setLoading(true);
      setMsg('');
      try {
        await dbService.hideComment(commentId);
        setMsg('🎉 Comment has been successfully hidden.');
        await loadForumData();
      } catch (err: any) {
        setMsg(`Error: ${err.message || 'Operation failed'}`);
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full border-4 border-navy-deep border-t-transparent h-10 w-10"></div>
      </div>
    );
  }

  const pendingPosts = posts.filter((p: any) => p.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
          <Shield className="h-6 w-6 text-navy-deep" />
          <span>Forum & Comment Moderation</span>
        </h2>
        <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
          Review pending classroom topics, audit discussions, and hide flagged replies
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-xl border border-emerald-250 bg-emerald-50 text-xs text-emerald-850 font-bold flex items-center space-x-2.5 animate-pulse">
          <AlertCircle className="h-5 w-5" />
          <span>{msg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider transition ${
            activeTab === 'posts' ? 'border-b-4 border-maple-red text-navy-deep font-bold' : 'text-slate-500'
          }`}
        >
          Pending Posts ({pendingPosts.length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider transition ${
            activeTab === 'comments' ? 'border-b-4 border-maple-red text-navy-deep font-bold' : 'text-slate-500'
          }`}
        >
          Audit Active Comments ({comments.length})
        </button>
      </div>

      {/* Tab contents */}
      {activeTab === 'posts' ? (
        <div className="space-y-4">
          {pendingPosts.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-xl p-8">
              <div className="text-3xl">📭</div>
              <h3 className="mt-3 text-sm font-bold text-slate-700">All Posts Moderated</h3>
              <p className="text-xs text-slate-500 mt-1">There are no pending student discussions to review.</p>
            </div>
          ) : (
            pendingPosts.map((p) => {
              const author = p.students?.profiles || { full_name: 'CIST Student', avatar_url: '', email: '', rank_title: 'Rookie Coder' };
              
              return (
                <div
                  key={p.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-350 transition flex items-start justify-between flex-wrap gap-4"
                >
                  <div className="space-y-3 flex-1 min-w-[280px]">
                    <div className="flex items-center space-x-2.5">
                      <img src={author.avatar_url} alt="av" className="h-8 w-8 rounded border bg-slate-50 object-cover" />
                      <div>
                        <span className="text-xs font-black text-slate-800 block leading-none">{author.full_name}</span>
                        <span className="text-[9px] text-slate-450 uppercase block font-semibold mt-1 leading-none">
                          {author.rank_title}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] uppercase font-black tracking-wide">
                        {p.type}
                      </span>
                      <h4 className="mt-2 text-base font-black text-slate-900">{p.title}</h4>
                      <p className="mt-1 text-xs text-slate-550 leading-relaxed font-semibold">{p.content}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleModeratePost(p.id, 'rejected')}
                      className="flex items-center space-x-1 border border-rose-250 bg-rose-50 hover:bg-rose-100 text-maple-red px-4 py-2 text-xs font-bold rounded-lg transition"
                    >
                      <X className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleModeratePost(p.id, 'approved')}
                      className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold rounded-lg shadow-sm transition"
                    >
                      <Check className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-xl p-8">
              <div className="text-3xl">📭</div>
              <h3 className="mt-3 text-sm font-bold text-slate-700">No active comments</h3>
              <p className="text-xs text-slate-500 mt-1">Class comments are empty or hidden.</p>
            </div>
          ) : (
            comments.map((c) => {
              const author = c.students?.profiles || { full_name: 'CIST Student', avatar_url: '', email: '', rank_title: 'Rookie Coder' };
              
              return (
                <div
                  key={c.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start justify-between flex-wrap gap-4 hover:border-slate-350 transition"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-bold uppercase mb-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Reply under thread: "{c.postTitle}"</span>
                    </div>

                    <div className="flex items-center space-x-2.5">
                      <img src={author.avatar_url} alt="av" className="h-7 w-7 rounded border bg-slate-50 object-cover" />
                      <div>
                        <span className="text-xs font-black text-slate-800 leading-none block">{author.full_name}</span>
                        <span className="text-[8px] uppercase text-slate-450 leading-none block mt-0.5">{author.rank_title}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-semibold italic bg-slate-50/50 p-2.5 border border-slate-100 rounded-lg">
                      "{c.content}"
                    </p>
                  </div>

                  <div>
                    <button
                      onClick={() => handleHideComment(c.id)}
                      className="flex items-center space-x-1.5 border border-slate-300 hover:bg-rose-50 hover:border-rose-350 text-slate-600 hover:text-maple-red px-3 py-2 text-xs font-bold rounded-lg transition"
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      <span>Hide Comment</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
