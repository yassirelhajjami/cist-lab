// src/app/admin/challenges/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { dbService } from '@/lib/db';
import { Code2, PlusCircle, Edit3, Trash2, ShieldAlert, AlertCircle } from 'lucide-react';

export default function AdminChallengesManagement() {
  const [missions, setMissions] = useState<any[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState('');
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // Add / Edit form modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<any>(null); // challengeId or null
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [starterCode, setStarterCode] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [xpReward, setXpReward] = useState(75);
  const [coinReward, setCoinReward] = useState(30);

  async function loadMissions() {
    try {
      const all = await dbService.getMissions();
      setMissions(all);
      if (all.length > 0) {
        setSelectedMissionId(all[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMissions();
  }, []);

  async function loadChallenges() {
    if (!selectedMissionId) return;
    setLoading(true);
    try {
      const list = await dbService.getChallenges(selectedMissionId);
      setChallenges(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadChallenges();
  }, [selectedMissionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const data = {
        mission_id: selectedMissionId,
        title,
        description,
        instructions,
        starter_code: starterCode,
        expected_output: expectedOutput,
        difficulty,
        xp_reward: xpReward,
        coin_reward: coinReward
      };

      if (isEditing) {
        await dbService.updateChallenge(isEditing, data);
        setMsg('🎉 Challenge updated successfully!');
      } else {
        await dbService.createChallenge(data);
        setMsg('🎉 New challenge registered successfully!');
      }

      setShowModal(false);
      setIsEditing(null);
      setTitle('');
      setDescription('');
      setInstructions('');
      setStarterCode('');
      setExpectedOutput('');
      await loadChallenges();
    } catch (err: any) {
      setMsg(`Error: ${err.message || 'Operation failed'}`);
      setLoading(false);
    }
  };

  const handleEditClick = (c: any) => {
    setIsEditing(c.id);
    setTitle(c.title);
    setDescription(c.description);
    setInstructions(c.instructions);
    setStarterCode(c.starter_code);
    setExpectedOutput(c.expected_output);
    setDifficulty(c.difficulty);
    setXpReward(c.xp_reward);
    setCoinReward(c.coin_reward);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this coding challenge?')) {
      setLoading(true);
      try {
        await dbService.deleteChallenge(id);
        setMsg('🎉 Challenge deleted.');
        await loadChallenges();
      } catch (err: any) {
        setMsg(`Error: ${err.message || 'Operation failed'}`);
        setLoading(false);
      }
    }
  };

  if (loading && missions.length === 0) {
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
            <Code2 className="h-6 w-6 text-navy-deep" />
            <span>Coding Challenges Designer</span>
          </h2>
          <p className="text-xs text-slate-500 uppercase mt-1 tracking-wider font-semibold">
            Draft compiler checks, define start codes, and allocate XP/coin rewards
          </p>
        </div>

        <button
          onClick={() => {
            setIsEditing(null);
            setTitle('');
            setDescription('');
            setInstructions('');
            setStarterCode('# Write starter code template here');
            setExpectedOutput('');
            setXpReward(75);
            setCoinReward(30);
            setShowModal(true);
          }}
          disabled={!selectedMissionId}
          className="flex items-center space-x-1.5 rounded-lg bg-maple-red hover:bg-maple-light px-5 py-2.5 text-xs font-bold text-white shadow transition-all active:scale-95 disabled:opacity-50"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>New Challenge Task</span>
        </button>
      </div>

      {msg && (
        <div className="p-4 rounded-xl border border-emerald-250 bg-emerald-50 text-xs text-emerald-850 font-bold flex items-center space-x-2.5 animate-pulse">
          <AlertCircle className="h-5 w-5" />
          <span>{msg}</span>
        </div>
      )}

      {/* Select Mission dropdown */}
      <div className="flex items-center space-x-3 bg-white border border-slate-200 rounded-xl p-4.5 shadow-sm max-w-md">
        <label className="text-xs font-black uppercase text-slate-650 shrink-0">Pathway Module:</label>
        <select
          value={selectedMissionId}
          onChange={(e) => setSelectedMissionId(e.target.value)}
          className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-800"
        >
          <option value="">-- Select Mission --</option>
          {missions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title} ({m.category})
            </option>
          ))}
        </select>
      </div>

      {/* Table grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">XP Reward</th>
                <th className="px-6 py-4">Expected Output</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {challenges.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <span className="block font-black text-slate-850 text-sm leading-none">{c.title}</span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-none max-w-xs truncate">
                      {c.description}
                    </span>
                  </td>
                  <td className="px-6 py-4 capitalize">{c.difficulty}</td>
                  <td className="px-6 py-4">⚡ {c.xp_reward} XP / 🪙 {c.coin_reward}</td>
                  <td className="px-6 py-4 text-slate-500 truncate max-w-44 font-mono text-[11px]">
                    {c.expected_output}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2.5">
                      <button
                        onClick={() => handleEditClick(c)}
                        className="p-1.5 rounded bg-slate-50 border hover:bg-navy-deep/5 hover:border-navy-light/40 text-navy-medium"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded bg-slate-50 border hover:bg-rose-50 hover:border-rose-350 text-maple-red"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {challenges.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 font-bold italic">
                    No coding challenges designer under this pathway. Click 'New Challenge Task' to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL SCREEN */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-base font-black uppercase text-slate-800 border-b pb-2 mb-4">
              {isEditing ? 'Modify Challenge Task' : 'Register Challenge Task'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-500 uppercase mb-1.5">Challenge Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850 text-xs"
                    placeholder="Printing Greeting Statement"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850 text-xs"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">XP Reward</label>
                  <input
                    type="number"
                    value={xpReward}
                    onChange={(e) => setXpReward(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850 text-xs"
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
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850 text-xs"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 uppercase mb-1.5">Brief Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850 text-xs"
                  placeholder="Practice printing lines of text console output..."
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase mb-1.5">Instructions</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Instruct the student on what exact code statements to declare..."
                  className="w-full h-16 rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850 text-xs resize-none"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Starter code</label>
                  <textarea
                    value={starterCode}
                    onChange={(e) => setStarterCode(e.target.value)}
                    className="w-full h-24 rounded-lg border border-slate-250 bg-slate-55 p-2 font-mono text-[10.5px] text-slate-800 resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Expected Output Check</label>
                  <textarea
                    value={expectedOutput}
                    onChange={(e) => setExpectedOutput(e.target.value)}
                    className="w-full h-24 rounded-lg border border-slate-250 bg-slate-55 p-2 font-mono text-[10.5px] text-slate-800 resize-none"
                    placeholder="Hello CIST CodeQuest!"
                    required
                  />
                </div>
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
                  {isEditing ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
