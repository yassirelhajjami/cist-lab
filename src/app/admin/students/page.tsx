// src/app/admin/students/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { dbService } from '@/lib/db';
import { PlusCircle, Search, Award, Star, Settings, UserPlus, Edit3, Trash2, ShieldAlert, KeyRound } from 'lucide-react';
import { createStudentAuth, updateStudentAuth } from '../actions';
import { BadgeIcon } from '@/components/ui/BadgeIcon';

export default function StudentsManagement() {
  const [students, setStudents] = useState<any[]>([]);
  const [badgesList, setBadgesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit student modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState<any>(null); // profileId or null
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password');
  const [studentCode, setStudentCode] = useState('');
  const [grade, setGrade] = useState('Grade 10');
  const [classroom, setClassroom] = useState('Room 204');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // Adjust XP / Coins modal
  const [showXpModal, setShowXpModal] = useState<any>(null); // profile object or null
  const [xpChange, setXpChange] = useState(100);
  const [coinsChange, setCoinsChange] = useState(20);
  const [isAdding, setIsAdding] = useState(true);

  // Award badge modal
  const [showBadgeModal, setShowBadgeModal] = useState<any>(null); // student id or null
  const [selectedBadge, setSelectedBadge] = useState('');
  const [studentBadgesMap, setStudentBadgesMap] = useState<Record<string, any[]>>({});

  async function loadData() {
    try {
      const [allStudents, badges, allStudentBadges] = await Promise.all([
        dbService.getStudents(),
        dbService.getBadges(),
        dbService.getStudentBadges()
      ]);
      setStudents(allStudents);
      setBadgesList(badges);

      // Load badges for each student
      const map: Record<string, any[]> = {};
      for (const s of allStudents) {
        const sId = s.students.id;
        const list = allStudentBadges
          .filter((sb: any) => sb.student_id === sId)
          .map((sb: any) => sb.badges);
        map[sId] = list;
      }
      setStudentBadgesMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        // Update in Supabase Auth (server-side using service role key if configured)
        await updateStudentAuth(email, password);

        // Update in DB
        await dbService.updateStudent(
          isEditing,
          { full_name: fullName, email, grade, status },
          { student_code: studentCode, grade, classroom, notes, status },
          password
        );
      } else {
        // Create in Supabase Auth first (server-side using service role key if configured)
        const authUser = await createStudentAuth(email, password);
        const userId = authUser ? authUser.id : null;

        // Create in DB
        await dbService.createStudent({
          fullName,
          email,
          studentCode,
          grade,
          classroom,
          notes,
          password,
          userId: userId || undefined
        });
      }
      
      // Reset
      setShowAddModal(false);
      setIsEditing(null);
      setFullName('');
      setEmail('');
      setStudentCode('');
      setNotes('');
      setPassword('password');
      await loadData();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleEditClick = (s: any) => {
    setIsEditing(s.id);
    setFullName(s.full_name);
    setEmail(s.email);
    setPassword(s.password || 'password');
    setStudentCode(s.students.student_code);
    setGrade(s.grade);
    setClassroom(s.students.classroom);
    setNotes(s.students.notes || '');
    setStatus(s.status);
    setShowAddModal(true);
  };

  const handleDelete = async (profileId: string) => {
    if (confirm('Are you sure you want to deactivate and remove this student file from CIST CodeQuest?')) {
      setLoading(true);
      try {
        await dbService.deleteStudent(profileId);
        await loadData();
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
  };

  const handleXpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showXpModal) return;
    setLoading(true);

    const xpDelta = isAdding ? xpChange : -xpChange;
    const coinsDelta = isAdding ? coinsChange : -coinsChange;

    try {
      await dbService.updateXPAndCoins(showXpModal.id, xpDelta, coinsDelta, 'Manual Adjustments by Teacher');
      setShowXpModal(null);
      await loadData();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAwardBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showBadgeModal || !selectedBadge) return;
    setLoading(true);

    try {
      await dbService.awardBadge(showBadgeModal, selectedBadge);
      setShowBadgeModal(null);
      setSelectedBadge('');
      await loadData();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleRemoveBadge = async (studentId: string, badgeId: string) => {
    if (confirm('Remove this badge from student?')) {
      setLoading(true);
      try {
        await dbService.removeBadge(studentId, badgeId);
        await loadData();
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
  };

  const filteredStudents = students.filter(
    (s: any) =>
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.students.student_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
            <UserPlus className="h-6 w-6 text-navy-deep" />
            <span>Student Administration</span>
          </h2>
          <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
            Edit profiles, reset credentials, manually adjust XP metrics, and award achievements
          </p>
        </div>

        <button
          onClick={() => {
            setIsEditing(null);
            setFullName('');
            setEmail('');
            setNotes('');
            setPassword('password');
            setStudentCode(`CIST-10-0${Math.floor(100 + Math.random() * 900)}`);
            setShowAddModal(true);
          }}
          className="flex items-center space-x-1.5 rounded-lg bg-maple-red hover:bg-maple-light px-5 py-2.5 text-xs font-bold text-white shadow transition-all active:scale-95"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Add Student Account</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-450" />
        <input
          type="text"
          placeholder="Search by student name, email, or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-250 bg-white py-3 pl-11 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-navy-deep shadow-sm"
        />
      </div>

      {/* Students Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Grade & Classroom</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Level & XP</th>
                <th className="px-6 py-4">Badges</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredStudents.map((s) => {
                const sBadges = studentBadgesMap[s.students.id] || [];

                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition duration-150">
                    {/* User profile info */}
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <img src={s.avatar_url} alt="avatar" className="h-9 w-9 rounded-lg border bg-white object-contain" />
                      <div>
                        <span className="block font-black text-slate-850 text-sm leading-none">{s.full_name}</span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-none">{s.email}</span>
                      </div>
                    </td>

                    {/* Registration Code */}
                    <td className="px-6 py-4 font-mono font-bold text-slate-650">{s.students.student_code}</td>

                    {/* Grade Room */}
                    <td className="px-6 py-4">{s.grade} • {s.students.classroom}</td>

                    {/* Status Pill */}
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        s.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-150 text-slate-600'
                      }`}>
                        {s.status}
                      </span>
                    </td>

                    {/* XP stats */}
                    <td className="px-6 py-4">
                      <span className="block font-bold">Lvl {s.level}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{s.xp} XP • {s.coins} Coins</span>
                    </td>

                    {/* Badges Grid */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-44">
                        {sBadges.map((b) => (
                          <span
                            key={b.id}
                            onClick={() => handleRemoveBadge(s.students.id, b.id)}
                            className="cursor-pointer bg-slate-50 hover:bg-rose-100 border hover:border-rose-200 p-1 rounded text-[10px] inline-flex items-center justify-center shadow-sm"
                            title={`Click to remove: ${b.name} (${b.icon_url})`}
                          >
                            <BadgeIcon name={b.icon_url} className="h-3.5 w-3.5 text-navy-deep" />
                          </span>
                        ))}
                        <button
                          onClick={() => setShowBadgeModal(s.students.id)}
                          className="px-1.5 py-0.5 rounded border border-dashed border-slate-300 hover:border-slate-500 text-[10px] text-slate-450 hover:text-slate-700"
                        >
                          + Award
                        </button>
                      </div>
                    </td>

                    {/* Operation Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2.5">
                        <button
                          onClick={() => setShowXpModal(s)}
                          className="p-1.5 rounded bg-slate-50 border hover:bg-gold-accent/5 hover:border-gold-accent/40 text-gold-accent"
                          title="Adjust XP / Coins"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(s)}
                          className="p-1.5 rounded bg-slate-50 border hover:bg-navy-deep/5 hover:border-navy-light/40 text-navy-medium"
                          title="Edit Student Profile"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 rounded bg-slate-50 border hover:bg-rose-50 hover:border-rose-350 text-maple-red"
                          title="Deactivate Student"
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

      {/* ADD / EDIT STUDENT MODAL SCREEN */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black uppercase text-slate-800 border-b pb-2 mb-4">
              {isEditing ? 'Modify Student File' : 'Register New Student'}
            </h3>

            <form onSubmit={handleCreateOrUpdateStudent} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800"
                    placeholder="Sofia Mansouri"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800"
                    placeholder="sofia.m@cist.edu"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                  Account Password {isEditing && "(Leave as is or enter new to reset)"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Student Code</label>
                  <input
                    type="text"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold"
                  >
                    {Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Classroom</label>
                  <input
                    type="text"
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Academic Profile Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Insert learning preferences, diagnostic codes, or parent contact details..."
                  className="w-full h-20 rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold resize-none"
                />
              </div>

              {isEditing && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-navy-deep hover:bg-maple-red px-5 py-2 text-xs font-bold text-white shadow"
                >
                  {isEditing ? 'Save Changes' : 'Register Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADJUST XP & COINS MODAL */}
      {showXpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black uppercase text-slate-800 border-b pb-2 mb-4">
              XP Adjust: {showXpModal.full_name}
            </h3>

            <form onSubmit={handleXpSubmit} className="space-y-4">
              <div className="flex space-x-1.5 border rounded-lg bg-slate-100 p-0.5 text-xs font-bold text-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className={`flex-1 py-1.5 rounded ${isAdding ? 'bg-white text-navy-deep shadow-sm' : 'text-slate-550'}`}
                >
                  Add Points
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className={`flex-1 py-1.5 rounded ${!isAdding ? 'bg-white text-maple-red shadow-sm' : 'text-slate-550'}`}
                >
                  Remove Points
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">XP Reward Amount</label>
                <input
                  type="number"
                  value={xpChange}
                  onChange={(e) => setXpChange(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Coins Delta</label>
                <input
                  type="number"
                  value={coinsChange}
                  onChange={(e) => setCoinsChange(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold"
                  min="0"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowXpModal(null)}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-navy-deep hover:bg-maple-red px-5 py-2 text-xs font-bold text-white shadow"
                >
                  Apply Delta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AWARD BADGE MODAL */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black uppercase text-slate-800 border-b pb-2 mb-4">
              Award Custom School Badge
            </h3>

            <form onSubmit={handleAwardBadge} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Select Badge Emblem</label>
                <select
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                  className="w-full rounded-lg border border-slate-250 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-850"
                  required
                >
                  <option value="">-- Choose Badge --</option>
                  {badgesList.map((b) => (
                    <option key={b.id} value={b.id}>
                      ({b.icon_url}) {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBadgeModal(null)}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-navy-deep hover:bg-maple-red px-5 py-2 text-xs font-bold text-white shadow"
                >
                  Award Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
