// src/app/admin/lessons/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { dbService } from '@/lib/db';
import { ListTodo, PlusCircle, Edit3, Trash2, ShieldAlert, AlertCircle } from 'lucide-react';

export default function AdminLessonsManagement() {
  const [missions, setMissions] = useState<any[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState('');
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // Add / Edit form modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<any>(null); // lessonId or null
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [codeExample, setCodeExample] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);

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

  async function loadLessons() {
    if (!selectedMissionId) return;
    setLoading(true);
    try {
      const list = await dbService.getLessons(selectedMissionId);
      setLessons(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLessons();
  }, [selectedMissionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const data = {
        mission_id: selectedMissionId,
        title,
        content,
        video_url: videoUrl,
        code_example: codeExample,
        order_index: orderIndex
      };

      if (isEditing) {
        await dbService.updateLesson(isEditing, data);
        setMsg('🎉 Lesson node updated successfully!');
      } else {
        await dbService.createLesson(data);
        setMsg('🎉 New lesson node created successfully!');
      }

      setShowModal(false);
      setIsEditing(null);
      setTitle('');
      setContent('');
      setVideoUrl('');
      setCodeExample('');
      await loadLessons();
    } catch (err: any) {
      setMsg(`Error: ${err.message || 'Operation failed'}`);
      setLoading(false);
    }
  };

  const handleEditClick = (l: any) => {
    setIsEditing(l.id);
    setTitle(l.title);
    setContent(l.content);
    setVideoUrl(l.video_url || '');
    setCodeExample(l.code_example || '');
    setOrderIndex(l.order_index);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this lesson slide?')) {
      setLoading(true);
      try {
        await dbService.deleteLesson(id);
        setMsg('🎉 Lesson deleted.');
        await loadLessons();
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
            <ListTodo className="h-6 w-6 text-navy-deep" />
            <span>Lessons Curriculum Builder</span>
          </h2>
          <p className="text-xs text-slate-500 uppercase mt-1 tracking-wider font-semibold">
            Draft lecture slides, insert video links, paste syntax code templates, and order slides
          </p>
        </div>

        <button
          onClick={() => {
            setIsEditing(null);
            setTitle('');
            setContent('');
            setVideoUrl('');
            setCodeExample('');
            setOrderIndex(lessons.length + 1);
            setShowModal(true);
          }}
          disabled={!selectedMissionId}
          className="flex items-center space-x-1.5 rounded-lg bg-maple-red hover:bg-maple-light px-5 py-2.5 text-xs font-bold text-white shadow transition-all active:scale-95 disabled:opacity-50"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>New Lesson Slide</span>
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
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Slide Title</th>
                <th className="px-6 py-4">Video Link</th>
                <th className="px-6 py-4">Code Preview</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {lessons.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-mono font-bold text-slate-500">Node #{l.order_index}</td>
                  <td className="px-6 py-4">
                    <span className="block font-black text-slate-850 text-sm leading-none">{l.title}</span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-none max-w-xs truncate">
                      {l.content}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 truncate max-w-40">{l.video_url || 'None'}</td>
                  <td className="px-6 py-4">
                    {l.code_example ? (
                      <pre className="font-mono text-[9px] bg-slate-50 border p-1 rounded max-w-44 overflow-hidden truncate">
                        {l.code_example}
                      </pre>
                    ) : (
                      'None'
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2.5">
                      <button
                        onClick={() => handleEditClick(l)}
                        className="p-1.5 rounded bg-slate-50 border hover:bg-navy-deep/5 hover:border-navy-light/40 text-navy-medium"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(l.id)}
                        className="p-1.5 rounded bg-slate-50 border hover:bg-rose-50 hover:border-rose-350 text-maple-red"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {lessons.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 font-bold italic">
                    No slides registered under this mission path. Click 'New Lesson Slide' to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT SCREEN */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black uppercase text-slate-800 border-b pb-2 mb-4">
              {isEditing ? 'Modify Lesson Slide' : 'Create Lesson Slide'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-500 uppercase mb-1.5">Slide Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850 text-xs"
                    placeholder="Python Variables declaration"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Order index</label>
                  <input
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850 text-xs"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 uppercase mb-1.5">Lecture Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Explain details, loop operations, or variable syntax principles..."
                  className="w-full h-24 rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850 text-xs resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase mb-1.5">YouTube Video Embed link (Optional)</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850 text-xs"
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase mb-1.5">Syntax Code Example (Optional)</label>
                <textarea
                  value={codeExample}
                  onChange={(e) => setCodeExample(e.target.value)}
                  placeholder="# Enter demo code statements here"
                  className="w-full h-18 rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 font-semibold text-slate-850 text-xs font-mono resize-none"
                />
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
                  {isEditing ? 'Save Changes' : 'Create Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
