// src/app/admin/missions/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { dbService } from '@/lib/db';
import { Map, PlusCircle, Edit3, Trash2, ShieldAlert, AlertCircle, FolderKanban, GraduationCap, LayoutGrid } from 'lucide-react';

export default function AdminMissionsManagement() {
  const [missions, setMissions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'missions' | 'courses'>('missions');

  // Add / Edit Mission Form modal
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [isEditingMission, setIsEditingMission] = useState<any>(null); // missionId or null
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Logic' | 'Web' | 'Python' | 'AI' | 'Robotics' | 'Algorithms'>('Python');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [xpReward, setXpReward] = useState(100);
  const [coinReward, setCoinReward] = useState(50);
  const [orderIndex, setOrderIndex] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [courseId, setCourseId] = useState('');

  // Add / Edit Course Form modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState<any>(null); // courseId or null
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseGrade, setCourseGrade] = useState('Grade 10');
  const [courseTheme, setCourseTheme] = useState('navy');
  const [courseIcon, setCourseIcon] = useState('Award');
  const [courseOrderIndex, setCourseOrderIndex] = useState(1);

  async function loadData() {
    try {
      const [allMissions, allCourses] = await Promise.all([
        dbService.getMissions(),
        dbService.getCourses()
      ]);
      setMissions(allMissions);
      setCourses(allCourses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleMissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const data = {
        title,
        description,
        category,
        difficulty,
        xp_reward: xpReward,
        coin_reward: coinReward,
        order_index: orderIndex,
        is_published: isPublished,
        course_id: courseId || null
      };

      if (isEditingMission) {
        await dbService.updateMission(isEditingMission, data);
        setMsg('🎉 Mission path updated successfully!');
      } else {
        await dbService.createMission(data);
        setMsg('🎉 New mission path created successfully!');
      }

      setShowMissionModal(false);
      setIsEditingMission(null);
      setTitle('');
      setDescription('');
      setCourseId('');
      await loadData();
    } catch (err: any) {
      setMsg(`Error: ${err.message || 'Operation failed'}`);
      setLoading(false);
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const data = {
        title: courseTitle,
        description: courseDescription,
        grade: courseGrade,
        color_theme: courseTheme,
        icon_url: courseIcon,
        order_index: courseOrderIndex,
        is_published: true
      };

      if (isEditingCourse) {
        await dbService.updateCourse(isEditingCourse, data);
        setMsg('🎉 Course updated successfully!');
      } else {
        await dbService.createCourse(data);
        setMsg('🎉 New K-12 course created successfully!');
      }

      setShowCourseModal(false);
      setIsEditingCourse(null);
      setCourseTitle('');
      setCourseDescription('');
      await loadData();
    } catch (err: any) {
      setMsg(`Error: ${err.message || 'Operation failed'}`);
      setLoading(false);
    }
  };

  const handleEditMissionClick = (m: any) => {
    setIsEditingMission(m.id);
    setTitle(m.title);
    setDescription(m.description);
    setCategory(m.category);
    setDifficulty(m.difficulty);
    setXpReward(m.xp_reward);
    setCoinReward(m.coin_reward);
    setOrderIndex(m.order_index);
    setIsPublished(m.is_published);
    setCourseId(m.course_id || '');
    setShowMissionModal(true);
  };

  const handleEditCourseClick = (c: any) => {
    setIsEditingCourse(c.id);
    setCourseTitle(c.title);
    setCourseDescription(c.description);
    setCourseGrade(c.grade || 'Grade 10');
    setCourseTheme(c.color_theme || 'navy');
    setCourseIcon(c.icon_url || 'Award');
    setCourseOrderIndex(c.order_index || 1);
    setShowCourseModal(true);
  };

  const handleDeleteMission = async (id: string) => {
    if (confirm('Delete this mission? This will recursively remove all associated lessons and challenges!')) {
      setLoading(true);
      try {
        await dbService.deleteMission(id);
        setMsg('🎉 Mission deleted successfully.');
        await loadData();
      } catch (err: any) {
        setMsg(`Error: ${err.message || 'Operation failed'}`);
        setLoading(false);
      }
    }
  };

  if (loading && courses.length === 0) {
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
            <Map className="h-6 w-6 text-navy-deep" />
            <span>K-12 Curriculum & Missions Controls</span>
          </h2>
          <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
            Author visual logic courses, align pathway grades, and map missions modules
          </p>
        </div>

        <div className="flex space-x-2">
          {activeTab === 'missions' ? (
            <button
              onClick={() => {
                setIsEditingMission(null);
                setTitle('');
                setDescription('');
                setXpReward(100);
                setCoinReward(50);
                setOrderIndex(missions.length + 1);
                setIsPublished(false);
                setCourseId('');
                setShowMissionModal(true);
              }}
              className="flex items-center space-x-1.5 rounded-lg bg-maple-red hover:bg-maple-light px-5 py-2.5 text-xs font-bold text-white shadow transition-all active:scale-95 animate-fade-in"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              <span>New Mission Module</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setIsEditingCourse(null);
                setCourseTitle('');
                setCourseDescription('');
                setCourseGrade('Grade 10');
                setCourseTheme('navy');
                setCourseIcon('Award');
                setCourseOrderIndex(courses.length + 1);
                setShowCourseModal(true);
              }}
              className="flex items-center space-x-1.5 rounded-lg bg-navy-deep hover:bg-navy-light px-5 py-2.5 text-xs font-bold text-white shadow transition-all active:scale-95 animate-fade-in"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              <span>New K-12 Course</span>
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl border border-emerald-250 bg-emerald-50 text-xs text-emerald-850 font-bold flex items-center space-x-2.5 animate-pulse">
          <AlertCircle className="h-5 w-5" />
          <span>{msg}</span>
        </div>
      )}

      {/* Tabs selectors */}
      <div className="flex border-b border-slate-200 gap-1">
        <button
          onClick={() => setActiveTab('missions')}
          className={`px-5 py-3 border-b-2 font-black uppercase text-[10px] tracking-wider transition ${
            activeTab === 'missions'
              ? 'border-navy-deep text-navy-deep bg-white'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <FolderKanban className="h-4 w-4 inline mr-1.5 align-middle" />
          Missions & Paths
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-5 py-3 border-b-2 font-black uppercase text-[10px] tracking-wider transition ${
            activeTab === 'courses'
              ? 'border-navy-deep text-navy-deep bg-white'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <GraduationCap className="h-4 w-4 inline mr-1.5 align-middle" />
          Grade Courses (K-12)
        </button>
      </div>

      {/* TAB 1: MISSIONS */}
      {activeTab === 'missions' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Index</th>
                  <th className="px-6 py-4">Module Title</th>
                  <th className="px-6 py-4">Linked Course / Grade</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Rewards</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {missions.map((m) => {
                  const linkedC = courses.find(c => c.id === m.course_id);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-500">#{m.order_index}</td>
                      <td className="px-6 py-4">
                        <span className="block font-black text-slate-850 text-sm leading-none">{m.title}</span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-none max-w-sm truncate">
                          {m.description}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {linkedC ? (
                          <span className="bg-emerald-100 border border-emerald-250/20 text-emerald-800 px-2 py-1 rounded text-[9px] font-extrabold uppercase tracking-wide">
                            {linkedC.title} ({linkedC.grade})
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-navy-deep/10 text-navy-deep px-2 py-0.5 rounded text-[8.5px] uppercase font-black tracking-wide leading-none">
                          {m.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 capitalize">{m.difficulty}</td>
                      <td className="px-6 py-4 text-slate-650">⚡ {m.xp_reward} XP / 🪙 {m.coin_reward}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                          m.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-150 text-slate-600'
                        }`}>
                          {m.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2.5">
                          <button
                            onClick={() => handleEditMissionClick(m)}
                            className="p-1.5 rounded bg-slate-50 border hover:bg-navy-deep/5 hover:border-navy-light/40 text-navy-medium"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMission(m.id)}
                            className="p-1.5 rounded bg-slate-50 border hover:bg-rose-50 hover:border-rose-350 text-maple-red"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: COURSES */}
      {activeTab === 'courses' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Course Title</th>
                  <th className="px-6 py-4">Target Grade</th>
                  <th className="px-6 py-4">Visual Theme</th>
                  <th className="px-6 py-4">Icon Type</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">Course #{c.order_index}</td>
                    <td className="px-6 py-4">
                      <span className="block font-black text-slate-855 text-sm leading-none">{c.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-none max-w-sm truncate">
                        {c.description}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-navy-deep/10 text-navy-deep px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">
                        {c.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      <span className={`inline-block w-3.5 h-3.5 rounded-full border border-slate-200 align-middle mr-1.5 ${
                        c.color_theme === 'emerald' ? 'bg-emerald-500' :
                        c.color_theme === 'amber' ? 'bg-amber-500' :
                        c.color_theme === 'navy' ? 'bg-navy-deep' :
                        c.color_theme === 'rose' ? 'bg-rose-500' :
                        c.color_theme === 'purple' ? 'bg-purple-500' :
                        'bg-indigo-500'
                      }`} />
                      {c.color_theme}
                    </td>
                    <td className="px-6 py-4 font-mono">{c.icon_url}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2.5">
                        <button
                          onClick={() => handleEditCourseClick(c)}
                          className="p-1.5 rounded bg-slate-50 border hover:bg-navy-deep/5 hover:border-navy-light/40 text-navy-medium"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MISSION MODAL */}
      {showMissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black uppercase text-slate-800 border-b pb-2 mb-4">
              {isEditingMission ? 'Modify Mission Module' : 'Create Mission Module'}
            </h3>

            <form onSubmit={handleMissionSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Module Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850"
                    placeholder="Python Loops Dungeon"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as 'Logic' | 'Web' | 'Python' | 'AI' | 'Robotics' | 'Algorithms')}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850"
                  >
                    {['Python', 'Algorithms', 'Robotics', 'Web', 'AI', 'Logic'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Linked Course (K-12 Grade)</label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850"
                    required
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title} ({c.grade})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 uppercase mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize coding principles student will practice..."
                  className="w-full h-18 rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850 resize-none"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">XP Reward</label>
                  <input
                    type="number"
                    value={xpReward}
                    onChange={(e) => setXpReward(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Coin Reward</label>
                  <input
                    type="number"
                    value={coinReward}
                    onChange={(e) => setCoinReward(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Order Index</label>
                  <input
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-slate-700 font-bold mt-2">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded border-slate-300 text-navy-deep focus:ring-0"
                  />
                  <span>Publish Pathway (Make visible to student portal)</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowMissionModal(false)}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-navy-deep hover:bg-maple-red px-5 py-2 text-xs font-bold text-white shadow"
                >
                  {isEditingMission ? 'Save Changes' : 'Create Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT COURSE MODAL */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black uppercase text-slate-800 border-b pb-2 mb-4">
              {isEditingCourse ? 'Modify K-12 Course' : 'Create K-12 Course'}
            </h3>

            <form onSubmit={handleCourseSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Course Title</label>
                  <input
                    type="text"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850"
                    placeholder="ICS3U Grade 11 CS"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Target Grade</label>
                  <select
                    value={courseGrade}
                    onChange={(e) => setCourseGrade(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850"
                  >
                    {Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 uppercase mb-1.5">Description</label>
                <textarea
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder="Summarize course content and learning targets..."
                  className="w-full h-18 rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850 resize-none"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Color Theme</label>
                  <select
                    value={courseTheme}
                    onChange={(e) => setCourseTheme(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850"
                  >
                    <option value="emerald">Emerald (Green)</option>
                    <option value="amber">Amber (Orange)</option>
                    <option value="navy">Navy (Dark Blue)</option>
                    <option value="rose">Rose (Red)</option>
                    <option value="purple">Purple (Purple)</option>
                    <option value="indigo">Indigo (Indigo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Lucide Icon name</label>
                  <input
                    type="text"
                    value={courseIcon}
                    onChange={(e) => setCourseIcon(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850"
                    placeholder="Gamepad2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Order Index</label>
                  <input
                    type="number"
                    value={courseOrderIndex}
                    onChange={(e) => setCourseOrderIndex(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-navy-deep hover:bg-maple-red px-5 py-2 text-xs font-bold text-white shadow"
                >
                  {isEditingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
