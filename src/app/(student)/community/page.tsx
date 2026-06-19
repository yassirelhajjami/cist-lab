// src/app/(student)/community/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { dbService } from '@/lib/db';
import { 
  Users, PlusCircle, MessageSquare, ThumbsUp, Send, Hash, Bell, 
  Search, Shield, Sparkles, HelpCircle, MessageCircle, Info 
} from 'lucide-react';

const CHANNELS = [
  { id: 'announcements', name: 'announcements', icon: '📢', type: 'announcement', desc: 'Official announcements and notices from CIST instructors.' },
  { id: 'general-chat', name: 'general-chat', icon: '💬', type: 'idea', desc: 'General coding discussions, logic riddles, and banter.' },
  { id: 'help-forum', name: 'help-forum', icon: '❓', type: 'question', desc: 'Stuck on syntax? Paste errors and help classmates troubleshoot bugs!' },
  { id: 'project-showcase', name: 'project-showcase', icon: '🎨', type: 'project', desc: 'Exhibit your custom software projects, HTML layouts, and scripts!' }
];

const MEMBERS = [
  { name: 'Mr. Harrison Finch', role: 'admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', rank: 'CIST Tech Hero', online: true },
  { name: 'Adam Belghiti', role: 'student', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=adam', rank: 'Bug Hunter', online: true },
  { name: 'Sofia Mansouri', role: 'student', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=sofia', rank: 'Algorithm Master', online: true },
  { name: 'Ryan Benjelloun', role: 'student', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ryan', rank: 'Code Explorer', online: true },
  { name: 'Yasmine Tazi', role: 'student', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=yasmine', rank: 'Robotics Engineer', online: false },
  { name: 'Nabil El Fassi', role: 'student', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=nabil', rank: 'Logic Builder', online: true }
];

export default function DiscordCommunityPage() {
  const { student, profile } = useApp();
  const [activeChannelId, setActiveChannelId] = useState('general-chat');
  const activeChannel = CHANNELS.find(c => c.id === activeChannelId) || CHANNELS[1];
  
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Add post modal
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });

  // View post details + comments drawer (Discord-like thread)
  const [activePost, setActivePost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const messageEndRef = useRef<HTMLDivElement>(null);

  async function loadPosts() {
    try {
      const allPosts = await dbService.getPosts('approved');
      setPosts(allPosts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  // Scroll to bottom on loading messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [posts, activeChannelId]);

  const handleOpenThread = async (post: any) => {
    setActivePost(post);
    setCommentLoading(true);
    try {
      const list = await dbService.getComments(post.id);
      setComments(list);
    } catch (err) {
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await dbService.likePost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
      if (activePost && activePost.id === postId) {
        setActivePost((prev: any) => ({ ...prev, likes_count: prev.likes_count + 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !newCommentText.trim() || !activePost) return;

    // Bad-word safety check
    const blacklist = ['badword1', 'badword2', 'spam'];
    if (blacklist.some(word => newCommentText.toLowerCase().includes(word))) {
      alert('Your message contains disallowed vocabulary. Let\'s keep CIST CodeQuest helpful and clean.');
      return;
    }

    try {
      await dbService.addComment(activePost.id, student.id, newCommentText);
      setNewCommentText('');
      const list = await dbService.getComments(activePost.id);
      setComments(list);
      setPosts(prev => prev.map(p => p.id === activePost.id ? { ...p, comments_count: p.comments_count + 1 } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      setFormMsg({ type: 'error', text: 'Please fill out all fields.' });
      return;
    }

    const blacklist = ['badword1', 'badword2', 'spam'];
    if (blacklist.some(word => newPostTitle.toLowerCase().includes(word) || newPostContent.toLowerCase().includes(word))) {
      setFormMsg({ type: 'error', text: 'Safety filter triggered. Disallowed words detected.' });
      return;
    }

    try {
      const data = {
        title: newPostTitle,
        content: newPostContent,
        type: activeChannel.type,
        image_url: ''
      };
      await dbService.createPost(student.id, data);
      setFormMsg({
        type: 'success',
        text: '🎉 Topic submitted! An instructor will approve it shortly.'
      });
      setNewPostTitle('');
      setNewPostContent('');
      setTimeout(() => {
        setShowNewTopicModal(false);
        loadPosts();
      }, 1500);
    } catch (err: any) {
      setFormMsg({ type: 'error', text: err.message || 'Posting failed.' });
    }
  };

  // Filter posts by active channel category
  const channelPosts = posts.filter(p => {
    if (activeChannel.id === 'announcements') {
      return p.type === 'announcement' || p.students?.profiles?.role === 'admin';
    }
    return p.type === activeChannel.type;
  });

  // Filter by search query
  const filteredPosts = channelPosts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.students?.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center bg-navy-dark text-slate-400">
        <div className="animate-spin rounded-full border-4 border-gold-accent border-t-transparent h-10 w-10"></div>
      </div>
    );
  }

  return (
    <div className="flex bg-navy-dark border border-navy-light/20 rounded-xl overflow-hidden shadow-2xl h-[calc(100vh-8.5rem)] text-slate-100">
      
      {/* 1. DISCORD LEFT SIDEBAR */}
      <div className="w-56 bg-navy-deep border-r border-navy-light/15 flex flex-col justify-between shrink-0">
        <div>
          {/* Header */}
          <div className="h-12 border-b border-navy-light/15 flex items-center px-4 space-x-2 font-black uppercase text-[11px] tracking-wider text-gold-accent bg-navy-dark/40 shadow-sm">
            <img src="/cist.png" alt="CIST Logo" className="h-5 w-5 object-contain rounded bg-white p-0.5" />
            <span>CIST CodeQuest</span>
          </div>
          
          {/* Channel list */}
          <div className="p-3 space-y-4">
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block px-2 mb-1.5">Text Channels</span>
              <div className="space-y-0.5">
                {CHANNELS.map(chan => {
                  const isActive = chan.id === activeChannelId;
                  return (
                    <button
                      key={chan.id}
                      onClick={() => {
                        setActiveChannelId(chan.id);
                        setActivePost(null);
                      }}
                      className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-left transition ${
                        isActive
                          ? 'bg-navy-light/25 text-white shadow-sm border-l-2 border-gold-accent'
                          : 'text-slate-400 hover:bg-navy-light/10 hover:text-slate-200'
                      }`}
                    >
                      <Hash className="h-4 w-4 text-slate-550 shrink-0" />
                      <span className="truncate">{chan.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* User Card footer */}
        {profile && (
          <div className="p-3 border-t border-navy-light/15 bg-navy-dark/50 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <img 
                src={profile.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=cist'} 
                alt="user avatar" 
                className="h-8.5 w-8.5 rounded-md border border-navy-light/30 object-cover bg-white"
              />
              <div className="min-w-0">
                <span className="block text-xs font-black truncate leading-none text-slate-200">{profile.full_name}</span>
                <span className="text-[9px] font-bold text-gold-accent uppercase mt-0.5 leading-none block">{profile.role}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. CENTER CHAT STREAM PANE */}
      <div className="flex-1 flex flex-col justify-between bg-navy-dark min-w-0">
        {/* Top Channel Header Bar */}
        <div className="h-12 border-b border-navy-light/15 flex items-center justify-between px-5 bg-navy-deep/20 shrink-0 select-none">
          <div className="flex items-center space-x-2 min-w-0">
            <Hash className="h-4.5 w-4.5 text-slate-450 shrink-0" />
            <h3 className="font-extrabold text-sm text-slate-200 truncate">{activeChannel.name}</h3>
            <span className="h-4 w-[1px] bg-navy-light/20 hidden md:block"></span>
            <p className="text-[10px] font-semibold text-slate-450 truncate hidden md:block">{activeChannel.desc}</p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* Search Input */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg bg-navy-deep border border-navy-light/25 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-550 w-44 focus:outline-none focus:border-gold-accent transition"
              />
            </div>

            {/* Create Topic Button */}
            {activeChannel.id !== 'announcements' && (
              <button
                onClick={() => {
                  setShowNewTopicModal(true);
                  setFormMsg({ type: '', text: '' });
                }}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gold-accent hover:bg-gold-light text-navy-dark text-[10px] font-black uppercase transition active:scale-95 shadow-md"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>New Topic</span>
              </button>
            )}
          </div>
        </div>

        {/* Message Feed Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
          
          {/* Welcome Announcement Card */}
          <div className="bg-navy-deep/45 border border-navy-light/20 p-5 rounded-xl text-center space-y-2 mb-6">
            <div className="text-3xl">{activeChannel.icon}</div>
            <h4 className="text-sm font-black uppercase text-slate-200 tracking-wider">Welcome to #{activeChannel.name}!</h4>
            <p className="text-xs text-slate-450 max-w-sm mx-auto font-medium">{activeChannel.desc}</p>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500 italic font-semibold">
              No chat logs found in #{activeChannel.name}.
            </div>
          ) : (
            filteredPosts.map(p => {
              const author = p.students?.profiles || { full_name: 'CIST Student', avatar_url: '', role: 'student', rank_title: 'Rookie Coder' };
              const isAdmin = author.role === 'admin';
              
              return (
                <div 
                  key={p.id}
                  onClick={() => handleOpenThread(p)}
                  className={`flex items-start space-x-3.5 group p-2.5 rounded-lg hover:bg-navy-deep/20 border border-transparent hover:border-navy-light/10 transition cursor-pointer ${
                    activePost?.id === p.id ? 'bg-navy-deep/30 border-navy-light/15' : ''
                  }`}
                >
                  <img
                    src={author.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=adam'}
                    alt="user avatar"
                    className="h-10 w-10 rounded-md border border-navy-light/35 bg-white shrink-0 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-black ${isAdmin ? 'text-gold-accent' : 'text-slate-200'}`}>
                        {author.full_name}
                      </span>
                      {isAdmin ? (
                        <span className="bg-gold-accent/20 text-gold-accent px-1.5 py-0.5 rounded text-[8px] uppercase font-black tracking-wide flex items-center space-x-0.5">
                          <Shield className="h-2 w-2" />
                          <span>Admin</span>
                        </span>
                      ) : (
                        <span className="bg-navy-medium text-slate-300 px-1.5 py-0.5 rounded text-[8px] uppercase font-bold tracking-wide">
                          {author.rank_title}
                        </span>
                      )}
                      <span className="text-[9px] text-slate-500 font-semibold uppercase">
                        {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-200 mt-1.5 leading-snug">{p.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed whitespace-pre-wrap">{p.content}</p>

                    {/* Discord Message reactions/actions footer */}
                    <div className="mt-2.5 flex items-center space-x-3 text-[10px] font-bold text-slate-550 border-t border-navy-light/10 pt-2 opacity-80 group-hover:opacity-100 transition">
                      <button 
                        onClick={(e) => handleLike(p.id, e)}
                        className="flex items-center space-x-1 bg-navy-deep/50 hover:bg-gold-accent/10 border border-navy-light/20 hover:border-gold-accent/30 hover:text-gold-accent px-2 py-0.5 rounded transition"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span>{p.likes_count} Reactions</span>
                      </button>

                      <span className="flex items-center space-x-1 bg-navy-deep/50 border border-navy-light/20 px-2 py-0.5 rounded">
                        <MessageSquare className="h-3 w-3" />
                        <span>{p.comments_count} Replies</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Floating instructions at bottom for empty text input */}
        <div className="px-5 pb-5 shrink-0">
          <div className="rounded-xl bg-navy-deep border border-navy-light/25 flex items-center px-4 py-3 relative">
            <span className="text-xs text-slate-500 font-bold">
              {activeChannel.id === 'announcements' 
                ? '🔒 Only CIST Teachers can post announcements here.'
                : `Use the [+ New Topic] button at the top right to start a message thread in #${activeChannel.name}!`
              }
            </span>
          </div>
        </div>
      </div>

      {/* 3. DISCORD COLLAPSIBLE THREAD VIEW (RIGHT DRAWER) */}
      {activePost && (
        <div className="w-80 border-l border-navy-light/20 bg-navy-deep/80 flex flex-col justify-between shrink-0 h-full animate-slide-in">
          {/* Header */}
          <div className="h-12 border-b border-navy-light/15 flex items-center justify-between px-4.5 bg-navy-dark/40 shrink-0">
            <div className="flex items-center space-x-2 min-w-0">
              <MessageCircle className="h-4.5 w-4.5 text-gold-accent shrink-0" />
              <h4 className="font-extrabold text-xs text-slate-200 truncate">Thread: {activePost.title}</h4>
            </div>
            <button 
              onClick={() => setActivePost(null)}
              className="text-[10px] font-black uppercase text-slate-450 hover:text-white"
            >
              Close
            </button>
          </div>

          {/* Discussion comments feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4.5 scrollbar-thin">
            {/* Original Post */}
            <div className="p-3.5 rounded-lg bg-navy-dark/50 border border-navy-light/15 space-y-2">
              <span className="text-[9px] font-bold text-gold-accent uppercase">Original Post</span>
              <p className="text-xs font-black text-slate-250 leading-snug">{activePost.title}</p>
              <p className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap">{activePost.content}</p>
            </div>

            <div className="border-t border-navy-light/10 pt-3.5 space-y-4">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">Channel Replies</span>
              
              {commentLoading ? (
                <div className="text-center py-4 text-xs text-slate-500 font-bold italic animate-pulse">Retrieving chat replies...</div>
              ) : comments.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 italic">No messages. Assist your fellow classmate!</div>
              ) : (
                comments.map(c => {
                  const commAuthor = c.students?.profiles || { full_name: 'CIST Student', avatar_url: '', role: 'student', rank_title: 'Rookie Coder' };
                  const isCommAdmin = commAuthor.role === 'admin';
                  
                  return (
                    <div key={c.id} className="flex space-x-2.5 items-start text-xs leading-normal">
                      <img 
                        src={commAuthor.avatar_url || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=adam'} 
                        alt="avatar" 
                        className="h-8 w-8 rounded-md bg-white border border-navy-light/20 object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span className={`font-black ${isCommAdmin ? 'text-gold-accent' : 'text-slate-250'}`}>{commAuthor.full_name}</span>
                          {isCommAdmin && (
                            <span className="bg-gold-accent/20 text-gold-accent px-1 py-0 rounded text-[7px] uppercase font-black leading-none">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 mt-1 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                        <span className="text-[8px] text-slate-500 font-semibold block mt-0.5">
                          {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Add Reply Input */}
          <form onSubmit={handleAddComment} className="p-3 border-t border-navy-light/15 bg-navy-dark/40 shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Reply to thread..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="w-full rounded-lg bg-navy-deep border border-navy-light/25 py-2 pl-3.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-accent transition"
                required
              />
              <button 
                type="submit" 
                className="absolute right-2 text-slate-500 hover:text-gold-accent transition active:scale-90"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. DISCORD RIGHT MEMBERS SIDEBAR */}
      <div className="w-52 bg-navy-deep border-l border-navy-light/15 hidden lg:flex flex-col justify-between shrink-0 h-full">
        <div className="p-4 space-y-5">
          {/* Section: Admins */}
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-2">Instructor — 1</span>
            <div className="space-y-2.5">
              {MEMBERS.filter(m => m.role === 'admin').map((m, idx) => (
                <div key={idx} className="flex items-center space-x-2.5">
                  <div className="relative">
                    <img src={m.avatar} alt="avatar" className="h-8 w-8 rounded-md bg-white border border-navy-light/20 object-cover" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-navy-deep"></span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-black text-gold-accent leading-none truncate">{m.name}</span>
                    <span className="text-[8px] font-black text-slate-500 uppercase mt-0.5 block truncate leading-none">{m.rank}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Students */}
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-2">Classmates — 5</span>
            <div className="space-y-2.5">
              {MEMBERS.filter(m => m.role === 'student').map((m, idx) => (
                <div key={idx} className={`flex items-center space-x-2.5 ${!m.online ? 'opacity-50' : ''}`}>
                  <div className="relative">
                    <img src={m.avatar} alt="avatar" className="h-8 w-8 rounded-md bg-white border border-navy-light/20 object-cover" />
                    <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-navy-deep ${
                      m.online ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}></span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-slate-300 leading-none truncate">{m.name}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase mt-0.5 block truncate leading-none">{m.rank}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE NEW TOPIC MODAL PANEL */}
      {showNewTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-navy-deep rounded-2xl p-6 shadow-2xl border border-navy-light/20 text-white">
            <div className="flex justify-between items-center mb-4 border-b border-navy-light/15 pb-2.5">
              <h3 className="text-base font-black uppercase text-slate-250 flex items-center space-x-2">
                <Users className="h-4.5 w-4.5 text-gold-accent" />
                <span>New Topic in #{activeChannel.name}</span>
              </h3>
              <button
                onClick={() => {
                  setShowNewTopicModal(false);
                  loadPosts();
                }}
                className="text-xs text-slate-450 hover:text-white uppercase font-black"
              >
                Cancel
              </button>
            </div>

            {formMsg.text && (
              <div className={`p-3.5 rounded-lg border text-xs font-semibold mb-4 leading-relaxed ${
                formMsg.type === 'success' ? 'bg-emerald-950 text-emerald-400 border-emerald-900' : 'bg-rose-950 text-rose-450 border-rose-900'
              }`}>
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Topic Title / Question Summary</label>
                <input
                  type="text"
                  placeholder="e.g., Variable swap challenge returns Canada instead of Tangier"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full rounded-lg border border-navy-light/25 bg-navy-dark px-3 py-2 text-xs font-semibold text-white placeholder-slate-550 focus:outline-none focus:border-gold-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1.5">Description details</label>
                <textarea
                  placeholder="Ask a question or explain your concepts. Markdown code segments can be used."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full h-32 rounded-lg border border-navy-light/25 bg-navy-dark px-3 py-2 text-xs font-semibold text-white placeholder-slate-550 focus:outline-none focus:border-gold-accent resize-none"
                  required
                />
              </div>

              <div className="rounded bg-navy-dark border border-navy-light/15 p-3 text-[10px] text-slate-450 font-semibold leading-relaxed flex items-start space-x-2">
                <Info className="h-4.5 w-4.5 text-gold-accent shrink-0" />
                <span>Posts start in pending review mode. They are audited for inappropriate language and school guidelines by CIST teachers before approval.</span>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-gold-accent hover:bg-gold-light py-3 font-black uppercase text-xs text-navy-dark transition shadow active:scale-95"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
