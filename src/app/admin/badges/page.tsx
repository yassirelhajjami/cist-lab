// src/app/admin/badges/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { dbService } from '@/lib/db';
import { Award, PlusCircle, AlertCircle } from 'lucide-react';

export default function AdminBadgesManagement() {
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // Add badge form
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('🏆');
  const [reqType, setReqType] = useState('mission'); // 'xp', 'mission', 'challenge', 'project', 'manual'
  const [reqValue, setReqValue] = useState(1);

  async function loadBadges() {
    try {
      const list = await dbService.getBadges();
      setBadges(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBadges();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      await dbService.createBadge({
        name,
        description,
        icon_url: iconUrl,
        requirement_type: reqType,
        requirement_value: reqValue
      });
      setMsg('🎉 Badge registered successfully!');
      setShowModal(false);
      setName('');
      setDescription('');
      setIconUrl('🏆');
      await loadBadges();
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

  return (
    <div className="space-y-6 text-xs font-semibold text-slate-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
            <Award className="h-6 w-6 text-navy-deep" />
            <span>Badges & Incentive Designs</span>
          </h2>
          <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
            Create school awards, upload graphic assets, and configure automatic unlock parameters
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 rounded-lg bg-maple-red hover:bg-maple-light px-5 py-2.5 text-xs font-bold text-white shadow transition-all active:scale-95"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>New Achievement Tag</span>
        </button>
      </div>

      {msg && (
        <div className="p-4 rounded-xl border border-emerald-250 bg-emerald-50 text-xs text-emerald-850 font-bold flex items-center space-x-2.5 animate-pulse">
          <AlertCircle className="h-5 w-5" />
          <span>{msg}</span>
        </div>
      )}

      {/* Grid listing */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((b) => (
          <div key={b.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start space-x-4">
            <div className="h-12 w-12 rounded-lg bg-gold-accent/15 border border-gold-accent/20 flex items-center justify-center text-2xl shrink-0">
              {b.icon_url}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-850 uppercase">{b.name}</h3>
              <p className="text-xs text-slate-500 leading-snug">{b.description}</p>
              <div className="pt-2 text-[9.5px] uppercase font-bold text-navy-deep">
                Unlock: {b.requirement_type} (value: {b.requirement_value})
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL SCREEN */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black uppercase text-slate-800 border-b pb-2 mb-4">
              Add Achievement Badge
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-500 uppercase mb-1.5">Badge Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-850"
                  placeholder="e.g. Loop Master"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 uppercase mb-1.5">Description details</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-850"
                  placeholder="e.g. Solve 3 loop compiler check templates"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Icon Emoji</label>
                  <input
                    type="text"
                    value={iconUrl}
                    onChange={(e) => setIconUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-850"
                    placeholder="🏆"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-500 uppercase mb-1.5">Req type</label>
                  <select
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-850"
                  >
                    <option value="xp">XP score</option>
                    <option value="mission">Mission Path</option>
                    <option value="challenge">Challenge count</option>
                    <option value="project">Project Showcase</option>
                    <option value="manual">Manual Award</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 uppercase mb-1.5">Requirement target value</label>
                <input
                  type="number"
                  value={reqValue}
                  onChange={(e) => setReqValue(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-850"
                  min="0"
                  required
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
                  Publish Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
