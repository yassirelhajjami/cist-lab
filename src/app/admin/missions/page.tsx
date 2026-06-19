// src/app/admin/missions/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { dbService } from '@/lib/db';
import { Map, PlusCircle, Edit3, Trash2, ShieldAlert, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminMissionsManagement() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // Add / Edit form modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<any>(null); // missionId or null
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Python');
  const [difficulty, setDifficulty] = useState('beginner');
  const [xpReward, setXpReward] = useState(100);
  const [coinReward, setCoinReward] = useState(50);
  const [orderIndex, setOrderIndex] = useState(1);
  const [isPublished, setIsPublished] = useState(false);

  async function loadMissions() {
    try {
      const all = await dbService.getMissions();
      setMissions(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMissions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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
        is_published: isPublished
      };

      if (isEditing) {
        await dbService.updateMission(isEditing, data);
        setMsg('🎉 Mission path updated successfully!');
      } else {
        await dbService.createMission(data);
        setMsg('🎉 New mission path created successfully!');
      }

      setShowModal(false);
      setIsEditing(null);
      setTitle('');
      setDescription('');
      await loadMissions();
    } catch (err: any) {
      setMsg(`Error: ${err.message || 'Operation failed'}`);
      setLoading(false);
    }
  };

  const handleEditClick = (m: any) => {
    setIsEditing(m.id);
    setTitle(m.title);
    setDescription(m.description);
    setCategory(m.category);
    setDifficulty(m.difficulty);
    setXpReward(m.xp_reward);
    setCoinReward(m.coin_reward);
    setOrderIndex(m.order_index);
    setIsPublished(m.is_published);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this mission? This will recursively remove all associated lessons and challenges!')) {
      setLoading(true);
      try {
        await dbService.deleteMission(id);
        setMsg('🎉 Mission deleted successfully.');
        await loadMissions();
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
            <Map className="h-6 w-6 text-navy-deep" />
            <span>Mission Pathway Controls</span>
          </h2>
          <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
            Author and order class paths. Configure reward stars and levels filters
          </p>
        </div>

        <button
          onClick={() => {
            setIsEditing(null);
            setTitle('');
            setDescription('');
            setXpReward(100);
            setCoinReward(50);
            setOrderIndex(missions.length + 1);
            setIsPublished(false);
            setShowModal(true);
          }}
          className="flex items-center space-x-1.5 rounded-lg bg-maple-red hover:bg-maple-light px-5 py-2.5 text-xs font-bold text-white shadow transition-all active:scale-95"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>New Mission Module</span>
        </button>
      </div>

      {msg && (
        <div className="p-4 rounded-xl border border-emerald-250 bg-emerald-50 text-xs text-emerald-850 font-bold flex items-center space-x-2.5 animate-pulse">
          <AlertCircle className="h-5 w-5" />
          <span>{msg}</span>
        </div>
      )}

      {/* Table grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Index</th>
                <th className="px-6 py-4">Module Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">XP Reward</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {missions.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-slate-500">#{m.order_index}</td>
                  <td className="px-6 py-4">
                    <span className="block font-black text-slate-850 text-sm leading-none">{m.title}</span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-none max-w-sm truncate">
                      {m.description}
                    </span>
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
                        onClick={() => handleEditClick(m)}
                        className="p-1.5 rounded bg-slate-50 border hover:bg-navy-deep/5 hover:border-navy-light/40 text-navy-medium"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 rounded bg-slate-50 border hover:bg-rose-50 hover:border-rose-350 text-maple-red"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL SCREEN */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black uppercase text-slate-800 border-b pb-2 mb-4">
              {isEditing ? 'Modify Mission Module' : 'Create Mission Module'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
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
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850"
                  >
                    {['Python', 'Algorithms', 'Robotics', 'Web', 'AI', 'Logic'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
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

              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
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
                  onClick={() => setShowModal(false)}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-navy-deep hover:bg-maple-red px-5 py-2 text-xs font-bold text-white shadow"
                >
                  {isEditing ? 'Save Changes' : 'Create Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
