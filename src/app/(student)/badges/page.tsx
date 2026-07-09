// src/app/(student)/badges/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { dbService } from '@/lib/db';
import { Award, Lock, Target, CheckCircle2 } from 'lucide-react';
import { BadgeIcon } from '@/components/ui/BadgeIcon';

export default function BadgesPage() {
  const { student, loading: appLoading } = useApp();
  
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBadgesData() {
      if (appLoading) return;
      if (!student) {
        setLoading(false);
        return;
      }
      try {
        const badges = await dbService.getBadges();
        const earned = await dbService.getStudentBadges(student.id);
        setAllBadges(badges);
        setEarnedBadges(earned);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBadgesData();
  }, [student, appLoading]);

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
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-black uppercase text-slate-800 tracking-tight flex items-center space-x-2">
          <Award className="h-6 w-6 text-navy-deep" />
          <span>My Badges & Achievements</span>
        </h2>
        <p className="text-xs text-slate-500 uppercase font-semibold mt-1 tracking-wider">
          Claim unique badges by completing code pathways, coding sandbox games, and scoring approved projects
        </p>
      </div>

      {/* Grid listing */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {allBadges.map((badge) => {
          const isUnlocked = earnedBadges.some((eb) => eb.id === badge.id);
          
          return (
            <div
              key={badge.id}
              className={`relative rounded-xl border bg-white p-5 shadow-sm transition duration-200 ${
                isUnlocked
                  ? 'border-gold-accent bg-gold-accent/5'
                  : 'border-slate-200 opacity-60 hover:opacity-80'
              }`}
            >
              {/* Lock icon overlay for locked items */}
              {!isUnlocked && (
                <div className="absolute top-4 right-4 text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
              )}
              {isUnlocked && (
                <div className="absolute top-4 right-4 text-gold-accent animate-pulse" title="Achievement Earned">
                  <CheckCircle2 className="h-5 w-5 fill-current text-gold-accent text-white" />
                </div>
              )}

              <div className="flex items-start space-x-4">
                {/* Big emoji emblem */}
                <div className={`h-14 w-14 rounded-xl flex items-center justify-center shadow-inner border shrink-0 ${
                  isUnlocked 
                    ? 'bg-gradient-to-br from-gold-light to-gold-accent border-gold-accent/40' 
                    : 'bg-slate-100 border-slate-200 filter grayscale'
                }`}>
                  <BadgeIcon name={badge.icon_url} className={isUnlocked ? "h-8 w-8 text-navy-dark" : "h-8 w-8 text-slate-500"} />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-850 uppercase">{badge.name}</h3>
                  <p className="text-xs text-slate-500 leading-snug">{badge.description}</p>
                </div>
              </div>

              {/* Requirement tracker details */}
              <div className="mt-5 border-t border-slate-100 pt-3.5 flex items-center justify-between text-[10.5px] font-bold text-slate-500 uppercase">
                <span className="flex items-center space-x-1.5">
                  <Target className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {badge.requirement_type === 'xp' ? `Earn >= ${badge.requirement_value} XP` :
                     badge.requirement_type === 'mission' ? 'Complete path mission' :
                     badge.requirement_type === 'challenge' ? `Solve ${badge.requirement_value} challenges` :
                     badge.requirement_type === 'project' ? 'Approve showcase project' :
                     'Manually awarded by teacher'}
                  </span>
                </span>
                
                <span className={isUnlocked ? 'text-gold-accent font-black' : 'text-slate-400'}>
                  {isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
